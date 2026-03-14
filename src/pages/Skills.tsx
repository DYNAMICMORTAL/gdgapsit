import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DoodleSkillTree } from '@/components/illustrations/GoogleDoodle';
import { SEOHead } from '@/components/SEOHead';
import { events } from '@/data/events';

interface SkillNode {
  id: string; label: string; color: string; x: number; y: number; parent: string;
  gdgEvent: string | null; desc: string; type?: string;
}

const SKILL_NODES: SkillNode[] = [
  { id: 'root', label: 'Start Your Journey', color: '#111', x: 50, y: 5, parent: '', gdgEvent: null, desc: 'Begin your developer path', type: 'root' },
  { id: 'web', label: 'Web Dev', color: '#4285F4', x: 18, y: 20, parent: 'root', gdgEvent: null, desc: 'The foundation of everything on the internet' },
  { id: 'html', label: 'HTML/CSS', color: '#4285F4', x: 10, y: 35, parent: 'web', gdgEvent: null, desc: 'Structure and style of web pages' },
  { id: 'js', label: 'JavaScript', color: '#4285F4', x: 18, y: 50, parent: 'html', gdgEvent: null, desc: 'Make web pages interactive' },
  { id: 'react', label: 'React', color: '#4285F4', x: 10, y: 65, parent: 'js', gdgEvent: 'tech-winter-bootcamp', desc: 'Covered in Tech Winter Bootcamp' },
  { id: 'nodejs', label: 'Node.js', color: '#4285F4', x: 20, y: 65, parent: 'js', gdgEvent: 'tech-winter-bootcamp', desc: 'Covered in Tech Winter Bootcamp' },
  { id: 'mobile', label: 'Mobile Dev', color: '#EA4335', x: 38, y: 20, parent: 'root', gdgEvent: null, desc: 'Build apps for Android and iOS' },
  { id: 'flutter', label: 'Flutter', color: '#EA4335', x: 30, y: 35, parent: 'mobile', gdgEvent: 'flutter-forward', desc: 'Covered in Flutter Forward workshop' },
  { id: 'kotlin', label: 'Kotlin', color: '#EA4335', x: 38, y: 50, parent: 'flutter', gdgEvent: 'android-dev-day', desc: 'Covered in Android Dev Day' },
  { id: 'compose', label: 'Jetpack Compose', color: '#EA4335', x: 30, y: 65, parent: 'kotlin', gdgEvent: 'android-dev-day', desc: 'Covered in Android Dev Day' },
  { id: 'ai', label: 'AI & ML', color: '#FBBC04', x: 58, y: 20, parent: 'root', gdgEvent: null, desc: 'The future of technology' },
  { id: 'python', label: 'Python', color: '#FBBC04', x: 50, y: 35, parent: 'ai', gdgEvent: null, desc: 'The go-to language for AI' },
  { id: 'gemini', label: 'Gemini API', color: '#FBBC04', x: 58, y: 50, parent: 'python', gdgEvent: 'gen-ai-study-jams-2025', desc: 'Covered in Gen AI Study Jams' },
  { id: 'prompt', label: 'Prompt Eng.', color: '#FBBC04', x: 50, y: 65, parent: 'gemini', gdgEvent: 'gen-ai-study-jams-2025', desc: 'Covered in Gen AI Study Jams' },
  { id: 'cloud', label: 'Cloud', color: '#34A853', x: 78, y: 20, parent: 'root', gdgEvent: null, desc: 'Deploy and scale applications globally' },
  { id: 'gcp', label: 'Google Cloud', color: '#34A853', x: 72, y: 35, parent: 'cloud', gdgEvent: 'cloud-study-bootcamp', desc: 'Covered in Cloud Study Bootcamp' },
  { id: 'cf', label: 'Cloud Functions', color: '#34A853', x: 78, y: 50, parent: 'gcp', gdgEvent: 'cloud-study-bootcamp', desc: 'Covered in Cloud Study Bootcamp' },
  { id: 'deploy', label: 'Deployment', color: '#34A853', x: 86, y: 35, parent: 'cloud', gdgEvent: 'tech-winter-bootcamp', desc: 'Covered in Tech Winter Bootcamp' },
  { id: 'oss', label: 'Open Source', color: '#7C3AED', x: 58, y: 80, parent: 'root', gdgEvent: null, desc: "Contribute to the world's software" },
  { id: 'git', label: 'Git', color: '#7C3AED', x: 50, y: 90, parent: 'oss', gdgEvent: 'open-source-101', desc: 'Covered in Open Source 101' },
  { id: 'gh', label: 'GitHub', color: '#7C3AED', x: 66, y: 90, parent: 'oss', gdgEvent: 'open-source-101', desc: 'Covered in Open Source 101' },
];

