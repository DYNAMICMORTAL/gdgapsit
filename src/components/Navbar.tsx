import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Github, Linkedin, Instagram, Globe } from "lucide-react";
import { GDGLogo } from "./Doodles";

const navLinks = [
  { label: "Home", to: "/", color: "#4285F4" },
  { label: "About", to: "/about", color: "#EA4335" },
  { label: "Events", to: "/events", color: "#FBBC04" },
  { label: "Calendar", to: "/calendar", color: "#7C3AED" },
  { label: "Gallery", to: "/gallery", color: "#34A853" },
  { label: "Contact", to: "/contact", color: "#4285F4" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200
          ${scrolled
            ? "bg-[hsl(var(--cream))]/92 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.06)]"
            : "bg-[hsl(var(--cream))]/85 backdrop-blur-md"
          } border-b border-foreground/[0.06]`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/GDG-Sticker-Brackets.gif" alt="" aria-hidden="true" className="h-9 w-auto pointer-events-none select-none" />
            {/* <GDGLogo size={36} /> */}
            <span className="font-syne font-bold text-ink text-base tracking-tight">gdg_apsit</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}
                  className="relative px-4 py-2 font-dm font-medium text-sm text-ink/80 hover:text-ink transition-colors rounded-full hover:bg-foreground/[0.04]">
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navDot"
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: link.color }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <Link to="/login"
            className="hidden md:flex items-center px-5 py-2 rounded-full border-[1.5px] border-ink/80 font-syne font-semibold text-sm text-ink hover:bg-ink hover:text-white transition-all duration-200">
            Login
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-foreground/[0.06] transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {open
                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <X size={22} />
                </motion.div>
                : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Menu size={22} />
                </motion.div>
              }
            </AnimatePresence>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)} />

            <motion.div key="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 w-[80vw] max-w-[320px] bg-[#0A0A0A] z-50 md:hidden flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div className="flex items-center gap-2">
                  <GDGLogo size={28} />
                  <span className="font-syne font-bold text-white text-sm">gdg_apsit</span>
                </div>
                <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center">
                  <X size={18} className="text-white" />
                </button>
              </div>

              <div className="h-px bg-white/[0.08] mx-6" />

              <nav className="flex flex-col px-4 pt-6 pb-4 gap-1">
                {navLinks.map((link, i) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <motion.div key={link.to} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.06 }}>
                      <Link to={link.to}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-[14px] font-syne font-bold text-xl transition-all
                          ${isActive ? "text-white bg-white/[0.08]" : "text-white/60 hover:text-white hover:bg-white/[0.05]"}`}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: isActive ? link.color : "rgba(255,255,255,0.2)" }} />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="h-px bg-white/[0.08] mx-6" />

              <div className="px-6 pt-5">
                <Link to="/login"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-ink rounded-[14px] font-syne font-bold text-base">
                  Login / Admin
                </Link>
              </div>

              <div className="px-6 pt-6 flex gap-3">
                {[
                  { icon: Github, href: "https://github.com/gdg-apsit" },
                  { icon: Linkedin, href: "https://linkedin.com/company/gdg-apsit" },
                  { icon: Instagram, href: "https://instagram.com/gdgapsit" },
                  { icon: Globe, href: "https://gdg.community.dev" },
                ].map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.15] transition-all">
                    <s.icon size={16} />
                  </a>
                ))}
              </div>

              <div className="mt-auto px-6 pb-8 pt-6">
                <p className="font-dm-mono text-[#34A853]/60 text-xs">$ sudo rm -rf negativity/</p>
                <p className="font-dm text-white/20 text-xs mt-1">© 2025 GDG on Campus APSIT</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
}
