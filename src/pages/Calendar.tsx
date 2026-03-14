import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { DoodleCalendar } from '@/components/illustrations/GoogleDoodle';
import { SEOHead } from '@/components/SEOHead';

const MONTHS = [
  { name: 'September', year: 2025, short: 'SEP' },
  { name: 'October', year: 2025, short: 'OCT' },
  { name: 'November', year: 2025, short: 'NOV' },
  { name: 'December', year: 2025, short: 'DEC' },
  { name: 'January', year: 2026, short: 'JAN' },
];

function monthNameToNumber(name: string) {
  return ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(name);
}

interface CalendarEvent {
  day: number; slug: string; title: string; type: string; color: string; span: number; isStart?: boolean;
}

const EVENT_DATES: Record<number, Record<number, CalendarEvent[]>> = {
  2025: {
    9: [{ day: 14, slug: 'gen-ai-study-jams-2025', title: 'Gen AI Study Jams', type: 'Study Jam', color: '#FBBC04', span: 2 }],
    10: [
      { day: 4, slug: 'flutter-forward', title: 'Flutter Forward', type: 'Workshop', color: '#4285F4', span: 1 },
      { day: 18, slug: 'dsa-masterclass', title: 'DSA Masterclass', type: 'Session', color: '#34A853', span: 1 },
    ],
    11: [
      { day: 1, slug: 'hackapsit-2025', title: 'HackAPSIT 2025', type: 'Hackathon', color: '#EA4335', span: 2 },
      { day: 22, slug: 'tech-winter-bootcamp', title: 'Tech Bootcamp', type: 'Bootcamp', color: '#7C3AED', span: 3 },
    ],
    12: [
      { day: 6, slug: 'cloud-study-bootcamp', title: 'Cloud Bootcamp', type: 'Workshop', color: '#4285F4', span: 1 },
      { day: 20, slug: 'open-source-101', title: 'Open Source 101', type: 'Session', color: '#34A853', span: 1 },
    ],
  },
  2026: {
    1: [{ day: 11, slug: 'android-dev-day', title: 'Android Dev Day', type: 'Workshop', color: '#4285F4', span: 1 }],
  },
};

