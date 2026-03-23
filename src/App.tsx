import { useState, useRef, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CursorGlow } from "./components/CursorGlow";
import { CommandPalette } from "./components/CommandPalette";
import { useKonami } from "./hooks/useKonami";
import { useGDGTyping } from "./hooks/useGDGTyping";
import { GDGLogo } from "./components/Doodles";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Calendar from "./pages/Calendar";
import Skills from "./pages/Skills";
import Certificates from "./pages/Certificates";
import EventQuiz from "./pages/EventQuiz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 14);
    const drops = Array(cols).fill(1);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*GDGAPSITgdgapsit";
    const interval = setInterval(() => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#34A853";
      ctx.font = "14px DM Mono, monospace";
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 14, y * 14);
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 35);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 opacity-70"/>;
};

const SecretGDGPage = () => (
  <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-8">
    <motion.div className="max-w-md text-center"
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <GDGLogo size={80}/>
      <h1 className="font-syne font-black text-white text-4xl mt-6">You found it! 🎉</h1>
      <p className="font-dm text-white/60 mt-4 leading-relaxed">
        This is the secret developer page. You clearly know what you're doing.
        GDG on Campus APSIT would love to have you on the team.
      </p>
      <div className="mt-6 font-dm-mono text-[#34A853] text-sm">$ echo "You're one of us now"</div>
      <div className="flex gap-3 mt-8 justify-center">
        <Link to="/contact" className="bg-[#4285F4] text-white px-6 py-3 rounded-full font-syne font-bold text-sm hover:bg-[#3A75E0] transition-colors">Join the team</Link>
        <Link to="/" className="bg-white/[0.08] text-white px-6 py-3 rounded-full font-syne font-bold text-sm hover:bg-white/[0.15] transition-colors">Go home</Link>
      </div>
    </motion.div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const isAdmin = location.pathname === "/admin";
  const isSecret = location.pathname === "/gdg";
  const isQuiz = location.pathname.endsWith("/quiz");
  const hideChrome = isLogin || isAdmin || isSecret || isQuiz;

  return (
    <>
      {!hideChrome && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/events/:slug/quiz" element={<EventQuiz />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/gdg" element={<SecretGDGPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {!hideChrome && <Footer />}
    </>
  );
};

const AppContent = () => {
  const [hackerMode, setHackerMode] = useState(false);
  const [gdgToast, setGdgToast] = useState(false);

  const handleKonami = useCallback(() => {
    setHackerMode(true);
    setTimeout(() => setHackerMode(false), 3000);
  }, []);

  const handleGDGTyping = useCallback(() => {
    setGdgToast(true);
    setTimeout(() => setGdgToast(false), 3500);
  }, []);

  useKonami(handleKonami);
  useGDGTyping(handleGDGTyping);

  return (
    <>
      <CursorGlow />
      <CommandPalette />
      <AnimatedRoutes />

      <AnimatePresence>
        {hackerMode && (
          <motion.div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MatrixRain/>
            <div className="relative z-10 text-center">
              <div className="font-dm-mono text-[#34A853] text-4xl font-bold mb-2">ACCESS GRANTED</div>
              <div className="font-dm-mono text-[#34A853]/60 text-sm">Welcome, developer. 🚀 GDG APSIT salutes you.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gdgToast && (
          <motion.div
            className="fixed bottom-6 right-6 z-[9998] bg-[#0A0A0A] text-white rounded-[16px] px-5 py-4 shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-3"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}>
            <GDGLogo size={28}/>
            <div>
              <div className="font-syne font-bold text-sm">GDG detected! 👋</div>
              <div className="font-dm text-white/50 text-xs mt-0.5">You typed "gdg" — you're one of us.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
