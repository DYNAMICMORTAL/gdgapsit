import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, ChevronRight, X, Plus, Mail, FileSpreadsheet, Check, Loader2, QrCode, GripVertical, Sparkles, Award } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { useEvents } from '@/hooks/useDB';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

// ── Types ────────────────────────────────────────────────────────────────────
interface TextHandle {
  x: number; y: number; fontSize: number; color: string; fontFamily: string;
}
interface QRHandle {
  x: number; y: number; size: number; show: boolean;
}
interface Recipient {
  name: string; email: string; certId: string;
}

// ── Cert ID generator ────────────────────────────────────────────────────────
function makeCertId(slug: string) {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const hex = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `GDGAPSIT-${slug.slice(0, 14).toUpperCase()}-${ym}-${hex}`;
}

// ── QR render (returns data URL) ─────────────────────────────────────────────
async function makeQRDataURL(certId: string, size: number): Promise<string> {
  const verifyUrl = `${window.location.origin}/certificates/verify/${certId}`;
  return QRCode.toDataURL(verifyUrl, { width: size, margin: 1, color: { dark: '#111111', light: '#ffffff' } });
}

// ── Font families for cert text ──────────────────────────────────────────────
const FONTS = [
  { label: 'Playfair Display', value: '"Playfair Display", Georgia, serif' },
  { label: 'Lato', value: '"Lato", Arial, sans-serif' },
  { label: 'DM Sans', value: '"DM Sans", sans-serif' },
  { label: 'Merriweather', value: '"Merriweather", Georgia, serif' },
  { label: 'Montserrat', value: '"Montserrat", Arial, sans-serif' },
];

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'template', num: '01', label: 'Template' },
  { id: 'position', num: '02', label: 'Position' },
  { id: 'recipients', num: '03', label: 'Recipients' },
  { id: 'generate', num: '04', label: 'Generate' },
] as const;
type StepId = typeof STEPS[number]['id'];

// ── Draggable canvas overlay ──────────────────────────────────────────────────
interface DragHandle {
  id: 'name' | 'date' | 'qr';
  x: number; y: number;
  color: string;
  label: string;
}

function CanvasPreview({
  imageUrl, canvasW, canvasH, nameHandle, dateHandle, qrHandle,
  onMove, sampleName, eventDate,
}: {
  imageUrl: string; canvasW: number; canvasH: number;
  nameHandle: TextHandle; dateHandle: TextHandle; qrHandle: QRHandle;
  onMove: (id: 'name' | 'date' | 'qr', x: number, y: number) => void;
  sampleName: string; eventDate: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'name' | 'date' | 'qr' | null>(null);

  const handles: DragHandle[] = [
    { id: 'name', x: nameHandle.x / canvasW * 100, y: nameHandle.y / canvasH * 100, color: '#4285F4', label: 'Name' },
    { id: 'date', x: dateHandle.x / canvasW * 100, y: dateHandle.y / canvasH * 100, color: '#34A853', label: 'Date' },
    ...(qrHandle.show ? [{ id: 'qr' as const, x: qrHandle.x / canvasW * 100, y: qrHandle.y / canvasH * 100, color: '#EA4335', label: 'QR' }] : []),
  ];

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    onMove(dragging, Math.round(px * canvasW), Math.round(py * canvasH));
  }, [dragging, canvasW, canvasH, onMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging || !containerRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));
    onMove(dragging, Math.round(px * canvasW), Math.round(py * canvasH));
  }, [dragging, canvasW, canvasH, onMove]);

  return (
    <div ref={containerRef} className="relative w-full select-none touch-none cursor-crosshair rounded-[16px] overflow-hidden border-2 border-foreground/[0.08] shadow-lg"
      onMouseMove={handleMouseMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)}
      onTouchMove={handleTouchMove} onTouchEnd={() => setDragging(null)}>
      <img src={imageUrl} alt="Template" className="w-full block" draggable={false} />
      {/* Text previews */}
      <div className="absolute inset-0 pointer-events-none">
        <span style={{
          position: 'absolute',
          left: `${nameHandle.x / canvasW * 100}%`,
          top: `${nameHandle.y / canvasH * 100}%`,
          transform: 'translate(-50%, -50%)',
          color: nameHandle.color,
          fontSize: `clamp(10px, ${nameHandle.fontSize / canvasW * 100}vw, 60px)`,
          fontFamily: nameHandle.fontFamily,
          fontWeight: 700,
          textShadow: '0 1px 3px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
        }}>{sampleName || 'Rahul Sharma'}</span>
        <span style={{
          position: 'absolute',
          left: `${dateHandle.x / canvasW * 100}%`,
          top: `${dateHandle.y / canvasH * 100}%`,
          transform: 'translate(-50%, -50%)',
          color: dateHandle.color,
          fontSize: `clamp(8px, ${dateHandle.fontSize / canvasW * 100}vw, 40px)`,
          fontFamily: dateHandle.fontFamily,
          whiteSpace: 'nowrap',
        }}>{eventDate || 'March 22, 2026'}</span>
      </div>
      {/* Drag handles */}
      {handles.map(h => (
        <div key={h.id}
          className="absolute flex items-center gap-1 rounded-full px-2 py-1 text-white text-[10px] font-bold cursor-grab active:cursor-grabbing shadow-lg select-none"
          style={{ left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%, -50%)', background: h.color, border: '2px solid white', zIndex: 10 }}
          onMouseDown={(e) => { e.preventDefault(); setDragging(h.id); }}
          onTouchStart={(e) => { e.preventDefault(); setDragging(h.id); }}>
          <GripVertical size={10} />
          {h.label}
        </div>
      ))}
      {dragging && <div className="absolute inset-0 bg-black/5" />}
    </div>
  );
}

