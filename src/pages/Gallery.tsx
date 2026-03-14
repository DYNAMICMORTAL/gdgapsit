import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { BlurText, FadeInSection } from "@/components/AnimationUtils";

interface GalleryItem { seed: string; event: string; type: string; caption: string; color: string; }

const galleryItems: GalleryItem[] = [
  { seed: "Emery", event: "HackAPSIT 2025", type: "Hackathon", caption: "Opening ceremony, Nov 1 2025", color: "#EA4335" },
  { seed: "Eden", event: "HackAPSIT 2025", type: "Hackathon", caption: "Teams building at 3am", color: "#C62828" },
  { seed: "Aiden", event: "HackAPSIT 2025", type: "Hackathon", caption: "Winners on stage", color: "#EA4335" },
  { seed: "Brian", event: "HackAPSIT 2025", type: "Hackathon", caption: "Mentor feedback session", color: "#E53935" },
  { seed: "Kingston", event: "Gen AI Study Jams", type: "Study Jam", caption: "Gemini API lab, Sep 14", color: "#FBBC04" },
  { seed: "Avery", event: "Gen AI Study Jams", type: "Study Jam", caption: "Peer learning in action", color: "#F4A700" },
  { seed: "Riley", event: "Gen AI Study Jams", type: "Study Jam", caption: "Closing session & certificates", color: "#FBBC04" },
  { seed: "Morgan", event: "Flutter Forward", type: "Workshop", caption: "Building our first widget tree", color: "#4285F4" },
  { seed: "Casey", event: "Flutter Forward", type: "Workshop", caption: "Hot reload magic", color: "#1A73E8" },
  { seed: "Jordan", event: "Flutter Forward", type: "Workshop", caption: "Firebase integration demo", color: "#4285F4" },
  { seed: "Taylor", event: "DSA Masterclass", type: "Session", caption: "Graph algorithms walkthrough", color: "#34A853" },
  { seed: "Alex", event: "DSA Masterclass", type: "Session", caption: "Pillai College crowd — inter-college", color: "#1E8E3E" },
  { seed: "Sam", event: "Tech Winter Bootcamp", type: "Bootcamp", caption: "Day 1: HTML/CSS foundations", color: "#7C3AED" },
  { seed: "Jamie", event: "Tech Winter Bootcamp", type: "Bootcamp", caption: "React state management deep-dive", color: "#6D28D9" },
  { seed: "Drew", event: "Tech Winter Bootcamp", type: "Bootcamp", caption: "Project showcase, Day 3", color: "#7C3AED" },
  { seed: "Quinn", event: "Tech Winter Bootcamp", type: "Bootcamp", caption: "Certificate distribution", color: "#5B21B6" },
  { seed: "Parker", event: "Cloud Study Bootcamp", type: "Workshop", caption: "GCP console exploration, MGM College", color: "#4285F4" },
  { seed: "Reese", event: "Cloud Study Bootcamp", type: "Workshop", caption: "Serverless app deployment", color: "#1A73E8" },
  { seed: "Finley", event: "Open Source 101", type: "Session", caption: "First pull request excitement", color: "#34A853" },
  { seed: "Rowan", event: "Open Source 101", type: "Session", caption: "GSOC tips & live demo", color: "#34A853" },
  { seed: "Sage", event: "Android Dev Day", type: "Workshop", caption: "Jetpack Compose live coding", color: "#4285F4" },
  { seed: "River", event: "Android Dev Day", type: "Workshop", caption: "News reader app final reveal", color: "#1A73E8" },
  { seed: "Phoenix", event: "Behind the Scenes", type: "BTS", caption: "Setting up the event hall", color: "#6B7280" },
  { seed: "Blake", event: "Behind the Scenes", type: "BTS", caption: "Core team debrief after HackAPSIT", color: "#4B5563" },
];

const filterTabs = [
  { label: "All Photos", type: "All", bg: "bg-ink", text: "text-white" },
  { label: "Workshops", type: "Workshop", bg: "bg-[#4285F4]", text: "text-white" },
  { label: "Hackathons", type: "Hackathon", bg: "bg-[#EA4335]", text: "text-white" },
  { label: "Sessions", type: "Session", bg: "bg-[#34A853]", text: "text-white" },
  { label: "Bootcamps", type: "Bootcamp", bg: "bg-[#7C3AED]", text: "text-white" },
  { label: "BTS", type: "BTS", bg: "bg-[#6B7280]", text: "text-white" },
];

