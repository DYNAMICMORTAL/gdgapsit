import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Users, Globe, Github, Share2, CalendarPlus } from "lucide-react";
import { events } from "@/data/events";
import EventIllustration from "@/components/EventIllustration";
import { FadeInSection } from "@/components/AnimationUtils";
import { ShareEventModal } from "@/components/ShareEventModal";
import { SEOHead } from "@/components/SEOHead";

const EventTimer = ({ eventDate }: { eventDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const target = new Date(eventDate.split("–")[0].replace(/,?\s*\d{4}$/, ", 2025"));

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const isPast = target.getTime() < Date.now();

  return (
    <div>
      <span className="font-caveat text-ink-muted text-base sm:text-lg block mb-3">
        {isPast ? "event concluded" : "launching in"}
      </span>
      {!isPast ? (
        <div className="font-syne font-black leading-none flex items-center gap-1" style={{ fontSize: "clamp(2rem, 8vw, 4rem)" }}>
          <span className="text-g-blue">{String(timeLeft.days).padStart(2, "0")}</span>
          <span className="text-ink/20 text-2xl">:</span>
          <span className="text-g-red">{String(timeLeft.hours).padStart(2, "0")}</span>
          <span className="text-ink/20 text-2xl">:</span>
          <span className="text-g-green">{String(timeLeft.minutes).padStart(2, "0")}</span>
        </div>
      ) : (
        <div className="font-syne font-black text-3xl sm:text-4xl text-g-green mt-2">Concluded ✓</div>
      )}
      {!isPast && (
        <div className="flex gap-4 font-dm text-ink-muted uppercase tracking-widest mt-1.5" style={{ fontSize: "10px" }}>
          <span>Days</span><span>Hrs</span><span>Min</span>
        </div>
      )}
    </div>
  );
};

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = events.find(e => e.slug === slug);
  const eventIndex = event ? events.indexOf(event) + 1 : 0;
  const [shareOpen, setShareOpen] = useState(false);
  const quizEnabled = JSON.parse(localStorage.getItem('gdg_quiz_enabled') || '{}');
  const isQuizActive = event ? quizEnabled[event.slug] : false;

  if (!event) {
    return (
      <div className="graph-bg min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-syne font-black text-4xl text-ink">Event not found</h1>
          <Link to="/events" className="font-dm text-g-blue hover:underline mt-4 inline-block">← Back to Events</Link>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Attendees", value: event.attendance, color: "#4285F4" },
    { label: "Duration", value: event.duration, color: "#EA4335" },
    { label: "Format", value: event.format, color: "#34A853" },
  ];

  return (
    <div className="graph-bg min-h-screen">
      <SEOHead title={event.title} description={event.description} type="event"
        eventData={{ startDate: event.date, location: event.location, organizer: 'GDG on Campus APSIT' }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <Link to="/events" className="inline-flex items-center gap-2 font-dm text-sm text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={15} /> Back to Events
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_2fr_1fr] gap-6 lg:gap-8">

          {/* LEFT — Timer: order-2 on mobile */}
          <div className="order-2 lg:order-1">
            <FadeInSection>
              <div className="bg-white rounded-[20px] p-5 lg:p-0 lg:bg-transparent border border-foreground/[0.06] lg:border-0 lg:sticky lg:top-24">
                <EventTimer eventDate={event.date} />
                <div className="flex flex-wrap gap-3 mt-5 lg:flex-col lg:gap-3">
                  <div className="flex items-center gap-1.5 font-dm text-sm text-ink-muted">
                    <Calendar size={14} /> {event.date}
                  </div>
                  <div className="flex items-center gap-1.5 font-dm text-sm text-ink-muted">
                    <MapPin size={14} /> {event.location}
                  </div>
                  <div className="flex items-center gap-1.5 font-dm text-sm text-ink-muted">
                    <Users size={14} /> {event.attendance} attendees
                  </div>
                </div>
                <span className="inline-block font-caveat font-bold text-sm px-4 py-1.5 rounded-full mt-4"
                  style={{ backgroundColor: `${event.badgeColor}20`, color: event.badgeColor }}>
                  {event.type}
                </span>
              </div>
            </FadeInSection>
          </div>

          {/* CENTER — Banner: order-1 on mobile */}
          <div className="order-1 lg:order-2">
            <FadeInSection delay={0.1}>
              <div className={`relative rounded-[20px] sm:rounded-[28px] overflow-hidden bg-gradient-to-br ${event.gradient} flex flex-col justify-between`}
                style={{ minHeight: "clamp(220px, 45vw, 380px)" }}>
                <EventIllustration type={event.type} color={event.badgeColor} />
                <span className="absolute top-6 right-6 sm:right-8 font-syne font-black text-[5rem] sm:text-[8rem] leading-none text-white/[0.06] select-none pointer-events-none">
                  {String(eventIndex).padStart(2, "0")}
                </span>
                <div className="relative z-10 flex gap-2 p-5 sm:p-8">
                  <span className="font-caveat font-bold text-sm px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white">{event.type}</span>
                  {event.interCollege && (
                    <span className="bg-[#4285F4] text-white text-xs font-dm font-semibold px-3 py-1 rounded-full">🏫 Inter-College</span>
                  )}
                </div>
                <div className="relative z-10 mt-auto p-5 sm:p-8 pt-0">
                  <h1 className="font-syne font-black text-white leading-tight max-w-[90%]" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}>
                    {event.title}
                  </h1>
                  <p className="font-dm text-white/70 text-sm sm:text-base mt-3 max-w-lg">{event.description}</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-8">
                <span className="font-caveat text-ink-muted text-lg">what you'll learn</span>
                <div className="flex flex-wrap gap-2 mt-3">
                  {event.topics.map(t => (
                    <span key={t} className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-dm font-medium"
                      style={{ backgroundColor: `${event.badgeColor}12`, color: event.badgeColor }}>{t}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 sm:mt-8">
                <h3 className="font-syne font-bold text-ink text-lg sm:text-xl">About this event</h3>
                <p className="font-dm text-ink-muted text-sm sm:text-base leading-relaxed mt-3">{event.longDescription}</p>
              </div>
            </FadeInSection>
          </div>

          {/* RIGHT — Actions: order-3 on mobile */}
          <div className="order-3 lg:order-3">
            <FadeInSection delay={0.2}>
              <div className="lg:sticky lg:top-24 flex flex-col gap-3">
                <span className="font-caveat text-ink-muted text-lg">join & connect</span>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  <a href="https://gdg.community.dev" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-g-blue text-white px-3 sm:px-5 py-3 sm:py-3.5 rounded-[14px] sm:rounded-2xl font-dm font-semibold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all">
                    <Globe size={15} /> GDG Community
                  </a>
                  <a href="#" className="flex items-center justify-center gap-2 bg-ink text-white px-3 sm:px-5 py-3 sm:py-3.5 rounded-[14px] sm:rounded-2xl font-dm font-semibold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all">
                    <Github size={15} /> GitHub
                  </a>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  <button onClick={() => setShareOpen(true)} className="flex items-center justify-center gap-2 bg-white border border-foreground/10 text-ink px-3 sm:px-5 py-3 sm:py-3.5 rounded-[14px] sm:rounded-2xl font-dm font-semibold text-xs sm:text-sm hover:bg-foreground/[0.03] active:scale-95 transition-all">
                    <Share2 size={15} /> Share
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-white border border-foreground/10 text-ink px-3 sm:px-5 py-3 sm:py-3.5 rounded-[14px] sm:rounded-2xl font-dm font-semibold text-xs sm:text-sm hover:bg-foreground/[0.03] active:scale-95 transition-all">
                    <CalendarPlus size={15} /> Calendar
                  </button>
                </div>

                <div className="border-t border-foreground/[0.08] my-2 lg:my-4" />

                <div className="bg-white rounded-[18px] p-4 sm:p-5 border border-foreground/[0.05]">
                  <span className="font-caveat text-ink-muted text-sm block mb-2">event stats</span>
                  <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-3">
                    {stats.map(stat => (
                      <div key={stat.label} className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
                        <span className="font-dm text-xs text-ink-muted block lg:inline">{stat.label}</span>
                        <span className="font-syne font-black text-base lg:text-sm" style={{ color: stat.color }}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {isQuizActive && (
                <Link to={`/events/${event.slug}/quiz`}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] font-syne font-black text-white text-base mt-3"
                  style={{ background: 'linear-gradient(135deg, #EA4335, #FBBC04)' }}>
                  <span>🎯</span> Take the Event Quiz
                  <span className="font-dm-mono text-xs bg-white/20 px-2 py-0.5 rounded-full ml-1">LIVE</span>
                </Link>
              )}
            </FadeInSection>
          </div>
        </div>
      </div>

      <ShareEventModal event={{ title: event.title, slug: event.slug, date: event.date, location: event.location, typeColor: event.typeColor }}
        isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
};

export default EventDetail;
