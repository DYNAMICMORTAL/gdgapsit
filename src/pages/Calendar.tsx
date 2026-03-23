import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Users, Clock } from 'lucide-react';
import { DoodleCalendar } from '@/components/illustrations/GoogleDoodle';
import { SEOHead } from '@/components/SEOHead';
import { useEvents } from '@/hooks/useDB';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const MONTH_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TYPE_COLORS: Record<string, string> = {
  'Study Jam': '#FBBC04',
  'Workshop': '#4285F4',
  'Hackathon': '#EA4335',
  'Session': '#34A853',
  'Bootcamp': '#7C3AED',
};

interface DBEvent {
  id: number; slug: string; title: string; type: string;
  date_start?: string; date_end?: string; date_display?: string;
  short_date?: string; location?: string; attendance?: string;
  badge_color?: string; type_color?: string; description?: string;
}

interface CalendarCell {
  event: DBEvent; isStart: boolean; isEnd: boolean; color: string;
}

function buildDayEventMap(events: DBEvent[], year: number, month0: number) {
  const map: Record<number, CalendarCell> = {};
  events.forEach(ev => {
    if (!ev.date_start) return;
    const start = new Date(ev.date_start);
    const end = ev.date_end ? new Date(ev.date_end) : start;
    const color = ev.badge_color ?? ev.type_color ?? TYPE_COLORS[ev.type] ?? '#4285F4';
    // iterate every day of the event span
    const cur = new Date(start);
    while (cur <= end) {
      if (cur.getFullYear() === year && cur.getMonth() === month0) {
        const d = cur.getDate();
        const isStart = cur.getTime() === start.getTime();
        const isEnd = cur.getTime() === end.getTime();
        map[d] = { event: ev, isStart, isEnd, color };
      }
      cur.setDate(cur.getDate() + 1);
    }
  });
  return map;
}

