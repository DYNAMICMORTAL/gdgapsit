import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Calendar, Users, Image, Home, Phone, Zap } from 'lucide-react';

const SEARCH_ITEMS = [
  { id: 'home', type: 'page', label: 'Home', icon: Home, to: '/', description: 'Back to home' },
  { id: 'events', type: 'page', label: 'Events', icon: Zap, to: '/events', description: 'All 8 events' },
  { id: 'about', type: 'page', label: 'About', icon: Users, to: '/about', description: 'Meet the GDG APSIT team' },
  { id: 'gallery', type: 'page', label: 'Gallery', icon: Image, to: '/gallery', description: 'Photos from events' },
  { id: 'contact', type: 'page', label: 'Contact', icon: Phone, to: '/contact', description: 'Get in touch' },
  { id: 'calendar', type: 'page', label: 'Calendar', icon: Calendar, to: '/calendar', description: 'Event calendar Sep–Jan' },
  { id: 'skills', type: 'page', label: 'Skills Tree', icon: Zap, to: '/skills', description: 'Developer learning roadmap' },
  { id: 'certs', type: 'page', label: 'Certificates', icon: Zap, to: '/certificates', description: 'Download attendance certificates' },
  { id: 'e1', type: 'event', label: 'Gen AI Study Jams', icon: null, to: '/events/gen-ai-study-jams-2025', description: 'Sep 14–15, 2025 · Study Jam', color: '#FBBC04' },
  { id: 'e2', type: 'event', label: 'Flutter Forward', icon: null, to: '/events/flutter-forward', description: 'Oct 4, 2025 · Workshop', color: '#4285F4' },
  { id: 'e3', type: 'event', label: 'DSA Masterclass', icon: null, to: '/events/dsa-masterclass', description: 'Oct 18, 2025 · Session', color: '#34A853' },
  { id: 'e4', type: 'event', label: 'HackAPSIT 2025', icon: null, to: '/events/hackapsit-2025', description: 'Nov 1–2, 2025 · Hackathon', color: '#EA4335' },
  { id: 'e5', type: 'event', label: 'Tech Winter Bootcamp', icon: null, to: '/events/tech-winter-bootcamp', description: 'Nov 22–24, 2025 · Bootcamp', color: '#7C3AED' },
  { id: 'e6', type: 'event', label: 'Cloud Study Bootcamp', icon: null, to: '/events/cloud-study-bootcamp', description: 'Dec 6, 2025 · Workshop', color: '#4285F4' },
  { id: 'e7', type: 'event', label: 'Open Source 101', icon: null, to: '/events/open-source-101', description: 'Dec 20, 2025 · Session', color: '#34A853' },
  { id: 'e8', type: 'event', label: 'Android Dev Day', icon: null, to: '/events/android-dev-day', description: 'Jan 11, 2026 · Workshop', color: '#4285F4' },
  { id: 'm1', type: 'team', label: 'Riya Sharma', icon: null, to: '/about', description: 'GDG Lead', color: '#4285F4' },
  { id: 'm2', type: 'team', label: 'Arjun Mehta', icon: null, to: '/about', description: 'Tech Head', color: '#EA4335' },
] as const;

type SearchItem = typeof SEARCH_ITEMS[number];

const TYPE_COLORS: Record<string, string> = { page: '#4285F4', event: '#EA4335', team: '#34A853' };
const TYPE_LABELS: Record<string, string> = { page: 'Page', event: 'Event', team: 'Team' };

const CMDP_STORAGE_KEY = 'gdg_cmdpalette_enabled';

