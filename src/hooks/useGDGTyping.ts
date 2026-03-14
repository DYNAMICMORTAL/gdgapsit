import { useRef, useEffect } from 'react';

export function useGDGTyping(callback: () => void) {
  const buffer = useRef('');
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      buffer.current = (buffer.current + e.key).slice(-3).toLowerCase();
      if (buffer.current === 'gdg') {
        callback();
        buffer.current = '';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [callback]);
}
