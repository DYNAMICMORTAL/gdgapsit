import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Instagram, Globe, MapPin, ArrowUpRight, Mail, ArrowRight } from "lucide-react";
import { GDGLogo } from "./Doodles";

const Footer = () => {
  const [terminalRan, setTerminalRan] = useState(false);

  return (
    <footer className="bg-[#0A0A0A]">
      {/* ── TOP: Editorial statement ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-8 sm:pb-10
        flex flex-col md:flex-row md:items-end md:justify-between gap-8
        border-b border-white/[0.06]">
        <div>
          <h2 className="font-syne font-black text-white leading-[1.0]"
            style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)" }}>
            Let's build<br />something<br />
            <span className="relative inline-block">
              amazing
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8">
                <motion.path d="M0,5 q50,-8 100,0 t100,0"
                  fill="none" stroke="#FBBC04" strokeWidth="3" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }} />
              </svg>
            </span>
            {" "}together.
          </h2>
        </div>

        <div className="flex flex-col items-start md:items-end gap-4">
          <a href="mailto:gdgoncampus.apsit@gmail.com"
            className="font-dm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-2 text-base">
            <Mail size={15} className="text-white/40" />
            gdgoncampus.apsit@gmail.com
          </a>
          <div className="flex gap-2.5">
            {[
              { icon: Github, href: "https://github.com/gdg-apsit", label: "GitHub" },
              { icon: Linkedin, href: "https://gdg.community.dev/gdg-on-campus-ap-shah-institute-of-technology-thane-india/", label: "LinkedIn" },
              { icon: Instagram, href: "https://www.instagram.com/gdg.apsit/", label: "Instagram" },
              { icon: Globe, href: "https://gdg.community.dev/gdg-on-campus-ap-shah-institute-of-technology-thane-india/", label: "GDG" },
            ].map(s => (
              <motion.a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08]
                  flex items-center justify-center text-white/50
                  hover:bg-white/[0.14] hover:text-white transition-all"
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <s.icon size={16} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* ── MIDDLE: 3 columns ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14
        grid grid-cols-2 md:grid-cols-3 gap-8 border-b border-white/[0.06]">

        {/* Col 1 — Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <GDGLogo size={28} />
            <span className="font-syne font-bold text-white text-sm">gdg_apsit</span>
          </div>
          <p className="font-dm text-white/35 text-sm leading-relaxed max-w-xs">
            A student chapter of Google Developer Groups on Campus at
            A.P. Shah Institute of Technology, Thane.
          </p>

          {/* Terminal easter egg */}
          <div
            className="mt-5 font-dm-mono text-sm cursor-pointer select-none"
            onClick={() => setTerminalRan(true)}
            title="Click to run!"
          >
            <span className="text-[#34A853]">$</span>
            <span className="text-white/25 hover:text-white/50 transition-colors">
              {" "}sudo rm -rf negativity/
            </span>
          </div>
          <AnimatePresence>
            {terminalRan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="font-dm-mono text-xs mt-1 overflow-hidden"
              >
                <span className="text-[#34A853]">✓</span>
                <span className="text-white/30"> Removed: self-doubt, imposter syndrome, procrastination</span>
                <br />
                <span className="text-[#FBBC04]">!</span>
                <span className="text-white/25"> Warning: happiness.exe is now running in background</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-5 inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-dm text-white/45 text-xs">Backed by Google</span>
          </div>
        </div>

        {/* Col 2 — Navigate */}
        <div>
          <span className="font-syne font-semibold text-white/40 text-xs uppercase tracking-[0.12em] mb-4 block">Navigate</span>
          <div className="flex flex-col gap-2.5">
            {[["Home", "/"], ["About", "/about"], ["Events", "/events"], ["Calendar", "/calendar"], ["Gallery", "/gallery"], ["Skills", "/skills"], ["Contact", "/contact"]].map(([l, to]) => (
              <Link key={l} to={to}
                className="font-dm text-white/40 text-sm hover:text-white transition-colors w-fit hover:translate-x-1 transform">
                {l}
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3 — Connect */}
        <div>
          <span className="font-syne font-semibold text-white/40 text-xs uppercase tracking-[0.12em] mb-4 block">Connect</span>
          <a href="https://gdg.community.dev/gdg-on-campus-ap-shah-institute-of-technology-thane-india/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#4285F4]/10 border border-[#4285F4]/20
              rounded-[10px] px-3.5 py-2.5 mb-2.5 hover:bg-[#4285F4]/20 transition-colors group">
            <Globe size={13} className="text-[#4285F4]" />
            <span className="font-dm text-white/60 text-sm group-hover:text-white transition-colors">gdg.community.dev/apsit-campus</span>
            <ArrowUpRight size={11} className="text-white/25 ml-auto" />
          </a>
          <div className="flex items-start gap-2 px-1 py-2">
            <MapPin size={12} className="text-white/25 mt-0.5 flex-shrink-0" />
            <span className="font-dm text-white/30 text-xs leading-relaxed">
              A.P. Shah Institute of Technology,<br />Thane, Maharashtra 400607
            </span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-5
        flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2">
            <GDGLogo size={20} />
            <span className="font-syne font-bold text-white/40 text-xs">gdg_apsit</span>
          </div>
          <span className="text-white/12">|</span>
          <span className="font-dm-mono text-[#34A853]/40 text-xs">$ sudo rm -rf negativity/</span>
        </div>
        <span className="font-dm text-white/20 text-xs">© 2025 GDG on Campus APSIT</span>
      </div>

      {/* ── BUILT WITH ── */}
      <div className="border-t border-white/[0.04] py-3.5 text-center">
        <span className="font-dm text-white/[0.15] text-xs">Built with </span>
        <span className="font-dm text-[#61DAFB]/30 text-xs font-medium">React</span>
        <span className="font-dm text-white/[0.15] text-xs">, </span>
        <span className="font-dm text-[#3178C6]/30 text-xs font-medium">TypeScript</span>
        <span className="font-dm text-white/[0.15] text-xs">, and brought to life with </span>
        <span className="font-dm text-[#FF0066]/30 text-xs font-medium">Motion</span>
      </div>
    </footer>
  );
};

export default Footer;
