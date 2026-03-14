import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

// BlurText — words animate in from blur
export const BlurText = ({
  text,
  className = "",
  delay = 80,
}: {
  text: string;
  className?: string;
  delay?: number;
}) => {
  const words = text.split(" ");
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * (delay / 1000), ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

// CountUp — count from 0 to target on scroll
export const CountUp = ({
  target,
  suffix = "",
  className = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {count}{suffix}
    </span>
  );
};

// FadeInSection — wraps children in a fade-up on scroll
export const FadeInSection = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Magnet — subtle magnetic pull on hover
export const Magnet = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setPos({ x, y });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {children}
    </motion.div>
  );
};

// TypewriterCycle — cycles through phrases
export const TypewriterCycle = ({
  phrases,
  className = "",
}: {
  phrases: string[];
  className?: string;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [phrases.length]);

  return (
    <div className={`relative h-8 overflow-hidden ${className}`}>
      {phrases.map((phrase, i) => (
        <motion.p
          key={phrase}
          className="absolute inset-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: i === index ? 1 : 0, y: i === index ? 0 : -20 }}
          transition={{ duration: 0.5 }}
        >
          {phrase}
        </motion.p>
      ))}
    </div>
  );
};

// Aurora background
export const Aurora = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 overflow-hidden ${className}`}>
    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-[spin_20s_linear_infinite] opacity-30">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-g-blue/20 blur-[120px]" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-g-red/15 blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-g-green/10 blur-[120px]" />
    </div>
  </div>
);