export default function Calendar() {
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const month = MONTHS[currentMonthIdx];
  const monthNum = monthNameToNumber(month.name);
  const firstDay = new Date(month.year, monthNum, 1).getDay();
  const daysInMonth = new Date(month.year, monthNum + 1, 0).getDate();
  const monthEvents = EVENT_DATES[month.year]?.[monthNum + 1] || [];

  const dayEventMap: Record<number, CalendarEvent & { isStart: boolean }> = {};
  monthEvents.forEach(ev => {
    for (let d = ev.day; d < ev.day + ev.span; d++) {
      dayEventMap[d] = { ...ev, isStart: d === ev.day };
    }
  });

  return (
    <div className="graph-bg min-h-screen">
      <SEOHead title="Event Calendar" description="View all GDG APSIT events on a calendar" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div className="flex items-end gap-6">
            <div className="animate-float-slow">
              <DoodleCalendar size={70} />
            </div>
            <div>
              <span className="font-dm-mono text-ink-muted text-xs uppercase tracking-[0.12em] block mb-2">
                GDG APSIT · Event Schedule
              </span>
              <h1 className="font-syne font-black text-ink leading-none" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
                Event{' '}
                <span className="relative inline-block text-[#4285F4]">
                  Calendar
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none">
                    <path d="M0,6 Q50,0 100,5 T200,4" fill="none" stroke="#FBBC04" strokeWidth="3" strokeLinecap="round"
                      style={{ strokeDasharray: 220, strokeDashoffset: 220, animation: 'drawSquiggle 1s 0.5s ease forwards' }} />
                  </svg>
                </span>
              </h1>
              <p className="font-dm text-ink-muted text-base mt-3">
                Sep 2025 — Jan 2026 · 8 events
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { type: 'Study Jam', color: '#FBBC04' },
              { type: 'Workshop', color: '#4285F4' },
              { type: 'Hackathon', color: '#EA4335' },
              { type: 'Session', color: '#34A853' },
              { type: 'Bootcamp', color: '#7C3AED' },
            ].map(l => (
              <div key={l.type} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-foreground/[0.06] text-xs font-dm text-ink">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                {l.type}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.button onClick={() => setCurrentMonthIdx(Math.max(0, currentMonthIdx - 1))} disabled={currentMonthIdx === 0}
              className="w-10 h-10 rounded-full bg-white border border-foreground/10 flex items-center justify-center disabled:opacity-30 hover:bg-foreground/[0.04] transition-colors"
              whileTap={{ scale: 0.9 }}>
              <ChevronLeft size={18} />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.div key={month.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }} className="text-center min-w-[180px]">
                <h2 className="font-syne font-black text-ink" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>{month.name}</h2>
                <span className="font-dm-mono text-ink-muted/50 text-xs">{month.year}</span>
              </motion.div>
            </AnimatePresence>

            <motion.button onClick={() => setCurrentMonthIdx(Math.min(MONTHS.length - 1, currentMonthIdx + 1))} disabled={currentMonthIdx === MONTHS.length - 1}
              className="w-10 h-10 rounded-full bg-white border border-foreground/10 flex items-center justify-center disabled:opacity-30 hover:bg-foreground/[0.04] transition-colors"
              whileTap={{ scale: 0.9 }}>
              <ChevronRight size={18} />
            </motion.button>
          </div>

          <div className="hidden sm:flex gap-2">
            {MONTHS.map((m, i) => (
              <motion.button key={m.short} onClick={() => setCurrentMonthIdx(i)}
                className={`px-3 py-1.5 rounded-full font-dm-mono text-xs transition-all ${currentMonthIdx === i ? 'bg-[#4285F4] text-white' : 'bg-white border border-foreground/[0.08] text-ink-muted hover:border-foreground/20'}`}
                whileTap={{ scale: 0.92 }}>
                {m.short}
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={month.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-[28px] border border-foreground/[0.06] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="grid grid-cols-7 bg-[hsl(var(--cream))] border-b border-foreground/[0.06]">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="py-3 text-center font-dm font-semibold text-ink-muted text-xs uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px] border-r border-b border-foreground/[0.04] bg-foreground/[0.01]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const eventOnDay = dayEventMap[day];
                return (
                  <motion.div key={day}
                    className={`min-h-[80px] sm:min-h-[100px] border-r border-b border-foreground/[0.04] relative p-2 ${eventOnDay ? 'cursor-pointer' : ''}`}
                    onMouseEnter={() => eventOnDay && setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => eventOnDay?.isStart && setSelectedEvent(eventOnDay)}
                    whileHover={eventOnDay ? { scale: 1.02 } : {}}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-dm font-semibold text-sm mb-1 text-ink">{day}</div>
                    {eventOnDay && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="rounded-[6px] px-2 py-1 text-white font-dm font-semibold text-[10px] sm:text-xs leading-tight cursor-pointer overflow-hidden"
                        style={{ background: eventOnDay.color }}>
                        {eventOnDay.isStart ? eventOnDay.title : '↳ cont.'}
                      </motion.div>
                    )}
                    {eventOnDay && hoveredDay === day && (
                      <div className="absolute inset-0 rounded-sm pointer-events-none" style={{ background: `${eventOnDay.color}08` }} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {selectedEvent && (
            <>
              <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedEvent(null)} />
              <motion.div className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 20 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}>
                <div className="bg-white rounded-[24px] overflow-hidden shadow-2xl">
                  <div className="h-3 w-full" style={{ background: selectedEvent.color }} />
                  <div className="p-6">
                    <span className="font-caveat font-bold text-sm px-3 py-1 rounded-full" style={{ background: `${selectedEvent.color}15`, color: selectedEvent.color }}>
                      {selectedEvent.type}
                    </span>
                    <h3 className="font-syne font-black text-ink text-2xl mt-3">{selectedEvent.title}</h3>
                    <div className="flex gap-4 mt-3 font-dm text-ink-muted text-sm">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} /> Day {selectedEvent.day}{selectedEvent.span > 1 ? `–${selectedEvent.day + selectedEvent.span - 1}` : ''}, {month.name} {month.year}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <Link to={`/events/${selectedEvent.slug}`}
                        className="flex-1 text-center bg-ink text-white px-4 py-3 rounded-[12px] font-syne font-bold text-sm hover:bg-ink/80 transition-colors">
                        View Event →
                      </Link>
                      <button onClick={() => setSelectedEvent(null)}
                        className="px-4 py-3 rounded-[12px] border border-foreground/10 font-dm text-sm hover:bg-foreground/[0.04] transition-colors">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {monthEvents.length > 0 && (
          <div className="mt-8">
            <h3 className="font-syne font-bold text-ink text-lg mb-4">Events in {month.name}</h3>
            <div className="flex flex-col gap-3">
              {monthEvents.map(ev => (
                <motion.div key={ev.slug} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                  <Link to={`/events/${ev.slug}`}
                    className="flex items-center gap-4 bg-white rounded-[16px] p-4 border border-foreground/[0.05] hover:border-foreground/[0.15] hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: `${ev.color}15` }}>
                      <span className="font-syne font-black text-lg" style={{ color: ev.color }}>{ev.day}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-syne font-bold text-ink text-sm">{ev.title}</div>
                      <div className="font-caveat text-xs mt-0.5" style={{ color: ev.color }}>{ev.type}</div>
                    </div>
                    <ChevronRight size={16} className="text-ink-muted group-hover:text-ink transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {monthEvents.length === 0 && (
          <div className="mt-8 text-center py-12 bg-white rounded-[20px] border border-foreground/[0.05]">
            <DoodleCalendar size={60} className="mx-auto opacity-30" />
            <p className="font-caveat text-ink-muted text-xl mt-4">No events this month</p>
          </div>
        )}
      </div>
    </div>
  );
}
