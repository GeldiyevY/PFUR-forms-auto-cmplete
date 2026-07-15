import { useState, useCallback } from 'react';
import type { TemplateState } from '../types/form';

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

export function useTemplate() {
  const [state, setState] = useState<TemplateState>({
    buffer: null,
    loading: false,
    error: null,
  });

  const loadTemplate = useCallback(async (templateName: string) => {
    const storageKey = `docx-template:${templateName}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      console.log(`[template] Loaded "${templateName}" from cache (localStorage key: ${storageKey})`);
      setState({ buffer: base64ToUint8Array(stored), loading: false, error: null });
      return;
    }

    console.log(`[template] Fetching "${templateName}" from /${templateName}.docx`);
    setState({ buffer: null, loading: true, error: null });

    try {
      const response = await fetch(`/${templateName}.docx`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить шаблон');
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      localStorage.setItem(storageKey, uint8ArrayToBase64(buffer));
      console.log(`[template] Loaded "${templateName}" from URL and cached it`);
      setState({ buffer, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки шаблона';
      console.error(`[template] Failed to load "${templateName}":`, message);
      setState({ buffer: null, loading: false, error: message });
    }
  }, []);

  return { ...state, loadTemplate };
}