const heights = ["h-48 sm:h-64", "h-56 sm:h-80", "h-40 sm:h-56", "h-52 sm:h-72", "h-48 sm:h-64", "h-56 sm:h-80",
  "h-40 sm:h-56", "h-52 sm:h-72", "h-48 sm:h-64", "h-40 sm:h-56", "h-56 sm:h-80", "h-48 sm:h-64",
  "h-52 sm:h-72", "h-40 sm:h-56", "h-56 sm:h-80", "h-48 sm:h-64", "h-40 sm:h-56", "h-52 sm:h-72",
  "h-48 sm:h-64", "h-56 sm:h-80", "h-40 sm:h-56", "h-52 sm:h-72", "h-48 sm:h-64", "h-40 sm:h-56"];

const Gallery = () => {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const filtered = filter === "All" ? galleryItems : galleryItems.filter(item => item.type === filter);

  return (
    <div className="pt-0">
      <section className="graph-bg py-12 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <div className="absolute top-8 right-16 w-24 h-32 border-2 border-foreground/[0.04] rounded-lg rotate-[8deg] hidden lg:block" />
          <span className="font-caveat text-ink-muted text-xl">moments captured</span>
          <h1 className="font-syne font-black text-ink leading-[1.05] mt-2" style={{ fontSize: "clamp(2.5rem, 10vw, 5rem)" }}>
            <BlurText text="Our Gallery" delay={80} />
          </h1>
          <div className="flex gap-1 mt-4">
            {["#4285F4", "#EA4335", "#FBBC04", "#34A853"].map(c => (
              <div key={c} className="w-8 sm:w-10 h-1.5 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
          <p className="font-dm text-ink-muted text-base sm:text-lg mt-5 max-w-xl">
            Real moments from our workshops, hackathons, sessions, and the community that makes it all happen.
          </p>
        </div>
      </section>

      <section className="graph-bg pb-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: "touch" }}>
            {filterTabs.map(tab => (
              <button key={tab.type} onClick={() => setFilter(tab.type)}
                className={`px-4 sm:px-5 py-2 rounded-full font-dm font-medium text-xs sm:text-sm transition-all flex-shrink-0 whitespace-nowrap active:scale-95 ${
                  filter === tab.type ? `${tab.bg} ${tab.text}` : "bg-white border border-foreground/10 text-ink-muted hover:border-foreground/30"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="graph-bg py-8 sm:py-12 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              className="columns-2 sm:columns-3 lg:columns-4 gap-2 sm:gap-3 space-y-2 sm:space-y-3">
              {filtered.map((item, i) => (
                <motion.div key={item.seed} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelected(item)}
                  className={`rounded-[14px] sm:rounded-[20px] overflow-hidden cursor-pointer relative group break-inside-avoid ${heights[i % heights.length]}`}
                  style={{ backgroundColor: `${item.color}18` }}>
                  <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, ${item.color}40, ${item.color}10)` }} />
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${item.seed}`} alt={item.caption} className="w-16 sm:w-24 h-16 sm:h-24 opacity-60 group-hover:opacity-80 transition-opacity" />
                  </div>
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[10px] sm:text-xs font-dm font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-white" style={{ backgroundColor: `${item.color}CC` }}>{item.type}</span>
                  </div>
                  {/* Show overlay on touch (always visible at low opacity on mobile) */}
                  <div className="absolute inset-0 bg-black/40 sm:bg-black/0 sm:group-hover:bg-black/50 transition-colors duration-300 flex flex-col justify-end p-3 sm:p-4 opacity-60 sm:opacity-0 sm:group-hover:opacity-100">
                    <span className="font-syne font-bold text-white text-xs sm:text-base">{item.event}</span>
                    <span className="font-dm text-white/80 text-[10px] sm:text-sm mt-0.5 sm:mt-1">{item.caption}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 sm:bg-black/80 backdrop-blur-md p-0 sm:p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full sm:max-w-lg overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="h-48 sm:h-64 relative flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.color}AA)` }}>
                <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${selected.seed}`} alt={selected.caption} className="w-24 sm:w-32 h-24 sm:h-32" />
                <button onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="font-syne font-black text-xl sm:text-2xl text-ink">{selected.event}</h3>
                <p className="font-dm text-ink-muted mt-2 text-sm sm:text-base">{selected.caption}</p>
                <span className="inline-block mt-3 text-xs font-dm font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: selected.color }}>{selected.type}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="bg-dark py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <FadeInSection>
            <span className="font-caveat text-white/40 text-xl">got photos from our events?</span>
            <h2 className="font-syne font-black text-white mt-3" style={{ fontSize: "clamp(1.8rem, 5vw, 3.5rem)" }}>Share Your Memories</h2>
            <p className="font-dm text-white/60 text-sm sm:text-base mt-4">Tag us on Instagram or send your photos to our email.</p>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="inline-block bg-white text-ink font-syne font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full mt-6 sm:mt-8 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 transition-all text-sm sm:text-base">
              📸 Tag @gdgapsit on Instagram
            </a>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
