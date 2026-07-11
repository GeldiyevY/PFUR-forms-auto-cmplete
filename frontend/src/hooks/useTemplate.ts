import { useState, useCallback } from 'react';
import type { TemplateState } from '../types/form';

const STORAGE_KEY = 'docx-template';

function base64ToUint8Array(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function uint8ArrayToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

export function useTemplate() {
  const [state, setState] = useState<TemplateState>({
    buffer: null,
    loading: false,
    error: null,
  });

  const loadTemplate = useCallback(async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setState({ buffer: base64ToUint8Array(stored), loading: false, error: null });
      return;
    }

    setState({ buffer: null, loading: true, error: null });

    try {
      const response = await fetch('/template.docx');
      if (!response.ok) {
        throw new Error('Не удалось загрузить шаблон');
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      localStorage.setItem(STORAGE_KEY, uint8ArrayToBase64(buffer));
      setState({ buffer, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки шаблона';
      setState({ buffer: null, loading: false, error: message });
    }
  }, []);

  return { ...state, loadTemplate };
}