export default function Skills() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getNode = (id: string) => SKILL_NODES.find(n => n.id === id);
  const selectedNodeData = selectedNode ? getNode(selectedNode) : null;
  const selectedEvent = selectedNodeData?.gdgEvent ? events.find(e => e.slug === selectedNodeData.gdgEvent) : null;

  return (
    <div className="graph-bg min-h-screen">
      <SEOHead title="Skills Tree" description="Explore the developer learning paths GDG APSIT covers" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <div className="flex items-end gap-6 flex-wrap">
          <div className="animate-float-slow"><DoodleSkillTree size={80} /></div>
          <div>
            <span className="font-dm-mono text-ink-muted text-xs uppercase tracking-[0.12em] block mb-2">GDG APSIT · Developer Roadmap</span>
            <h1 className="font-syne font-black text-ink leading-none" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
              Skills <span className="text-[#34A853]">Tree</span>
            </h1>
            <p className="font-dm text-ink-muted mt-2 max-w-xl text-base">
              Explore the developer learning paths GDG APSIT covers. Highlighted nodes are skills we've run events for — click to explore.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          {[
            { label: 'GDG Event Covered', color: '#4285F4', filled: true },
            { label: 'Learning Path', color: '#6B6B6B', filled: false },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border border-foreground/[0.06] text-xs font-dm text-ink">
              <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: l.color, background: l.filled ? l.color : 'transparent' }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-white rounded-[28px] border border-foreground/[0.06] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-5 border-b border-foreground/[0.06]">
            {[
              { label: 'Web Dev', color: '#4285F4' },
              { label: 'Mobile Dev', color: '#EA4335' },
              { label: 'AI & ML', color: '#FBBC04' },
              { label: 'Cloud', color: '#34A853' },
              { label: 'Open Source', color: '#7C3AED' },
            ].map(t => (
              <div key={t.label} className="py-3 px-4 text-center border-r last:border-r-0 border-foreground/[0.06]">
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: t.color }} />
                <span className="font-dm font-semibold text-xs text-ink">{t.label}</span>
              </div>
            ))}
          </div>

          <div ref={containerRef} className="relative overflow-auto" style={{ height: '600px', minWidth: '100%' }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {SKILL_NODES.filter(n => n.parent).map(node => {
                const parent = getNode(node.parent);
                if (!parent) return null;
                const w = 900; const h = 600;
                return (
                  <line key={node.id}
                    x1={(parent.x / 100) * w} y1={(parent.y / 100) * h}
                    x2={(node.x / 100) * w} y2={(node.y / 100) * h}
                    stroke={node.gdgEvent ? node.color : '#e5e5e5'}
                    strokeWidth={node.gdgEvent ? 2 : 1.5}
                    strokeDasharray={node.gdgEvent ? 'none' : '5 4'}
                    opacity={node.gdgEvent ? 0.5 : 0.3} />
                );
              })}
            </svg>

            {SKILL_NODES.map(node => {
              const px = (node.x / 100) * 900;
              const py = (node.y / 100) * 600;
              const hasEvent = node.gdgEvent;
              const isSelected = selectedNode === node.id;
              return (
                <motion.button key={node.id}
                  className="absolute flex flex-col items-center gap-1 cursor-pointer"
                  style={{ left: px, top: py, transform: 'translate(-50%, -50%)', zIndex: isSelected ? 20 : 10 }}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.92 }}
                  animate={{ scale: isSelected ? 1.2 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                  <div className={`rounded-full flex items-center justify-center shadow-sm transition-all ${node.type === 'root' ? 'w-14 h-14' : 'w-10 h-10'}`}
                    style={{
                      background: hasEvent ? node.color : 'white',
                      border: `2.5px solid ${node.color}`,
                      boxShadow: isSelected ? `0 0 0 4px ${node.color}30` : hasEvent ? `0 4px 12px ${node.color}40` : '0 2px 8px rgba(0,0,0,0.08)',
                    }}>
                    {hasEvent && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="font-dm font-semibold text-center leading-tight max-w-[80px] whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ fontSize: node.type === 'root' ? '11px' : '9px', color: hasEvent ? node.color : '#6B6B6B' }}>
                    {node.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedNodeData && (
          <motion.div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.06] shadow-sm flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: `${selectedNodeData.color}15` }}>
                <div className="w-4 h-4 rounded-full" style={{ background: selectedNodeData.color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-syne font-black text-ink text-xl">{selectedNodeData.label}</h3>
                <p className="font-dm text-ink-muted text-sm mt-1">{selectedNodeData.desc}</p>
                {selectedEvent && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] font-dm text-sm font-medium"
                    style={{ background: `${selectedNodeData.color}10`, color: selectedNodeData.color }}>
                    ✓ Covered in: {selectedEvent.title} · {selectedEvent.date}
                  </div>
                )}
              </div>
              {selectedEvent && (
                <Link to={`/events/${selectedEvent.slug}`}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-[12px] font-syne font-bold text-sm text-white"
                  style={{ background: selectedNodeData.color }}>
                  View Event <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
