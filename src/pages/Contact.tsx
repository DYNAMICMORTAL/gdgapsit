import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Instagram, Globe, Send } from "lucide-react";
import { Squiggle } from "@/components/Doodles";
import { FadeInSection } from "@/components/AnimationUtils";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent!", description: "We'll be in touch soon 🎉" });
    window.location.href = `mailto:gdgoncampus.apsit@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`)}`;
  };

  return (
    <div className="pt-0">
      <section className="graph-bg py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <span className="font-caveat text-ink-muted text-xl sm:text-2xl">don't be a stranger</span>
            <h1 className="font-syne font-black text-ink leading-tight mt-2" style={{ fontSize: "clamp(2.5rem, 9vw, 5rem)" }}>
              Say Hello 👋
            </h1>
            <Squiggle color="#4285F4" width={240} />
          </FadeInSection>
        </div>
      </section>

      <section className="graph-bg pb-16 sm:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 md:gap-8 max-w-5xl mx-auto px-4 sm:px-6">
          <div>
            <FadeInSection>
              <form onSubmit={handleSubmit} className="bg-white rounded-[24px] sm:rounded-3xl p-6 sm:p-10 shadow-sm border border-foreground/[0.06] notebook-lines">
                {[
                  { label: "Full Name", key: "name", type: "text" },
                  { label: "Email Address", key: "email", type: "email" },
                ].map(field => (
                  <div key={field.key} className="mb-6 sm:mb-8 group">
                    <label className="font-caveat font-semibold text-ink-muted text-base block mb-1 group-focus-within:text-g-blue transition-colors">{field.label}</label>
                    <input type={field.type} required value={form[field.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full font-dm text-base text-ink bg-transparent border-b-2 border-foreground/[0.15] pb-2 focus:outline-none focus:border-g-blue transition-colors" />
                  </div>
                ))}
                <div className="mb-6 sm:mb-8 group">
                  <label className="font-caveat font-semibold text-ink-muted text-base block mb-1 group-focus-within:text-g-blue transition-colors">Subject</label>
                  <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full font-dm text-base text-ink bg-transparent border-b-2 border-foreground/[0.15] pb-2 focus:outline-none focus:border-g-blue transition-colors appearance-none cursor-pointer">
                    {["General Inquiry", "Event Collaboration", "Sponsorship", "Join the Team", "Technical Query", "Other"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-6 sm:mb-8 group">
                  <label className="font-caveat font-semibold text-ink-muted text-base block mb-1 group-focus-within:text-g-blue transition-colors">Message</label>
                  <textarea rows={5} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full font-dm text-base text-ink bg-transparent border-b-2 border-foreground/[0.15] pb-2 focus:outline-none focus:border-g-blue transition-colors resize-none" />
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit"
                  className="bg-ink text-white w-full py-3.5 sm:py-4 rounded-2xl font-syne font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:shadow-lg active:scale-95 transition-all">
                  Send Message <Send size={18} />
                </motion.button>
              </form>
            </FadeInSection>
          </div>

          <div className="space-y-4">
            <FadeInSection delay={0.1}>
              <div className="bg-[#FDECEA] rounded-[24px] sm:rounded-3xl p-6 sm:p-8 sm:rotate-[1.5deg]">
                <h3 className="font-syne font-black text-ink text-xl sm:text-2xl">GDG on Campus APSIT</h3>
                <p className="font-dm text-ink-muted text-sm mt-1">A.P. Shah Institute of Technology, Thane, Maharashtra 400607</p>
                <a href="mailto:gdgoncampus.apsit@gmail.com" className="font-dm text-g-blue text-sm mt-3 flex items-center gap-2 hover:underline">
                  <Mail size={14} /> gdgoncampus.apsit@gmail.com
                </a>
                <p className="font-caveat text-ink-muted text-base mt-4">or DM us on Instagram 📸</p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="bg-white rounded-[24px] sm:rounded-3xl p-5 sm:p-6 shadow-md -mt-4 relative z-10">
                <h3 className="font-syne font-bold text-ink text-lg mb-4">Find us on</h3>
                <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-4">
                  {[
                    { icon: <Mail size={20} />, label: "Email" },
                    { icon: <Github size={20} />, label: "GitHub" },
                    { icon: <Linkedin size={20} />, label: "LinkedIn" },
                    { icon: <Instagram size={20} />, label: "Instagram" },
                    { icon: <Globe size={20} />, label: "GDG" },
                  ].map(s => (
                    <a key={s.label} href="#" className="flex flex-col items-center gap-1 group">
                      <div className="w-12 h-12 rounded-full border border-foreground/10 bg-cream flex items-center justify-center text-ink-muted group-hover:ring-2 group-hover:ring-g-blue transition-all">
                        {s.icon}
                      </div>
                      <span className="font-dm text-xs text-ink-muted">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.3}>
              <div className="bg-[#EBF3FF] rounded-[20px] sm:rounded-2xl p-5 sm:p-6 mt-4">
                <h3 className="font-syne font-bold text-g-blue text-base sm:text-lg">Want to co-host an event?</h3>
                <p className="font-dm text-ink-muted text-sm mt-2">We regularly collaborate with other college GDG chapters. Reach out with your idea.</p>
                <a href="mailto:gdgoncampus.apsit@gmail.com?subject=Event Collaboration"
                  className="bg-g-blue text-white px-5 sm:px-6 py-2.5 rounded-full font-syne font-semibold mt-4 inline-block hover:shadow-lg active:scale-95 transition-all text-sm">
                  Let's Talk →
                </a>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
