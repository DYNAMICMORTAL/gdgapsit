import { useRef, useEffect } from 'react';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

export function useKonami(callback: () => void) {
  const seq = useRef<string[]>([]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      seq.current = [...seq.current.slice(-9), e.key];
      if (seq.current.join(',') === KONAMI.join(',')) callback();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [callback]);
}
