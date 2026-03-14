import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, ChevronRight, X, Plus, Check } from 'lucide-react';
import { DoodleGraduationCap, DoodleTrophy } from '@/components/illustrations/GoogleDoodle';
import { SEOHead } from '@/components/SEOHead';

const EVENTS_LIST = [
  { slug: 'gen-ai-study-jams-2025', title: 'Gen AI Study Jams — Season 2025', date: 'September 14–15, 2025' },
  { slug: 'flutter-forward', title: 'Flutter Forward', date: 'October 4, 2025' },
  { slug: 'dsa-masterclass', title: 'DSA Masterclass', date: 'October 18, 2025' },
  { slug: 'hackapsit-2025', title: 'HackAPSIT 2025', date: 'November 1–2, 2025' },
  { slug: 'tech-winter-bootcamp', title: 'Tech Winter Bootcamp', date: 'November 22–24, 2025' },
  { slug: 'cloud-study-bootcamp', title: 'Cloud Study Bootcamp', date: 'December 6, 2025' },
  { slug: 'open-source-101', title: 'Open Source 101', date: 'December 20, 2025' },
  { slug: 'android-dev-day', title: 'Android Dev Day', date: 'January 11, 2026' },
];

async function generateCertificate(name: string, eventSlug: string) {
  const event = EVENTS_LIST.find(e => e.slug === eventSlug);
  if (!event) return;
  const canvas = document.createElement('canvas');
  canvas.width = 1754; canvas.height = 1240;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F7F5F0';
  ctx.fillRect(0, 0, 1754, 1240);

  ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 1;
  for (let x = 0; x < 1754; x += 38) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,1240); ctx.stroke(); }
  for (let y = 0; y < 1240; y += 38) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(1754,y); ctx.stroke(); }

  const colors = ['#4285F4','#EA4335','#FBBC04','#34A853'];
  colors.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * 438.5, 0, 438.5, 14); });

  ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 1674, 1160);

  ctx.fillStyle = '#111'; ctx.font = 'bold 36px Arial, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('GDG ON CAMPUS APSIT', 877, 130);

  ctx.fillStyle = '#6B6B6B'; ctx.font = '24px Georgia, serif';
  ctx.fillText('Certificate of Attendance', 877, 180);

  ctx.fillStyle = '#6B6B6B'; ctx.font = 'italic 28px Georgia, serif';
  ctx.fillText('This certifies that', 877, 380);

  ctx.fillStyle = '#111'; ctx.font = 'bold 72px Georgia, serif';
  ctx.fillText(name, 877, 490);

  ctx.fillStyle = '#6B6B6B'; ctx.font = 'italic 28px Georgia, serif';
  ctx.fillText('has successfully attended', 877, 580);

  ctx.fillStyle = '#4285F4'; ctx.font = 'bold 44px Arial, sans-serif';
  ctx.fillText(event.title, 877, 660);

  ctx.fillStyle = '#555'; ctx.font = '28px Arial, sans-serif';
  ctx.fillText(event.date, 877, 720);

  colors.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * 438.5, 1226, 438.5, 14); });

  const link = document.createElement('a');
  link.download = `gdg-apsit-certificate-${eventSlug}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

const StudentCertForm = () => {
  const [name, setName] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!name.trim() || !selectedEvent) return;
    setGenerating(true);
    await generateCertificate(name.trim(), selectedEvent);
    setGenerating(false);
    setGenerated(true);
    setTimeout(() => setGenerated(false), 3000);
  };

  const event = EVENTS_LIST.find(e => e.slug === selectedEvent);

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-[24px] p-7 border border-foreground/[0.06] shadow-sm">
        <h3 className="font-syne font-black text-ink text-xl mb-5">Get My Certificate</h3>
        <div className="mb-4">
          <label className="font-dm font-semibold text-ink text-sm block mb-2">Your Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma"
            className="w-full border border-foreground/[0.12] rounded-[12px] px-4 py-3 font-dm text-ink text-sm outline-none focus:border-[#4285F4] transition-colors" />
        </div>
        <div className="mb-6">
          <label className="font-dm font-semibold text-ink text-sm block mb-2">Select Event Attended</label>
          <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
            className="w-full border border-foreground/[0.12] rounded-[12px] px-4 py-3 font-dm text-ink text-sm outline-none focus:border-[#4285F4] transition-colors bg-white">
            <option value="">— Choose an event —</option>
            {EVENTS_LIST.map(ev => <option key={ev.slug} value={ev.slug}>{ev.title}</option>)}
          </select>
        </div>
        {name && event && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-[16px] border-2 border-[#4285F4]/20 bg-[#4285F4]/[0.04] p-4">
            <div className="flex items-center gap-3">
              <DoodleGraduationCap size={40} />
              <div>
                <div className="font-syne font-bold text-ink text-sm">{name}</div>
                <div className="font-dm text-ink-muted text-xs mt-0.5">{event.title} · {event.date}</div>
              </div>
            </div>
          </motion.div>
        )}
        <motion.button onClick={handleGenerate} disabled={!name.trim() || !selectedEvent || generating}
          className="w-full py-3.5 rounded-[14px] font-syne font-bold text-sm text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          style={{ background: generated ? '#34A853' : '#4285F4' }} whileTap={{ scale: 0.97 }}>
          {generating ? '⏳ Generating...' : generated ? <><Check size={16} /> Certificate Downloaded!</> : <><Download size={16} /> Generate & Download Certificate</>}
        </motion.button>
      </div>
    </div>
  );
};

const AdminCertGenerator = () => {
  const [step, setStep] = useState<'upload' | 'position' | 'students' | 'generate'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [namePlaceholder, setNamePlaceholder] = useState({ x: 540, y: 380, fontSize: 48, color: '#1a1a1a' });
  const [datePlaceholder, setDatePlaceholder] = useState({ x: 540, y: 460, fontSize: 28, color: '#555555' });
  const [students, setStudents] = useState<Array<{ name: string; email: string }>>([{ name: '', email: '' }]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setUploadedImage(src);
      const img = new window.Image();
      img.onload = () => { imgRef.current = img; };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const generateAll = async () => {
    if (!imgRef.current) return;
    const validStudents = students.filter(s => s.name.trim());
    if (!validStudents.length) return;
    setGenerating(true);
    setProgress({ current: 0, total: validStudents.length });
    const event = EVENTS_LIST.find(e => e.slug === selectedEvent);

    for (let i = 0; i < validStudents.length; i++) {
      const student = validStudents[i];
      setProgress({ current: i + 1, total: validStudents.length });
      const canvas = document.createElement('canvas');
      canvas.width = imgRef.current.width; canvas.height = imgRef.current.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(imgRef.current, 0, 0);
      ctx.font = `bold ${namePlaceholder.fontSize}px Georgia, serif`;
      ctx.fillStyle = namePlaceholder.color; ctx.textAlign = 'center';
      ctx.fillText(student.name.trim(), namePlaceholder.x, namePlaceholder.y);
      if (event) {
        ctx.font = `${datePlaceholder.fontSize}px Arial, sans-serif`;
        ctx.fillStyle = datePlaceholder.color; ctx.textAlign = 'center';
        ctx.fillText(event.date, datePlaceholder.x, datePlaceholder.y);
      }
      const link = document.createElement('a');
      link.download = `certificate-${student.name.trim().replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      await new Promise(r => setTimeout(r, 400));
    }
    setGenerating(false);
  };

  const STEPS = [
    { id: 'upload' as const, label: '① Upload Template' },
    { id: 'position' as const, label: '② Position Text' },
    { id: 'students' as const, label: '③ Add Students' },
    { id: 'generate' as const, label: '④ Generate All' },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setStep(s.id)}
              className={`px-4 py-2 rounded-full font-dm font-medium text-sm transition-all ${step === s.id ? 'bg-[#4285F4] text-white shadow-md' : 'bg-white border border-foreground/10 text-ink-muted hover:border-foreground/20'}`}>
              {s.label}
            </button>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-foreground/20 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-syne font-bold text-ink text-lg mb-4">Upload Certificate Template</h3>
                <p className="font-dm text-ink-muted text-sm mb-5">Upload your certificate design (JPG/PNG). Next step positions names and dates.</p>
                <label className="block border-2 border-dashed border-foreground/[0.15] rounded-[20px] p-10 text-center cursor-pointer hover:border-[#4285F4]/50 hover:bg-[#4285F4]/[0.03] transition-all">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Upload size={32} className="mx-auto text-ink-muted mb-3" />
                  <p className="font-syne font-bold text-ink text-base">Click to upload image</p>
                  <p className="font-dm text-ink-muted text-sm mt-1">JPG, PNG · Recommended 1754×1240px</p>
                </label>
                <div className="mt-5">
                  <label className="font-dm font-semibold text-ink text-sm block mb-2">Event (for date auto-fill)</label>
                  <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
                    className="w-full border border-foreground/[0.12] rounded-[12px] px-4 py-3 font-dm text-sm outline-none focus:border-[#4285F4] bg-white">
                    <option value="">— Select event —</option>
                    {EVENTS_LIST.map(ev => <option key={ev.slug} value={ev.slug}>{ev.title}</option>)}
                  </select>
                </div>
                <button onClick={() => uploadedImage && selectedEvent && setStep('position')} disabled={!uploadedImage || !selectedEvent}
                  className="mt-5 w-full bg-[#4285F4] text-white py-3 rounded-[12px] font-syne font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#3A75E0] transition-colors active:scale-95">
                  Continue to Position Text <ChevronRight size={16} />
                </button>
              </div>
              {uploadedImage && (
                <div>
                  <p className="font-dm font-semibold text-ink text-sm mb-3">Preview</p>
                  <img src={uploadedImage} alt="Template" className="w-full rounded-[16px] border border-foreground/[0.08] shadow-sm" />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 'position' && (
          <motion.div key="position" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="font-syne font-bold text-ink text-lg mb-4">Position Text Placeholders</h3>
            <p className="font-dm text-ink-muted text-sm mb-5">Set X/Y coordinates where name and date appear.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-[#4285F4]/[0.06] border border-[#4285F4]/[0.15] rounded-[16px] p-5">
                  <p className="font-syne font-bold text-[#4285F4] text-sm mb-3">[Student Name]</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ label: 'X', key: 'x' }, { label: 'Y', key: 'y' }, { label: 'Size', key: 'fontSize' }].map(f => (
                      <div key={f.key}>
                        <label className="font-dm text-xs text-ink-muted block mb-1">{f.label}</label>
                        <input type="number" value={(namePlaceholder as any)[f.key]}
                          onChange={e => setNamePlaceholder(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                          className="w-full border border-foreground/10 rounded-[8px] px-3 py-2 font-dm-mono text-sm outline-none focus:border-[#4285F4]" />
                      </div>
                    ))}
                    <div>
                      <label className="font-dm text-xs text-ink-muted block mb-1">Color</label>
                      <input type="color" value={namePlaceholder.color}
                        onChange={e => setNamePlaceholder(p => ({ ...p, color: e.target.value }))}
                        className="w-full h-10 rounded-[8px] border border-foreground/10 cursor-pointer" />
                    </div>
                  </div>
                </div>
                <div className="bg-[#34A853]/[0.06] border border-[#34A853]/[0.15] rounded-[16px] p-5">
                  <p className="font-syne font-bold text-[#34A853] text-sm mb-3">[Event Date]</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ label: 'X', key: 'x' }, { label: 'Y', key: 'y' }, { label: 'Size', key: 'fontSize' }].map(f => (
                      <div key={f.key}>
                        <label className="font-dm text-xs text-ink-muted block mb-1">{f.label}</label>
                        <input type="number" value={(datePlaceholder as any)[f.key]}
                          onChange={e => setDatePlaceholder(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                          className="w-full border border-foreground/10 rounded-[8px] px-3 py-2 font-dm-mono text-sm outline-none focus:border-[#34A853]" />
                      </div>
                    ))}
                    <div>
                      <label className="font-dm text-xs text-ink-muted block mb-1">Color</label>
                      <input type="color" value={datePlaceholder.color}
                        onChange={e => setDatePlaceholder(p => ({ ...p, color: e.target.value }))}
                        className="w-full h-10 rounded-[8px] border border-foreground/10 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
              {uploadedImage && <img src={uploadedImage} alt="Template" className="w-full rounded-[16px] border border-foreground/[0.08]" />}
            </div>
            <button onClick={() => setStep('students')} className="mt-6 w-full bg-[#4285F4] text-white py-3 rounded-[12px] font-syne font-bold text-sm active:scale-95">
              Continue to Add Students <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 'students' && (
          <motion.div key="students" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="max-w-2xl">
              <h3 className="font-syne font-bold text-ink text-lg mb-2">Add Student List</h3>
              <p className="font-dm text-ink-muted text-sm mb-5">One certificate per student will be generated.</p>
              <div className="flex flex-col gap-2 mb-4">
                {students.map((student, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#4285F4]/10 flex items-center justify-center flex-shrink-0 font-dm-mono text-xs text-[#4285F4] font-bold">{i + 1}</div>
                    <input value={student.name} onChange={e => setStudents(ss => ss.map((s, j) => j === i ? { ...s, name: e.target.value } : s))}
                      placeholder="Full Name" className="flex-1 border border-foreground/10 rounded-[10px] px-3 py-2.5 font-dm text-sm outline-none focus:border-[#4285F4]" />
                    <input value={student.email} onChange={e => setStudents(ss => ss.map((s, j) => j === i ? { ...s, email: e.target.value } : s))}
                      placeholder="Email (optional)" className="flex-1 border border-foreground/10 rounded-[10px] px-3 py-2.5 font-dm text-sm outline-none focus:border-[#4285F4]" />
                    <button onClick={() => setStudents(ss => ss.filter((_, j) => j !== i))} disabled={students.length === 1}
                      className="w-8 h-8 rounded-full bg-[#EA4335]/[0.08] text-[#EA4335] flex items-center justify-center hover:bg-[#EA4335]/[0.15] transition-colors disabled:opacity-30">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mb-6">
                <button onClick={() => setStudents(ss => [...ss, { name: '', email: '' }])}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] border border-dashed border-foreground/[0.15] text-ink-muted hover:border-[#4285F4]/40 hover:text-[#4285F4] font-dm text-sm transition-all">
                  <Plus size={14} /> Add Row
                </button>
                <span className="font-dm text-xs text-ink-muted self-center">{students.filter(s => s.name.trim()).length} valid entries</span>
              </div>
              <button onClick={() => setStep('generate')} disabled={!students.filter(s => s.name.trim()).length}
                className="w-full bg-[#4285F4] text-white py-3 rounded-[12px] font-syne font-bold text-sm disabled:opacity-40 active:scale-95">
                Ready to Generate ({students.filter(s => s.name.trim()).length} certificates) <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'generate' && (
          <motion.div key="generate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="max-w-lg mx-auto text-center">
              <div className="animate-float inline-block mb-6"><DoodleTrophy size={80} /></div>
              <h3 className="font-syne font-black text-ink text-2xl mb-3">Ready to Generate</h3>
              <p className="font-dm text-ink-muted mb-8">{students.filter(s => s.name.trim()).length} certificates will be downloaded.</p>

              {generating && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-dm text-ink text-sm">Generating {progress.current} of {progress.total}...</span>
                    <span className="font-dm-mono text-[#4285F4] text-sm font-bold">{Math.round((progress.current / progress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-foreground/[0.08] rounded-full h-2.5 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #4285F4, #34A853)' }}
                      animate={{ width: `${(progress.current / progress.total) * 100}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </div>
              )}

              <motion.button onClick={generateAll} disabled={generating}
                className="w-full py-4 rounded-[14px] font-syne font-black text-base text-white flex items-center justify-center gap-3 disabled:opacity-60 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }} whileTap={{ scale: 0.97 }}>
                {generating ? '⏳ Generating...' : <><Download size={18} /> Generate {students.filter(s => s.name.trim()).length} Certificates</>}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Certificates() {
  const [mode, setMode] = useState<'student' | 'admin'>('student');

  return (
    <div className="graph-bg min-h-screen">
      <SEOHead title="Certificates" description="Download your GDG APSIT event attendance certificate" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-10">
        <div className="flex items-end gap-6 flex-wrap">
          <div className="animate-float-slow"><DoodleGraduationCap size={80} /></div>
          <div>
            <span className="font-dm-mono text-ink-muted text-xs uppercase tracking-[0.12em] block mb-2">GDG APSIT · Recognition</span>
            <h1 className="font-syne font-black text-ink leading-none" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>Certificates</h1>
            <p className="font-dm text-ink-muted mt-2 text-base">Download your certificate or generate bulk certificates for all attendees.</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-full p-1 border border-foreground/[0.08] w-fit mt-8">
          {([['student', 'For Me'], ['admin', 'Admin (Bulk)']] as const).map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-full font-syne font-bold text-sm transition-all active:scale-95 ${mode === m ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            {mode === 'student' ? <StudentCertForm /> : <AdminCertGenerator />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
