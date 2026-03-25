import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Github, Linkedin, Instagram, Globe, ArrowRight, Code, BookOpen, X, ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";
import { FloatingPills, CodeSymbols, HandCircle, Squiggle, GDGLogo } from "@/components/Doodles";
import { BlurText, CountUp, FadeInSection, Magnet, TypewriterCycle } from "@/components/AnimationUtils";
import { Link, useNavigate } from "react-router-dom";
import { useReveal } from "@/hooks/useReveal";
import memberBadge from "@/assets/i-am-a-member.png";

const miniGalleryItems = [
  { seed: "Emery", event: "HackAPSIT 2025", type: "Hackathon", color: "#EA4335", h: 280 },
  { seed: "Eden", event: "Gen AI Study Jams", type: "Study Jam", color: "#FBBC04", h: 220 },
  { seed: "Aiden", event: "Flutter Forward", type: "Workshop", color: "#4285F4", h: 260 },
  { seed: "Brian", event: "DSA Masterclass", type: "Session", color: "#34A853", h: 220 },
  { seed: "Kingston", event: "Tech Bootcamp", type: "Bootcamp", color: "#7C3AED", h: 280 },
  { seed: "Avery", event: "Android Dev Day", type: "Workshop", color: "#4285F4", h: 240 },
];

const faqs = [
  { question: "What is GDG on Campus APSIT?", icon: "🎓", color: "#4285F4", answer: "GDG on Campus APSIT is a student-led technology community at A.P. Shah Institute of Technology, Thane. We are officially backed by Google Developer Groups and focused on peer-to-peer learning, hands-on workshops, and building real-world skills that employers actually care about.", highlights: ["student-led", "Google Developer Groups", "peer-to-peer", "hands-on", "real-world"], cta: { label: "Learn more about us", href: "/about" } },
  { question: "Who can join GDG on Campus?", icon: "🙋", color: "#EA4335", answer: "Any student currently enrolled at APSIT can join — regardless of your year, branch, or technical background. Whether you are a complete beginner curious about coding or a final-year student prepping for placements, GDG has something for you. We welcome everyone who is curious and willing to learn.", highlights: ["any student", "regardless", "complete beginner", "final-year", "everyone"], cta: { label: "Join our community", href: "https://gdg.community.dev" } },
  { question: "What kind of events do you host?", icon: "📅", color: "#FBBC04", answer: "We run five types of events: Study Jams (Google-curated learning tracks), Workshops (hands-on technical sessions on Flutter, Cloud, Web, Android), Hackathons (24-hour competitive builds like HackAPSIT), Sessions (focused topic talks), and Bootcamps (multi-day intensive programs). We hosted 8 events between September 2025 and January 2026 alone.", highlights: ["Study Jams", "Workshops", "Hackathons", "Sessions", "Bootcamps", "HackAPSIT"], cta: { label: "Browse all events", href: "/events" } },
  { question: "Are events free to attend?", icon: "💸", color: "#34A853", answer: "Yes — all GDG on Campus APSIT events are completely free for APSIT students. For inter-college events and hackathons with external prizes, there may be a nominal registration fee, but our on-campus events are always free. We believe financial barriers should never stop a student from learning.", highlights: ["completely free", "APSIT students", "nominal", "never stop"], cta: null },
  { question: "How is GDG different from other tech clubs?", icon: "✦", color: "#4285F4", answer: "Three things: Google backing, a global network, and a focus on industry relevance. GDG on Campus chapters are officially recognized by Google, meaning our members get access to Google developer resources, certificates, and pathways into programs like Google Summer of Code and Google Developer certifications.", highlights: ["Google backing", "global network", "industry relevance", "Google Summer of Code", "certifications"], cta: null },
  { question: "What does the core team actually do?", icon: "🔧", color: "#EA4335", answer: "Our core team of 7 leads manages everything end-to-end: the Tech Heads build workshops and learning tracks, the Literature Head writes all our content and blogs, the Cinematographer captures every event for social media, the Operations Head handles logistics, the Creatives Head designs all visuals, and the GDG Lead coordinates everyone.", highlights: ["Tech Heads", "Literature Head", "Cinematographer", "Operations Head", "Creatives Head", "GDG Lead"], cta: { label: "Meet the team", href: "/about" } },
  { question: "Can I collaborate or sponsor an event?", icon: "🤝", color: "#34A853", answer: "Absolutely. We actively collaborate with other GDG on Campus chapters, tech companies, and student organizations. HackAPSIT 2025 featured participation from 5 colleges. If you represent an organization and want to co-host a workshop, sponsor a hackathon, or simply connect — reach out via the contact page.", highlights: ["collaborate", "sponsor", "5 colleges", "co-host", "contact page"], cta: { label: "Get in touch", href: "/contact" } },
  { question: "How do I stay updated on upcoming events?", icon: "📣", color: "#FBBC04", answer: "Follow us on Instagram for event announcements, behind-the-scenes content, and quick updates. Join our GDG Community page on gdg.community.dev to get official notifications and register for events. You can also star us on GitHub for technical resources from our workshops.", highlights: ["Instagram", "GDG Community", "gdg.community.dev", "GitHub"], cta: { label: "Follow on Instagram", href: "https://instagram.com" } },
];

