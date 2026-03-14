import { useRef } from 'react';
import { useInView } from 'framer-motion';

export function useReveal(margin = '-60px') {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: margin as any });
  return { ref, inView };
}
