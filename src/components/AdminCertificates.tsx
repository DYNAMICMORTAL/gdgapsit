import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, ChevronRight, X, Plus, Mail, FileSpreadsheet, CheckCircle, Loader2, QrCode, GripVertical, Sparkles } from 'lucide-react';
import { useAdminEvents } from '@/hooks/useDB';
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

// ── QR render
async function makeQRDataURL(certId: string, size: number): Promise<string> {
  const verifyUrl = `${window.location.origin}/certificates/verify/${certId}`;
  return QRCode.toDataURL(verifyUrl, { width: size, margin: 1, color: { dark: '#111111', light: '#ffffff' } });
}

// ── Fonts
const FONTS = [
  { label: 'Playfair Display', value: '"Playfair Display", Georgia, serif' },
  { label: 'Lato', value: '"Lato", Arial, sans-serif' },
  { label: 'DM Sans', value: '"DM Sans", sans-serif' },
  { label: 'Merriweather', value: '"Merriweather", Georgia, serif' },
  { label: 'Montserrat', value: '"Montserrat", Arial, sans-serif' },
];

const STEPS = [
  { id: 'template', num: '01', label: 'Template' },
  { id: 'position', num: '02', label: 'Position' },
  { id: 'recipients', num: '03', label: 'Recipients' },
  { id: 'generate', num: '04', label: 'Generate' },
] as const;
type StepId = typeof STEPS[number]['id'];

interface DragHandle {
  id: 'name' | 'date' | 'qr';
  x: number; y: number;
  color: string;
  label: string;
}

// ── Canvas Preview with draggable handles
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
    <div ref={containerRef} className="relative w-full select-none touch-none cursor-crosshair rounded-[16px] overflow-hidden border-2 border-foreground/[0.08] shadow-lg bg-foreground/[0.02]"
      onMouseMove={handleMouseMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)}
      onTouchMove={handleTouchMove} onTouchEnd={() => setDragging(null)}>
      <img src={imageUrl} alt="Template" className="w-full block" draggable={false} />
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
    </div>
  );
}

// ── CSV/Excel parser
function parseCSV(text: string): Recipient[] {
  return text.split('\n')
    .map(line => line.trim()).filter(Boolean)
    .filter(line => !line.toLowerCase().startsWith('name'))
    .map(line => {
      const [name = '', email = ''] = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      return { name, email, certId: '' };
    })
    .filter(r => r.name);
}

