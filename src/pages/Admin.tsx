import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, Users, Image as ImageIcon, Settings, LogOut,
  Plus, Pencil, Trash2, X, TrendingUp, Eye, EyeOff, Search, UserPlus, Linkedin, Mail,
  CalendarPlus, ImagePlus as ImagePlusIcon, ExternalLink, Globe, Zap, BarChart3, ToggleLeft, ToggleRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { GDGLogo } from "@/components/Doodles";
import { events as initialEvents } from "@/data/events";
import type { Event } from "@/data/events";
import { CountUp } from "@/components/AnimationUtils";

// ========== AUTH GATE ==========
const AdminAuthGate = ({ onAuth }: { onAuth: (v: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 900));
    if (email === "admin@gdgapsit.com" && password === "gdgapsit2025") {
      localStorage.setItem("gdg_admin_auth", "true");
      onAuth(true);
    } else {
      setError("Invalid credentials. Try admin@gdgapsit.com");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-[#4285F4]/[0.08] blur-[120px]" />
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-[#EA4335]/[0.08] blur-[100px]" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#161616] border border-white/[0.08] rounded-[32px] p-10 w-full max-w-sm relative">
        <div className="flex flex-col items-center mb-8">
          <GDGLogo size={44} />
          <h1 className="font-syne font-black text-white text-2xl mt-4">Admin Panel</h1>
          <p className="font-dm text-white/40 text-sm mt-1 text-center">GDG on Campus APSIT</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="border-b border-white/10 pb-3">
            <label className="font-caveat text-white/50 text-base block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="bg-transparent font-dm text-white text-base w-full outline-none placeholder:text-white/20" placeholder="admin@gdgapsit.com" />
          </div>
          <div className="border-b border-white/10 pb-3 relative">
            <label className="font-caveat text-white/50 text-base block mb-1">Password</label>
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="bg-transparent font-dm text-white text-base w-full outline-none placeholder:text-white/20 pr-8" placeholder="••••••••••" />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-0 bottom-4 text-white/30 hover:text-white/60">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-dm text-[#EA4335] text-xs mt-3">{error}</motion.p>}
        <motion.button onClick={handleLogin} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full mt-6 py-4 rounded-[16px] font-syne font-bold text-base bg-white text-ink disabled:opacity-60 transition-all">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-ink/20 border-t-ink rounded-full inline-block" />
              Verifying...
            </span>
          ) : "Sign In →"}
        </motion.button>
        <span className="absolute top-4 right-4 font-dm-mono text-white/[0.05] text-4xl">{"{ }"}</span>
        <span className="absolute bottom-4 left-4 font-dm-mono text-white/[0.05] text-2xl">{"</>"}</span>
      </motion.div>
    </div>
  );
};

// ========== SIDEBAR ==========
const QuizToggleRow = ({ event }: { event: typeof ALL_EVENTS_ADMIN[0] }) => {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-[12px] bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: event.typeColor }} />
        <div>
          <span className="font-dm font-medium text-ink text-sm">{event.title}</span>
          <span className="font-caveat text-xs ml-2" style={{ color: event.typeColor }}>{event.type}</span>
        </div>
      </div>
      <button onClick={() => setEnabled(!enabled)} className="flex items-center gap-2 transition-colors">
        {enabled ? (
          <ToggleRight size={28} className="text-[#34A853]" />
        ) : (
          <ToggleLeft size={28} className="text-ink-muted" />
        )}
        <span className={`font-dm text-xs ${enabled ? "text-[#34A853]" : "text-ink-muted"}`}>
          {enabled ? "Active" : "Off"}
        </span>
      </button>
    </div>
  );
};

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "team", label: "Team Members", icon: Users },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "settings", label: "Settings", icon: Settings },
];

