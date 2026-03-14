import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Mail, X } from "lucide-react";
import { Squiggle, GDGLogo } from "@/components/Doodles";
import { BlurText, FadeInSection } from "@/components/AnimationUtils";

const teamMembers = [
  { seed: "Eden", name: "Arjun Mehta", role: "Tech Head", color: "#EA4335", bio: "Web dev wizard & open-source contributor. Runs our flagship coding workshops." },
  { seed: "Aiden", name: "Priya Nair", role: "Tech Head", color: "#EA4335", bio: "Android & Flutter specialist. Mentors juniors through our bootcamp programs." },
  { seed: "Brian", name: "Zara Khan", role: "Literature Head", color: "#FBBC04", bio: "Storyteller turned techie. Crafts all our content, blogs, and event narratives." },
  { seed: "Kingston", name: "Dev Patel", role: "Cinematographer", color: "#34A853", bio: "Captures every GDG moment. From event reels to behind-the-scenes content." },
  { seed: "Avery", name: "Mihir Shah", role: "Operations Head", color: "#4285F4", bio: "The backbone of logistics. Every event runs smoothly because of Mihir." },
  { seed: "Riley", name: "Ananya Joshi", role: "Creatives Head", color: "#EA4335", bio: "Designs every poster, banner, and social post that makes GDG APSIT recognizable." },
];

const extendedTeamMembers = [
  { seed: "Phoenix", name: "Yash Gupta", role: "Tech Core", roleColor: "#EA4335", bio: "Backend engineer, loves building APIs and tinkering with cloud infra.", linkedin: "#", email: "yash@gdgapsit.com" },
  { seed: "Blake", name: "Sneha Patil", role: "Design Core", roleColor: "#FBBC04", bio: "UI/UX enthusiast obsessed with Figma and motion design.", linkedin: "#", email: "sneha@gdgapsit.com" },
  { seed: "River", name: "Rohan Verma", role: "Events Core", roleColor: "#34A853", bio: "Logistics wizard. Never misses a deadline, ever.", linkedin: "#", email: "rohan@gdgapsit.com" },
  { seed: "Morgan", name: "Ishaan Thakur", role: "Tech Core", roleColor: "#EA4335", bio: "Flutter and Firebase developer. Building cross-platform, one widget at a time.", linkedin: "#", email: "" },
  { seed: "Casey", name: "Aishwarya Rao", role: "Literature Core", roleColor: "#FBBC04", bio: "Writes our blogs, newsletters, and event descriptions with flair.", linkedin: "#", email: "aishwarya@gdgapsit.com" },
  { seed: "Jordan", name: "Kunal Shah", role: "Media Core", roleColor: "#34A853", bio: "Videographer and reel-maker behind all our Instagram content.", linkedin: "", email: "kunal@gdgapsit.com" },
  { seed: "Taylor", name: "Ritika Jain", role: "Operations Core", roleColor: "#4285F4", bio: "Manages logistics, sponsorships, and makes sure nothing falls through.", linkedin: "#", email: "" },
  { seed: "Alex", name: "Neel Mehta", role: "Creatives Core", roleColor: "#EA4335", bio: "Illustrator and poster designer. Makes every event look incredible.", linkedin: "#", email: "neel@gdgapsit.com" },
];

