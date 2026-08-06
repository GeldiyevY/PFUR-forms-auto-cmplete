import { useState, useCallback } from 'react';
import type { TemplateState } from '../types/form';

const META_SUFFIX = ':meta';

/** Timeout for conditional-fetch fallback checks (ms). */
const FETCH_TIMEOUT = 5000;

function base64ToUint8Array(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function uint8ArrayToBase64(buffer: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < buffer.length; i += chunkSize) {
    binary += String.fromCharCode(...Array.from(buffer.subarray(i, i + chunkSize)));
  }
  return btoa(binary);
}

/**
 * Read the stored last-modified timestamp for a template from localStorage.
 * Returns `null` when no metadata exists (e.g. old cache entries pre-dating
 * this feature).
 */
function getTemplateMeta(templateName: string): { lastModified?: string } | null {
  const raw = localStorage.getItem(`docx-template:${templateName}${META_SUFFIX}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { lastModified?: string };
  } catch {
    return null;
  }
}

/**
 * Persistently cache a template buffer *and* its server `Last-Modified` value.
 * The `lastModified` comes from the response header and powers subsequent
 * conditional GET requests (`If-Modified-Since`).
 */
function cacheTemplate(
  templateName: string,
  buffer: Uint8Array,
  lastModified: string | null,
): void {
  const storageKey = `docx-template:${templateName}`;
  localStorage.setItem(storageKey, uint8ArrayToBase64(buffer));
  if (lastModified) {
    localStorage.setItem(
      `${storageKey}${META_SUFFIX}`,
      JSON.stringify({ lastModified }),
    );
  }
}

/**
 * Fetch a single template with conditional-GET semantics.
 *
 * - If a cached copy exists **and** we have its `Last-Modified` metadata,
 *   send `If-Modified-Since`. A `304` response means the cache is still
 *   valid — the cached buffer is returned without downloading the body.
 * - If the server says the template was modified (`200`), the new buffer is
 *   stored and returned.
 * - On any network failure (offline, timeout) the cached buffer is used
 *   silently when one exists.
 * - When no cache exists the template is fetched unconditionally. If that
 *   also fails, the error propagates to the caller (there is nothing to
 *   fall back to).
 *
 * `fallbackToCache` controls whether a network error should silently return
 * the stale cache. Pass `false` only when a fresh download is strictly
 * required.
 */
async function fetchTemplate(
  templateName: string,
  fallbackToCache: boolean,
): Promise<Uint8Array> {
  const storageKey = `docx-template:${templateName}`;
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    const meta = getTemplateMeta(templateName);
    const headers: HeadersInit = {};
    if (meta?.lastModified) {
      headers['If-Modified-Since'] = meta.lastModified;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      const response = await fetch(`/${templateName}.docx`, {
        headers,
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 304) {
        console.log(`[template] "${templateName}" cache is up to date`);
        return base64ToUint8Array(stored);
      }

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const serverLastModified = response.headers.get('Last-Modified');
        cacheTemplate(templateName, buffer, serverLastModified);
        console.log(
          `[template] Loaded "${templateName}" from URL${meta ? ' (updated, was cached)' : ''} and cached it`,
        );
        return buffer;
      }

      // Non-200, non-304 — fall back to cache if allowed.
      if (fallbackToCache) {
        console.log(
          `[template] Server returned ${response.status} for "${templateName}", using cached version`,
        );
        return base64ToUint8Array(stored);
      }
      throw new Error(
        `Не удалось загрузить шаблон "${templateName}" (статус ${response.status})`,
      );
    } catch (err) {
      if (fallbackToCache) {
        console.log(
          `[template] Network check for "${templateName}" failed (${(err as Error).message}), using cached version`,
        );
        return base64ToUint8Array(stored);
      }
      throw err;
    }
  }

  // No cache — fetch fresh.
  console.log(`[template] Fetching "${templateName}" from /${templateName}.docx`);
  const response = await fetch(`/${templateName}.docx`);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить шаблон "${templateName}"`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const serverLastModified = response.headers.get('Last-Modified');
  cacheTemplate(templateName, buffer, serverLastModified);
  console.log(`[template] Loaded "${templateName}" from URL and cached it`);
  return buffer;
}

export function useTemplate() {
  const [state, setState] = useState<TemplateState>({
    buffer: null,
    loading: false,
    error: null,
  });

  const loadTemplate = useCallback(async (templateName: string) => {
    setState({ buffer: null, loading: true, error: null });
    try {
      const buffer = await fetchTemplate(templateName, true);
      setState({ buffer, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки шаблона';
      console.error(`[template] Failed to load "${templateName}":`, message);
      setState({ buffer: null, loading: false, error: message });
    }
  }, []);

  /** Load several templates (each cached independently) and return their buffers in order. */
  const loadTemplates = useCallback(async (templateNames: string[]): Promise<Uint8Array[]> => {
    const buffers: Uint8Array[] = [];
    for (const name of templateNames) {
      // When the cache exists, silently fall back to it on network errors.
      const hasCache = !!localStorage.getItem(`docx-template:${name}`);
      buffers.push(await fetchTemplate(name, hasCache));
    }
    return buffers;
  }, []);

  /**
   * Background check: for every template that already has a cached copy
   * *with* `Last-Modified` metadata, send a conditional GET. If the server
   * reports the template as newer, download and refresh the cache.
   *
   * Templates that are not cached are **not** downloaded (saves bandwidth
   * for grant types the user may never select).
   *
   * All network failures are swallowed — this is a fire-and-forget call
   * meant for app startup.
   */
  const checkForUpdates = useCallback(async (templateNames: string[]): Promise<void> => {
    for (const name of templateNames) {
      const meta = getTemplateMeta(name);
      const stored = localStorage.getItem(`docx-template:${name}`);
      if (!stored || !meta?.lastModified) {
        continue;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(`/${name}.docx`, {
          headers: { 'If-Modified-Since': meta.lastModified },
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.status === 304) {
          continue;
        }

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);
          const serverLastModified = response.headers.get('Last-Modified');
          cacheTemplate(name, buffer, serverLastModified);
          console.log(`[template] Background update downloaded for "${name}"`);
        }
      } catch {
        console.log(`[template] Background update check for "${name}" failed (offline?)`);
      }
    }
  }, []);

  return { ...state, loadTemplate, loadTemplates, checkForUpdates };
}