const attendanceData = [
  { event: "Gen AI Jams", attendees: 80, color: "#FBBC04" },
  { event: "Flutter Fwd", attendees: 60, color: "#4285F4" },
  { event: "DSA Master", attendees: 120, color: "#34A853" },
  { event: "HackAPSIT", attendees: 200, color: "#EA4335" },
  { event: "Winter Boot", attendees: 90, color: "#7C3AED" },
];

const monthlyGrowth = [
  { month: "Jul", members: 20 },
  { month: "Aug", members: 35 },
  { month: "Sep", members: 85 },
  { month: "Oct", members: 140 },
  { month: "Nov", members: 210 },
  { month: "Dec", members: 260 },
  { month: "Jan", members: 310 },
];

const eventTypeDistribution = [
  { name: "Workshop", value: 3, color: "#4285F4" },
  { name: "Hackathon", value: 2, color: "#EA4335" },
  { name: "Study Jam", value: 2, color: "#FBBC04" },
  { name: "Bootcamp", value: 1, color: "#34A853" },
];

const teamMembers = [
  { id: "1", seed: "Emery", name: "Riya Sharma", role: "GDG Lead", roleColor: "#4285F4", bio: "Final year CS student and the driving force behind GDG on Campus APSIT.", isLead: true, linkedin: "#", email: "riya@gdgapsit.com" },
  { id: "2", seed: "Eden", name: "Arjun Mehta", role: "Tech Head", roleColor: "#EA4335", bio: "Web dev wizard & open-source contributor.", isLead: false, linkedin: "#", email: "arjun@gdgapsit.com" },
  { id: "3", seed: "Aiden", name: "Priya Nair", role: "Tech Head", roleColor: "#EA4335", bio: "Android & Flutter specialist.", isLead: false, linkedin: "#", email: "" },
  { id: "4", seed: "Brian", name: "Zara Khan", role: "Literature Head", roleColor: "#FBBC04", bio: "Storyteller turned techie.", isLead: false, linkedin: "", email: "zara@gdgapsit.com" },
  { id: "5", seed: "Kingston", name: "Dev Patel", role: "Cinematographer", roleColor: "#34A853", bio: "Captures every GDG moment.", isLead: false, linkedin: "#", email: "" },
  { id: "6", seed: "Avery", name: "Mihir Shah", role: "Operations Head", roleColor: "#4285F4", bio: "The backbone of logistics.", isLead: false, linkedin: "#", email: "" },
  { id: "7", seed: "Riley", name: "Ananya Joshi", role: "Creatives Head", roleColor: "#EA4335", bio: "Designs every poster and banner.", isLead: false, linkedin: "", email: "ananya@gdgapsit.com" },
];

const recentActivity = [
  { icon: Plus, color: "#34A853", text: 'Event "Android Dev Day" published', time: "Jan 8, 2026", tag: "Event" },
  { icon: Pencil, color: "#4285F4", text: 'Team member "Ananya Joshi" updated', time: "Jan 5, 2026", tag: "Member" },
  { icon: ImageIcon, color: "#FBBC04", text: "3 new gallery photos added", time: "Dec 22, 2025", tag: "Gallery" },
  { icon: Zap, color: "#EA4335", text: "HackAPSIT 2025 event concluded", time: "Nov 3, 2025", tag: "Event" },
  { icon: Users, color: "#34A853", text: 'Extended team member "Neel Mehta" added', time: "Oct 28, 2025", tag: "Member" },
  { icon: Globe, color: "#4285F4", text: "GDG Community link updated for Flutter Forward", time: "Oct 2, 2025", tag: "Event" },
];

const ALL_EVENTS_ADMIN = [
  { title: "Gen AI Study Jams — Season 2025", type: "Study Jam", shortDate: "Sep 14–15", attendance: "80+", typeColor: "#FBBC04" },
  { title: "Flutter Forward", type: "Workshop", shortDate: "Oct 4", attendance: "60+", typeColor: "#4285F4" },
  { title: "DSA Masterclass", type: "Session", shortDate: "Oct 18", attendance: "120+", typeColor: "#34A853" },
  { title: "HackAPSIT 2025", type: "Hackathon", shortDate: "Nov 1–2", attendance: "200+", typeColor: "#EA4335" },
  { title: "Tech Winter Bootcamp", type: "Bootcamp", shortDate: "Nov 22–24", attendance: "90+", typeColor: "#7C3AED" },
];