function parseXLSX(buffer: ArrayBuffer): Recipient[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  return rows.slice(1).map((row: any[]) => ({
    name: String(row[0] ?? '').trim(),
    email: String(row[1] ?? '').trim(),
    certId: '',
  })).filter(r => r.name);
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export function AdminCertificates() {
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

  const { data: eventsData = [] } = useAdminEvents();
  const events = eventsData as any[];
  const selectedEvent = events.find((e: any) => e.slug === selectedEventSlug);

  const validRecipients = useMemo(() => recipients.filter(r => r.name.trim()), [recipients]);

  const ensureIds = () => {
    if (!selectedEventSlug) return;
    setRecipients(prev => prev.map(r => ({
      ...r,
      certId: r.certId || (r.name.trim() ? makeCertId(selectedEventSlug) : ''),
    })));
  };
  useEffect(ensureIds, [selectedEventSlug]);

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

      ctx.font = `bold ${nameHandle.fontSize}px Playfair Display, Georgia, serif`;
      ctx.fillStyle = nameHandle.color; ctx.textAlign = 'center';
      ctx.fillText(r.name, nameHandle.x, nameHandle.y);

      if (selectedEvent) {
        ctx.font = `${dateHandle.fontSize}px Lato, Arial, sans-serif`;
        ctx.fillStyle = dateHandle.color; ctx.textAlign = 'center';
        ctx.fillText(selectedEvent.date_display ?? selectedEvent.short_date ?? '', dateHandle.x, dateHandle.y);
      }

      ctx.font = `18px monospace`;
      ctx.fillStyle = 'rgba(80,80,80,0.6)'; ctx.textAlign = 'center';
      ctx.fillText(`Certificate ID: ${r.certId}`, imgNatW / 2, imgNatH - 30);

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
    <div>
      <h1 className="font-syne font-black text-ink text-2xl mb-6">Certificate Studio</h1>
      <p className="font-dm text-ink-muted text-sm mb-6">Design templates · Position elements · Generate & email certificates in bulk</p>

      {/* Step nav */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-none pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-shrink-0">
            <button onClick={() => setStep(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-dm text-sm font-medium transition-all whitespace-nowrap ${
                step === s.id
                  ? 'bg-[#4285F4] text-white'
                  : 'text-ink-muted hover:text-ink'
              }`}>
              <span className={`font-dm-mono text-[10px] ${step === s.id ? 'text-white/70' : 'text-ink-muted'}`}>{s.num}</span>
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} className={step === s.id || STEPS.indexOf(STEPS.find(x => x.id === step)!) > i ? 'text-ink-muted/50' : 'text-ink-muted/30'} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══ STEP 1: TEMPLATE ══════════════════════════════════════════ */}
        {step === 'template' && (
          <motion.div key="template" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload */}
              <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.06]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-[12px] bg-[#4285F4]/10 flex items-center justify-center"><Upload size={18} className="text-[#4285F4]" /></div>
                  <div>
                    <h3 className="font-syne font-bold text-ink text-base">Upload Template</h3>
                    <p className="font-dm text-ink-muted text-xs">JPG or PNG · Recommended 1754×1240px</p>
                  </div>
                </div>
                <label className={`block border-2 border-dashed rounded-[16px] p-8 text-center cursor-pointer transition-all ${templateImg ? 'border-[#34A853]/40 bg-[#34A853]/[0.03]' : 'border-foreground/[0.12] hover:border-[#4285F4]/40 hover:bg-[#4285F4]/[0.02]'}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleTemplateUpload} />
                  {templateImg
                    ? <><CheckCircle size={28} className="mx-auto text-[#34A853] mb-2" /><p className="font-syne font-bold text-[#34A853] text-sm">Uploaded ✓</p><p className="font-dm text-ink-muted text-xs mt-1">Click to replace</p></>
                    : <><Upload size={28} className="mx-auto text-ink-muted mb-2" /><p className="font-syne font-bold text-ink text-sm">Click to upload image</p><p className="font-dm text-ink-muted text-xs mt-1">JPG, PNG</p></>
                  }
                </label>
              </div>

              {/* Event picker */}
              <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.06]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-[12px] bg-[#FBBC04]/10 flex items-center justify-center"><Sparkles size={18} className="text-[#FBBC04]" /></div>
                  <div>
                    <h3 className="font-syne font-bold text-ink text-base">Select Event</h3>
                    <p className="font-dm text-ink-muted text-xs">Fetched from database</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {events.map((ev: any) => {
                    const color = ev.badge_color ?? '#4285F4';
                    const sel = selectedEventSlug === ev.slug;
                    return (
                      <button key={ev.slug} onClick={() => setSelectedEventSlug(ev.slug)}
                        className={`w-full flex items-center gap-3 p-3 rounded-[12px] border-2 transition-all text-left ${sel ? 'border-[#4285F4] bg-[#4285F4]/[0.06]' : 'border-foreground/[0.07] hover:border-foreground/20 bg-transparent'}`}>
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-dm font-semibold text-ink text-sm truncate">{ev.title}</p>
                          <p className="font-dm-mono text-ink-muted text-xs mt-0.5">{ev.short_date ?? ev.date_display ?? '—'}</p>
                        </div>
                        {sel && <CheckCircle size={16} className="text-[#4285F4] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {templateImg && (
              <div className="mt-4">
                <img src={templateImg} alt="Preview" className="w-full rounded-[16px] border border-foreground/[0.08] shadow-sm max-h-64 object-contain bg-foreground/[0.02]" />
              </div>
            )}

            <button onClick={() => setStep('position')} disabled={!canProceedTemplate}
              className="mt-6 w-full bg-[#4285F4] text-white py-3 rounded-[12px] font-syne font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#3A75E0] transition-colors">
              Continue to Position <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* ══ STEP 2: POSITION ══════════════════════════════════════════ */}
        {step === 'position' && (
          <motion.div key="position" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <div className="grid md:grid-cols-[280px_1fr] gap-6">
              <div className="space-y-4">
                <p className="font-dm text-ink-muted text-sm"><span className="font-semibold text-[#4285F4]">Drag handles</span> to position elements</p>

                {/* Name */}
                <div className="bg-white rounded-[16px] p-4 border border-foreground/[0.06]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#4285F4]" />
                    <p className="font-syne font-bold text-[#4285F4] text-xs">[Name]</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['x','y','fontSize'] as const).map(k => (
                      <div key={k}>
                        <label className="font-dm text-xs text-ink-muted block mb-1">{k === 'fontSize' ? 'Size' : k}</label>
                        <input type="number" value={nameHandle[k]}
                          onChange={e => setNameHandle(h => ({ ...h, [k]: Number(e.target.value) }))}
                          className="w-full border border-foreground/10 rounded-[8px] px-2 py-1 font-dm-mono text-xs outline-none focus:border-[#4285F4]" />
                      </div>
                    ))}
                    <div>
                      <label className="font-dm text-xs text-ink-muted block mb-1">Color</label>
                      <input type="color" value={nameHandle.color}
                        onChange={e => setNameHandle(h => ({ ...h, color: e.target.value }))}
                        className="w-full h-8 rounded-[6px] border border-foreground/10 cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="bg-white rounded-[16px] p-4 border border-foreground/[0.06]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#34A853]" />
                    <p className="font-syne font-bold text-[#34A853] text-xs">[Date]</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['x','y','fontSize'] as const).map(k => (
                      <div key={k}>
                        <label className="font-dm text-xs text-ink-muted block mb-1">{k === 'fontSize' ? 'Size' : k}</label>
                        <input type="number" value={dateHandle[k]}
                          onChange={e => setDateHandle(h => ({ ...h, [k]: Number(e.target.value) }))}
                          className="w-full border border-foreground/10 rounded-[8px] px-2 py-1 font-dm-mono text-xs outline-none focus:border-[#34A853]" />
                      </div>
                    ))}
                    <div>
                      <label className="font-dm text-xs text-ink-muted block mb-1">Color</label>
                      <input type="color" value={dateHandle.color}
                        onChange={e => setDateHandle(h => ({ ...h, color: e.target.value }))}
                        className="w-full h-8 rounded-[6px] border border-foreground/10 cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* QR */}
                <div className="bg-white rounded-[16px] p-4 border border-foreground/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#EA4335]" />
                      <p className="font-syne font-bold text-[#EA4335] text-xs">[QR]</p>
                    </div>
                    <button onClick={() => setQrHandle(h => ({ ...h, show: !h.show }))}
                      className={`relative w-8 h-4 rounded-full transition-all ${qrHandle.show ? 'bg-[#EA4335]' : 'bg-foreground/20'}`}>
                      <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${qrHandle.show ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {qrHandle.show && (
                    <div className="grid grid-cols-2 gap-2">
                      {(['x','y','size'] as const).map(k => (
                        <div key={k}>
                          <label className="font-dm text-xs text-ink-muted block mb-1">{k}</label>
                          <input type="number" value={qrHandle[k]}
                            onChange={e => setQrHandle(h => ({ ...h, [k]: Number(e.target.value) }))}
                            className="w-full border border-foreground/10 rounded-[8px] px-2 py-1 font-dm-mono text-xs outline-none focus:border-[#EA4335]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Canvas */}
              {templateImg && (
                <div>
                  <p className="font-dm text-xs text-ink-muted mb-3">Preview • Drag colored handles to reposition</p>
                  <CanvasPreview
                    imageUrl={templateImg} canvasW={imgNatW} canvasH={imgNatH}
                    nameHandle={nameHandle} dateHandle={dateHandle} qrHandle={qrHandle}
                    onMove={handleMove}
                    sampleName="Rahul Sharma"
                    eventDate={selectedEvent?.date_display ?? selectedEvent?.short_date ?? 'March 22, 2026'}
                  />
                </div>
              )}
            </div>

            <button onClick={() => setStep('recipients')}
              className="mt-6 w-full bg-[#4285F4] text-white py-3 rounded-[12px] font-syne font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#3A75E0] transition-colors">
              Continue to Recipients <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* ══ STEP 3: RECIPIENTS ════════════════════════════════════════ */}
        {step === 'recipients' && (
          <motion.div key="recipients" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.06] mb-4">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <div>
                  <h3 className="font-syne font-bold text-ink text-lg">Import Recipients</h3>
                  <p className="font-dm text-ink-muted text-sm mt-0.5">Upload spreadsheet or add manually</p>
                </div>
                <label className="flex items-center gap-2 px-4 py-2 rounded-[12px] border-2 border-dashed border-[#34A853]/30 bg-[#34A853]/[0.04] text-[#34A853] font-dm font-medium text-sm cursor-pointer hover:bg-[#34A853]/[0.08] transition-all">
                  <FileSpreadsheet size={16} />
                  Import CSV / Excel
                  <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleSpreadsheet} />
                </label>
              </div>
              <p className="font-dm text-ink-muted text-xs mb-4 bg-foreground/[0.02] rounded-[10px] p-3">
                <strong>Format:</strong> Column A = Full Name, Column B = Email (optional). First row can be a header.
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recipients.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text" placeholder="Full Name" value={r.name}
                      onChange={e => {
                        const newR = [...recipients];
                        newR[i].name = e.target.value;
                        setRecipients(newR);
                      }}
                      className="flex-1 border border-foreground/10 rounded-[10px] px-3 py-2 font-dm text-sm outline-none focus:border-[#4285F4]" />
                    <input
                      type="email" placeholder="Email (optional)" value={r.email}
                      onChange={e => {
                        const newR = [...recipients];
                        newR[i].email = e.target.value;
                        setRecipients(newR);
                      }}
                      className="flex-1 border border-foreground/10 rounded-[10px] px-3 py-2 font-dm text-sm outline-none focus:border-[#4285F4]" />
                    {recipients.length > 1 && (
                      <button onClick={() => setRecipients(recipients.filter((_, idx) => idx !== i))}
                        className="px-3 py-2 text-[#EA4335] hover:bg-[#EA4335]/10 rounded-[10px] transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => setRecipients([...recipients, { name: '', email: '', certId: '' }])}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-foreground/20 rounded-[12px] text-ink-muted font-dm text-sm hover:border-[#4285F4] hover:text-[#4285F4] transition-colors">
                <Plus size={16} /> Add Row
              </button>
            </div>

            <button onClick={() => setStep('generate')} disabled={validRecipients.length === 0}
              className="w-full bg-[#4285F4] text-white py-3 rounded-[12px] font-syne font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#3A75E0] transition-colors">
              Generate Certificates <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* ══ STEP 4: GENERATE ══════════════════════════════════════════ */}
        {step === 'generate' && (
          <motion.div key="generate" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.06] mb-6">
              <h3 className="font-syne font-bold text-ink text-lg mb-6">Generate & Download</h3>

              {!done ? (
                <div>
                  <button onClick={generateAll} disabled={generating || !validRecipients.length}
                    className="w-full bg-[#4285F4] text-white py-4 rounded-[16px] font-syne font-bold text-base disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-[#3A75E0] transition-colors">
                    {generating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {progress.label}
                      </>
                    ) : (
                      <>
                        <Download size={18} /> Generate {validRecipients.length} Certificates
                      </>
                    )}
                  </button>

                  {generating && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm font-dm text-ink-muted">
                        <span>{progress.current} / {progress.total}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-foreground/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          className="h-full bg-[#4285F4]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#34A853]/[0.05] rounded-[12px] border border-[#34A853]/20 flex items-center gap-3">
                    <CheckCircle size={24} className="text-[#34A853] flex-shrink-0" />
                    <div>
                      <p className="font-syne font-bold text-[#34A853] text-sm">Generated successfully!</p>
                      <p className="font-dm text-[#34A853]/70 text-xs">ZIP file downloaded with all certificates</p>
                    </div>
                  </div>

                  <button onClick={sendEmails} disabled={sending || !validRecipients.filter(r => r.email).length}
                    className="w-full bg-white border-2 border-[#FBBC04] text-[#FBBC04] py-3 rounded-[12px] font-syne font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-[#FBBC04]/[0.05] transition-colors">
                    {sending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={16} /> Send Certificates via Email
                      </>
                    )}
                  </button>

                  {emailResult && (
                    <div className="p-3 bg-foreground/[0.03] rounded-[12px] font-dm text-sm text-ink-muted">
                      Sent: {emailResult.sent} • Failed: {emailResult.failed}
                    </div>
                  )}

                  <button onClick={() => { setStep('template'); setDone(false); }}
                    className="w-full bg-foreground/[0.05] text-ink-muted py-3 rounded-[12px] font-syne font-bold text-sm hover:bg-foreground/[0.08] transition-colors">
                    Create Another Batch
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
