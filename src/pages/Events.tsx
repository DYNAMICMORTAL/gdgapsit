import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays, MapPin, ArrowRight, LayoutGrid, Zap, BookOpen,
  Code2, Users, Rocket, List, Clock,
} from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { useEvents } from "@/hooks/useDB";

// ─── DATA ────────────────────────────────────────────────────
type EventData = any;
// ALL_EVENTS is now dynamically loaded from DB in the component
const FILTER_OPTIONS = [
  { label: "All Events", value: "All", icon: LayoutGrid, color: "#111111" },
  { label: "Hackathons", value: "Hackathon", icon: Zap, color: "#EA4335" },
  { label: "Study Jams", value: "Study Jam", icon: BookOpen, color: "#FBBC04" },
  { label: "Workshops", value: "Workshop", icon: Code2, color: "#4285F4" },
  { label: "Sessions", value: "Session", icon: Users, color: "#34A853" },
  { label: "Bootcamps", value: "Bootcamp", icon: Rocket, color: "#7C3AED" },
];

// ─── DOODLES ────────────────────────────────────────────────
const EventDoodle = ({ type }: { type: string }) => {
  const base = "absolute pointer-events-none select-none";

  if (type === "notebook") return (
    <svg className={`${base} bottom-0 right-0`} width="200" height="160" viewBox="0 0 200 160">
      <rect x="30" y="20" width="140" height="110" rx="4" fill="white" opacity="0.12"/>
      <rect x="30" y="20" width="8" height="110" rx="2" fill="white" opacity="0.2"/>
      {[35,55,75,95].map(cy=><circle key={cy} cx="34" cy={cy} r="4" fill="none" stroke="white" strokeWidth="1.5" opacity="0.35"/>)}
      {[45,58,71,84,97,110].map(cy=><line key={cy} x1="48" y1={cy} x2="158" y2={cy} stroke="white" strokeWidth="1" opacity="0.15"/>)}
      <line x1="48" y1="45" x2="100" y2="45" stroke="white" strokeWidth="1.5" opacity="0.4"/>
      <motion.text x="155" y="30" fill="white" opacity="0.4" fontSize="16" animate={{ y: [-2,2,-2], rotate: [0,15,0] }} transition={{ duration: 3, repeat: Infinity }}>✦</motion.text>
      <motion.text x="15" y="55" fill="white" opacity="0.3" fontSize="12" animate={{ y: [0,-4,0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}>✦</motion.text>
    </svg>
  );

  if (type === "phone") return (
    <svg className={`${base} bottom-2 right-4`} width="120" height="160" viewBox="0 0 120 160">
      <rect x="25" y="10" width="70" height="130" rx="12" fill="white" opacity="0.12" stroke="white" strokeWidth="1.5" strokeOpacity="0.2"/>
      <rect x="35" y="22" width="50" height="95" rx="4" fill="white" opacity="0.08"/>
      <circle cx="60" cy="130" r="5" fill="white" opacity="0.25"/>
      {[[42,70],[62,70],[42,88],[62,88]].map(([x,y],i)=><rect key={i} x={x} y={y} width="12" height="12" rx="3" fill="white" opacity="0.15"/>)}
    </svg>
  );

  if (type === "graph") return (
    <svg className={`${base} bottom-0 right-0`} width="220" height="150" viewBox="0 0 220 150">
      <circle cx="110" cy="25" r="14" fill="white" opacity="0.18"/>
      <text x="110" y="30" textAnchor="middle" fill="white" opacity="0.5" fontSize="10" fontFamily="monospace">42</text>
      <circle cx="65" cy="70" r="12" fill="white" opacity="0.14"/>
      <circle cx="155" cy="70" r="12" fill="white" opacity="0.14"/>
      <text x="65" y="74" textAnchor="middle" fill="white" opacity="0.4" fontSize="9" fontFamily="monospace">17</text>
      <text x="155" y="74" textAnchor="middle" fill="white" opacity="0.4" fontSize="9" fontFamily="monospace">58</text>
      <line x1="100" y1="36" x2="76" y2="58" stroke="white" strokeWidth="1.2" opacity="0.2"/>
      <line x1="120" y1="36" x2="144" y2="58" stroke="white" strokeWidth="1.2" opacity="0.2"/>
      <text x="15" y="140" fill="white" opacity="0.2" fontSize="11" fontFamily="monospace">O(log n)</text>
    </svg>
  );

  if (type === "lightning") return (
    <svg className={`${base} bottom-0 right-0`} width="240" height="180" viewBox="0 0 240 180">
      <path d="M20,90 h40 v-30 h50 v30 h20 v40 h60 v-20 h20" fill="none" stroke="white" strokeWidth="1.2" opacity="0.12"/>
      <motion.polygon points="145,15 125,80 145,80 115,165 170,70 147,70 175,15" fill="white" opacity="0.15" animate={{ opacity: [0.12,0.22,0.12] }} transition={{ duration: 1.8, repeat: Infinity }}/>
      <text x="155" y="165" fill="white" opacity="0.05" fontSize="100" fontFamily="'DM Mono', monospace" fontWeight="900">24</text>
    </svg>
  );

  if (type === "rocket") return (
    <svg className={`${base} bottom-0 right-2`} width="160" height="180" viewBox="0 0 160 180">
      <path d="M80,160 L65,95 Q80,25 95,95 Z" fill="white" opacity="0.15"/>
      <ellipse cx="80" cy="162" rx="16" ry="8" fill="white" opacity="0.1"/>
      <path d="M65,110 Q48,128 44,155 L65,140 Z" fill="white" opacity="0.1"/>
      <path d="M95,110 Q112,128 116,155 L95,140 Z" fill="white" opacity="0.1"/>
      <circle cx="80" cy="90" r="10" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3"/>
      <circle cx="80" cy="90" r="5" fill="white" opacity="0.15"/>
      <motion.path d="M70,162 Q80,185 90,162" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.25"
        animate={{ d: ["M70,162 Q80,185 90,162", "M72,162 Q80,178 88,162", "M70,162 Q80,185 90,162"] }}
        transition={{ duration: 0.6, repeat: Infinity }}/>
    </svg>
  );

  if (type === "cloud") return (
    <svg className={`${base} bottom-2 right-2`} width="200" height="150" viewBox="0 0 200 150">
      <path d="M40,100 Q25,100 25,82 Q25,65 42,63 Q40,38 62,32 Q75,20 95,28 Q108,15 125,22 Q148,18 158,40 Q178,42 178,62 Q178,80 160,82 Z" fill="white" opacity="0.12" stroke="white" strokeWidth="1" strokeOpacity="0.15"/>
      <rect x="60" y="58" width="80" height="30" rx="3" fill="white" opacity="0.08"/>
      {[63,72,81,90,99,108,117,126].map(x=><rect key={x} x={x} y="61" width="5" height="24" rx="1" fill="white" opacity="0.12"/>)}
      <text x="65" y="140" fill="white" opacity="0.06" fontSize="55" fontFamily="'DM Mono', monospace" fontWeight="900">GCP</text>
    </svg>
  );

  if (type === "branch") return (
    <svg className={`${base} bottom-0 right-2`} width="180" height="160" viewBox="0 0 180 160">
      <line x1="90" y1="150" x2="90" y2="20" stroke="white" strokeWidth="1.5" opacity="0.15"/>
      <path d="M90,110 Q90,85 130,70" fill="none" stroke="white" strokeWidth="1.2" opacity="0.2"/>
      <path d="M90,80 Q90,58 50,45" fill="none" stroke="white" strokeWidth="1.2" opacity="0.2"/>
      {[150,110,80,50,20].map((cy,i)=><motion.circle key={cy} cx="90" cy={cy} r="6" fill="white" opacity="0.2" animate={{ scale: [1,1.25,1] }} transition={{ duration: 2, repeat: Infinity, delay: i*0.4 }}/>)}
      <circle cx="130" cy="70" r="5" fill="white" opacity="0.18"/>
      <circle cx="50" cy="45" r="5" fill="white" opacity="0.18"/>
      <path d="M130,70 Q140,35 90,20" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.15"/>
    </svg>
  );

  if (type === "android") return (
    <svg className={`${base} bottom-0 right-4`} width="140" height="180" viewBox="0 0 140 180">
      <line x1="52" y1="55" x2="40" y2="35" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      <line x1="88" y1="55" x2="100" y2="35" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      <circle cx="40" cy="33" r="4" fill="white" opacity="0.3"/>
      <circle cx="100" cy="33" r="4" fill="white" opacity="0.3"/>
      <path d="M38,75 Q38,52 70,52 Q102,52 102,75 L102,90 Q102,93 38,93 Z" fill="white" opacity="0.15"/>
      <motion.circle cx="55" cy="70" r="5" fill="white" opacity="0.4" animate={{ opacity: [0.4,0.1,0.4] }} transition={{ duration: 3, repeat: Infinity }}/>
      <motion.circle cx="85" cy="70" r="5" fill="white" opacity="0.4" animate={{ opacity: [0.4,0.1,0.4] }} transition={{ duration: 3, repeat: Infinity }}/>
      <rect x="38" y="95" width="64" height="60" rx="6" fill="white" opacity="0.12"/>
      <rect x="18" y="95" width="16" height="44" rx="8" fill="white" opacity="0.12"/>
      <rect x="106" y="95" width="16" height="44" rx="8" fill="white" opacity="0.12"/>
      <rect x="45" y="157" width="18" height="22" rx="9" fill="white" opacity="0.12"/>
      <rect x="77" y="157" width="18" height="22" rx="9" fill="white" opacity="0.12"/>
    </svg>
  );

  return null;
};

// ─── KEYWORD TOOLTIPS ────────────────────────────────────────
const KEYWORD_LOGOS: Record<string, React.ReactNode> = {
  gemini: (
    <div className="flex flex-col items-center gap-1">
      <svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 2 L18.5 13.5 L30 16 L18.5 18.5 L16 30 L13.5 18.5 L2 16 L13.5 13.5 Z" fill="#4285F4"/></svg>
      <span className="font-dm text-white text-[10px] font-medium">Gemini</span>
    </div>
  ),
  flutter: (
    <div className="flex flex-col items-center gap-1">
      <svg width="28" height="32" viewBox="0 0 28 32"><polygon points="0,8 14,0 28,8 14,16" fill="#54C5F8" opacity="0.9"/><polygon points="14,16 28,8 28,24 14,32" fill="#29B6F6" opacity="0.9"/><polygon points="0,8 14,16 14,32 0,24" fill="#01579B" opacity="0.9"/></svg>
      <span className="font-dm-mono text-white text-[10px]">Flutter</span>
    </div>
  ),
  firebase: (
    <div className="flex flex-col items-center gap-1">
      <svg width="24" height="32" viewBox="0 0 24 32"><path d="M2,28 L8,10 L14,18 L20,4 L22,28 Z" fill="#FFA000" opacity="0.9"/><path d="M2,28 L8,10 L14,18 Z" fill="#F57C00" opacity="0.9"/></svg>
      <span className="font-dm-mono text-white text-[10px]">Firebase</span>
    </div>
  ),
  react: (
    <div className="flex flex-col items-center gap-1">
      <svg width="32" height="28" viewBox="0 0 32 28"><circle cx="16" cy="14" r="3" fill="#61DAFB"/><ellipse cx="16" cy="14" rx="14" ry="5" fill="none" stroke="#61DAFB" strokeWidth="1.5"/><ellipse cx="16" cy="14" rx="14" ry="5" fill="none" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(60 16 14)"/><ellipse cx="16" cy="14" rx="14" ry="5" fill="none" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(120 16 14)"/></svg>
      <span className="font-dm-mono text-white text-[10px]">React</span>
    </div>
  ),
  kotlin: (
    <div className="flex flex-col items-center gap-1">
      <svg width="28" height="28" viewBox="0 0 28 28"><polygon points="0,0 28,0 14,14" fill="#F6891F" opacity="0.9"/><polygon points="0,0 14,14 0,28" fill="#C757BC" opacity="0.9"/><polygon points="14,14 28,0 28,28" fill="#7F52FF" opacity="0.9"/></svg>
      <span className="font-dm-mono text-white text-[10px]">Kotlin</span>
    </div>
  ),
  tensorflow: (
    <div className="flex flex-col items-center gap-1">
      <svg width="28" height="32" viewBox="0 0 28 32"><path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z" fill="#FF6F00" opacity="0.85"/><text x="14" y="20" textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace" fontWeight="bold">TF</text></svg>
      <span className="font-dm-mono text-white text-[10px]">TensorFlow</span>
    </div>
  ),
  gsoc: (
    <div className="flex flex-col items-center gap-1">
      <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#4285F4" opacity="0.9"/><text x="16" y="21" textAnchor="middle" fill="white" fontSize="9" fontFamily="'DM Sans',sans-serif" fontWeight="bold">GSOC</text></svg>
      <span className="font-dm-mono text-white text-[10px]">Summer of Code</span>
    </div>
  ),
  android: (
    <div className="flex flex-col items-center gap-1">
      <svg width="28" height="28" viewBox="0 0 28 28"><ellipse cx="14" cy="14" rx="12" ry="10" fill="#78C257" opacity="0.9"/><circle cx="9" cy="12" r="2" fill="white"/><circle cx="19" cy="12" r="2" fill="white"/></svg>
      <span className="font-dm-mono text-white text-[10px]">Android</span>
    </div>
  ),
  gcp: (
    <div className="flex flex-col items-center gap-1">
      <svg width="36" height="28" viewBox="0 0 36 28"><path d="M18 2 Q28 2 32 12 Q36 12 36 18 Q36 24 30 24 L8 24 Q2 24 2 18 Q2 12 6 12 Q10 2 18 2Z" fill="white" opacity="0.9"/></svg>
      <span className="font-dm-mono text-white text-[10px]">GCP</span>
    </div>
  ),
};

const KeywordTooltip = ({ logoKey, children }: { keyword: string; logoKey: string; children: React.ReactNode }) => {
  const [hovered, setHovered] = useState(false);
  const logo = KEYWORD_LOGOS[logoKey];

  return (
    <span className="relative inline-block" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span className="border-b border-dashed border-current/40 cursor-default">{children}</span>
      <AnimatePresence>
        {hovered && logo && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.88 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.88 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
              bg-[#111] rounded-[14px] px-4 py-3 shadow-xl pointer-events-none
              flex flex-col items-center whitespace-nowrap"
          >
            {logo}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111]"/>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

function renderDescriptionWithTooltips(text: string, keywordLogos: Record<string, string>) {
  if (!keywordLogos || Object.keys(keywordLogos).length === 0) return <>{text}</>;
  const keywords = Object.keys(keywordLogos);
  const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => {
        const match = keywords.find(k => k.toLowerCase() === part.toLowerCase());
        if (match) return <KeywordTooltip key={i} keyword={match} logoKey={keywordLogos[match]}>{part}</KeywordTooltip>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── CHRONICLE HERO ──────────────────────────────────────────
const ChronicleHero = () => {
  const { ref, inView } = useReveal("-40px");
  return (
    <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
      <motion.div
        className="border-t-[3px] border-b border-black/12 py-3 mb-6 flex items-center justify-between flex-wrap gap-2"
        initial={{ opacity: 0, y: -10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <span className="font-dm-mono text-[#6B6B6B] text-xs uppercase tracking-[0.12em]">The GDG Chronicle</span>
          <span className="w-px h-3 bg-black/15"/>
          <span className="font-dm-mono text-[#6B6B6B] text-xs">Vol. III · Sep 2025 – Jan 2026</span>
        </div>
        <div className="flex items-center gap-2">
          {["#4285F4","#EA4335","#FBBC04","#34A853"].map(c=><div key={c} className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>)}
        </div>
      </motion.div>

      <div className="flex flex-wrap items-baseline gap-x-4 sm:gap-x-6">
        {[
          { text: "Events", color: "#4285F4" },
          { text: "Till", color: "#EA4335" },
          { text: "Now", color: "#FBBC04" },
        ].map((w, i) => (
          <motion.span key={i}
            className="font-syne font-black leading-[0.95] block"
            style={{ fontSize: "clamp(3.5rem, 10vw, 7.5rem)", color: w.color }}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {w.text}
          </motion.span>
        ))}
        <div className="flex items-end pb-4 sm:pb-6 gap-2">
          {["#34A853","#34A853","#34A853"].map((c,i) => (
            <motion.div key={i} className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm"
              style={{ background: c }}
              animate={{ scaleY: [1, 1.8, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>

      <motion.p
        className="font-dm text-[#6B6B6B] text-base sm:text-lg mt-4 max-w-xl"
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}
      >
        From our campus to yours — 8 events, 500+ attendees, 4 cities.
      </motion.p>
    </div>
  );
};

// ─── CHRONICLE MONTH ─────────────────────────────────────────
const ChronicleMonth = ({ group, groupIndex }: { group: { month: string; year: string; events: EventData[] }; groupIndex: number }) => {
  const { ref, inView } = useReveal("-40px");

  return (
    <div ref={ref} className="mb-16 sm:mb-20">
      <motion.div
        className="flex items-center gap-4 mb-6 sm:mb-8"
        initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <span className="absolute -top-2 left-0 font-syne font-black text-black/[0.04] leading-none pointer-events-none select-none whitespace-nowrap"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)", zIndex: 0 }}>
            {group.month.toUpperCase().slice(0, 3)}
          </span>
          <h2 className="relative z-10 font-syne font-black text-[#111] leading-none"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)" }}>
            {group.month}
          </h2>
          <span className="font-dm-mono text-[#6B6B6B]/40 text-xs mt-0.5 block">{group.year}</span>
        </div>
        <div className="flex-1 flex items-center gap-1">
          <div className="flex-1 h-px bg-black/10"/>
          <span className="font-dm-mono text-[#6B6B6B] text-xs px-2.5 py-1 bg-white rounded-full border border-black/8">
            {group.events.length} {group.events.length === 1 ? "event" : "events"}
          </span>
        </div>
      </motion.div>

      <div className={`grid gap-4 ${
        group.events.some(e => e.size === "featured") ? "grid-cols-1"
        : group.events.length === 1 ? "grid-cols-1 max-w-2xl"
        : "grid-cols-1 sm:grid-cols-2"
      }`}>
        {group.events.map((event, ei) => (
          <motion.div key={event.id}
            initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 + ei * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={event.size === "featured" || event.size === "wide" ? "sm:col-span-2" : ""}
          >
            <ChronicleCard event={event}/>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── CHRONICLE CARD ──────────────────────────────────────────
const ChronicleCard = ({ event }: { event: EventData }) => {
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const isFeatured = event.size === "featured";
  const isWide = event.size === "wide" || isFeatured;

  return (
    <div
      className={`group rounded-[24px] overflow-hidden cursor-pointer
        shadow-[0_2px_14px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_48px_rgba(0,0,0,0.13)]
        transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]
        ${isFeatured ? "border-2 border-black/8" : ""}`}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        setMouse({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/events/${event.slug}`)}
    >
      {/* BANNER */}
      <div className="relative overflow-hidden bg-[#111]"
        style={{
          height: isFeatured ? "clamp(200px, 30vw, 300px)" : isWide ? "clamp(160px, 22vw, 220px)" : "clamp(140px, 20vw, 180px)",
          ...(event.imageUrl 
                ? { backgroundImage: `url(${event.imageUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }
                : { background: `linear-gradient(145deg, ${event.bannerColor1}, ${event.bannerColor2})` }
             )
        }}>
        {!event.imageUrl && (
          <>
            <motion.div className="absolute pointer-events-none rounded-full hidden sm:block"
              style={{ width: 280, height: 280, background: "radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 65%)", left: `${mouse.x}%`, top: `${mouse.y}%`, transform: "translate(-50%, -50%)", filter: "blur(24px)" }}
              animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.2 }}/>
            <EventDoodle type={event.doodle}/>
          </>
        )}
        <span className="absolute bottom-0 right-3 font-syne font-black text-white/[0.15] leading-none select-none pointer-events-none drop-shadow-md"
          style={{ fontSize: "clamp(5rem, 12vw, 9rem)", zIndex: 5 }}>
          {String(event.index).padStart(2, "0")}
        </span>
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-caveat font-bold text-white text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/15">{event.type}</span>
            {isFeatured && (
              <motion.span className="font-syne font-black text-[#EA4335] text-xs bg-white px-2.5 py-1 rounded-full shadow-md"
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                ★ FLAGSHIP
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            {event.isInterCollege && <span className="font-dm font-semibold text-white text-xs bg-[#4285F4] px-2.5 py-1 rounded-full shadow-sm">🏫 Inter-College</span>}
            <span className="font-dm-mono text-white/85 text-xs bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full">{event.attendance}</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/35 to-transparent px-5 pb-4 pt-8">
          <h3 className="font-syne font-black text-white leading-tight"
            style={{ fontSize: isFeatured ? "clamp(1.4rem,3.5vw,2rem)" : "clamp(1rem,2.5vw,1.3rem)" }}>
            {event.title}
            <span className="block font-dm font-normal text-white/70 text-sm mt-0.5">{event.subtitle}</span>
          </h3>
        </div>
      </div>

      {/* CARD BODY */}
      <div className={`bg-white px-4 sm:px-5 py-4 ${isWide ? "sm:px-6" : ""}`}>
        <div className="flex items-center gap-3 font-dm text-[#6B6B6B] text-xs sm:text-sm flex-wrap">
          <span className="flex items-center gap-1.5"><CalendarDays size={11} className="opacity-40"/> {event.date}</span>
          <span className="w-1 h-1 rounded-full bg-black/15"/>
          <span className="flex items-center gap-1.5"><MapPin size={11} className="opacity-40"/> {event.location}</span>
          <span className="w-1 h-1 rounded-full bg-black/15 hidden sm:block"/>
          <span className="hidden sm:flex items-center gap-1 text-xs text-[#6B6B6B]/60"><Clock size={10} className="opacity-40"/> {event.duration}</span>
        </div>
        <p className="font-dm text-[#333] text-sm leading-relaxed mt-3 line-clamp-2">
          {renderDescriptionWithTooltips(event.description, event.keywordLogos)}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {event.topics.map((t: string) => {
            const logoKey = Object.entries(event.keywordLogos || {}).find(([k]) => k === t)?.[1] as string | undefined;
            return (
              <span key={t} className="font-dm text-xs px-2.5 py-1 rounded-full font-medium cursor-default transition-all hover:scale-105"
                style={{ background: `${event.typeColor}12`, color: event.typeColor }}>
                {logoKey ? <KeywordTooltip keyword={t} logoKey={logoKey}>{t}</KeywordTooltip> : t}
              </span>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-dm text-xs text-[#6B6B6B]">
            <span className="w-2 h-2 rounded-full" style={{ background: event.typeColor }}/>
            View full details
          </div>
          <motion.div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: `${event.typeColor}15` }}
            whileHover={{ scale: 1.2, rotate: -15 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            <ArrowRight size={13} style={{ color: event.typeColor }}/>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ─── LIST VIEW ───────────────────────────────────────────────
const ListMonth = ({ events }: { events: EventData[] }) => (
  <div className="space-y-2">
    {events.map((event, i) => (
      <motion.div key={event.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
        <Link to={`/events/${event.slug}`}
          className="flex items-center gap-4 bg-white rounded-[16px] p-4 border border-black/5 hover:border-black/15 hover:shadow-md hover:-translate-y-0.5 transition-all group active:scale-[0.99]">
          <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: event.typeColor }}/>
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: `${event.typeColor}15` }}>
            <span className="font-syne font-black text-sm" style={{ color: event.typeColor }}>{String(event.index).padStart(2,"0")}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-syne font-bold text-[#111] text-sm truncate">{event.title}</span>
              {event.isFeatured && <span className="font-dm text-[10px] text-[#EA4335] font-bold">FLAGSHIP</span>}
            </div>
            <div className="font-dm text-[#6B6B6B] text-xs mt-0.5 flex gap-2 flex-wrap">
              <span>{event.date}</span><span>·</span><span>{event.location}</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className="font-caveat font-bold text-xs px-2 py-0.5 rounded-full" style={{ background: `${event.typeColor}12`, color: event.typeColor }}>{event.type}</span>
            <span className="font-dm-mono text-[#6B6B6B] text-xs">{event.attendance}</span>
          </div>
          <ArrowRight size={14} className="text-[#6B6B6B] group-hover:text-[#111] group-hover:translate-x-1 transition-all flex-shrink-0"/>
        </Link>
      </motion.div>
    ))}
  </div>
);

// ─── STATS BAR ───────────────────────────────────────────────
function EventsStatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const stats = [
    { label: "Events Conducted", value: "8+", sub: "Sep 2025 – Jan 2026", color: "#4285F4" },
    { label: "Event Formats", value: "5", sub: "Workshops to Hackathons", color: "#EA4335" },
    { label: "Partner Colleges", value: "3+", sub: "Across Navi Mumbai & Thane", color: "#34A853" },
    { label: "Total Attendees", value: "500+", sub: "And counting...", color: "#FBBC04" },
  ];
  return (
    <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bg-white rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 border border-black/5 shadow-sm">
            <div className="font-syne font-black leading-none" style={{ fontSize: "clamp(1.8rem, 5vw, 3.5rem)", color: s.color }}>{s.value}</div>
            <div className="font-dm font-semibold text-ink text-xs sm:text-sm mt-2">{s.label}</div>
            <div className="font-dm text-[#6B6B6B] text-[10px] sm:text-xs mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function Events() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"chronicle" | "list">("chronicle");

  const { data: dbEvents = [], isLoading, isError, error } = useEvents();

  const allEvents = Array.isArray(dbEvents) ? dbEvents.map((e, index) => {
    let doodle = "notebook";
    if (e.type === "Hackathon") doodle = "lightning";
    else if (e.type === "Workshop") doodle = "phone";
    else if (e.type === "Session") doodle = "branch";
    else if (e.type === "Bootcamp") doodle = "rocket";

    return {
      id: e.id,
      index: index + 1,
      slug: e.slug,
      type: e.type,
      month: e.month || "TBD",
      year: e.date_start ? e.date_start.substring(0, 4) : new Date().getFullYear().toString(),
      title: e.title,
      subtitle: e.description?.split('\n')[0] || "",
      date: e.date_display || e.short_date || "TBD",
      location: e.location || "TBA",
      attendance: e.attendance || "-",
      duration: e.duration || "TBD",
      format: e.format || "In-Person",
      description: e.description || "",
      topics: Array.isArray(e.topics) ? e.topics : [],
      typeColor: e.type_color || e.badge_color || "#4285F4",
      bannerColor1: e.banner_color_1 || e.type_color || "#4285F4",
      bannerColor2: e.banner_color_2 || "#1A73E8",
      isFeatured: e.is_featured,
      isInterCollege: e.is_inter_college,
      keywordLogos: {},
      doodle,
      size: e.is_featured ? "featured" : "narrow",
      imageUrl: e.image_url || null,
    };
  }) : [];

  const CURRENT_YEAR = new Date().getFullYear();
  const allowedYears = [CURRENT_YEAR.toString(), (CURRENT_YEAR - 1).toString()];
  
  const yearlyEvents = allEvents.filter(e => allowedYears.includes(e.year));
  const filtered = activeFilter === "All" ? yearlyEvents : yearlyEvents.filter(e => e.type === activeFilter);
  
  const groupedTasks = filtered.reduce((acc, event) => {
    const key = `${event.month} ${event.year}`;
    if (!acc.has(key)) acc.set(key, { month: event.month, year: event.year, events: [] });
    acc.get(key).events.push(event);
    return acc;
  }, new Map());
  
  const grouped = Array.from(groupedTasks.values());

  return (
    <div className="graph-bg min-h-screen">
      <ChronicleHero/>

      {/* CONTROLS BAR */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-1" style={{ WebkitOverflowScrolling: "touch" } as any}>
          {FILTER_OPTIONS.map((f, i) => {
            const isActive = activeFilter === f.value;
            const count = f.value === "All" ? yearlyEvents.length : yearlyEvents.filter(e => e.type === f.value).length;
            return (
              <motion.button key={f.value}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.06 }}
                onClick={() => setActiveFilter(f.value)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-dm font-medium text-[13px] whitespace-nowrap flex-shrink-0 border transition-all duration-200 active:scale-95
                  ${isActive ? "border-transparent text-white" : "bg-white border-black/10 text-[#6B6B6B] hover:border-black/20"}`}
                style={isActive ? { backgroundColor: f.color } : {}}>
                <f.icon size={12}/>{f.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/25 text-white" : "bg-black/5 text-[#6B6B6B]"}`}>{count}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 bg-white rounded-full p-1 border border-black/8 flex-shrink-0 self-start sm:self-auto">
          {([
            { id: "chronicle", icon: LayoutGrid, label: "Chronicle" },
            { id: "list", icon: List, label: "List" },
          ] as const).map(v => (
            <button key={v.id}
              onClick={() => setViewMode(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-dm text-xs font-medium transition-all active:scale-95
                ${viewMode === v.id ? "bg-[#111] text-white" : "text-[#6B6B6B] hover:text-[#111]"}`}>
              <v.icon size={12}/>{v.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        {isLoading ? (
          <div className="text-center py-20">
            <p className="font-dm text-[#6B6B6B] text-lg">Loading events...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="font-dm text-[#111] text-lg">We couldn&apos;t load events right now.</p>
            <p className="font-dm text-[#6B6B6B] text-sm mt-3">
              {error instanceof Error ? error.message : "The API request failed."}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === "chronicle" ? (
              <motion.div key="chronicle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {grouped.map((g, gi) => <ChronicleMonth key={g.month} group={g} groupIndex={gi}/>)}
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ListMonth events={filtered}/>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        {grouped.length === 0 && viewMode === "chronicle" && !isLoading && !isError && (
          <div className="text-center py-20"><p className="font-dm text-[#6B6B6B] text-lg">No events found for this filter.</p></div>
        )}
      </div>

      <EventsStatsBar/>
    </div>
  );
}