// ── CSV / Excel parser ────────────────────────────────────────────────────────
function parseCSV(text: string): { name: string; email: string }[] {
  return text.split('\n')
    .map(line => line.trim()).filter(Boolean)
    .filter(line => !line.toLowerCase().startsWith('name'))
    .map(line => {
      const [name = '', email = ''] = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      return { name, email };
    })
    .filter(r => r.name);
}
function parseXLSX(buffer: ArrayBuffer): { name: string; email: string }[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  return rows.slice(1).map((row: any[]) => ({ name: String(row[0] ?? '').trim(), email: String(row[1] ?? '').trim() })).filter(r => r.name);
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function Certificates() {
  const [step, setStep] = useState<StepId>('template');
  const [templateImg, setTemplateImg] = useState<string | null>(null);
  const [imgNatW, setImgNatW] = useState(1754);
  const [imgNatH, setImgNatH] = useState(1240);
  const [selectedEventSlug, setSelectedEventSlug] = useState('');

  const [nameHandle, setNameHandle] = useState<TextHandle>({ x: 877, y: 490, fontSize: 72, color: '#111111', fontFamily: '"Playfair Display", Georgia, serif' });
  const [dateHandle, setDateHandle] = useState<TextHandle>({ x: 877, y: 580, fontSize: 32, color: '#555555', fontFamily: '"Lato", Arial, sans-serif' });
  const [qrHandle, setQrHandle] = useState<QRHandle>({ x: 120, y: 1100, size: 160, show: true });

  const [recipients, setRecipients] = useState<Recipient[]>([{ name: '', email: '', certId: '' }]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [emailResult, setEmailResult] = useState<{ sent: number; failed: number } | null>(null);

  const { data: eventsData = [], isLoading: eventsLoading } = useEvents();
  const events = eventsData as any[];
  const selectedEvent = events.find((e: any) => e.slug === selectedEventSlug);

  const validRecipients = useMemo(() => recipients.filter(r => r.name.trim()), [recipients]);

  // ── Certificate ID generation for new rows ─────────────────────────────────
  const ensureIds = () => {
    if (!selectedEventSlug) return;
    setRecipients(prev => prev.map(r => ({
      ...r,
      certId: r.certId || (r.name.trim() ? makeCertId(selectedEventSlug) : ''),
    })));
  };
  useEffect(ensureIds, [selectedEventSlug]);

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      const img = new window.Image();
      img.onload = () => { setImgNatW(img.width); setImgNatH(img.height); };
      img.src = src;
      setTemplateImg(src);
    };
    reader.readAsDataURL(file);
  };

  const handleMove = useCallback((id: 'name' | 'date' | 'qr', x: number, y: number) => {
    if (id === 'name') setNameHandle(h => ({ ...h, x, y }));
    else if (id === 'date') setDateHandle(h => ({ ...h, x, y }));
    else setQrHandle(h => ({ ...h, x, y }));
  }, []);

  // ── Spreadsheet import ─────────────────────────────────────────────────────
  const handleSpreadsheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const slug = selectedEventSlug;
    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = ev => {
        const parsed = parseCSV(ev.target?.result as string);
        setRecipients(parsed.map(p => ({ ...p, certId: makeCertId(slug) })));
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = ev => {
        const parsed = parseXLSX(ev.target?.result as ArrayBuffer);
        setRecipients(parsed.map(p => ({ ...p, certId: makeCertId(slug) })));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // ── Generate all certificates → ZIP ───────────────────────────────────────
  const generateAll = async () => {
    if (!templateImg) return;
    const valid = validRecipients;
    if (!valid.length) return;
    setGenerating(true); setDone(false);
    setProgress({ current: 0, total: valid.length, label: 'Loading template…' });

    const img = new window.Image();
    await new Promise<void>(res => { img.onload = () => res(); img.src = templateImg; });

    const zip = new JSZip();

    for (let i = 0; i < valid.length; i++) {
      const r = valid[i];
      setProgress({ current: i + 1, total: valid.length, label: `Generating: ${r.name}` });

      const canvas = document.createElement('canvas');
      canvas.width = imgNatW; canvas.height = imgNatH;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      // Name
      ctx.font = `bold ${nameHandle.fontSize}px Playfair Display, Georgia, serif`;
      ctx.fillStyle = nameHandle.color; ctx.textAlign = 'center';
      ctx.fillText(r.name, nameHandle.x, nameHandle.y);

      // Date
      if (selectedEvent) {
        ctx.font = `${dateHandle.fontSize}px Lato, Arial, sans-serif`;
        ctx.fillStyle = dateHandle.color; ctx.textAlign = 'center';
        ctx.fillText(selectedEvent.date_display ?? selectedEvent.short_date ?? '', dateHandle.x, dateHandle.y);
      }

      // Cert ID text (small, bottom)
      ctx.font = `18px monospace`;
      ctx.fillStyle = 'rgba(80,80,80,0.6)'; ctx.textAlign = 'center';
      ctx.fillText(`Certificate ID: ${r.certId}`, imgNatW / 2, imgNatH - 30);

      // QR code
      if (qrHandle.show && r.certId) {
        const qrDataUrl = await makeQRDataURL(r.certId, qrHandle.size);
        const qrImg = new window.Image();
        await new Promise<void>(res => { qrImg.onload = () => res(); qrImg.src = qrDataUrl; });
        ctx.drawImage(qrImg, qrHandle.x - qrHandle.size / 2, qrHandle.y - qrHandle.size / 2, qrHandle.size, qrHandle.size);
      }

      const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/png', 1.0));
      zip.file(`${r.name.replace(/\s+/g, '_')}_${r.certId}.png`, blob);
      await new Promise(r => setTimeout(r, 20));
    }

    setProgress({ current: valid.length, total: valid.length, label: 'Packaging ZIP…' });
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a'); a.href = url;
    a.download = `GDG-APSIT-Certificates-${selectedEventSlug || 'batch'}.zip`; a.click();
    URL.revokeObjectURL(url);

    // Record in DB
    try {
      await fetch('/api/admin/certificates/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gdg_admin_token')}` },
        body: JSON.stringify({
          records: valid.map(r => ({
            certId: r.certId, studentName: r.name, studentEmail: r.email,
            eventSlug: selectedEventSlug, eventName: selectedEvent?.title || '',
          })),
        }),
      });
    } catch { /* non-critical */ }

    setGenerating(false); setDone(true);
  };

  // ── Send emails ────────────────────────────────────────────────────────────
  const sendEmails = async () => {
    const withEmail = validRecipients.filter(r => r.email);
    if (!withEmail.length) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/certificates/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gdg_admin_token')}` },
        body: JSON.stringify({ recipients: withEmail, eventName: selectedEvent?.title || '', eventSlug: selectedEventSlug }),
      });
      const data = await res.json();
      setEmailResult(data);
    } catch { setEmailResult({ sent: 0, failed: withEmail.length }); }
    setSending(false);
  };

  const canProceedTemplate = !!templateImg && !!selectedEventSlug;
  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="bg-[#F7F6F3] min-h-screen">
      <SEOHead title="Certificate Studio" description="Issue and manage GDG APSIT event certificates" />

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="bg-[#0E0E0E] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#4285F4]/[0.10] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-[#FBBC04]/[0.08] blur-[100px]" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
          <div className="flex items-end gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center flex-shrink-0">
              <Award size={32} className="text-[#FBBC04]" />
            </div>
            <div>
              <span className="font-dm-mono text-white/30 text-xs uppercase tracking-[0.14em] block mb-2">GDG APSIT · Admin Tool</span>
              <h1 className="font-syne font-black text-white leading-none" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                Certificate Studio
              </h1>
              <p className="font-dm text-white/50 mt-2 text-sm sm:text-base">
                Design templates · Position elements · Generate & email certificates in bulk
              </p>
            </div>
          </div>

          {/* Step nav */}
          <div className="flex items-center gap-0 mt-10 overflow-x-auto scrollbar-none">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-shrink-0">
                <button onClick={() => setStep(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-dm text-sm font-medium transition-all ${
                    step === s.id
                      ? 'bg-white text-[#0E0E0E]'
                      : 'text-white/40 hover:text-white/70'
                  }`}>
                  <span className={`font-dm-mono text-[10px] ${step === s.id ? 'text-[#4285F4]' : 'text-white/20'}`}>{s.num}</span>
                  {s.label}
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={14} className={step === s.id || STEPS.indexOf(STEPS.find(x => x.id === step)!) > i ? 'text-white/30' : 'text-white/10'} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24">
        <AnimatePresence mode="wait">

          {/* ══ STEP 1: TEMPLATE ══════════════════════════════════════════ */}
          {step === 'template' && (
            <motion.div key="template" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Upload */}
                <div className="bg-white rounded-[24px] p-6 border border-foreground/[0.06] shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#4285F4]/10 flex items-center justify-center"><Upload size={18} className="text-[#4285F4]" /></div>
                    <div>
                      <h3 className="font-syne font-bold text-ink text-base">Upload Template</h3>
                      <p className="font-dm text-ink-muted text-xs">JPG or PNG · Recommended 1754×1240px (A4 landscape)</p>
                    </div>
                  </div>
                  <label className={`block border-2 border-dashed rounded-[16px] p-8 text-center cursor-pointer transition-all ${templateImg ? 'border-[#34A853]/40 bg-[#34A853]/[0.03]' : 'border-foreground/[0.12] hover:border-[#4285F4]/40 hover:bg-[#4285F4]/[0.02]'}`}>
                    <input type="file" accept="image/*" className="hidden" onChange={handleTemplateUpload} />
                    {templateImg
                      ? <><Check size={28} className="mx-auto text-[#34A853] mb-2" /><p className="font-syne font-bold text-[#34A853] text-sm">Template uploaded ✓</p><p className="font-dm text-ink-muted text-xs mt-1">Click to replace</p></>
                      : <><Upload size={28} className="mx-auto text-ink-muted mb-2" /><p className="font-syne font-bold text-ink text-sm">Click to upload image</p><p className="font-dm text-ink-muted text-xs mt-1">JPG, PNG</p></>
                    }
                  </label>
                </div>

                {/* Event picker */}
                <div className="bg-white rounded-[24px] p-6 border border-foreground/[0.06] shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#FBBC04]/10 flex items-center justify-center"><Sparkles size={18} className="text-[#FBBC04]" /></div>
                    <div>
                      <h3 className="font-syne font-bold text-ink text-base">Select Event</h3>
                      <p className="font-dm text-ink-muted text-xs">Fetched from your database</p>
                    </div>
                  </div>
                  {eventsLoading
                    ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-[12px] bg-foreground/[0.04] animate-pulse" />)}</div>
                    : (
                      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-foreground/10">
                        {events.map((ev: any) => {
                          const color = ev.badge_color ?? ev.type_color ?? '#4285F4';
                          const sel = selectedEventSlug === ev.slug;
                          return (
                            <button key={ev.slug} onClick={() => setSelectedEventSlug(ev.slug)}
                              className={`w-full flex items-center gap-3 p-3 rounded-[12px] border-2 transition-all text-left ${sel ? 'border-[#4285F4] bg-[#4285F4]/[0.06]' : 'border-foreground/[0.07] hover:border-foreground/20 bg-transparent'}`}>
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                              <div className="flex-1 min-w-0">
                                <p className="font-dm font-semibold text-ink text-sm truncate">{ev.title}</p>
                                <p className="font-dm-mono text-ink-muted text-xs mt-0.5">{ev.short_date ?? ev.date_display ?? '—'}</p>
                              </div>
                              {sel && <Check size={16} className="text-[#4285F4] flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )
                  }
                </div>
              </div>

              {templateImg && (
                <div className="mt-4">
                  <img src={templateImg} alt="Preview" className="w-full rounded-[16px] border border-foreground/[0.08] shadow-sm max-h-64 object-contain bg-foreground/[0.02]" />
                </div>
              )}

              <button onClick={() => setStep('position')} disabled={!canProceedTemplate}
                className="mt-6 w-full bg-[#4285F4] text-white py-4 rounded-[16px] font-syne font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#3A75E0] transition-colors shadow-[0_4px_16px_rgba(66,133,244,0.3)] active:scale-95">
                Continue to Position Text <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ══ STEP 2: POSITION ══════════════════════════════════════════ */}
          {step === 'position' && (
            <motion.div key="position" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="grid md:grid-cols-[340px_1fr] gap-6">
                {/* Controls */}
                <div className="space-y-4">
                  <p className="font-dm text-ink-muted text-sm">
                    <span className="font-semibold text-[#4285F4]">Drag the handles</span> on the preview to position each element, or use the controls below.
                  </p>

                  {/* Name handle */}
                  <div className="bg-white rounded-[20px] p-5 border border-foreground/[0.06]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-[#4285F4]" />
                      <p className="font-syne font-bold text-[#4285F4] text-sm">[Student Name]</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(['x','y','fontSize'] as const).map(k => (
                        <div key={k}>
                          <label className="font-dm text-xs text-ink-muted block mb-1 capitalize">{k === 'fontSize' ? 'Size (px)' : k.toUpperCase()}</label>
                          <input type="number" value={nameHandle[k]}
                            onChange={e => setNameHandle(h => ({ ...h, [k]: Number(e.target.value) }))}
                            className="w-full border border-foreground/10 rounded-[8px] px-3 py-2 font-dm-mono text-sm outline-none focus:border-[#4285F4]" />
                        </div>
                      ))}
                      <div>
                        <label className="font-dm text-xs text-ink-muted block mb-1">Color</label>
                        <input type="color" value={nameHandle.color}
                          onChange={e => setNameHandle(h => ({ ...h, color: e.target.value }))}
                          className="w-full h-10 rounded-[8px] border border-foreground/10 cursor-pointer" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="font-dm text-xs text-ink-muted block mb-1">Font</label>
                      <select value={nameHandle.fontFamily} onChange={e => setNameHandle(h => ({ ...h, fontFamily: e.target.value }))}
                        className="w-full border border-foreground/10 rounded-[8px] px-3 py-2 font-dm text-sm outline-none focus:border-[#4285F4] bg-white">
                        {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Date handle */}
                  <div className="bg-white rounded-[20px] p-5 border border-foreground/[0.06]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-[#34A853]" />
                      <p className="font-syne font-bold text-[#34A853] text-sm">[Event Date]</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(['x','y','fontSize'] as const).map(k => (
                        <div key={k}>
                          <label className="font-dm text-xs text-ink-muted block mb-1 capitalize">{k === 'fontSize' ? 'Size (px)' : k.toUpperCase()}</label>
                          <input type="number" value={dateHandle[k]}
                            onChange={e => setDateHandle(h => ({ ...h, [k]: Number(e.target.value) }))}
                            className="w-full border border-foreground/10 rounded-[8px] px-3 py-2 font-dm-mono text-sm outline-none focus:border-[#34A853]" />
                        </div>
                      ))}
                      <div>
                        <label className="font-dm text-xs text-ink-muted block mb-1">Color</label>
                        <input type="color" value={dateHandle.color}
                          onChange={e => setDateHandle(h => ({ ...h, color: e.target.value }))}
                          className="w-full h-10 rounded-[8px] border border-foreground/10 cursor-pointer" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="font-dm text-xs text-ink-muted block mb-1">Font</label>
                      <select value={dateHandle.fontFamily} onChange={e => setDateHandle(h => ({ ...h, fontFamily: e.target.value }))}
                        className="w-full border border-foreground/10 rounded-[8px] px-3 py-2 font-dm text-sm outline-none focus:border-[#34A853] bg-white">
                        {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* QR handle */}
                  <div className="bg-white rounded-[20px] p-5 border border-foreground/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#EA4335]" />
                        <p className="font-syne font-bold text-[#EA4335] text-sm">[QR Code]</p>
                      </div>
                      <button onClick={() => setQrHandle(h => ({ ...h, show: !h.show }))}
                        className={`relative w-10 h-5 rounded-full transition-all ${qrHandle.show ? 'bg-[#EA4335]' : 'bg-foreground/20'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${qrHandle.show ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                    {qrHandle.show && (
                      <div className="grid grid-cols-2 gap-3">
                        {(['x','y','size'] as const).map(k => (
                          <div key={k}>
                            <label className="font-dm text-xs text-ink-muted block mb-1 capitalize">{k === 'size' ? 'Size (px)' : k.toUpperCase()}</label>
                            <input type="number" value={qrHandle[k]}
                              onChange={e => setQrHandle(h => ({ ...h, [k]: Number(e.target.value) }))}
                              className="w-full border border-foreground/10 rounded-[8px] px-3 py-2 font-dm-mono text-sm outline-none focus:border-[#EA4335]" />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="font-dm text-ink-muted text-xs mt-3">QR encodes a verification URL. Attendees scan it to verify authenticity.</p>
                  </div>
                </div>

                {/* Canvas preview */}
                {templateImg && (
                  <div>
                    <p className="font-dm text-xs text-ink-muted mb-3 flex items-center gap-1.5">
                      <GripVertical size={12} /> Drag the coloured handles to reposition each element
                    </p>
                    <CanvasPreview
                      imageUrl={templateImg} canvasW={imgNatW} canvasH={imgNatH}
                      nameHandle={nameHandle} dateHandle={dateHandle} qrHandle={qrHandle}
                      onMove={handleMove}
                      sampleName="Rahul Sharma"
                      eventDate={selectedEvent?.date_display ?? selectedEvent?.short_date ?? 'March 22, 2026'}
                    />
                    <p className="font-dm text-xs text-ink-muted/60 mt-2 text-center">Preview only · actual render uses full resolution</p>
                  </div>
                )}
              </div>

              <button onClick={() => setStep('recipients')}
                className="mt-6 w-full bg-[#4285F4] text-white py-4 rounded-[16px] font-syne font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#3A75E0] transition-colors shadow-[0_4px_16px_rgba(66,133,244,0.3)] active:scale-95">
                Continue to Recipients <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ══ STEP 3: RECIPIENTS ════════════════════════════════════════ */}
          {step === 'recipients' && (
            <motion.div key="recipients" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="bg-white rounded-[24px] p-6 border border-foreground/[0.06] shadow-sm mb-4">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                  <div>
                    <h3 className="font-syne font-bold text-ink text-lg">Import Recipients</h3>
                    <p className="font-dm text-ink-muted text-sm mt-0.5">Upload a spreadsheet or add rows manually</p>
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] border-2 border-dashed border-[#34A853]/30 bg-[#34A853]/[0.04] text-[#34A853] font-dm font-medium text-sm cursor-pointer hover:bg-[#34A853]/[0.08] transition-all">
                    <FileSpreadsheet size={16} />
                    Import CSV / Excel
                    <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleSpreadsheet} />
                  </label>
                </div>
                <p className="font-dm text-ink-muted text-xs mb-4 bg-foreground/[0.02] rounded-[10px] p-3">
                  <strong>Spreadsheet format:</strong> Column A = Full Name, Column B = Email (optional). First row can be a header — it's automatically skipped.
                </p>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="border-b border-foreground/[0.06]">
                        <th className="text-left py-2 px-3 font-dm font-semibold text-ink-muted text-xs uppercase tracking-wider w-8">#</th>
                        <th className="text-left py-2 px-3 font-dm font-semibold text-ink-muted text-xs uppercase tracking-wider">Full Name</th>
                        <th className="text-left py-2 px-3 font-dm font-semibold text-ink-muted text-xs uppercase tracking-wider">Email</th>
                        <th className="text-left py-2 px-3 font-dm font-semibold text-ink-muted text-xs uppercase tracking-wider">Certificate ID</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {recipients.map((r, i) => (
                        <tr key={i} className="border-b border-foreground/[0.04] last:border-0">
                          <td className="py-2 px-3 font-dm-mono text-ink-muted text-xs">{i + 1}</td>
                          <td className="py-2 px-3">
                            <input value={r.name}
                              onChange={e => setRecipients(rs => rs.map((x, j) => j === i ? { ...x, name: e.target.value, certId: x.certId || (e.target.value.trim() ? makeCertId(selectedEventSlug) : '') } : x))}
                              placeholder="Full Name" className="w-full border border-foreground/10 rounded-[8px] px-3 py-1.5 font-dm text-sm outline-none focus:border-[#4285F4]" />
                          </td>
                          <td className="py-2 px-3">
                            <input value={r.email}
                              onChange={e => setRecipients(rs => rs.map((x, j) => j === i ? { ...x, email: e.target.value } : x))}
                              placeholder="email@example.com" type="email" className="w-full border border-foreground/10 rounded-[8px] px-3 py-1.5 font-dm text-sm outline-none focus:border-[#4285F4]" />
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-dm-mono text-ink-muted text-[10px] bg-foreground/[0.04] px-2 py-1 rounded select-all">{r.certId || '—'}</span>
                          </td>
                          <td className="py-2 px-2">
                            <button onClick={() => setRecipients(rs => rs.length === 1 ? rs : rs.filter((_, j) => j !== i))}
                              className="w-7 h-7 rounded-full bg-[#EA4335]/[0.08] text-[#EA4335] flex items-center justify-center hover:bg-[#EA4335]/20 transition-colors">
                              <X size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-foreground/[0.06]">
                  <button onClick={() => setRecipients(rs => [...rs, { name: '', email: '', certId: '' }])}
                    className="flex items-center gap-2 px-4 py-2 rounded-[10px] border border-dashed border-foreground/[0.15] text-ink-muted hover:border-[#4285F4]/40 hover:text-[#4285F4] font-dm text-sm transition-all">
                    <Plus size={14} /> Add Row
                  </button>
                  <span className="font-dm text-sm text-ink-muted">{validRecipients.length} valid recipient{validRecipients.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <button onClick={() => setStep('generate')} disabled={!validRecipients.length}
                className="w-full bg-[#4285F4] text-white py-4 rounded-[16px] font-syne font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#3A75E0] transition-colors shadow-[0_4px_16px_rgba(66,133,244,0.3)] active:scale-95">
                Ready to Generate ({validRecipients.length} certificates) <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ══ STEP 4: GENERATE ══════════════════════════════════════════ */}
          {step === 'generate' && (
            <motion.div key="generate" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Summary card */}
                <div className="bg-white rounded-[24px] p-6 border border-foreground/[0.06] shadow-sm">
                  <h3 className="font-syne font-bold text-ink text-lg mb-5">Batch Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-3 border-b border-foreground/[0.06]">
                      <span className="font-dm text-ink-muted text-sm">Event</span>
                      <span className="font-dm font-semibold text-ink text-sm text-right max-w-[200px] truncate">{selectedEvent?.title || '—'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-foreground/[0.06]">
                      <span className="font-dm text-ink-muted text-sm">Date</span>
                      <span className="font-dm-mono text-ink text-sm">{selectedEvent?.date_display ?? '—'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-foreground/[0.06]">
                      <span className="font-dm text-ink-muted text-sm">Total Certificates</span>
                      <span className="font-syne font-black text-[#4285F4] text-lg">{validRecipients.length}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-foreground/[0.06]">
                      <span className="font-dm text-ink-muted text-sm">With Email</span>
                      <span className="font-dm font-semibold text-ink text-sm">{validRecipients.filter(r => r.email).length}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="font-dm text-ink-muted text-sm">QR Code</span>
                      <span className={`font-dm font-semibold text-sm ${qrHandle.show ? 'text-[#34A853]' : 'text-ink-muted'}`}>{qrHandle.show ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-[24px] p-6 border border-foreground/[0.06] shadow-sm flex flex-col">
                  <h3 className="font-syne font-bold text-ink text-lg mb-5">Generate & Deliver</h3>

                  {/* Progress */}
                  {generating && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-dm text-ink text-sm">{progress.label}</span>
                        <span className="font-dm-mono text-[#4285F4] text-sm font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-foreground/[0.06] rounded-full h-3 overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #4285F4, #34A853, #FBBC04)' }}
                          animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
                      </div>
                      <div className="flex mt-3 gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {validRecipients.slice(0, 6).map((r, i) => (
                          <div key={i} className={`flex-shrink-0 px-2.5 py-1 rounded-full font-dm text-xs transition-all ${i < progress.current ? 'bg-[#34A853]/10 text-[#34A853]' : i === progress.current - 1 && generating ? 'bg-[#4285F4]/10 text-[#4285F4]' : 'bg-foreground/[0.04] text-ink-muted'}`}>
                            {i < progress.current ? '✓' : '⏳'} {r.name.split(' ')[0]}
                          </div>
                        ))}
                        {validRecipients.length > 6 && <div className="flex-shrink-0 px-2.5 py-1 rounded-full font-dm text-xs bg-foreground/[0.04] text-ink-muted">+{validRecipients.length - 6} more</div>}
                      </div>
                    </div>
                  )}

                  {done && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="mb-4 p-4 rounded-[14px] bg-[#34A853]/[0.08] border border-[#34A853]/20">
                      <div className="flex items-center gap-2">
                        <Check size={18} className="text-[#34A853]" />
                        <p className="font-syne font-bold text-[#34A853] text-sm">ZIP downloaded! {validRecipients.length} certificates generated.</p>
                      </div>
                      <p className="font-dm text-[#34A853]/80 text-xs mt-1 ml-6">All cert IDs have been recorded in the database.</p>
                    </motion.div>
                  )}

                  {emailResult && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="mb-4 p-4 rounded-[14px] bg-[#4285F4]/[0.08] border border-[#4285F4]/20">
                      <p className="font-syne font-bold text-[#4285F4] text-sm">Email delivery: {emailResult.sent} sent, {emailResult.failed} failed</p>
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-3 mt-auto">
                    <motion.button onClick={generateAll} disabled={generating || !validRecipients.length}
                      className="w-full py-4 rounded-[16px] font-syne font-black text-base text-white flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }} whileTap={{ scale: 0.97 }}>
                      {generating
                        ? <><Loader2 size={18} className="animate-spin" /> Generating {progress.current}/{progress.total}…</>
                        : <><Download size={18} /> Generate & Download ZIP</>}
                    </motion.button>

                    <button onClick={sendEmails} disabled={sending || !validRecipients.filter(r => r.email).length}
                      className="w-full py-3.5 rounded-[16px] font-syne font-bold text-sm border-2 border-[#4285F4] text-[#4285F4] flex items-center justify-center gap-2 hover:bg-[#4285F4]/[0.06] disabled:opacity-40 active:scale-95 transition-all">
                      {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Mail size={16} /> Send via Gmail ({validRecipients.filter(r => r.email).length} emails)</>}
                    </button>
                  </div>

                  <p className="font-dm text-ink-muted/60 text-xs mt-4 text-center">
                    Configure GMAIL_USER and GMAIL_APP_PASSWORD in .env to enable email sending
                  </p>
                </div>
              </div>

              {/* Recipients preview */}
              <div className="mt-6 bg-white rounded-[24px] p-6 border border-foreground/[0.06] shadow-sm">
                <h4 className="font-syne font-bold text-ink text-base mb-4">Recipients ({validRecipients.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead><tr className="border-b border-foreground/[0.06]">
                      {['#','Name','Email','Certificate ID'].map(h => (
                        <th key={h} className="text-left py-2 px-3 font-dm font-semibold text-ink-muted text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {validRecipients.map((r, i) => (
                        <tr key={i} className="border-b border-foreground/[0.04] last:border-0">
                          <td className="py-2 px-3 font-dm-mono text-ink-muted text-xs">{i + 1}</td>
                          <td className="py-2 px-3 font-dm font-medium text-ink text-sm">{r.name}</td>
                          <td className="py-2 px-3 font-dm text-ink-muted text-xs">{r.email || '—'}</td>
                          <td className="py-2 px-3 font-dm-mono text-[10px] text-ink-muted bg-foreground/[0.02] rounded">{r.certId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
