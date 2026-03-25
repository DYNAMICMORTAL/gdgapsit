import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Mail, X } from "lucide-react";
import { Squiggle, GDGLogo } from "@/components/Doodles";
import { BlurText, FadeInSection } from "@/components/AnimationUtils";
import { useTeam } from "@/hooks/useDB";

const About = () => {
  const [showExtended, setShowExtended] = useState(false);
  const { data: allMembers = [] } = useTeam();

  const lead        = allMembers.find((m: any) => m.is_lead);
  const coreMembers = allMembers.filter((m: any) => !m.is_lead && m.team_type === 'core');
  const extMembers  = allMembers.filter((m: any) => m.team_type === 'extended');

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

      {/* GDG LEAD — full-width hero banner */}
      {lead && (
        <section className="bg-[#0E0E0E] relative overflow-hidden">
          {/* Background glow blobs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#4285F4]/[0.12] blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-[#EA4335]/[0.10] blur-[100px] pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
            <FadeInSection>
              <div className="flex flex-col sm:flex-row gap-8 sm:gap-14 items-center">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full p-[3px] bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC04]">
                    <img
                      src={lead.profile_picture_url || `https://api.dicebear.com/9.x/micah/svg?seed=${lead.dicebear_seed ?? lead.name}`}
                      alt={lead.name}
                      className="w-full h-full rounded-full bg-white object-cover"
                    />
                  </div>
                  <span className="absolute -top-2 -right-2 font-caveat font-bold text-white text-xs bg-[#EA4335] px-3 py-1 rounded-full shadow-lg rotate-6">GDG Lead</span>
                </div>
                {/* Info */}
                <div className="text-center sm:text-left">
                  <span className="font-caveat text-white/40 text-lg sm:text-xl tracking-wide">GDG on Campus APSIT</span>
                  <h2 className="font-syne font-black text-white text-3xl sm:text-5xl mt-1 leading-none">{lead.name}</h2>
                  <span className="font-dm font-semibold text-sm px-4 py-1.5 rounded-full mt-3 inline-block"
                    style={{ backgroundColor: `${lead.role_color ?? '#4285F4'}25`, color: lead.role_color ?? '#4285F4', border: `1px solid ${lead.role_color ?? '#4285F4'}40` }}>
                    {lead.role}
                  </span>
                  {lead.bio && <p className="font-dm text-white/60 text-sm sm:text-base mt-4 max-w-md leading-relaxed">{lead.bio}</p>}
                  <div className="flex gap-3 mt-5 justify-center sm:justify-start flex-wrap">
                    {lead.linkedin_url && (
                      <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-full font-dm font-medium text-sm bg-[#0A66C2] text-white hover:bg-[#0958a8] transition-all shadow-[0_4px_14px_rgba(10,102,194,0.4)]">
                        <Linkedin size={16} />
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`}
                        className="flex items-center justify-center w-10 h-10 rounded-full font-dm font-medium text-sm bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all">
                        <Mail size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>
      )}

      {/* CORE TEAM */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <FadeInSection>
          <span className="font-caveat text-ink-muted text-xl">the people who make it happen</span>
          <h2 className="font-syne font-black text-3xl sm:text-4xl text-ink mt-2">Core Team</h2>
          <Squiggle color="#EA4335" width={180} />
        </FadeInSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12">
          {coreMembers.map((member: any, i: number) => (
            <FadeInSection key={member.id ?? member.name} delay={i * 0.08}>
              <motion.div whileHover={{ y: -6 }} className="bg-white rounded-2xl p-4 sm:p-6 border border-foreground/[0.06] shadow-sm hover:shadow-lg transition-all group">
                <img src={member.profile_picture_url || `https://api.dicebear.com/9.x/micah/svg?seed=${member.dicebear_seed ?? member.name}`} alt={member.name}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full mx-auto border-[3px] bg-white object-cover" style={{ borderColor: member.role_color ?? '#4285F4' }} />
                <h3 className="font-syne font-bold text-ink text-sm sm:text-lg mt-3 sm:mt-4 text-center">{member.name}</h3>
                <div className="flex justify-center mt-1.5 sm:mt-2">
                  <span className="font-caveat font-semibold text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
                    style={{ backgroundColor: `${member.role_color ?? '#4285F4'}20`, color: member.role_color ?? '#4285F4' }}>
                    {member.role}
                  </span>
                </div>
                <p className="hidden sm:block font-dm text-ink-muted text-sm mt-3 text-center leading-relaxed">{member.bio}</p>
                <div className="flex justify-center gap-2 mt-3 sm:mt-4 flex-wrap">
                  {member.linkedin_url && (
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center w-8 h-8 rounded-full font-dm text-xs font-medium bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all">
                      <Linkedin size={14} />
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`}
                      className="flex items-center justify-center w-8 h-8 rounded-full font-dm text-xs font-medium bg-foreground/[0.06] text-ink-muted hover:bg-ink hover:text-white transition-all">
                      <Mail size={14} />
                    </a>
                  )}
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
              <span className="font-dm-mono text-ink/50 text-xs sm:text-sm">+{extMembers.length || 8} more members</span>
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
                  className="w-10 h-10 rounded-full bg-foreground/[0.06] flex items-center justify-center hover:bg-foreground/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6">
                {extMembers.map((member: any, i: number) => (
                  <motion.div key={member.id ?? member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-cream rounded-2xl p-4 sm:p-5 text-center">
                    <img src={member.profile_picture_url || `https://api.dicebear.com/9.x/micah/svg?seed=${member.dicebear_seed ?? member.name}`} alt={member.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto border-[3px] bg-white object-cover" style={{ borderColor: member.role_color ?? '#4285F4' }} />
                    <h3 className="font-syne font-bold text-ink text-xs sm:text-sm mt-2 sm:mt-3">{member.name}</h3>
                    <span className="font-caveat text-xs" style={{ color: member.role_color ?? '#4285F4' }}>{member.role}</span>
                    <p className="font-dm text-ink-muted text-[10px] sm:text-xs mt-1 sm:mt-2 hidden sm:block">{member.bio}</p>
                    <div className="flex justify-center gap-1.5 mt-2 sm:mt-3 flex-wrap">
                      {member.linkedin_url && (
                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center w-7 h-7 rounded-full font-dm text-[10px] font-medium bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all">
                          <Linkedin size={12} />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`}
                          className="flex items-center justify-center w-7 h-7 rounded-full font-dm text-[10px] font-medium bg-foreground/[0.06] text-ink-muted hover:bg-ink hover:text-white transition-all">
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
      {/* <section className="bg-dark py-14 sm:py-24">
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
      </section> */}
    </div>
  );
};

export default About;
