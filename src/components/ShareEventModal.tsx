import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, MessageCircle, Linkedin, Twitter } from 'lucide-react';

interface ShareEventModalProps {
  event: { title: string; slug: string; date: string; location: string; typeColor: string; };
  isOpen: boolean;
  onClose: () => void;
}

export const ShareEventModal = ({ event, isOpen, onClose }: ShareEventModalProps) => {
  const [copied, setCopied] = useState(false);
  const [posterDownloading, setPosterDownloading] = useState(false);

  const eventUrl = `${window.location.origin}/events/${event.slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Check out this GDG APSIT event:\n*${event.title}*\n📅 ${event.date}\n📍 ${event.location}\n\n${eventUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`Attending ${event.title} by @GDGonCampus APSIT! 🚀\n${eventUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleDownloadPoster = async () => {
    setPosterDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = event.typeColor;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1080; x += 38) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1080); ctx.stroke(); }
    for (let y = 0; y < 1080; y += 38) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillText('GDG ON CAMPUS APSIT', 80, 120);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(80, 140); ctx.lineTo(1000, 140); ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px "Arial Black", sans-serif';
    const words = event.title.split(' ');
    let line = ''; let y = 340;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > 920 && line) { ctx.fillText(line, 80, y); y += 90; line = word + ' '; }
      else { line = test; }
    }
    ctx.fillText(line, 80, y);

    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '32px Arial, sans-serif';
    ctx.fillText(`📅  ${event.date}`, 80, 780);
    ctx.fillText(`📍  ${event.location}`, 80, 840);

    const colors = ['#4285F4','#EA4335','#FBBC04','#34A853'];
    colors.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * 270, 1072, 270, 8); });

    const link = document.createElement('a');
    link.download = `${event.slug}-poster.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setPosterDownloading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}/>
          <motion.div
            className="fixed left-1/2 bottom-0 sm:top-1/2 z-50 w-full sm:w-[440px] sm:-translate-y-1/2"
            style={{ transform: 'translateX(-50%)' }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}>
            <div className="bg-white rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl">
              <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-5 sm:hidden"/>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-syne font-black text-ink text-xl">Share Event</h3>
                  <p className="font-dm text-ink-muted text-sm mt-0.5 line-clamp-1">{event.title}</p>
                </div>
                <button onClick={onClose} className="w-9 h-9 rounded-full bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground/10 transition-colors">
                  <X size={16}/>
                </button>
              </div>

              <div className="flex items-center gap-2 bg-[hsl(var(--cream))] rounded-[14px] p-3 mb-5">
                <span className="flex-1 font-dm-mono text-ink-muted text-xs truncate">{eventUrl}</span>
                <motion.button onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] font-dm font-semibold text-xs transition-all text-white"
                  style={{ background: copied ? '#34A853' : '#111' }}
                  whileTap={{ scale: 0.92 }}>
                  {copied ? <Check size={13}/> : <Copy size={13}/>}
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'WhatsApp', icon: MessageCircle, color: '#25D366', onClick: handleWhatsApp },
                  { label: 'LinkedIn', icon: Linkedin, color: '#0A66C2', onClick: handleLinkedIn },
                  { label: 'Twitter/X', icon: Twitter, color: '#1DA1F2', onClick: handleTwitter },
                ].map(btn => (
                  <motion.button key={btn.label} onClick={btn.onClick}
                    className="flex flex-col items-center gap-2 py-4 rounded-[16px] border border-foreground/[0.06] hover:border-foreground/[0.15] font-dm text-xs text-ink transition-all"
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.94 }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${btn.color}15` }}>
                      <btn.icon size={18} style={{ color: btn.color }}/>
                    </div>
                    {btn.label}
                  </motion.button>
                ))}
              </div>

              <motion.button onClick={handleDownloadPoster} disabled={posterDownloading}
                className="w-full py-3.5 rounded-[14px] border-2 border-dashed border-foreground/[0.15] font-dm font-medium text-sm text-ink hover:border-[#4285F4]/40 hover:text-[#4285F4] transition-all flex items-center justify-center gap-2"
                whileTap={{ scale: 0.97 }}>
                {posterDownloading ? '⏳ Generating...' : '⬇ Download Event Poster (1080×1080)'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