export default function Calendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth0, setViewMonth0] = useState(today.getMonth()); // 0-indexed
  const [selectedCell, setSelectedCell] = useState<CalendarCell & { day: number } | null>(null);

  const { data: allEvents = [], isLoading } = useEvents();

  const prevMonth = () => {
    if (viewMonth0 === 0) { setViewMonth0(11); setViewYear(y => y - 1); }
    else setViewMonth0(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth0 === 11) { setViewMonth0(0); setViewYear(y => y + 1); }
    else setViewMonth0(m => m + 1);
  };
  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth0(today.getMonth()); };

  const firstDay = new Date(viewYear, viewMonth0, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth0 + 1, 0).getDate();
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth0 === today.getMonth();

  const dayEventMap = useMemo(
    () => buildDayEventMap(allEvents as DBEvent[], viewYear, viewMonth0),
    [allEvents, viewYear, viewMonth0]
  );

  // events that fall (at least partially) in this month
  const monthEvents = useMemo(() => {
    const seen = new Set<string>();
    return Object.values(dayEventMap)
      .filter(c => { if (seen.has(c.event.slug)) return false; seen.add(c.event.slug); return true; })
      .map(c => c.event);
  }, [dayEventMap]);

  // 3-month pill strip: prev / current / next
  const pillMonths = useMemo(() => {
    const make = (offset: number) => {
      let m = viewMonth0 + offset;
      let y = viewYear;
      if (m < 0) { m += 12; y -= 1; }
      if (m > 11) { m -= 12; y += 1; }
      return { m, y, label: MONTH_SHORT[m], name: MONTH_NAMES[m] };
    };
    return [-1, 0, 1].map(make);
  }, [viewMonth0, viewYear]);

  const TYPE_LEGEND = Object.entries(TYPE_COLORS).map(([type, color]) => ({ type, color }));

  return (
    <div className="graph-bg min-h-screen">
      <SEOHead title="Event Calendar" description="View all GDG APSIT events on a calendar" />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div className="flex items-end gap-6">
            <div className="animate-float-slow"><DoodleCalendar size={70} /></div>
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
                {isLoading ? 'Loading events…' : `${MONTH_NAMES[viewMonth0]} ${viewYear} · ${monthEvents.length} event${monthEvents.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2">
            {TYPE_LEGEND.map(l => (
              <div key={l.type} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-foreground/[0.06] text-xs font-dm text-ink shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                {l.type}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CALENDAR ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">

        {/* Month Nav */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <motion.button onClick={prevMonth} whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-white border border-foreground/10 flex items-center justify-center hover:bg-foreground/[0.04] transition-colors shadow-sm">
              <ChevronLeft size={18} />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.div key={`${viewYear}-${viewMonth0}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }} className="text-center min-w-[200px]">
                <h2 className="font-syne font-black text-ink" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                  {MONTH_NAMES[viewMonth0]}
                </h2>
                <span className="font-dm-mono text-ink-muted/50 text-xs">{viewYear}</span>
              </motion.div>
            </AnimatePresence>

            <motion.button onClick={nextMonth} whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-white border border-foreground/10 flex items-center justify-center hover:bg-foreground/[0.04] transition-colors shadow-sm">
              <ChevronRight size={18} />
            </motion.button>
          </div>

          {/* 3-Month pills + Today */}
          <div className="flex items-center gap-2">
            {!isCurrentMonth && (
              <motion.button onClick={goToday} whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-full font-dm text-xs font-semibold bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20 hover:bg-[#4285F4]/20 transition-colors">
                Today
              </motion.button>
            )}
            {pillMonths.map((p, i) => (
              <motion.button key={`${p.y}-${p.m}`}
                onClick={() => { setViewYear(p.y); setViewMonth0(p.m); }}
                whileTap={{ scale: 0.92 }}
                className={`px-3 py-1.5 rounded-full font-dm-mono text-xs transition-all ${
                  i === 1
                    ? 'bg-[#4285F4] text-white shadow-md'
                    : 'bg-white border border-foreground/[0.08] text-ink-muted hover:border-foreground/20'
                }`}>
                {p.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div key={`${viewYear}-${viewMonth0}`}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-[28px] border border-foreground/[0.06] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-[hsl(var(--cream))] border-b border-foreground/[0.06]">
              {DAY_NAMES.map(d => (
                <div key={d} className="py-3 text-center font-dm font-semibold text-ink-muted text-xs uppercase tracking-wider">{d}</div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e${i}`} className="min-h-[80px] sm:min-h-[100px] border-r border-b border-foreground/[0.04] bg-foreground/[0.01]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const cell = dayEventMap[day];
                const isToday = isCurrentMonth && day === today.getDate();
                return (
                  <motion.div key={day}
                    className={`min-h-[80px] sm:min-h-[100px] border-r border-b border-foreground/[0.04] relative p-1.5 sm:p-2 ${cell ? 'cursor-pointer' : ''} ${isToday ? 'bg-[#4285F4]/[0.03]' : ''}`}
                    onClick={() => cell?.isStart && setSelectedCell({ ...cell, day })}
                    whileHover={cell ? { scale: 1.02, zIndex: 2 } : {}}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    {/* Day number */}
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-dm font-semibold text-xs sm:text-sm mb-1 ${
                      isToday ? 'bg-[#4285F4] text-white shadow-sm' : 'text-ink'
                    }`}>{day}</div>
                    {/* Event chip */}
                    {cell && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="rounded-[5px] px-1.5 py-0.5 text-white font-dm font-semibold text-[9px] sm:text-[10px] leading-tight overflow-hidden"
                        style={{ background: cell.color }}>
                        {cell.isStart ? cell.event.title : '↳ cont.'}
                      </motion.div>
                    )}
                    {/* Hover tint */}
                    {cell && (
                      <div className="absolute inset-0 rounded-sm pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
                        style={{ background: `${cell.color}08` }} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Event Popup */}
        <AnimatePresence>
          {selectedCell && (
            <>
              <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedCell(null)} />
              <motion.div className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 20 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}>
                <div className="bg-white rounded-[24px] overflow-hidden shadow-2xl">
                  <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${selectedCell.color}, ${selectedCell.color}88)` }} />
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <span className="font-caveat font-bold text-sm px-3 py-1 rounded-full"
                        style={{ background: `${selectedCell.color}18`, color: selectedCell.color }}>
                        {selectedCell.event.type}
                      </span>
                      <button onClick={() => setSelectedCell(null)} className="w-8 h-8 rounded-full bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground/10 transition-colors text-ink-muted text-lg leading-none">×</button>
                    </div>
                    <h3 className="font-syne font-black text-ink text-xl sm:text-2xl mt-3 leading-tight">{selectedCell.event.title}</h3>
                    {selectedCell.event.description && (
                      <p className="font-dm text-ink-muted text-sm mt-2 leading-relaxed line-clamp-2">{selectedCell.event.description}</p>
                    )}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 font-dm text-ink-muted text-sm">
                        <CalendarDays size={14} className="flex-shrink-0" style={{ color: selectedCell.color }} />
                        <span>{selectedCell.event.date_display ?? selectedCell.event.short_date ?? `${MONTH_NAMES[viewMonth0]} ${selectedCell.day}, ${viewYear}`}</span>
                      </div>
                      {selectedCell.event.location && (
                        <div className="flex items-center gap-2 font-dm text-ink-muted text-sm">
                          <MapPin size={14} className="flex-shrink-0" style={{ color: selectedCell.color }} />
                          <span>{selectedCell.event.location}</span>
                        </div>
                      )}
                      {selectedCell.event.attendance && (
                        <div className="flex items-center gap-2 font-dm text-ink-muted text-sm">
                          <Users size={14} className="flex-shrink-0" style={{ color: selectedCell.color }} />
                          <span>{selectedCell.event.attendance} attendees</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 mt-5">
                      <Link to={`/events/${selectedCell.event.slug}`}
                        className="flex-1 text-center py-3 rounded-[12px] font-syne font-bold text-sm text-white hover:opacity-90 transition-opacity"
                        style={{ background: selectedCell.color }}>
                        View Event →
                      </Link>
                      <button onClick={() => setSelectedCell(null)}
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

        {/* Month event list */}
        {!isLoading && monthEvents.length > 0 && (
          <div className="mt-8">
            <h3 className="font-syne font-bold text-ink text-lg mb-4">Events in {MONTH_NAMES[viewMonth0]}</h3>
            <div className="flex flex-col gap-3">
              {monthEvents.map(ev => {
                const color = ev.badge_color ?? ev.type_color ?? TYPE_COLORS[ev.type] ?? '#4285F4';
                return (
                  <motion.div key={ev.slug} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <Link to={`/events/${ev.slug}`}
                      className="flex items-center gap-4 bg-white rounded-[16px] p-4 border border-foreground/[0.05] hover:border-foreground/[0.15] hover:shadow-md transition-all group">
                      <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                        <CalendarDays size={20} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-syne font-bold text-ink text-sm truncate">{ev.title}</div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="font-caveat text-xs" style={{ color }}>{ev.type}</span>
                          {ev.short_date && <span className="font-dm-mono text-ink-muted text-xs">{ev.short_date}</span>}
                          {ev.location && <span className="font-dm text-ink-muted text-xs truncate hidden sm:block">{ev.location}</span>}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-ink-muted group-hover:text-ink transition-colors flex-shrink-0" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {!isLoading && monthEvents.length === 0 && (
          <div className="mt-8 text-center py-16 bg-white rounded-[20px] border border-foreground/[0.05]">
            <DoodleCalendar size={60} className="mx-auto opacity-30" />
            <p className="font-syne font-bold text-ink-muted text-lg mt-4">No events this month</p>
            <p className="font-dm text-ink-muted/60 text-sm mt-2">Add events in the Admin panel and they'll appear here.</p>
          </div>
        )}

        {isLoading && (
          <div className="mt-8 flex flex-col gap-3">
            {[1,2].map(i => (
              <div key={i} className="h-16 bg-white rounded-[16px] border border-foreground/[0.05] animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