export const CmdKToggle = () => {
  const [enabled, setEnabled] = useState(localStorage.getItem(CMDP_STORAGE_KEY) !== 'false');
  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(CMDP_STORAGE_KEY, next ? 'true' : 'false');
  };
  return (
    <motion.button onClick={toggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-[#34A853]' : 'bg-foreground/20'}`}
      whileTap={{ scale: 0.9 }}>
      <motion.div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
        animate={{ left: enabled ? '26px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}/>
    </motion.button>
  );
};

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isEnabled = localStorage.getItem(CMDP_STORAGE_KEY) !== 'false';

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_ITEMS.slice(0, 8);

  const grouped = (['page', 'event', 'team'] as const).map(type => ({
    type,
    items: filtered.filter(i => i.type === type),
  })).filter(g => g.items.length > 0);

  const allFiltered = grouped.flatMap(g => g.items);

  const openPalette = useCallback(() => {
    setOpen(true); setQuery(''); setSelected(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const closePalette = useCallback(() => { setOpen(false); setQuery(''); }, []);

  const selectItem = useCallback((item: SearchItem) => {
    navigate(item.to); closePalette();
  }, [navigate, closePalette]);

  useEffect(() => {
    if (!isEnabled) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? closePalette() : openPalette();
      }
      if (!open) return;
      if (e.key === 'Escape') closePalette();
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, allFiltered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && allFiltered[selected]) selectItem(allFiltered[selected]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, allFiltered, selected, openPalette, closePalette, selectItem, isEnabled]);

  if (!isEnabled) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9000]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closePalette}/>
          <motion.div
            className="fixed top-[12vh] left-1/2 z-[9001] w-[90vw] sm:w-[580px] max-h-[70vh]"
            style={{ transform: 'translateX(-50%)' }}
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
            <div className="bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.2)] border border-foreground/[0.08] overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-foreground/[0.06]">
                <Search size={18} className="text-ink-muted flex-shrink-0"/>
                <input ref={inputRef} value={query}
                  onChange={e => { setQuery(e.target.value); setSelected(0); }}
                  placeholder="Search events, pages, team members..."
                  className="flex-1 font-dm text-ink text-base outline-none bg-transparent placeholder:text-ink-muted/50"/>
                <kbd className="font-dm-mono text-[10px] text-ink-muted bg-foreground/[0.05] px-2 py-1 rounded-md">ESC</kbd>
              </div>
              <div className="overflow-y-auto max-h-[55vh] py-2">
                {grouped.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="font-caveat text-ink-muted text-xl">Nothing found for "{query}"</p>
                  </div>
                ) : grouped.map(group => (
                  <div key={group.type}>
                    <div className="px-4 py-2 flex items-center gap-2">
                      <span className="font-dm font-semibold text-[10px] uppercase tracking-widest"
                        style={{ color: TYPE_COLORS[group.type] }}>
                        {TYPE_LABELS[group.type]}s
                      </span>
                      <div className="flex-1 h-px bg-foreground/[0.06]"/>
                    </div>
                    {group.items.map(item => {
                      const idx = allFiltered.indexOf(item);
                      const isSelected = idx === selected;
                      return (
                        <motion.button key={item.id}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected ? 'bg-[#4285F4]/[0.08]' : 'hover:bg-foreground/[0.03]'}`}
                          onClick={() => selectItem(item)}
                          onMouseEnter={() => setSelected(idx)}
                          whileTap={{ scale: 0.98 }}>
                          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                            style={{ background: item.type === 'page' ? '#4285F412' : `${'color' in item ? item.color : '#4285F4'}15` }}>
                            {item.icon
                              ? <item.icon size={15} className="text-[#4285F4]"/>
                              : <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'color' in item ? item.color : '#4285F4' }}/>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-dm font-medium text-ink text-sm truncate">{item.label}</div>
                            <div className="font-dm text-ink-muted text-xs truncate mt-0.5">{item.description}</div>
                          </div>
                          <motion.div animate={{ x: isSelected ? 3 : 0 }} className="flex-shrink-0">
                            <ArrowRight size={14} className={isSelected ? 'text-[#4285F4]' : 'text-foreground/20'}/>
                          </motion.div>
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-foreground/[0.06] flex items-center justify-between bg-[hsl(var(--cream))]/60">
                <div className="flex items-center gap-4 font-dm-mono text-[10px] text-ink-muted/60">
                  <span><kbd className="bg-foreground/[0.08] px-1.5 py-0.5 rounded text-[9px]">↑↓</kbd> navigate</span>
                  <span><kbd className="bg-foreground/[0.08] px-1.5 py-0.5 rounded text-[9px]">↵</kbd> open</span>
                </div>
                <span className="font-dm-mono text-[10px] text-ink-muted/60">{allFiltered.length} results</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
