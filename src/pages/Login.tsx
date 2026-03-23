import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { GDGLogo, GoogleGLogo } from "@/components/Doodles";
import { Aurora } from "@/components/AnimationUtils";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Login = () => {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("gdg_admin_token")) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { token } = await api.login(email, password);
      localStorage.setItem("gdg_admin_token", token);
      toast({ title: "Welcome back!", description: "Redirecting to admin dashboard..." });
      navigate("/admin", { replace: true });
    } catch {
      toast({ title: "Invalid credentials", description: "Please check your email and password.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] bg-dark relative overflow-hidden flex-col items-center justify-center">
        <Aurora />
        <div className="relative z-10 text-center px-8">
          <GDGLogo size={80} className="mx-auto" />
          <h2 className="font-syne font-black text-white text-4xl mt-6 leading-tight">
            Welcome to<br />GDG on Campus<br />APSIT
          </h2>
          <p className="font-dm text-white/50 text-base mt-3 max-w-xs mx-auto">
            A community of builders, learners, and creators.
          </p>
        </div>
        <span className="absolute top-20 left-16 font-dm-mono text-3xl font-bold text-g-yellow opacity-40 animate-float">{"{ }"}</span>
        <span className="absolute bottom-24 right-16 font-dm-mono text-2xl text-g-blue opacity-40 animate-float-delayed">{"</>"}</span>
      </div>

      {/* RIGHT — full width on mobile */}
      <div className="w-full lg:w-[55%] bg-cream graph-bg flex items-center justify-center min-h-screen p-4 sm:p-8 relative">
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="flex items-center gap-2">
            <GDGLogo size={28} />
            <span className="font-syne font-bold text-ink text-sm">gdg_apsit</span>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-white rounded-[24px] sm:rounded-3xl p-7 sm:p-10 shadow-lg w-full max-w-sm relative border border-foreground/[0.05] mt-8 lg:mt-0">
          <svg className="absolute top-4 right-4 w-6 h-6 text-g-yellow" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
          <div className="absolute bottom-4 left-4 flex gap-1">
            <div className="w-2 h-2 rounded-full bg-g-blue" />
            <div className="w-2 h-2 rounded-full bg-g-red" />
            <div className="w-2 h-2 rounded-full bg-g-yellow" />
            <div className="w-2 h-2 rounded-full bg-g-green" />
          </div>

          <h1 className="font-syne font-black text-ink text-2xl sm:text-3xl">Sign In</h1>
          <p className="font-dm text-ink-muted text-sm mt-1">Access the GDG APSIT admin panel</p>

          <button className="w-full mt-6 py-3 sm:py-3.5 rounded-2xl border-2 border-g-blue flex items-center justify-center gap-3 font-syne font-semibold text-sm text-ink hover:bg-[#4285F4]/5 hover:shadow-md active:scale-[0.98] transition-all">
            <GoogleGLogo /> Continue with Google
          </button>

          <div className="flex items-center gap-4 my-5 sm:my-6">
            <div className="flex-1 h-px bg-foreground/10" />
            <span className="font-dm text-ink-muted text-sm">or admin login</span>
            <div className="flex-1 h-px bg-foreground/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full font-dm text-base text-ink bg-transparent border-b-2 border-foreground/[0.15] py-2 focus:outline-none focus:border-g-blue transition-colors" />
            </div>
            <div className="relative">
              <input type={showPass ? "text" : "password"} placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full font-dm text-base text-ink bg-transparent border-b-2 border-foreground/[0.15] py-2 pr-10 focus:outline-none focus:border-g-blue transition-colors" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-0 top-2 text-ink-muted hover:text-ink transition-colors w-10 h-10 flex items-center justify-center">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="font-dm text-g-blue text-sm text-right cursor-pointer hover:underline">Forgot password?</p>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting}
              className="bg-ink text-white w-full py-3 sm:py-3.5 rounded-2xl font-syne font-bold active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? "Signing In..." : "Sign In as Admin"}
            </motion.button>
          </form>

          <p className="font-dm text-ink-muted text-sm text-center mt-5 sm:mt-6">
            Not an admin?{" "}
            <Link to="/" className="text-g-blue hover:underline">Join our community →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
