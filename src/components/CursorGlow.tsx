import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CursorGlow = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isDesktop, setIsDesktop] = useState(false);
  const x = useSpring(pos.x, { stiffness: 120, damping: 18 });
  const y = useSpring(pos.y, { stiffness: 120, damping: 18 });

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  if (!isDesktop) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] rounded-full mix-blend-multiply"
      style={{
        x, y,
        width: 320, height: 320,
        background: 'radial-gradient(circle, rgba(66,133,244,0.06) 0%, transparent 65%)',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(1px)',
      }}
    />
  );
};
