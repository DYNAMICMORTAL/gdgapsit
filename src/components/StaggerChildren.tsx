import React from 'react';
import { motion } from 'framer-motion';

export const StaggerChildren = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-40px' }}
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.09, delayChildren: delay } },
    }}
  >
    {React.Children.map(children, child => (
      <motion.div variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22,1,0.36,1] } },
      }}>
        {child}
      </motion.div>
    ))}
  </motion.div>
);
