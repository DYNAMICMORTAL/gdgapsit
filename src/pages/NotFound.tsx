import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { GDGLogo } from "@/components/Doodles";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => { console.error("404 Error: User attempted to access non-existent route:", location.pathname); }, [location.pathname]);

  return (
    <div className="bg-dark min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "38px 38px" }} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-g-blue/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-g-red/10 blur-[100px]" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-syne font-black leading-none tracking-tight flex justify-center" style={{ fontSize: "clamp(7rem, 28vw, 14rem)" }}>
          <span className="text-g-blue">4</span>
          <span className="text-g-red">0</span>
          <span className="text-g-yellow">4</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-center mt-4">
          <GDGLogo size={48} />
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="font-caveat text-white/50 text-xl sm:text-2xl mt-6">
          oops, this page got lost in the cloud ☁️
        </motion.p>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="font-dm text-white/40 text-sm sm:text-base mt-3 max-w-md mx-auto">
          The page you're looking for doesn't exist. Maybe it got deployed to the wrong environment.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link to="/" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-ink px-7 py-3 rounded-full font-syne font-bold hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <Link to="/events" className="w-full sm:w-auto px-7 py-3 rounded-full font-syne font-bold text-white border border-white/20 hover:border-white/50 active:scale-95 transition-all text-center">
            View Events
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-10 sm:mt-12 bg-white/[0.04] rounded-[14px] sm:rounded-xl p-4 sm:p-5 max-w-xs mx-auto w-full text-left border border-white/[0.06]">
          <p className="font-dm-mono text-sm"><span className="text-g-green">$</span><span className="text-white/60"> cd /home</span></p>
          <p className="font-dm-mono text-sm mt-1"><span className="text-g-red">error:</span><span className="text-white/40"> page not found</span></p>
          <p className="font-dm-mono text-sm mt-1"><span className="text-g-yellow">hint:</span><span className="text-white/40"> try /events or /about</span></p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