const About = () => {
  const [showExtended, setShowExtended] = useState(false);

  return (
    <div className="pt-0">
      {/* HERO */}
      <section className="graph-bg py-12 sm:py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-syne font-black text-ink leading-[1.05]" style={{ fontSize: "clamp(2rem, 7vw, 6rem)" }}>
            <BlurText text="Meet the People Behind the" delay={60} />
            <span className="relative inline-block ml-[0.3em]">
              <BlurText text="Magic" delay={60} />
              <span className="absolute -bottom-2 left-0 right-0">
                <Squiggle color="#FBBC04" width={200} />
              </span>
            </span>
          </h1>
          <p className="font-dm text-ink-muted text-base sm:text-lg mt-4 sm:mt-6 max-w-xl mx-auto">
            The passionate students of APSIT who dedicate their time to building a thriving developer community.
          </p>
        </div>
      </section>

      {/* GDG LEAD */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <FadeInSection>
          <div className="bg-dark rounded-[24px] sm:rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(66,133,244,0.06),transparent)] pointer-events-none" />
            <div className="relative mx-auto sm:mx-0">
              <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full p-1 gradient-border">
                <img src="https://api.dicebear.com/9.x/micah/svg?seed=Emery" alt="GDG Lead" className="w-full h-full rounded-full bg-white" />
              </div>
            </div>
            <div className="relative z-10 text-center sm:text-left flex-1">
              <span className="font-caveat text-g-yellow text-lg">GDG Lead</span>
              <h2 className="font-syne font-black text-white text-2xl sm:text-4xl mt-1">Riya Sharma</h2>
              <p className="font-dm text-white/60 mt-3 text-sm sm:text-base leading-relaxed max-w-md">
                Final year CS student and the driving force behind GDG on Campus APSIT. Passionate about cloud technologies and making tech accessible to every student.
              </p>
              <div className="flex gap-3 mt-5 justify-center sm:justify-start">
                <a href="#" className="bg-[#0A66C2] text-white px-4 py-2 rounded-full text-sm font-dm font-medium flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                  <Linkedin size={16} /> LinkedIn
                </a>
                <a href="mailto:" className="bg-white/10 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-white/20 active:scale-95 transition-all">
                  <Mail size={16} /> Email
                </a>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* CORE TEAM */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <FadeInSection>
          <span className="font-caveat text-ink-muted text-xl">the people who make it happen</span>
          <h2 className="font-syne font-black text-3xl sm:text-4xl text-ink mt-2">Core Team</h2>
          <Squiggle color="#EA4335" width={180} />
        </FadeInSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12">
          {teamMembers.map((member, i) => (
            <FadeInSection key={member.name} delay={i * 0.08}>
              <motion.div whileHover={{ y: -6 }} className="bg-white rounded-2xl p-4 sm:p-6 border border-foreground/[0.06] shadow-sm hover:shadow-lg transition-all group">
                <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${member.seed}`} alt={member.name}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full mx-auto border-[3px] bg-white" style={{ borderColor: member.color }} />
                <h3 className="font-syne font-bold text-ink text-sm sm:text-lg mt-3 sm:mt-4 text-center">{member.name}</h3>
                <div className="flex justify-center mt-1.5 sm:mt-2">
                  <span className="font-caveat font-semibold text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full" style={{ backgroundColor: `${member.color}20`, color: member.color }}>
                    {member.role}
                  </span>
                </div>
                <p className="hidden sm:block font-dm text-ink-muted text-sm mt-3 text-center leading-relaxed">{member.bio}</p>
                <div className="flex justify-center gap-2 mt-3 sm:mt-4">
                  <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white">
                    <Linkedin size={14} />
                  </a>
                  <a href="mailto:" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors bg-foreground/[0.06] text-ink-muted hover:bg-ink hover:text-white">
                    <Mail size={14} />
                  </a>
                </div>
              </motion.div>
            </FadeInSection>
          ))}

          <FadeInSection delay={0.5}>
            <motion.div onClick={() => setShowExtended(true)} whileHover={{ scale: 1.03, rotate: -1 }}
              className="bg-[#FBBC04] rounded-[24px] p-4 sm:p-6 border-0 cursor-pointer flex flex-col items-center justify-center gap-3 sm:gap-4 min-h-[220px] sm:min-h-[280px] shadow-[0_4px_20px_rgba(251,188,4,0.3)] relative overflow-hidden active:scale-95 transition-all">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 rounded-sm rotate-[-2deg]" />
              <div className="flex -space-x-3">
                {["Phoenix", "Blake", "River"].map((seed, i) => (
                  <img key={seed} src={`https://api.dicebear.com/9.x/micah/svg?seed=${seed}`} alt=""
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#FBBC04] bg-white" style={{ zIndex: 3 - i }} />
                ))}
              </div>
              <div className="text-center">
                <h3 className="font-caveat font-bold text-ink text-xl sm:text-2xl">See more cool peeps!</h3>
                <p className="font-dm text-ink/60 text-xs sm:text-sm mt-1">*Click to meet the full team*</p>
              </div>
              <span className="font-dm-mono text-ink/50 text-xs sm:text-sm">+8 more members</span>
            </motion.div>
          </FadeInSection>
        </div>
      </section>

      {/* Extended Team Modal */}
      <AnimatePresence>
        {showExtended && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={e => e.target === e.currentTarget && setShowExtended(false)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 sm:p-6 border-b border-foreground/[0.06]">
                <div>
                  <h2 className="font-syne font-black text-ink text-xl sm:text-2xl">The Full Crew 🎉</h2>
                  <p className="font-dm text-ink-muted text-xs sm:text-sm">Every person who makes GDG APSIT possible</p>
                </div>
                <button onClick={() => setShowExtended(false)}
                  className="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-foreground/[0.06] flex items-center justify-center hover:bg-foreground/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6">
                {extendedTeamMembers.map((member, i) => (
                  <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-cream rounded-2xl p-4 sm:p-5 text-center">
                    <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${member.seed}`} alt={member.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto border-[3px] bg-white" style={{ borderColor: member.roleColor }} />
                    <h3 className="font-syne font-bold text-ink text-xs sm:text-sm mt-2 sm:mt-3">{member.name}</h3>
                    <span className="font-caveat text-xs" style={{ color: member.roleColor }}>{member.role}</span>
                    <p className="font-dm text-ink-muted text-[10px] sm:text-xs mt-1 sm:mt-2 hidden sm:block">{member.bio}</p>
                    <div className="flex justify-center gap-2 mt-2 sm:mt-3">
                      {member.linkedin && (
                        <a href={member.linkedin} className="w-7 h-7 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-colors">
                          <Linkedin size={12} />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="w-7 h-7 rounded-full bg-foreground/[0.06] text-ink-muted flex items-center justify-center hover:bg-ink hover:text-white transition-colors">
                          <Mail size={12} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ABOUT STORY */}
      <section className="bg-dark py-14 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 items-center">
            <div className="text-center sm:text-left">
              <FadeInSection>
                <GDGLogo size={60} />
                <span className="font-caveat text-g-yellow text-2xl sm:text-3xl block mt-4">we are</span>
                <h2 className="font-syne font-black text-white leading-none mt-2" style={{ fontSize: "clamp(3rem, 10vw, 5rem)" }}>GDG APSIT</h2>
              </FadeInSection>
            </div>
            <div>
              <FadeInSection delay={0.15}>
                <div className="bg-dark-surface rounded-2xl p-6 sm:p-8">
                  <p className="font-dm text-white/80 text-sm sm:text-base leading-relaxed">
                    We believe learning should have no gatekeepers. GDG on Campus APSIT exists to bridge the gap between academic curriculum and industry-ready skills.
                  </p>
                </div>
              </FadeInSection>
            </div>
            <div>
              <FadeInSection delay={0.25}>
                <div className="bg-dark-surface rounded-2xl p-6 sm:p-8">
                  <h3 className="font-syne font-bold text-white text-lg sm:text-xl mb-3">Our Story</h3>
                  <p className="font-dm text-white/80 text-sm sm:text-base leading-relaxed">
                    Founded as GDSC APSIT in 2022, we became GDG on Campus in 2024. We've run 15+ events, collaborated with 4+ colleges, and helped 200+ students.
                  </p>
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