const AnimatedAnswer = ({ text, highlights, color }: { text: string; highlights: string[]; color: string }) => {
  const words = text.split(" ");
  return (
    <p className="font-dm text-sm sm:text-base leading-[1.9] text-ink">
      {words.map((word, i) => {
        const isHighlight = highlights.some(h => word.toLowerCase().includes(h.toLowerCase()));
        return (
          <motion.span key={i} className="inline-block mr-[0.28em] relative"
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: i * 0.022, duration: 0.3, ease: "easeOut" }}>
            {isHighlight ? (
              <span className="relative inline-block">
                <motion.span className="absolute inset-x-[-3px] bottom-0 h-[10px] rounded-sm -z-10"
                  style={{ background: `${color}35` }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.022 + 0.15, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} />
                <span className="font-semibold relative" style={{ color }}>{word}</span>
              </span>
            ) : word}
          </motion.span>
        );
      })}
    </p>
  );
};

const FAQSection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <section className="bg-cream-dark py-14 sm:py-28 relative overflow-hidden">
      <span className="absolute right-10 top-10 font-syne font-black text-[24vw] text-ink/[0.025] select-none pointer-events-none leading-none">?</span>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <span className="font-caveat text-ink-muted text-xl block mb-2">got questions?</span>
        <h2 className="font-syne font-black text-ink leading-none" style={{ fontSize: "clamp(2rem, 6vw, 5rem)" }}>
          We've got<br /><span className="text-g-blue">answers</span><span className="text-g-red">.</span>
        </h2>
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-8 sm:mt-12">
          {faqs.map((faq, i) => (
            <motion.button key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} layout
              className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-full border font-dm font-medium text-xs sm:text-sm transition-all duration-200 text-left active:scale-95"
              style={{ background: openFaq === i ? faq.color : "white", borderColor: openFaq === i ? faq.color : "rgba(0,0,0,0.1)", color: openFaq === i ? "white" : "#111", boxShadow: openFaq === i ? `0 4px 24px ${faq.color}30` : "none" }}
              whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <span className="font-dm-mono text-xs mr-1 sm:mr-2 opacity-50">{String(i + 1).padStart(2, "0")}</span>
              {faq.question}
              <motion.span className="inline-block ml-1 sm:ml-2" animate={{ rotate: openFaq === i ? 45 : 0 }}>+</motion.span>
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {openFaq !== null && (
            <motion.div key={openFaq}
              initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mt-4 sm:mt-6 rounded-[20px] sm:rounded-[28px] overflow-hidden"
              style={{ background: "white", boxShadow: `0 8px 60px ${faqs[openFaq].color}18, 0 2px 8px rgba(0,0,0,0.06)`, borderLeft: `5px solid ${faqs[openFaq].color}` }}>
              <div className="p-5 sm:p-8">
                <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${faqs[openFaq].color}15` }}>
                      <span style={{ color: faqs[openFaq].color }}>{faqs[openFaq].icon}</span>
                    </div>
                    <h3 className="font-syne font-bold text-ink text-base sm:text-xl">{faqs[openFaq].question}</h3>
                  </div>
                  <button onClick={() => setOpenFaq(null)} className="w-8 h-8 rounded-full bg-foreground/[0.05] flex items-center justify-center flex-shrink-0 hover:bg-foreground/10 transition-colors">
                    <X size={15} />
                  </button>
                </div>
                <AnimatedAnswer text={faqs[openFaq].answer} highlights={faqs[openFaq].highlights} color={faqs[openFaq].color} />
                {faqs[openFaq].cta && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-foreground/[0.06]">
                    <Link to={faqs[openFaq].cta!.href} className="inline-flex items-center gap-2 font-syne font-semibold text-sm px-5 py-2.5 rounded-full"
                      style={{ background: `${faqs[openFaq].color}15`, color: faqs[openFaq].color }}>
                      {faqs[openFaq].cta!.label} →
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// ── EventDoodle for Home bento cards ──
const EventDoodle = ({ type }: { type: string }) => {
  const base = "absolute pointer-events-none select-none";
  if (type === "lightning") return (
    <svg className={`${base} bottom-0 right-0`} width="200" height="140" viewBox="0 0 240 180">
      <motion.polygon points="145,15 125,80 145,80 115,165 170,70 147,70 175,15" fill="white" opacity="0.15"
        animate={{ opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 1.8, repeat: Infinity }} />
    </svg>
  );
  if (type === "notebook") return (
    <svg className={`${base} bottom-0 right-0`} width="160" height="120" viewBox="0 0 200 160">
      <rect x="30" y="20" width="140" height="110" rx="4" fill="white" opacity="0.12" />
      {[45, 58, 71, 84].map(y => <line key={y} x1="48" y1={y} x2="158" y2={y} stroke="white" strokeWidth="1" opacity="0.15" />)}
    </svg>
  );
  if (type === "phone") return (
    <svg className={`${base} bottom-2 right-4`} width="100" height="130" viewBox="0 0 120 160">
      <rect x="25" y="10" width="70" height="130" rx="12" fill="white" opacity="0.12" stroke="white" strokeWidth="1.5" strokeOpacity="0.2" />
      <circle cx="60" cy="130" r="5" fill="white" opacity="0.25" />
    </svg>
  );
  return null;
};

// ── Home Events Preview — Bento Grid ──
const HomeEventsPreview = () => {
  const { ref, inView } = useReveal("-60px");
  const navigate = useNavigate();

  const events = [
    { slug: "hackapsit-2025", type: "Hackathon", title: "HackAPSIT 2025", date: "Nov 1–2", location: "APSIT", topics: ["AI/ML", "Web3", "Health Tech"], attendance: "200+", typeColor: "#EA4335", bg1: "#EA4335", bg2: "#C62828", doodle: "lightning" },
    { slug: "gen-ai-study-jams-2025", type: "Study Jam", title: "Gen AI Study Jams", date: "Sep 14–15", location: "APSIT", topics: ["Gemini API", "Prompt Eng."], attendance: "80+", typeColor: "#FBBC04", bg1: "#FBBC04", bg2: "#F59F00", doodle: "notebook" },
    { slug: "flutter-forward", type: "Workshop", title: "Flutter Forward", date: "Oct 4", location: "APSIT", topics: ["Flutter", "Firebase"], attendance: "60+", typeColor: "#4285F4", bg1: "#4285F4", bg2: "#1A73E8", doodle: "phone" },
  ];

  return (
    <section className="graph-bg py-16 sm:py-24">
      <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10 sm:mb-12">
          <div>
            <span className="font-caveat text-[#6B6B6B] text-xl block mb-1">what's been happening</span>
            <h2 className="font-syne font-black text-ink leading-none" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>Events Till Now</h2>
            <svg width="200" height="14" viewBox="0 0 200 14" className="mt-2">
              <motion.path d="M0,7 q25,-7 50,0 t50,0 t50,0 t50,0" fill="none" stroke="#FBBC04" strokeWidth="3" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1, delay: 0.3 }} />
            </svg>
          </div>
          <Link to="/events" className="font-dm text-sm text-ink font-medium flex items-center gap-1.5 border-b border-black/20 pb-0.5 hover:border-black transition-colors hidden sm:flex">
            See all 8 events <ArrowRight size={13} />
          </Link>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Event 1 — Hackathon large */}
          <motion.div className="col-span-2 lg:col-span-3" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            <BentoEventCard event={events[0]} tall />
          </motion.div>
          {/* Event 2 */}
          <motion.div className="col-span-1 lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.18 }}>
            <BentoEventCard event={events[1]} />
          </motion.div>
          {/* Event 3 */}
          <motion.div className="col-span-1 lg:col-span-1" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.26 }}>
            <BentoEventCard event={events[2]} />
          </motion.div>
          {/* Stats block */}
          <motion.div className="col-span-2 sm:col-span-3 lg:col-span-4" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.34 }}>
            <BentoStatsBlock />
          </motion.div>
          {/* Google block */}
          <motion.div className="col-span-2 sm:col-span-3 lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
            <BentoGoogleBlock />
          </motion.div>
        </div>

        <div className="mt-5 sm:hidden">
          <Link to="/events" className="flex items-center justify-center gap-2 py-3 rounded-[14px] border-2 border-dashed border-black/12 text-[#6B6B6B] font-dm font-medium text-sm hover:border-[#4285F4]/40 hover:text-[#4285F4] transition-all">
            View all 8 events <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

const BentoEventCard = ({ event, tall = false }: { event: any; tall?: boolean }) => (
  <Link to={`/events/${event.slug}`}
    className="block rounded-[20px] overflow-hidden relative cursor-pointer group shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_36px_rgba(0,0,0,0.14)] hover:-translate-y-1.5 transition-all duration-300 active:scale-[0.98]"
    style={{ height: tall ? "clamp(240px, 35vw, 320px)" : "clamp(180px, 28vw, 260px)" }}>
    <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${event.bg1}, ${event.bg2})` }} />
    <div className="absolute inset-0 overflow-hidden"><EventDoodle type={event.doodle} /></div>
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
    <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 z-10">
      <div className="flex items-start justify-between">
        <span className="font-caveat font-bold text-white text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/15">{event.type}</span>
        <span className="font-dm-mono text-white/80 text-xs bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">{event.attendance}</span>
      </div>
      <div>
        <h3 className="font-syne font-black text-white leading-tight" style={{ fontSize: tall ? "clamp(1.2rem, 3vw, 1.7rem)" : "clamp(0.95rem, 2vw, 1.2rem)" }}>{event.title}</h3>
        <div className="flex items-center gap-2 mt-1.5 font-dm text-white/70 text-xs">
          <CalendarDays size={10} /> {event.date} · {event.location}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {event.topics.slice(0, 2).map((t: string) => (
            <span key={t} className="font-dm text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/15">{t}</span>
          ))}
        </div>
      </div>
    </div>
  </Link>
);

const BentoStatsBlock = () => (
  <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-black/5 h-full flex flex-col justify-between min-h-[100px]">
    <span className="font-caveat text-[#6B6B6B] text-base">by the numbers</span>
    <div className="grid grid-cols-4 gap-3 mt-3">
      {[
        { val: "8+", lbl: "Events", c: "#4285F4" },
        { val: "500+", lbl: "Attendees", c: "#EA4335" },
        { val: "4+", lbl: "Colleges", c: "#34A853" },
        { val: "5", lbl: "Formats", c: "#FBBC04" },
      ].map(s => (
        <div key={s.lbl} className="text-center">
          <div className="font-syne font-black text-2xl sm:text-3xl" style={{ color: s.c }}>{s.val}</div>
          <div className="font-dm text-[#6B6B6B] text-[11px] mt-0.5 uppercase tracking-wider">{s.lbl}</div>
        </div>
      ))}
    </div>
  </div>
);

const BentoGoogleBlock = () => (
  <div className="bg-[#0A0A0A] rounded-[20px] p-5 relative overflow-hidden flex flex-col justify-between min-h-[100px]">
    <div className="absolute right-3 bottom-3 opacity-[0.07]">
      <svg width="80" height="80" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" />
      </svg>
    </div>
    <div>
      <span className="font-caveat text-white/40 text-sm">backed by</span>
      <div className="flex items-center gap-1.5 mt-1">
        {["#4285F4", "#EA4335", "#FBBC04", "#34A853", "#4285F4", "#EA4335"].map((c, i) => (
          <span key={i} className="font-syne font-black text-base" style={{ color: c }}>{"Google"[i]}</span>
        ))}
      </div>
    </div>
    <Link to="/about" className="font-dm text-white/50 text-xs mt-3 hover:text-white/80 transition-colors flex items-center gap-1">
      Meet the team <ArrowRight size={11} />
    </Link>
  </div>
);

// ── Home Gallery ──
const HomeGallery = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <section className="graph-bg py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="font-caveat text-[#6B6B6B] text-xl block mb-1">captured moments</span>
            <h2 className="font-syne font-black text-ink" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>From Our Events</h2>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full bg-white border border-foreground/10 flex items-center justify-center hover:bg-foreground/[0.05] active:scale-95 transition-all"><ChevronLeft size={18} /></button>
            <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full bg-white border border-foreground/10 flex items-center justify-center hover:bg-foreground/[0.05] active:scale-95 transition-all"><ChevronRight size={18} /></button>
            <Link to="/gallery" className="font-dm text-sm text-ink font-medium flex items-center gap-1 border-b border-black/25 pb-0.5 ml-2 hover:border-black transition-colors">See full gallery <ArrowRight size={13} /></Link>
          </div>
        </div>
        <div className="relative">
          <div ref={scrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-none" style={{ WebkitOverflowScrolling: "touch" } as any}>
            {miniGalleryItems.map((item, i) => (
              <motion.div key={i} className="flex-shrink-0 rounded-[14px] sm:rounded-[20px] overflow-hidden relative cursor-pointer group"
                style={{ width: typeof window !== "undefined" && window.innerWidth < 640 ? "160px" : "200px", height: `${typeof window !== "undefined" && window.innerWidth < 640 ? item.h * 0.8 : item.h}px` }}
                whileHover={{ y: -8, scale: 1.03 }} transition={{ type: "spring", stiffness: 320, damping: 22 }}>
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(145deg, ${item.color}EE, ${item.color}88)` }}>
                  <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                  <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${item.seed}`} className="w-16 sm:w-20 h-16 sm:h-20 opacity-30 relative z-10" alt="" />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                <div className="absolute top-3 left-3 z-10"><span className="font-caveat font-bold text-white text-xs bg-black/25 backdrop-blur-sm px-2 py-0.5 rounded-full">{item.type}</span></div>
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/55 to-transparent p-3"><div className="font-caveat font-bold text-white text-xs sm:text-sm">{item.event}</div></div>
              </motion.div>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-3 w-16 sm:w-20 pointer-events-none bg-gradient-to-l from-[hsl(var(--cream))] to-transparent" />
        </div>
        <div className="sm:hidden mt-4"><Link to="/gallery" className="font-dm text-sm text-ink font-medium flex items-center gap-1 border-b border-black/25 pb-0.5 w-fit">See full gallery <ArrowRight size={13} /></Link></div>
      </div>
    </section>
  );
};

// ── We Are GDG — Simple, no scroll pinning ──
const WeAreGDG = () => {
  const { ref: ref1, inView: inView1 } = useReveal("-60px");
  const { ref: ref2, inView: inView2 } = useReveal("-40px");

  return (
    <section className="bg-[#0A0A0A] py-16 sm:py-24 overflow-visible relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#4285F4]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#EA4335]/[0.04] blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ROW 1: Identity */}
        <div ref={ref1} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 sm:gap-16 mb-12 sm:mb-16">
          <div>
            <GDGLogo size={48} />
            <motion.span className="font-caveat text-[#FBBC04] text-2xl sm:text-3xl mt-4 block"
              initial={{ opacity: 0, x: -20 }} animate={inView1 ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.1 }}>
              we are
            </motion.span>
            <motion.h2 className="font-syne font-black text-white leading-[0.88] mt-1"
              style={{ fontSize: "clamp(3.5rem, 10vw, 8rem)" }}
              initial={{ opacity: 0, y: 24 }} animate={inView1 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              GDG<br />APSIT
            </motion.h2>
            <motion.span className="font-dm-mono text-white/20 text-sm mt-3 block"
              initial={{ opacity: 0 }} animate={inView1 ? { opacity: 1 } : {}} transition={{ delay: 0.45 }}>
              Est. 2022 · Thane, Maharashtra
            </motion.span>
            {/* Member badge */}
            <motion.img src={memberBadge} alt="I am a member of GDG on Campus APSIT"
              className="mt-6 w-48 sm:w-56 rounded-2xl shadow-lg border border-white/10"
              initial={{ opacity: 0, scale: 0.9 }} animate={inView1 ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.55, duration: 0.5 }} />
          </div>

          <div className="max-w-sm">
            <motion.div className="flex gap-1.5 mb-5"
              initial={{ scaleX: 0 }} animate={inView1 ? { scaleX: 1 } : {}}
              style={{ transformOrigin: "left" }} transition={{ delay: 0.35, duration: 0.6 }}>
              {["#4285F4", "#EA4335", "#FBBC04", "#34A853"].map(c => (
                <div key={c} className="flex-1 h-[3px] rounded-full" style={{ background: c }} />
              ))}
            </motion.div>
            <motion.p className="font-syne font-bold text-white leading-[1.3]"
              style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)" }}
              initial={{ opacity: 0, y: 16 }} animate={inView1 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
              "Learning should have no gatekeepers."
            </motion.p>
            <motion.p className="font-dm text-white/55 text-sm sm:text-base leading-relaxed mt-4"
              initial={{ opacity: 0 }} animate={inView1 ? { opacity: 1 } : {}} transition={{ delay: 0.55 }}>
              We host events at APSIT and partner colleges — study jams, hackathons, bootcamps, and sessions. Open to all.
            </motion.p>
            <motion.div className="mt-5 font-dm-mono text-sm flex flex-col gap-1.5"
              initial={{ opacity: 0 }} animate={inView1 ? { opacity: 1 } : {}} transition={{ delay: 0.65 }}>
              {[["$", "building skills", "#34A853"], ["$", "fostering community", "#4285F4"], ["$", "opening doors", "#FBBC04"]].map(([, cmd, color]) => (
                <div key={cmd} className="flex items-center gap-2">
                  <span style={{ color }}>$</span><span className="text-white/35">{cmd}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="h-px bg-white/[0.06] mb-12 sm:mb-16" />

        {/* ROW 2: Story + Stats */}
        <div ref={ref2} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <motion.div className="lg:col-span-2 bg-[#161616] rounded-[24px] p-7 sm:p-9 border border-white/5 relative overflow-hidden"
            initial={{ opacity: 0, y: 24 }} animate={inView2 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            <div className="flex gap-1 absolute top-0 left-0 right-0 h-[3px]">
              {["#4285F4", "#EA4335", "#FBBC04", "#34A853"].map(c => <div key={c} className="flex-1" style={{ background: c }} />)}
            </div>
            <h3 className="font-syne font-bold text-white text-xl sm:text-2xl mt-2 mb-4">Our Story</h3>
            <p className="font-dm text-white/65 text-sm sm:text-base leading-[1.9]">
              Founded as GDSC APSIT in 2022, we became GDG on Campus in 2024 —
              a recognition backed by{" "}<span className="text-[#34A853] font-medium">GoogleForDevs</span>.
              We've run 15+ events, collaborated with 4+ colleges, and helped
              200+ students build skills that matter. Our flagship events —{" "}
              <span className="text-[#4285F4] font-medium">HackAPSIT</span>,{" "}
              <span className="text-[#FBBC04] font-medium">Gen AI Study Jams</span>, and our{" "}
              <span className="text-[#34A853] font-medium">Tech Bootcamps</span> — are open to all.
            </p>
          </motion.div>

          <motion.div className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 24 }} animate={inView2 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}>
            {[
              { value: "200+", label: "Members", color: "#4285F4" },
              { value: "15+", label: "Events", color: "#EA4335" },
              { value: "4+", label: "Colleges", color: "#34A853" },
              { value: "500+", label: "Attendees", color: "#FBBC04" },
            ].map((s, i) => (
              <motion.div key={s.label} className="bg-[#161616] rounded-[18px] px-5 py-4 border border-white/5 flex items-center justify-between"
                initial={{ opacity: 0, x: 20 }} animate={inView2 ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.2 + i * 0.08 }}>
                <span className="font-syne font-black text-3xl" style={{ color: s.color }}>{s.value}</span>
                <span className="font-dm text-white/35 text-xs uppercase tracking-widest">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  return (
    <div>
      {/* HERO */}
      <section className="graph-bg relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <FloatingPills />
        <CodeSymbols />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-syne font-black text-[20vw] text-foreground/[0.03] select-none pointer-events-none leading-none">GDG</span>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 sm:gap-3 bg-white border border-foreground/[0.1] shadow-sm rounded-full px-3 sm:px-5 py-2 sm:py-2.5 mb-6 sm:mb-8 text-xs sm:text-sm flex-wrap justify-center">
            <div className="flex flex-col gap-0 w-[4px] h-6 rounded-full overflow-hidden">
              <div className="flex-1 bg-[#4285F4]" /><div className="flex-1 bg-[#EA4335]" /><div className="flex-1 bg-[#FBBC04]" /><div className="flex-1 bg-[#34A853]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-dm font-medium text-ink">🎓 Google Developer Groups</span>
              <span className="font-dm text-xs text-ink-muted">On Campus · APSIT, Thane</span>
            </div>
          </motion.div>

          <h1 className="font-syne font-black leading-[1.05] text-ink" style={{ fontSize: "clamp(2.4rem, 8vw, 5.5rem)" }}>
            <BlurText text="Google" delay={80} />
            <span className="relative inline-block mx-[0.3em]"><BlurText text="Developer" delay={80} /><HandCircle color="#FBBC04" /></span>
            <br className="hidden sm:block" />
            <BlurText text="Groups On Campus" delay={80} /><br /><BlurText text="APSIT" delay={80} />
          </h1>

          <div className="mt-4 sm:mt-6">
            <TypewriterCycle phrases={["Converting Coffee into Code ☕", "Building the Future, One Commit at a Time 🚀", "Where Curiosity Meets Code 🧠"]} className="font-dm font-medium text-base sm:text-xl text-ink-muted" />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-8 px-4 sm:px-0">
            <Link to="/events" className="w-full sm:w-auto bg-g-blue text-white px-7 py-3 rounded-full font-syne font-bold hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all inline-flex items-center justify-center gap-2">
              Explore Events <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="w-full sm:w-auto bg-transparent border-2 border-ink text-ink px-7 py-3 rounded-full font-syne font-bold hover:bg-ink hover:text-white active:scale-95 transition-all text-center">
              Meet the Team
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }} className="flex flex-wrap justify-center gap-3 mt-6 sm:mt-8">
            {[
              { icon: <Github size={20} />, href: "#", hoverColor: "#333" },
              { icon: <Linkedin size={20} />, href: "#", hoverColor: "#0A66C2" },
              { icon: <Instagram size={20} />, href: "#", hoverColor: "#E4405F" },
              { icon: <Globe size={20} />, href: "https://gdg.community.dev", hoverColor: "#4285F4" },
            ].map((s, i) => (
              <Magnet key={i}>
                <a href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-white border border-foreground/10 shadow-sm flex items-center justify-center text-ink-muted hover:text-white transition-all"
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = s.hoverColor)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                  {s.icon}
                </a>
              </Magnet>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="graph-bg py-14 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <FadeInSection>
                <span className="font-caveat text-g-blue text-xl tracking-wide">what we do</span>
                <h2 className="font-syne font-black text-ink mt-2 leading-[1.05]" style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}>The<br />Clubhouse</h2>
                <p className="font-dm text-sm sm:text-base text-ink-muted mt-4 sm:mt-5 leading-relaxed max-w-sm">
                  We're a Google-backed student community at APSIT. We run workshops, host hackathons, organize study jams, and build real-world skills. One event at a time.
                </p>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none sm:flex-col sm:overflow-visible mt-6 sm:mt-8">
                  {[
                    { n: 200, s: "+", label: "Members", color: "text-g-blue" },
                    { n: 15, s: "+", label: "Events Hosted", color: "text-g-red" },
                    { n: 4, s: "+", label: "Partner Colleges", color: "text-g-green" },
                  ].map((stat, i) => (
                    <div key={stat.label} className={`flex-shrink-0 min-w-[140px] sm:min-w-0 ${i < 2 ? "sm:border-b sm:border-ink/[0.08] sm:pb-6" : ""}`}>
                      <div className={`font-syne font-black text-4xl sm:text-6xl ${stat.color}`}><CountUp target={stat.n} suffix={stat.s} /></div>
                      <div className="font-dm text-xs sm:text-sm text-ink-muted uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </FadeInSection>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 gap-3">
              <FadeInSection delay={0}>
                <motion.div whileHover={{ y: -5, rotate: -0.5 }} className="bg-[#EBF3FF] rounded-[20px] p-5 sm:p-7 border border-[#4285F4]/15 min-h-[180px] sm:min-h-[220px] relative overflow-hidden cursor-default">
                  <Code size={28} className="text-[#4285F4] sm:w-8 sm:h-8" /><h3 className="font-syne font-black text-xl sm:text-2xl text-ink mt-3 sm:mt-4">Workshops</h3>
                  <p className="font-dm text-xs sm:text-sm text-ink-muted mt-2">Hands-on Flutter, Cloud, Android & Web sessions</p>
                  <span className="absolute -bottom-4 -right-4 text-[5rem] sm:text-[7rem] opacity-[0.06] font-mono font-black text-[#4285F4] select-none pointer-events-none leading-none">{`</>`}</span>
                </motion.div>
              </FadeInSection>
              <FadeInSection delay={0.1} className="lg:row-span-2">
                <motion.div whileHover={{ scale: 1.02 }} className="bg-dark rounded-[20px] p-5 sm:p-7 min-h-[180px] lg:min-h-[460px] relative overflow-hidden cursor-default flex flex-col justify-between">
                  <div>
                    <span className="font-caveat font-bold text-[#EA4335] text-sm sm:text-base bg-[#EA4335]/10 px-3 py-1 rounded-full inline-block">24hrs</span>
                    <h3 className="font-syne font-black text-2xl sm:text-3xl text-white mt-3 sm:mt-4 leading-tight">Hack-<br />athons</h3>
                    <p className="font-dm text-xs sm:text-sm text-white/60 mt-2 sm:mt-3">24-hour innovation sprints. Build, pitch, win.</p>
                  </div>
                  <div className="text-center py-2 sm:py-4 hidden lg:block"><span className="text-[6rem] opacity-20 select-none">⚡</span></div>
                  <div><span className="font-dm-mono text-[#EA4335] text-xs">50+ teams · ₹50K prizes</span></div>
                  <div className="w-32 h-32 rounded-full border-[3px] border-[#EA4335]/20 absolute -bottom-8 -right-8 hidden sm:block" />
                </motion.div>
              </FadeInSection>
              <FadeInSection delay={0.2}>
                <motion.div whileHover={{ y: -5, rotate: 0.5 }} className="bg-[#FEF9E7] rounded-[20px] p-5 sm:p-7 border border-[#FBBC04]/30 min-h-[160px] sm:min-h-[200px] relative overflow-hidden cursor-default"
                  style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 20px, rgba(251,188,4,0.08) 20px, rgba(251,188,4,0.08) 21px)" }}>
                  <BookOpen size={24} className="text-[#FBBC04] sm:w-7 sm:h-7" /><h3 className="font-syne font-black text-xl sm:text-2xl text-ink mt-2 sm:mt-3">Study Jams</h3>
                  <p className="font-dm text-xs sm:text-sm text-ink-muted mt-2">Google-curated paths. Learn together.</p>
                </motion.div>
              </FadeInSection>
              <FadeInSection delay={0.3} className="col-span-2">
                <motion.div whileHover={{ y: -5 }} className="bg-[#E8F5EC] rounded-[20px] p-5 sm:p-7 border border-[#34A853]/20 min-h-[160px] sm:min-h-[200px] relative overflow-hidden cursor-default">
                  <h3 className="font-syne font-black text-xl sm:text-2xl text-ink">Sessions &<br />Bootcamps</h3>
                  <p className="font-dm text-xs sm:text-sm text-ink-muted mt-2">Deep dives into DSA, Cloud, Full-Stack & Open Source.</p>
                  <span className="text-[4rem] sm:text-[5rem] opacity-[0.15] absolute -bottom-2 -right-2 select-none pointer-events-none">👥</span>
                </motion.div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION BOUNDARY — GIF pinned at the seam between light + dark sections */}
      <div className="relative">
        <WeAreGDG />
        {/* "putting things together" GIF — floats at the top-right of the dark section, overlapping the boundary */}
        <div className="absolute top-0 right-4 sm:right-8 lg:right-16 -translate-y-1/2 z-20 pointer-events-none select-none">
          <img
            src="/putting things together.gif"
            alt="Putting things together"
            className="w-36 sm:w-48 lg:w-56 h-auto drop-shadow-2xl"
          />
        </div>
      </div>

      <HomeEventsPreview />
      <HomeGallery />
      <FAQSection />

      {/* JOIN CTA */}
      <section className="graph-bg py-16 sm:py-28 relative overflow-hidden">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-syne font-black text-[18vw] text-ink/[0.03] select-none pointer-events-none leading-none whitespace-nowrap">BUILD</span>
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <FadeInSection>
            <span className="font-caveat text-ink-muted text-xl">ready to build something?</span>
            <h2 className="font-syne font-black text-ink mt-3 leading-tight" style={{ fontSize: "clamp(2.8rem, 11vw, 5rem)" }}>
              Join <span className="text-g-blue">1800+</span><br /><span className="text-g-red">builders</span>
            </h2>
            <p className="font-dm text-ink-muted text-base sm:text-lg mt-4">Students learning, building, and growing together at APSIT.</p>
            <div className="flex items-center justify-center gap-3 mt-8">
              {["Emery", "Eden", "Aiden", "Brian", "Kingston"].map((seed, i) => (
                <div key={seed} className="w-11 h-11 rounded-full border-2 border-cream bg-white overflow-hidden" style={{ marginLeft: i > 0 ? "-8px" : "0", zIndex: 5 - i }}>
                  <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${seed}`} alt={seed} className="w-full h-full" />
                </div>
              ))}
              <span className="font-dm text-ink-muted text-sm ml-3">+1795 more</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-8 px-4 sm:px-0">
              <a href="https://gdg.community.dev/gdg-on-campus-ap-shah-institute-of-technology-thane-india" target="_blank" rel="noopener noreferrer"
                className="w-full sm:w-auto bg-ink text-white px-8 py-3.5 rounded-full font-syne font-bold hover:-translate-y-0.5 hover:shadow-xl active:scale-95 transition-all text-center">
                Join Our Community →
              </a>
              <Link to="/events" className="w-full sm:w-auto px-8 py-3.5 rounded-full font-syne font-bold text-ink border-2 border-ink/20 hover:border-ink active:scale-95 transition-all text-center">
                Explore Events
              </Link>
            </div>
            <div className="flex justify-center gap-2 mt-10 sm:mt-12">
              {["#4285F4", "#EA4335", "#FBBC04", "#34A853"].map(c => <div key={c} className="w-8 h-2 rounded-full" style={{ backgroundColor: c }} />)}
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
};

export default Home;