// ========== MAIN ADMIN ==========
const Admin = () => {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("gdg_admin_auth") === "true");
  const [tab, setTab] = useState("dashboard");
  const [eventsData, setEventsData] = useState<Event[]>(initialEvents);
  const [members, setMembers] = useState(teamMembers);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<typeof teamMembers[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isAuth) return <AdminAuthGate onAuth={setIsAuth} />;

  const handleLogout = () => {
    localStorage.removeItem("gdg_admin_auth");
    localStorage.removeItem("gdg-admin-auth");
    setIsAuth(false);
  };

  const handleDeleteEvent = (slug: string) => setEventsData(prev => prev.filter(e => e.slug !== slug));
  const handleDeleteMember = (id: string) => setMembers(prev => prev.filter(m => m.id !== id));

  const filteredEvents = eventsData.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const quickActions = [
    { label: "Add New Event", icon: CalendarPlus, color: "#4285F4", onClick: () => { setTab("events"); setEditingEvent(null); setShowEventModal(true); } },
    { label: "Add Team Member", icon: UserPlus, color: "#EA4335", onClick: () => { setTab("team"); setEditingMember(null); setShowMemberModal(true); } },
    { label: "Add Gallery Photo", icon: ImagePlusIcon, color: "#34A853", onClick: () => setTab("gallery") },
    { label: "View Live Site", icon: ExternalLink, color: "#FBBC04", onClick: () => window.open("/", "_blank") },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] md:flex">
      {/* Mobile tab bar */}
      <div className="md:hidden bg-white border-b border-foreground/[0.06] px-4 py-3 sticky top-0 z-30">
        <div className="flex gap-2 overflow-x-auto scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-dm font-medium text-sm whitespace-nowrap flex-shrink-0 active:scale-95 transition-all ${
                tab === item.id ? "bg-[#4285F4] text-white" : "bg-foreground/[0.05] text-[#6B6B6B]"
              }`}>
              <item.icon size={13} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 bg-white border-r border-foreground/[0.06] flex-col fixed top-0 left-0 bottom-0 z-40">
        <div className="flex items-center gap-3 p-6 border-b border-foreground/[0.06]">
          <GDGLogo size={32} />
          <div>
            <p className="font-syne font-bold text-ink text-sm">GDG APSIT</p>
            <p className="font-dm text-ink-muted text-xs">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] font-dm text-sm transition-all text-left ${
                tab === item.id ? "bg-[#4285F4] text-white shadow-[0_4px_12px_rgba(66,133,244,0.3)]" : "text-ink-muted hover:bg-foreground/[0.04] hover:text-ink"
              }`}>
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-7 py-4 font-dm text-sm text-ink-muted hover:text-[#EA4335] transition-colors border-t border-foreground/[0.06]">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Top bar */}
      <div className="md:ml-64 flex-1">
        <div className="hidden md:flex bg-white border-b border-foreground/[0.06] px-8 py-4 items-center justify-between sticky top-0 z-20">
          <span className="font-dm text-ink-muted text-sm">
            GDG Admin / <span className="text-ink font-medium capitalize">{tab}</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="font-dm-mono text-ink-muted text-xs">admin@gdgapsit.com</span>
            <img src="https://api.dicebear.com/9.x/micah/svg?seed=Admin" className="w-8 h-8 rounded-full bg-white border-2 border-foreground/10" alt="Admin" />
          </div>
        </div>

        <main className="p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* ═══════ DASHBOARD ═══════ */}
              {tab === "dashboard" && (
                <div>
                  <h1 className="font-syne font-black text-ink text-2xl mb-6">Dashboard</h1>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    {[
                      { label: "Events Published", value: 8, color: "#4285F4", Icon: CalendarDays, trend: "+2 this month" },
                      { label: "Team Members", value: 7, color: "#EA4335", Icon: Users, trend: "Core team" },
                      { label: "Total Attendees", value: 500, color: "#34A853", Icon: TrendingUp, trend: "Across 8 events" },
                      { label: "Gallery Items", value: 24, color: "#FBBC04", Icon: ImageIcon, trend: "Photos added" },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white rounded-[20px] p-6 border border-foreground/[0.05] shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-dm text-ink-muted text-sm">{stat.label}</span>
                            <div className="font-syne font-black text-ink text-4xl mt-1"><CountUp target={stat.value} /></div>
                          </div>
                          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                            <stat.Icon size={18} style={{ color: stat.color }} />
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-foreground/[0.05]">
                          <span className="font-dm text-xs text-ink-muted">{stat.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {quickActions.map(action => (
                      <button key={action.label} onClick={action.onClick}
                        className="bg-white rounded-[16px] p-5 border border-foreground/[0.05] shadow-sm flex flex-col items-center gap-3 hover:shadow-md transition-all group">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ background: `${action.color}12` }}>
                          <action.icon size={18} style={{ color: action.color }} />
                        </div>
                        <span className="font-dm font-medium text-ink text-sm text-center">{action.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.05] shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-syne font-bold text-ink text-lg">Recent Activity</h2>
                        <span className="font-dm text-ink-muted text-xs">Last 90 days</span>
                      </div>
                      {recentActivity.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-3 border-b border-foreground/[0.04] last:border-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}12` }}>
                            <item.icon size={14} style={{ color: item.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-dm text-sm text-ink truncate">{item.text}</p>
                            <p className="font-dm-mono text-xs text-ink-muted mt-0.5">{item.time}</p>
                          </div>
                          <span className="font-dm text-[10px] px-2 py-0.5 rounded-full bg-foreground/[0.04] text-ink-muted flex-shrink-0">{item.tag}</span>
                        </div>
                      ))}
                    </div>

                    {/* Team Snapshot */}
                    <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.05] shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-syne font-bold text-ink text-lg">Team Snapshot</h2>
                        <button onClick={() => setTab("team")} className="font-dm text-[#4285F4] text-sm hover:underline">Manage →</button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { seed: "Emery", name: "Riya Sharma", role: "GDG Lead", color: "#4285F4" },
                          { seed: "Eden", name: "Arjun Mehta", role: "Tech Head", color: "#EA4335" },
                          { seed: "Aiden", name: "Priya Nair", role: "Tech Head", color: "#EA4335" },
                          { seed: "Brian", name: "Zara Khan", role: "Literature", color: "#FBBC04" },
                          { seed: "Kingston", name: "Dev Patel", role: "Cinemat.", color: "#34A853" },
                          { seed: "Avery", name: "Mihir Shah", role: "Operations", color: "#4285F4" },
                          { seed: "Riley", name: "Ananya Joshi", role: "Creatives", color: "#EA4335" },
                        ].map(m => (
                          <div key={m.seed} className="flex items-center gap-2.5 p-2 rounded-[10px] hover:bg-foreground/[0.02] transition-colors">
                            <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${m.seed}`} className="w-9 h-9 rounded-full border-2 bg-white" style={{ borderColor: m.color }} alt={m.name} />
                            <div className="min-w-0">
                              <p className="font-dm font-medium text-ink text-xs truncate">{m.name}</p>
                              <p className="font-caveat text-xs" style={{ color: m.color }}>{m.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Events Overview Table */}
                  <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.05] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-syne font-bold text-ink text-lg">Events Overview</h2>
                      <button onClick={() => setTab("events")} className="font-dm text-[#4285F4] text-sm hover:underline">Manage all →</button>
                    </div>
                    <div className="overflow-x-auto"><table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b border-foreground/[0.06]">
                          {["Event", "Type", "Date", "Attendance"].map(h => (
                            <th key={h} className="text-left py-2 font-dm font-semibold text-xs text-ink-muted uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ALL_EVENTS_ADMIN.map(event => (
                          <tr key={event.title} className="border-b border-foreground/[0.03] last:border-0">
                            <td className="py-3 font-dm text-sm text-ink">{event.title}</td>
                            <td className="py-3">
                              <span className="font-caveat font-bold text-xs px-2 py-0.5 rounded-full" style={{ background: `${event.typeColor}15`, color: event.typeColor }}>
                                {event.type}
                              </span>
                            </td>
                            <td className="py-3 font-dm text-sm text-ink-muted">{event.shortDate}</td>
                            <td className="py-3 font-dm-mono text-sm text-ink">{event.attendance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table></div>
                  </div>
                </div>
              )}

              {/* ═══════ EVENTS ═══════ */}
              {tab === "events" && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 bg-white rounded-[12px] border border-foreground/[0.06] flex items-center gap-3 px-4 py-3 shadow-sm">
                      <Search size={15} className="text-ink-muted" />
                      <input placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="font-dm text-sm text-ink bg-transparent outline-none flex-1" />
                    </div>
                    <button onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
                      className="flex items-center gap-2 bg-[#4285F4] text-white px-4 py-3 rounded-[12px] font-dm font-semibold text-sm shadow-sm hover:bg-[#3A75E0] transition-colors">
                      <Plus size={15} /> New Event
                    </button>
                  </div>
                  <div className="bg-white rounded-[20px] border border-foreground/[0.05] overflow-hidden shadow-sm overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead>
                        <tr className="bg-foreground/[0.02] border-b border-foreground/[0.05]">
                          {["Event", "Type", "Date", "Location", "Attendees", "Status", ""].map(h => (
                            <th key={h} className="text-left px-6 py-4 font-dm font-semibold text-xs text-ink-muted uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvents.map(event => (
                          <tr key={event.slug} className="border-t border-foreground/[0.04] hover:bg-foreground/[0.01] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: event.badgeColor }} />
                                <span className="font-dm font-medium text-ink text-sm">{event.title}</span>
                                {event.featured && <span className="font-syne font-black text-[#EA4335] text-[10px] bg-[#EA4335]/10 px-2 py-0.5 rounded-full">FLAGSHIP</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-caveat font-bold text-sm px-3 py-1 rounded-full" style={{ background: `${event.badgeColor}15`, color: event.badgeColor }}>{event.type}</span>
                            </td>
                            <td className="px-6 py-4 font-dm text-sm text-ink-muted">{event.date}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                {event.interCollege && <span className="font-dm text-[#4285F4] text-xs bg-[#4285F4]/10 px-2 py-0.5 rounded-full">IC</span>}
                                <span className="font-dm text-sm text-ink-muted">{event.location}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-dm-mono text-sm text-ink">{event.attendance}</td>
                            <td className="px-6 py-4">
                              <span className="font-dm text-xs px-2.5 py-1 rounded-full font-medium bg-[#34A853]/[0.15] text-[#34A853]">✓ Concluded</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => { setEditingEvent(event); setShowEventModal(true); }}
                                  className="w-8 h-8 rounded-[8px] bg-[#4285F4]/[0.08] text-[#4285F4] flex items-center justify-center hover:bg-[#4285F4]/[0.18] transition-colors">
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => handleDeleteEvent(event.slug)}
                                  className="w-8 h-8 rounded-[8px] bg-[#EA4335]/[0.08] text-[#EA4335] flex items-center justify-center hover:bg-[#EA4335]/[0.18] transition-colors">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ═══════ ANALYTICS ═══════ */}
              {tab === "analytics" && (
                <div>
                  <h1 className="font-syne font-black text-ink text-2xl mb-6">Analytics</h1>

                  {/* Quiz Toggles */}
                  <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.05] shadow-sm mb-6">
                    <h2 className="font-syne font-bold text-ink text-lg mb-4">Quiz Management</h2>
                    <p className="font-dm text-ink-muted text-sm mb-4">Enable or disable quizzes for each event.</p>
                    <div className="space-y-3">
                      {ALL_EVENTS_ADMIN.map(event => (
                        <QuizToggleRow key={event.title} event={event} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Attendance Chart */}
                    <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.05] shadow-sm">
                      <h2 className="font-syne font-bold text-ink text-lg mb-4">Attendance by Event</h2>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={attendanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                          <XAxis dataKey="event" tick={{ fontSize: 11, fontFamily: "DM Sans" }} stroke="rgba(0,0,0,0.3)" />
                          <YAxis tick={{ fontSize: 11, fontFamily: "DM Sans" }} stroke="rgba(0,0,0,0.3)" />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", fontFamily: "DM Sans", fontSize: 13 }} />
                          <Bar dataKey="attendees" radius={[8, 8, 0, 0]}>
                            {attendanceData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Community Growth */}
                    <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.05] shadow-sm">
                      <h2 className="font-syne font-bold text-ink text-lg mb-4">Community Growth</h2>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={monthlyGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "DM Sans" }} stroke="rgba(0,0,0,0.3)" />
                          <YAxis tick={{ fontSize: 11, fontFamily: "DM Sans" }} stroke="rgba(0,0,0,0.3)" />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", fontFamily: "DM Sans", fontSize: 13 }} />
                          <Line type="monotone" dataKey="members" stroke="#4285F4" strokeWidth={3} dot={{ fill: "#4285F4", r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Event Type Distribution */}
                  <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.05] shadow-sm">
                    <h2 className="font-syne font-bold text-ink text-lg mb-4">Event Type Distribution</h2>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <ResponsiveContainer width="100%" height={220} className="max-w-[260px]">
                        <PieChart>
                          <Pie data={eventTypeDistribution} dataKey="value" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}>
                            {eventTypeDistribution.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", fontFamily: "DM Sans", fontSize: 13 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-3">
                        {eventTypeDistribution.map(t => (
                          <div key={t.name} className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-foreground/[0.03]">
                            <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                            <span className="font-dm text-sm text-ink">{t.name}</span>
                            <span className="font-dm-mono text-xs text-ink-muted">({t.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════ TEAM MEMBERS ═══════ */}
              {tab === "team" && (
                <div>
                  <h1 className="font-syne font-black text-ink text-2xl mb-6">Team Members</h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {members.map(member => (
                      <div key={member.id} className="bg-white rounded-[20px] p-5 border border-foreground/[0.05] shadow-sm relative group">
                        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingMember(member); setShowMemberModal(true); }}
                            className="w-7 h-7 rounded-full bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center hover:bg-[#4285F4] hover:text-white transition-all">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDeleteMember(member.id)}
                            className="w-7 h-7 rounded-full bg-[#EA4335]/10 text-[#EA4335] flex items-center justify-center hover:bg-[#EA4335] hover:text-white transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="relative w-fit">
                          <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${member.seed}`} className="w-16 h-16 rounded-full bg-white border-[3px]"
                            style={{ borderColor: member.roleColor }} alt={member.name} />
                          {member.isLead && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FBBC04] rounded-full flex items-center justify-center text-[10px]">⭐</div>}
                        </div>
                        <div className="font-syne font-bold text-ink text-base mt-3">{member.name}</div>
                        <div className="font-caveat font-semibold text-sm mt-0.5" style={{ color: member.roleColor }}>{member.role}</div>
                        <p className="font-dm text-xs text-ink-muted mt-2 line-clamp-2">{member.bio}</p>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-foreground/[0.05]">
                          {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-dm text-xs text-[#0A66C2] hover:underline"><Linkedin size={11} /> LinkedIn</a>}
                          {member.email && <a href={`mailto:${member.email}`} className="flex items-center gap-1 font-dm text-xs text-ink-muted hover:text-ink"><Mail size={11} /> {member.email.split("@")[0]}@...</a>}
                        </div>
                      </div>
                    ))}
                    <motion.button onClick={() => { setEditingMember(null); setShowMemberModal(true); }} whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-[20px] border-2 border-dashed border-foreground/[0.12] flex flex-col items-center justify-center gap-3 p-5 min-h-[220px] text-ink-muted hover:border-[#4285F4]/40 hover:text-[#4285F4] transition-all group">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:border-solid transition-all">
                        <UserPlus size={20} />
                      </div>
                      <span className="font-dm font-medium text-sm">Add Team Member</span>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* ═══════ GALLERY ═══════ */}
              {tab === "gallery" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="font-syne font-black text-ink text-2xl">Gallery</h1>
                    <button className="flex items-center gap-2 bg-[#4285F4] text-white px-4 py-2 rounded-[10px] font-dm font-semibold text-sm hover:opacity-90 transition-opacity">
                      <Plus size={16} /> Add Photo
                    </button>
                  </div>
                  <p className="font-dm text-ink-muted text-sm">Gallery management — add, edit, and delete gallery items from here.</p>
                </div>
              )}

              {/* ═══════ SETTINGS ═══════ */}
              {tab === "settings" && (
                <div>
                  <h1 className="font-syne font-black text-ink text-2xl mb-6">Settings</h1>
                  {[
                    { title: "Site Information", fields: [
                      { label: "Club Name", default: "GDG on Campus APSIT" },
                      { label: "Email Address", default: "gdgoncampus.apsit@gmail.com" },
                      { label: "College", default: "A.P. Shah Institute of Technology, Thane" },
                      { label: "Founded Year", default: "2022" },
                    ]},
                    { title: "Social Links", fields: [
                      { label: "GitHub", default: "https://github.com/gdg-apsit" },
                      { label: "LinkedIn", default: "" },
                      { label: "Instagram", default: "" },
                      { label: "GDG Community", default: "https://gdg.community.dev" },
                    ]},
                    { title: "Admin Access", fields: [
                      { label: "Admin Email", default: "admin@gdgapsit.com" },
                      { label: "Change Password", default: "" },
                    ]},
                  ].map(group => (
                    <div key={group.title} className="bg-white rounded-[20px] p-6 border border-foreground/[0.05] mb-4">
                      <h3 className="font-syne font-bold text-ink text-lg mb-4">{group.title}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.fields.map(field => (
                          <div key={field.label} className="flex flex-col gap-1.5">
                            <label className="font-caveat text-ink-muted text-base">{field.label}</label>
                            <input type={field.label.includes("Password") ? "password" : "text"} defaultValue={field.default}
                              className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink bg-white outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/10 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="bg-[#34A853] text-white px-6 py-3 rounded-[12px] font-syne font-bold text-sm hover:opacity-90 transition-opacity mt-2">Save Changes</button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* EVENT MODAL */}
      <AnimatePresence>
        {showEventModal && (
          <EventModal event={editingEvent}
            onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
            onSave={(ev) => { if (editingEvent) setEventsData(prev => prev.map(e => e.slug === editingEvent.slug ? { ...e, ...ev } : e)); setShowEventModal(false); setEditingEvent(null); }} />
        )}
      </AnimatePresence>

      {/* MEMBER MODAL */}
      <AnimatePresence>
        {showMemberModal && (
          <MemberModal member={editingMember}
            onClose={() => { setShowMemberModal(false); setEditingMember(null); }}
            onSave={() => { setShowMemberModal(false); setEditingMember(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
};

// ========== EVENT MODAL ==========
const EventModal = ({ event, onClose, onSave }: { event: Event | null; onClose: () => void; onSave: (e: Partial<Event>) => void }) => {
  const [title, setTitle] = useState(event?.title || "");
  const [type, setType] = useState(event?.type || "Workshop");
  const [date, setDate] = useState(event?.date || "");
  const [location, setLocation] = useState(event?.location || "");
  const [attendance, setAttendance] = useState(event?.attendance || "");
  const [description, setDescription] = useState(event?.description || "");
  const [topics, setTopics] = useState(event?.topics.join(", ") || "");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-foreground/[0.06] px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between rounded-t-[28px]">
          <h2 className="font-syne font-bold text-ink text-lg sm:text-xl">{event ? "Edit Event" : "Add New Event"}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground/10"><X size={16} /></button>
        </div>
        <div className="px-5 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Event Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4] transition-all" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Event Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4] bg-white">
              {["Study Jam", "Hackathon", "Workshop", "Session", "Bootcamp"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Date</label>
            <input value={date} onChange={e => setDate(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Attendance</label>
            <input value={attendance} onChange={e => setAttendance(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4] resize-none" />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Topics (comma-separated)</label>
            <input value={topics} onChange={e => setTopics(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
            <div className="flex flex-wrap gap-1.5 mt-1">
              {topics.split(",").filter(Boolean).map(t => <span key={t} className="font-dm text-xs px-2.5 py-1 rounded-full bg-[#4285F4]/10 text-[#4285F4]">{t.trim()}</span>)}
            </div>
          </div>
          <div className="col-span-2">
            <button onClick={() => onSave({ title, type, date, location, attendance, description, topics: topics.split(",").map(t => t.trim()).filter(Boolean) })}
              className="w-full py-4 rounded-[16px] bg-[#4285F4] text-white font-syne font-bold text-base hover:bg-[#3A75E0] transition-all shadow-[0_4px_16px_rgba(66,133,244,0.3)]">
              {event ? "Update Event" : "Publish Event"} →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ========== MEMBER MODAL ==========
const MemberModal = ({ member, onClose, onSave }: { member: typeof teamMembers[0] | null; onClose: () => void; onSave: () => void }) => {
  const [name, setName] = useState(member?.name || "");
  const [role, setRole] = useState(member?.role || "Core Member");
  const [seed, setSeed] = useState(member?.seed || "preview");
  const [roleColor, setRoleColor] = useState(member?.roleColor || "#4285F4");
  const [bio, setBio] = useState(member?.bio || "");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-foreground/[0.06] px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between rounded-t-[28px]">
          <h2 className="font-syne font-bold text-ink text-lg sm:text-xl">{member ? "Edit Member" : "Add Member"}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground/10"><X size={16} /></button>
        </div>
        <div className="px-8 py-6 space-y-5">
          <div className="flex justify-center p-6 bg-foreground/[0.02] rounded-[16px]">
            <div className="relative">
              <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${seed || "preview"}`} className="w-24 h-24 rounded-full border-4 bg-white transition-all" style={{ borderColor: roleColor }} alt="Preview" />
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-caveat font-bold text-white" style={{ background: roleColor }}>{role || "Role"}</div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4] bg-white">
              {["GDG Lead", "Tech Head", "Literature Head", "Cinematographer", "Operations Head", "Creatives Head", "Core Member"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">DiceBear Seed</label>
            <input value={seed} onChange={e => setSeed(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" placeholder="e.g. Emery" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Role Color</label>
            <div className="flex gap-2">
              {["#4285F4", "#EA4335", "#FBBC04", "#34A853", "#7C3AED"].map(c => (
                <button key={c} onClick={() => setRoleColor(c)} className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{ background: c, borderColor: roleColor === c ? "#111" : "transparent", transform: roleColor === c ? "scale(1.2)" : "scale(1)" }} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4] resize-none" />
          </div>
          <button onClick={onSave} className="w-full py-4 rounded-[16px] bg-[#4285F4] text-white font-syne font-bold text-base hover:bg-[#3A75E0] transition-all">
            {member ? "Update Member" : "Add Member"} →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Admin;
