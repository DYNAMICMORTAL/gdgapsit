import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, Users, Image as ImageIcon, Settings, LogOut,
  Plus, Pencil, Trash2, X, TrendingUp, Eye, EyeOff, Search, UserPlus, Linkedin, Mail,
  CalendarPlus, ImagePlus as ImagePlusIcon, ExternalLink, Globe, Zap, BarChart3, ToggleLeft, ToggleRight,
  Calendar as CalendarIcon, CheckCircle, Radio, MapPin, ArrowRight, Award,
  Save,
  Check
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { GDGLogo } from "@/components/Doodles";
import { AdminCertificates } from "@/components/AdminCertificates";
import { api } from "@/lib/api";
import {
  useAdminEvents, useAdminStats, useDeleteEvent, useUpdateEvent, useCreateEvent,
  useToggleQuiz, useTeam, useDeleteMember, useUpdateMember, useCreateMember,
  useSettings, useSaveSettings, useUpdateQuizState,
} from "@/hooks/useDB";
import { useQueryClient } from "@tanstack/react-query";
import { CountUp } from "@/components/AnimationUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ========== QUIZ TOGGLE ROW - uses DB ==========
const QuizToggleRow = ({ event }: { event: any }) => {
  const toggleMutation = useToggleQuiz();
  const [enabled, setEnabled] = useState(event.quiz_enabled ?? false);
  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    toggleMutation.mutate({ slug: event.slug, enabled: next });
  };
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-[12px] bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: event.type_color ?? event.typeColor ?? '#4285F4' }} />
        <div>
          <span className="font-dm font-medium text-ink text-sm">{event.title}</span>
          <span className="font-caveat text-xs ml-2" style={{ color: event.type_color ?? event.typeColor ?? '#4285F4' }}>{event.type}</span>
        </div>
      </div>
      <button onClick={handleToggle} className="flex items-center gap-2 transition-colors" disabled={toggleMutation.isPending}>
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
  { id: "certificates", label: "Certificates", icon: Award },
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



const getEventStatus = (event: any) => {
  if (!event.date_start) return { label: 'Upcoming', color: '#4285F4', bg: '#4285F415', icon: <CalendarIcon size={12} /> };

  // Parse the stored date_start ('YYYY-MM-DD') reliably tracking UTC Midnight offsets locally
  const start = new Date(event.date_start + 'T00:00:00').getTime();
  const end = event.date_end ? new Date(event.date_end + 'T23:59:59').getTime() : start + (24 * 60 * 60 * 1000);
  const now = Date.now();

  if (now < start) return { label: 'Upcoming', color: '#4285F4', bg: '#4285F415', icon: <CalendarIcon size={12} /> };
  if (now > end) return { label: 'Concluded', color: '#34A853', bg: '#34A85315', icon: <CheckCircle size={12} /> };
  return { label: 'Live Now', color: '#EA4335', bg: '#EA433515', icon: <Radio size={12} className="animate-pulse" /> };
};

// ========== MAIN ADMIN ==========
const Admin = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem("gdg_admin_token"));
  const [tab, setTab] = useState("dashboard");
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuth) {
      navigate("/login", { replace: true });
    }
  }, [isAuth, navigate]);

  // DB hooks
  const { data: eventsData = [], isLoading: eventsLoading } = useAdminEvents();

  const currentEventStats = {
    total: eventsData?.length || 0,
    upcoming: (eventsData || []).filter((e: any) => getEventStatus(e).label === 'Upcoming').length,
    concluded: (eventsData || []).filter((e: any) => getEventStatus(e).label === 'Concluded').length
  };

  const filteredEvents = (eventsData || []).filter((e: any) =>
    (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const { data: stats } = useAdminStats();
  const { data: membersData = [] } = useTeam();
  const { data: settingsData = {} } = useSettings();
  const deleteEvent = useDeleteEvent();
  const updateEvent = useUpdateEvent();
  const createEvent = useCreateEvent();
  const deleteMember = useDeleteMember();
  const updateMember = useUpdateMember();
  const createMember = useCreateMember();
  const saveSettings = useSaveSettings();
  const [settingsForm, setSettingsForm] = useState<any>({});

  useEffect(() => {
    if (Object.keys(settingsData).length > 0) {
      setSettingsForm(settingsData);
    }
  }, [settingsData]);

  const handleSaveSettings = () => {
    saveSettings.mutate(settingsForm);
  };

  const updateQuizState = useUpdateQuizState();

  const handleUpdateQuizStatus = (slug: string, status: string, timer?: number) => {
    const currentState = eventsData.find((e: any) => e.slug === slug)?.quiz_state || {};
    const newState = {
      ...currentState,
      status,
      timer: timer || currentState.timer || 60,
      startTime: status === 'active' ? new Date().toISOString() : currentState.startTime,
      participants: status === 'lobby' ? [] : (currentState.participants || [])
    };
    updateQuizState.mutate({ slug, state: newState });
  };

  const handleLogout = () => {
    localStorage.removeItem("gdg_admin_token");
    setIsAuth(false);
    navigate("/login", { replace: true });
  };

  const handleDeleteEvent = (slug: string) => deleteEvent.mutate(slug);
  const handleDeleteMember = (id: number) => deleteMember.mutate(id);

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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-dm font-medium text-sm whitespace-nowrap flex-shrink-0 active:scale-95 transition-all ${tab === item.id ? "bg-[#4285F4] text-white" : "bg-foreground/[0.05] text-[#6B6B6B]"
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
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] font-dm text-sm transition-all text-left ${tab === item.id ? "bg-[#4285F4] text-white shadow-[0_4px_12px_rgba(66,133,244,0.3)]" : "text-ink-muted hover:bg-foreground/[0.04] hover:text-ink"
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
                      <div className="space-y-3">
                        {[
                          { text: "New event published", time: "2 hours ago", tag: "Event" },
                          { text: "Team member added", time: "1 day ago", tag: "Team" },
                          { text: "Gallery updated", time: "3 days ago", tag: "Gallery" },
                          { text: "Quiz enabled for Gen AI Jams", time: "5 days ago", tag: "Quiz" },
                        ].map(item => (
                          <div key={item.text} className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-dm text-sm text-ink truncate">{item.text}</p>
                              <p className="font-dm-mono text-xs text-ink-muted mt-0.5">{item.time}</p>
                            </div>
                            <span className="font-dm text-[10px] px-2 py-0.5 rounded-full bg-foreground/[0.04] text-ink-muted flex-shrink-0">{item.tag}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Team Snapshot */}
                    <div className="bg-white rounded-[20px] p-6 border border-foreground/[0.05] shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-syne font-bold text-ink text-lg">Team Snapshot</h2>
                        <button onClick={() => setTab("team")} className="font-dm text-[#4285F4] text-sm hover:underline">Manage →</button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {(membersData as any[]).slice(0, 6).map((m: any) => (
                          <div key={m.id ?? m.name} className="flex items-center gap-2.5 p-2 rounded-[10px] hover:bg-foreground/[0.02] transition-colors">
                            <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${m.dicebear_seed ?? m.name}`} className="w-9 h-9 rounded-full border-2 bg-white" style={{ borderColor: m.role_color ?? '#4285F4' }} alt={m.name} />
                            <div className="min-w-0">
                              <p className="font-dm font-medium text-ink text-xs truncate">{m.name}</p>
                              <p className="font-caveat text-xs" style={{ color: m.role_color ?? '#4285F4' }}>{m.role}</p>
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
                          {["Event", "Status", "Date"].map(h => (
                            <th key={h} className="text-left py-2 font-dm font-semibold text-xs text-ink-muted uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(eventsData as any[]).slice(0, 5).map((event: any) => {
                          const status = getEventStatus(event);
                          return (
                            <tr key={event.slug} className="border-b border-foreground/[0.03] last:border-0 hover:bg-foreground/[0.01]">
                              <td className="py-3 px-2 font-dm text-sm text-ink flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: event.badgeColor || '#4285F4' }} />
                                {event.title}
                              </td>
                              <td className="py-3 px-2">
                                <span className="font-dm font-bold flex items-center w-max gap-1 text-[11px] px-2 py-0.5 rounded-full" style={{ background: status.bg, color: status.color }}>
                                  {status.icon} {status.label}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-dm text-sm text-ink-muted">{event.short_date ?? event.shortDate ?? '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table></div>
                  </div>
                </div>
              )}

              {/* ═══════ EVENTS ═══════ */}
              {tab === "events" && (
                <div className="pb-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="font-syne font-black text-ink text-2xl">Events Workspace</h1>
                      <div className="flex items-center gap-3 mt-2 font-dm text-sm text-ink-muted">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EA4335]"></span> {currentEventStats.total} Total</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#4285F4]"></span> {currentEventStats.upcoming} Upcoming</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#34A853]"></span> {currentEventStats.concluded} Concluded</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex-1 sm:w-[250px] bg-white rounded-[14px] border border-foreground/[0.06] flex items-center gap-2 px-3 py-2 shadow-sm">
                        <Search size={14} className="text-ink-muted" />
                        <input placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                          className="font-dm text-sm text-ink bg-transparent outline-none flex-1" />
                      </div>
                      <button onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
                        className="flex-shrink-0 flex items-center gap-2 bg-[#0F1115] text-white px-5 py-2.5 rounded-[14px] font-dm font-semibold text-sm shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:opacity-90 active:scale-[0.98] transition-all">
                        <Plus size={16} /> New Event
                      </button>
                    </div>
                  </div>

                  {/* Grid Layout Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => {
                      const status = getEventStatus(event);
                      return (
                        <div key={event.slug} className="bg-white rounded-[24px] border border-foreground/[0.05] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group flex flex-col">

                          {/* Banner Image or Gradient */}
                          <div className={cn("h-36 w-full relative flex-shrink-0", !event.image_url && `bg-gradient-to-br ${event.gradient || "from-[#4285F4] to-[#1A73E8]"}`)}
                            style={event.image_url ? { backgroundImage: `url(${event.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                            <div className="absolute top-4 left-4 flex gap-2">
                              <span className="font-dm font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-[10px] bg-white/95 text-ink shadow-sm backdrop-blur-md">
                                {event.type}
                              </span>
                              {event.is_featured && (
                                <span className="font-syne font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-[10px] bg-[#EA4335] text-white shadow-sm">
                                  Flagship
                                </span>
                              )}
                            </div>

                            {/* Hover Overlay Actions */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button onClick={() => { setEditingEvent(event); setShowEventModal(true); }} className="w-8 h-8 rounded-[10px] bg-white/95 text-ink flex items-center justify-center hover:bg-white transition-colors shadow-md backdrop-blur-md tooltip-trigger"><Pencil size={14} /></button>
                              <button onClick={() => handleDeleteEvent(event.slug)} className="w-8 h-8 rounded-[10px] bg-white/95 text-[#EA4335] flex items-center justify-center hover:bg-white transition-colors shadow-md backdrop-blur-md"><Trash2 size={14} /></button>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5 sm:p-6 flex-1 flex flex-col">
                            <h3 className="font-syne font-bold text-ink text-xl leading-[1.2] mb-3 line-clamp-2">{event.title}</h3>

                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className="flex items-center gap-1.5 font-dm font-bold text-[11px] uppercase tracking-wider px-3 py-1 rounded-[10px]" style={{ background: status.bg, color: status.color }}>
                                {status.icon} {status.label}
                              </span>
                              <span className="font-dm font-medium text-xs text-ink-muted flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-foreground/[0.03]">
                                <CalendarIcon size={12} /> {event.date_display || event.short_date || "—"}
                              </span>
                            </div>

                            <p className="font-dm text-sm text-ink-muted line-clamp-2 mb-5 leading-relaxed">
                              {event.description || "No description provided."}
                            </p>

                            <div className="mt-auto flex items-center justify-between border-t border-foreground/[0.05] pt-5">
                              <span className="font-dm font-medium text-xs text-ink-muted flex items-center gap-1.5 truncate max-w-[60%]"><MapPin size={14} className="flex-shrink-0 text-ink/40" /> <span className="truncate">{event.location}</span></span>
                              <a href={`/events/${event.slug}`} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-[#4285F4] transition-colors font-dm text-xs font-bold flex items-center gap-1">View Portal <ArrowRight size={14} /></a>
                            </div>
                          </div>

                        </div>
                      );
                    })}
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
                      {(eventsData as any[]).map((event: any) => (
                        <QuizToggleRow key={event.slug ?? event.title} event={event} />
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
                    {(membersData as any[]).map((member: any) => (
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
                          {member.profile_picture_url ? (
                            <img src={member.profile_picture_url} className="w-16 h-16 rounded-full bg-white border-[3px] object-cover"
                              style={{ borderColor: member.role_color ?? '#4285F4' }} alt={member.name} />
                          ) : (
                            <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${member.dicebear_seed ?? member.name}`} className="w-16 h-16 rounded-full bg-white border-[3px]"
                              style={{ borderColor: member.role_color ?? '#4285F4' }} alt={member.name} />
                          )}
                          {member.is_lead && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FBBC04] rounded-full flex items-center justify-center text-[11px] shadow-sm border-2 border-white">⭐</div>}
                        </div>
                        <div className="font-syne font-bold text-ink text-base mt-3">{member.name}</div>
                        <div className="font-caveat font-semibold text-sm mt-0.5" style={{ color: member.role_color ?? '#4285F4' }}>{member.role}</div>

                        {(member.branch || member.year) && (
                          <div className="flex gap-2 mt-2">
                            {member.branch && <span className="text-[10px] font-dm-mono font-bold bg-foreground/[0.04] px-2 py-0.5 rounded-md text-ink-muted">{member.branch}</span>}
                            {member.year && <span className="text-[10px] font-dm-mono font-bold bg-[#4285F4]/10 text-[#4285F4] px-2 py-0.5 rounded-md">{member.year}</span>}
                          </div>
                        )}

                        <p className="font-dm text-xs text-ink-muted mt-2 line-clamp-2">{member.bio}</p>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-foreground/[0.05]">
                          {member.linkedin_url && <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-dm text-xs text-[#0A66C2] hover:underline"><Linkedin size={11} /> LinkedIn</a>}
                          {member.email && <a href={`mailto:${member.email}`} className="flex items-center gap-1 font-dm text-xs text-ink-muted hover:text-ink"><Mail size={11} /> Email</a>}
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

              {/* ═══════ CERTIFICATES ═══════ */}
              {tab === "certificates" && <AdminCertificates />}

              {/* ═══════ SETTINGS ═══════ */}
              {tab === "settings" && (
                <div>
                  <h1 className="font-syne font-black text-ink text-2xl mb-6">Settings</h1>
                  {[
                    {
                      title: "Site Information", fields: [
                        { label: "Club Name", key: "club_name" },
                        { label: "Email Address", key: "email" },
                        { label: "College", key: "college" },
                        { label: "Founded Year", key: "founded_year" },
                      ]
                    },
                    {
                      title: "Social Links", fields: [
                        { label: "GitHub URL", key: "github_url" },
                        { label: "LinkedIn URL", key: "linkedin_url" },
                        { label: "Instagram URL", key: "instagram_url" },
                        { label: "GDG Community URL", key: "gdg_community_url" },
                      ]
                    },
                    {
                      title: "Admin Access", fields: [
                        { label: "Admin Email", key: "admin_email" },
                        { label: "Change Password", key: "admin_password" },
                      ]
                    },
                  ].map(group => (
                    <div key={group.title} className="bg-white rounded-[20px] p-6 border border-foreground/[0.05] mb-4">
                      <h3 className="font-syne font-bold text-ink text-lg mb-4">{group.title}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.fields.map(field => (
                          <div key={field.label} className="flex flex-col gap-1.5">
                            <label className="font-caveat text-ink-muted text-base">{field.label}</label>
                            <input
                              type={field.key.includes("password") ? "password" : "text"}
                              value={settingsForm[field.key] || ""}
                              onChange={e => setSettingsForm({ ...settingsForm, [field.key]: e.target.value })}
                              className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink bg-white outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/10 transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveSettings.isPending}
                    className="bg-[#34A853] text-white px-8 py-3.5 rounded-[12px] font-syne font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] mt-2 flex items-center gap-2"
                  >
                    {saveSettings.isPending ? "Saving..." : <><Save size={16} /> Save Changes</>}
                  </button>
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
            onUpdateQuizStatus={handleUpdateQuizStatus}
            onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
            onSave={(ev) => {
              if (editingEvent) {
                updateEvent.mutate({ slug: editingEvent.slug, data: ev });
              } else {
                createEvent.mutate(ev);
              }
              setShowEventModal(false);
              setEditingEvent(null);
            }} />
        )}
      </AnimatePresence>

      {/* MEMBER MODAL */}
      <AnimatePresence>
        {showMemberModal && (
          <MemberModal member={editingMember}
            onClose={() => { setShowMemberModal(false); setEditingMember(null); }}
            onSave={(data) => {
              if (editingMember) {
                updateMember.mutate({ id: editingMember.id, data });
              } else {
                createMember.mutate(data);
              }
              setShowMemberModal(false);
              setEditingMember(null);
            }} />
        )}
      </AnimatePresence>
    </div>
  );
};

// ========== EVENT MODAL ==========
const EventModal = ({ event, onClose, onSave, onUpdateQuizStatus }: { 
  event: any | null; 
  onClose: () => void; 
  onSave: (e: any) => void;
  onUpdateQuizStatus: (slug: string, status: string, timer?: number) => void;
}) => {
  const [title, setTitle] = useState(event?.title || "");
  const [slug, setSlug] = useState(event?.slug || "");
  const [type, setType] = useState(event?.type || "Workshop");

  // Add beautiful date picker states (defaults to today for new events)
  const defaultDateStart = event?.date_start ? new Date(event.date_start) : new Date();
  const [dateStart, setDateStart] = useState<Date | undefined>(defaultDateStart);
  const [dateDisplay, setDateDisplay] = useState(event?.date_display || format(defaultDateStart, "MMM d, yyyy"));

  const [location, setLocation] = useState(event?.location || "");
  const [registrationLink, setRegistrationLink] = useState(event?.registration_link || "");
  const [attendance, setAttendance] = useState(event?.attendance || "");
  const [description, setDescription] = useState(event?.description || "");
  const [longDescription, setLongDescription] = useState(event?.long_description || "");
  const [imageUrl, setImageUrl] = useState(event?.image_url || "");
  const [duration, setDuration] = useState(event?.duration || "");
  const [formatStr, setFormatStr] = useState(event?.format || "");
  const [isFeatured, setIsFeatured] = useState(event?.is_featured || false);
  const [isInterCollege, setIsInterCollege] = useState(event?.is_inter_college || false);
  const [topics, setTopics] = useState((event?.topics ?? []).join(", "));

  // Safe parse function
  const safeParse = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  // New JSONB Array Builder States
  const [speakers, setSpeakers] = useState<any[]>(safeParse(event?.speakers));
  const [agenda, setAgenda] = useState<any[]>(safeParse(event?.agenda));
  const [faqs, setFaqs] = useState<any[]>(safeParse(event?.faqs));
  const [sponsors, setSponsors] = useState<any[]>(safeParse(event?.sponsors));

  // Quiz Engine States
  const [quizEnabled, setQuizEnabled] = useState(event?.quiz_enabled || false);
  const [quizData, setQuizData] = useState<any[]>(safeParse(event?.quiz_data));

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!event) setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleDateSelect = (d: Date | undefined) => {
    setDateStart(d);
    if (d) setDateDisplay(format(d, "MMM d, yyyy")); // Auto-fill the display text on selection
  };

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
            <input value={title} onChange={e => handleTitleChange(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4] transition-all" />
          </div>
          {!event && (
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="font-caveat text-ink-muted text-base">Slug (URL-friendly ID)</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. flutter-forward-2025" className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm-mono text-sm text-ink outline-none focus:border-[#4285F4] transition-all" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Event Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4] bg-white">
              {["Study Jam", "Hackathon", "Workshop", "Session", "Bootcamp"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className={cn(
                  "border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none transition-all flex items-center justify-between text-left hover:bg-foreground/[0.02] bg-white w-full",
                  !dateStart && "text-ink-muted"
                )}>
                  {dateStart ? format(dateStart, "PPP") : <span>Pick a date</span>}
                  <CalendarDays size={16} className="text-[#4285F4] opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[60] bg-white border border-foreground/[0.08]" align="start">
                <Calendar
                  mode="single"
                  selected={dateStart}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Date Display (Editable Text)</label>
            <input value={dateDisplay} onChange={e => setDateDisplay(e.target.value)} placeholder="e.g. Feb 21 - Feb 23, 2026" className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Registration Link</label>
            <input value={registrationLink} onChange={e => setRegistrationLink(e.target.value)} placeholder="e.g. https://gdg.community.dev/events/..." className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Attendance</label>
            <input value={attendance} onChange={e => setAttendance(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Duration</label>
            <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 2 Days, 4 Hours" className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Format</label>
            <input value={formatStr} onChange={e => setFormatStr(e.target.value)} placeholder="e.g. In-Person, Online" className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Image URL</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="e.g. https://imgur.com/... or Google Drive link" className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Short Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4] resize-none" />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Long Details (Markdown allowed later)</label>
            <textarea value={longDescription} onChange={e => setLongDescription(e.target.value)} rows={4} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4] resize-vertical" />
          </div>
          <div className="col-span-2 flex items-center gap-6 mt-2 mb-2">
            <label className="flex items-center gap-2 font-dm text-sm text-ink cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-[#4285F4]" />
              Flagship / Featured (Bigger Card)
            </label>
            <label className="flex items-center gap-2 font-dm text-sm text-ink cursor-pointer">
              <input type="checkbox" checked={isInterCollege} onChange={e => setIsInterCollege(e.target.checked)} className="w-4 h-4 accent-[#4285F4]" />
              Inter-College Event
            </label>
          </div>
          <div className="col-span-2 flex flex-col gap-1.5 mb-2">
            <label className="font-caveat text-ink-muted text-base">Topics (comma-separated)</label>
            <input value={topics} onChange={e => setTopics(e.target.value)} className="border border-foreground/10 rounded-[10px] px-4 py-2.5 font-dm text-sm text-ink outline-none focus:border-[#4285F4]" />
            <div className="flex flex-wrap gap-1.5 mt-1">
              {topics.split(",").filter(Boolean).map(t => <span key={t} className="font-dm text-xs px-2.5 py-1 rounded-full bg-[#4285F4]/10 text-[#4285F4]">{t.trim()}</span>)}
            </div>
          </div>

          {/* ════ EVENT ENRICHMENT: ARRAY BUILDERS ════ */}
          <div className="col-span-2 border-t border-foreground/[0.06] pt-5 mt-2">
            <h3 className="font-syne font-bold text-ink text-xl">Event Enrichment</h3>
            <p className="font-dm text-ink-muted text-xs mt-1">Populate these arrays to automatically generate beautiful UI sections on the public Event Details page.</p>
          </div>

          {/* SPEAKERS BUILDER */}
          <div className="col-span-2 flex flex-col gap-3 p-5 bg-foreground/[0.015] rounded-[20px] border border-foreground/[0.05]">
            <div className="flex items-center justify-between">
              <label className="font-caveat text-ink text-xl font-bold">Speakers</label>
              <button onClick={() => setSpeakers([...speakers, { name: "", role: "", company: "", avatar: "", linkedinUrl: "" }])}
                className="text-xs bg-white border border-foreground/[0.08] px-3.5 py-2 rounded-full font-dm font-semibold text-ink shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-foreground/[0.02] transition-colors flex items-center gap-1.5">
                <Plus size={12} /> Add Speaker
              </button>
            </div>
            {speakers.length === 0 && <p className="text-xs text-ink-muted font-dm italic">No speakers added yet.</p>}
            {speakers.map((sp, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-[12px] border border-foreground/[0.05] shadow-sm">
                <input value={sp.name} placeholder="Name" onChange={e => { const s = [...speakers]; s[i].name = e.target.value; setSpeakers(s); }} className="w-full sm:w-[25%] border border-foreground/10 rounded-[8px] px-3 py-2 font-dm text-xs outline-none focus:border-[#4285F4]" />
                <input value={sp.role} placeholder="Role / Title" onChange={e => { const s = [...speakers]; s[i].role = e.target.value; setSpeakers(s); }} className="w-full sm:w-[35%] border border-foreground/10 rounded-[8px] px-3 py-2 font-dm text-xs outline-none focus:border-[#4285F4]" />
                <input value={sp.linkedinUrl} placeholder="LinkedIn URL" onChange={e => { const s = [...speakers]; s[i].linkedinUrl = e.target.value; setSpeakers(s); }} className="flex-1 border border-foreground/10 rounded-[8px] px-3 py-2 font-dm text-xs outline-none focus:border-[#4285F4]" />
                <button onClick={() => setSpeakers(speakers.filter((_, idx) => idx !== i))} className="w-full sm:w-9 h-9 flex items-center justify-center text-[#EA4335] bg-red-50 rounded-[8px] border border-red-100 hover:bg-red-100 transition-colors"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>

          {/* AGENDA BUILDER */}
          <div className="col-span-2 flex flex-col gap-3 p-5 bg-foreground/[0.015] rounded-[20px] border border-foreground/[0.05] mt-2">
            <div className="flex items-center justify-between">
              <label className="font-caveat text-ink text-xl font-bold">Agenda Timeline</label>
              <button onClick={() => setAgenda([...agenda, { time: "10:00 AM", title: "", description: "" }])}
                className="text-xs bg-white border border-foreground/[0.08] px-3.5 py-2 rounded-full font-dm font-semibold text-ink shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-foreground/[0.02] transition-colors flex items-center gap-1.5">
                <Plus size={12} /> Add Time Block
              </button>
            </div>
            {agenda.length === 0 && <p className="text-xs text-ink-muted font-dm italic">No agenda blocks added yet.</p>}
            {agenda.map((ag, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-[12px] border border-foreground/[0.05] shadow-sm items-start sm:items-center">
                <input value={ag.time} placeholder="e.g. 10:30 AM" onChange={e => { const s = [...agenda]; s[i].time = e.target.value; setAgenda(s); }} className="w-full sm:w-[100px] border border-foreground/10 rounded-[8px] px-3 py-2 font-dm font-bold text-xs outline-none text-center focus:border-[#4285F4]" />
                <div className="flex-1 w-full flex flex-col gap-2">
                  <input value={ag.title} placeholder="Session Title" onChange={e => { const s = [...agenda]; s[i].title = e.target.value; setAgenda(s); }} className="w-full border border-foreground/10 rounded-[8px] px-3 py-2 font-dm text-xs outline-none font-semibold focus:border-[#4285F4]" />
                  <input value={ag.description} placeholder="Short Description / Subtitle" onChange={e => { const s = [...agenda]; s[i].description = e.target.value; setAgenda(s); }} className="w-full border border-foreground/10 rounded-[8px] px-3 py-2 font-dm text-xs outline-none text-ink-muted focus:border-[#4285F4]" />
                </div>
                <button onClick={() => setAgenda(agenda.filter((_, idx) => idx !== i))} className="w-full sm:w-9 h-full min-h-[9px] sm:min-h-[70px] flex items-center justify-center text-[#EA4335] bg-red-50 rounded-[8px] border border-red-100 hover:bg-red-100 transition-colors"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>

          {/* FAQS BUILDER */}
          <div className="col-span-2 flex flex-col gap-3 p-5 bg-foreground/[0.015] rounded-[20px] border border-foreground/[0.05] mt-2">
            <div className="flex items-center justify-between">
              <label className="font-caveat text-ink text-xl font-bold">FAQs</label>
              <button onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
                className="text-xs bg-white border border-foreground/[0.08] px-3.5 py-2 rounded-full font-dm font-semibold text-ink shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-foreground/[0.02] transition-colors flex items-center gap-1.5">
                <Plus size={12} /> Add Question
              </button>
            </div>
            {faqs.length === 0 && <p className="text-xs text-ink-muted font-dm italic">No questions added yet.</p>}
            {faqs.map((faq, i) => (
              <div key={i} className="flex gap-2 bg-white p-2 rounded-[12px] border border-foreground/[0.05] shadow-sm items-start">
                <div className="flex-1 w-full flex flex-col gap-2">
                  <input value={faq.question} placeholder="Question" onChange={e => { const s = [...faqs]; s[i].question = e.target.value; setFaqs(s); }} className="w-full border border-foreground/10 rounded-[8px] px-3 py-2 font-dm text-xs font-bold outline-none focus:border-[#4285F4]" />
                  <textarea value={faq.answer} placeholder="Answer" rows={2} onChange={e => { const s = [...faqs]; s[i].answer = e.target.value; setFaqs(s); }} className="w-full border border-foreground/10 rounded-[8px] px-3 py-2 font-dm text-xs outline-none text-ink-muted resize-none focus:border-[#4285F4]" />
                </div>
                <button onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))} className="w-9 sm:w-9 h-[70px] flex flex-shrink-0 items-center justify-center text-[#EA4335] bg-red-50 rounded-[8px] border border-red-100 hover:bg-red-100 transition-colors"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>

          {/* SPONSORS BUILDER */}
          <div className="col-span-2 flex flex-col gap-3 p-5 bg-foreground/[0.015] rounded-[20px] border border-foreground/[0.05] mt-2 mb-4">
            <div className="flex items-center justify-between">
              <label className="font-caveat text-ink text-xl font-bold">Sponsors / Powered By</label>
              <button onClick={() => setSponsors([...sponsors, { name: "", logo: "" }])}
                className="text-xs bg-white border border-foreground/[0.08] px-3.5 py-2 rounded-full font-dm font-semibold text-ink shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-foreground/[0.02] transition-colors flex items-center gap-1.5">
                <Plus size={12} /> Add Sponsor
              </button>
            </div>
            {sponsors.length === 0 && <p className="text-xs text-ink-muted font-dm italic">No sponsors added yet.</p>}
            {sponsors.map((sponsor, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-[12px] border border-foreground/[0.05] shadow-sm">
                <input value={sponsor.name} placeholder="Sponsor Name" onChange={e => { const s = [...sponsors]; s[i].name = e.target.value; setSponsors(s); }} className="w-full sm:w-[35%] border border-foreground/10 rounded-[8px] px-3 py-2 font-dm text-xs outline-none focus:border-[#4285F4]" />
                <input value={sponsor.logo} placeholder="Logo Image URL (SVG/PNG)" onChange={e => { const s = [...sponsors]; s[i].logo = e.target.value; setSponsors(s); }} className="flex-1 border border-foreground/10 rounded-[8px] px-3 py-2 font-dm text-xs outline-none focus:border-[#4285F4]" />
                <button onClick={() => setSponsors(sponsors.filter((_, idx) => idx !== i))} className="w-full sm:w-9 h-9 flex items-center justify-center text-[#EA4335] bg-red-50 rounded-[8px] border border-red-100 hover:bg-red-100 transition-colors"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
          {/* QUIZ ENGINE BUILDER - REDESIGNED */}
          <div className="col-span-2 flex flex-col p-6 sm:p-8 bg-[#0F1115] rounded-[32px] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.15)] mt-4 mb-6 relative overflow-hidden group">
            {/* Dark Mode Background Effects */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#4285F4]/20 to-transparent blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-[#EA4335]/20 to-transparent blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 border-b border-white/10 pb-6 mb-6">
              <div>
                 <h3 className="font-syne font-black text-white text-2xl sm:text-3xl flex items-center gap-3">
                   Gamified Quiz Engine 
                   <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>🎯</motion.span>
                 </h3>
                 <p className="font-dm text-sm text-white/50 mt-2 leading-relaxed max-w-md">Design interactive challenges. Configure multiple-choice or short-answer questions, assign points, and watch attendees battle on the live leaderboard.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                 <input type="checkbox" className="sr-only peer" checked={quizEnabled} onChange={(e) => setQuizEnabled(e.target.checked)} />
                 <div className="w-14 h-8 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#34A853] after:content-[''] after:absolute after:top-[8px] after:left-[8px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-[#34A853]/20 border border-white/10 shadow-inner"></div>
                 <span className="ml-3 font-dm font-bold text-sm text-white pr-2">{quizEnabled ? 'Quiz On' : 'Quiz Off'}</span>
              </label>
              {quizEnabled && event && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10 mt-4">
                  <span className="font-dm text-[10px] uppercase font-bold text-white/40 w-full mb-1">Session Control: {event.quiz_state?.status || 'idle'}</span>
                  <button 
                    onClick={() => onUpdateQuizStatus(event.slug, 'lobby')}
                    className={cn(
                      "px-4 py-2 rounded-full font-dm font-bold text-xs transition-all flex items-center gap-2",
                      event.quiz_state?.status === 'lobby' ? "bg-[#34A853] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
                    )}
                  >
                    Open Lobby
                  </button>
                  <button 
                    onClick={() => onUpdateQuizStatus(event.slug, 'active', 60)}
                    disabled={event.quiz_state?.status !== 'lobby'}
                    className={cn(
                      "px-4 py-2 rounded-full font-dm font-bold text-xs transition-all flex items-center gap-2",
                      event.quiz_state?.status === 'active' ? "bg-[#4285F4] text-white" : "bg-white/10 text-white/60 hover:bg-white/20 disabled:opacity-50"
                    )}
                  >
                    Start Quiz (60s)
                  </button>
                  <button 
                    onClick={() => onUpdateQuizStatus(event.slug, 'finished')}
                    className="px-4 py-2 rounded-full bg-[#EA4335]/20 text-[#EA4335] border border-[#EA4335]/30 font-dm font-bold text-xs hover:bg-[#EA4335] hover:text-white transition-all"
                  >
                    End Quiz
                  </button>
                </div>
              )}
            </div>
            
            {quizEnabled && (
               <div className="flex flex-col gap-4 z-10 transition-all">
                  
                  {quizData.length === 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 border-dashed rounded-[24px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <h4 className="font-syne font-bold text-white text-lg">No Challenges Constructed</h4>
                      <p className="font-dm text-white/40 text-[12px] mt-1 mb-6 max-w-sm">Craft the perfect quiz to challenge your attendees.</p>
                      <button onClick={() => setQuizData([{ question: "", type: "mcq", options: ["", "", "", ""], correctIndex: 0, points: 100, explanation: "", correct_keywords: [] }])}
                        className="bg-white text-black px-6 py-2.5 rounded-full font-syne font-bold text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
                        <Plus size={14} /> Ignite First Question
                      </button>
                    </motion.div>
                  )}
                  
                  {quizData.length > 0 && quizData.map((q: any, qIndex: number) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: qIndex * 0.05 }} key={qIndex} 
                      className="bg-white/5 p-4 sm:p-5 rounded-[20px] border border-white/10 shadow-lg flex flex-col gap-4 relative group/card hover:border-white/20 transition-colors">
                       
                       <div className="absolute top-2 right-2 p-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                         <button onClick={() => setQuizData(quizData.filter((_: any, idx: number) => idx !== qIndex))} className="text-[#EA4335] bg-[#EA4335]/10 p-1.5 rounded-lg hover:bg-[#EA4335] hover:text-white transition-all"><Trash2 size={14} /></button>
                       </div>
                       
                       <div className="flex flex-col sm:flex-row gap-3 w-full relative">
                         <div className="flex-1 relative">
                           <span className="font-dm-mono font-bold text-[9px] text-[#4285F4] uppercase tracking-widest block mb-1">QUESTION {qIndex + 1}</span>
                           <input value={q.question} placeholder="What will happen when you compile..." 
                             onChange={e => { const s = [...quizData]; s[qIndex] = { ...s[qIndex], question: e.target.value }; setQuizData(s); }} 
                             className="w-full bg-black/40 border border-white/10 rounded-[12px] px-4 py-3 font-dm text-sm font-bold text-white outline-none focus:border-[#4285F4] focus:bg-black/60 transition-all shadow-inner placeholder-white/10" />
                         </div>
                         <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                           <div className="flex flex-col gap-1 w-[90px]">
                             <label className="text-[9px] uppercase font-dm font-bold text-white/40">Type</label>
                             <select value={q.type || "mcq"} onChange={e => { const s = [...quizData]; s[qIndex] = { ...s[qIndex], type: e.target.value as "mcq"|"short" }; setQuizData(s); }} className="bg-white/10 border border-white/10 text-white font-dm text-[12px] rounded-[8px] px-2 py-2 outline-none focus:border-[#4285F4] appearance-none">
                               <option value="mcq" className="bg-[#161616]">MCQ</option>
                               <option value="short" className="bg-[#161616]">Short Ans</option>
                             </select>
                           </div>
                           <div className="flex flex-col gap-1 w-[60px]">
                             <label className="text-[9px] uppercase font-dm font-bold text-white/40">Points</label>
                             <input type="number" value={q.points ?? 100} onChange={e => { const s = [...quizData]; s[qIndex] = { ...s[qIndex], points: parseInt(e.target.value)||0 }; setQuizData(s); }} className="bg-white/10 border border-white/10 text-white font-dm text-[12px] rounded-[8px] px-2 py-2 outline-none focus:border-[#4285F4] text-center" />
                           </div>
                         </div>
                       </div>
                       
                       {(q.type === "mcq" || !q.type) && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            {(q.options || []).map((opt: string, oIndex: number) => {
                               const isCorrect = q.correctIndex === oIndex;
                               return (
                                 <div key={oIndex} className={cn("flex flex-col gap-2 rounded-[12px] px-4 py-3 transition-all relative overflow-hidden group/opt", 
                                     isCorrect ? 'bg-[#34A853]/15 border border-[#34A853] shadow-[0_0_15px_rgba(52,168,83,0.1)]' : 'bg-white/5 border border-white/5 hover:border-white/20')}>
                                    
                                    <div className="flex items-center justify-between w-full">
                                      <span className={cn("font-syne font-black text-[10px] px-2 py-0.5 rounded", isCorrect ? "bg-[#34A853] text-white" : "bg-white/10 text-white/40")}>
                                        {["A", "B", "C", "D"][oIndex]}
                                      </span>
                                      
                                      <label className="flex items-center gap-1.5 cursor-pointer select-none group/radio">
                                        <input type="radio" name={`correct-${qIndex}`} checked={isCorrect} 
                                          onChange={() => { const s = [...quizData]; s[qIndex] = { ...s[qIndex], correctIndex: oIndex }; setQuizData(s); }} 
                                          className="hidden" />
                                        <div className={cn("w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all", isCorrect ? "border-[#34A853] bg-[#34A853]" : "border-white/20 group-hover/radio:border-white/50")}>
                                          {isCorrect && <Check size={8} strokeWidth={4} className="text-white" />}
                                        </div>
                                        <span className={cn("font-dm font-bold text-[10px] transition-colors", isCorrect ? "text-[#34A853]" : "text-white/40 group-hover/radio:text-white/70")}>
                                          {isCorrect ? "Correct" : "Correct?"}
                                        </span>
                                      </label>
                                    </div>

                                    <input value={opt} placeholder={`Option ${["A","B","C","D"][oIndex]}...`} 
                                      onChange={e => { const s = [...quizData]; const newOpt = [...s[qIndex].options]; newOpt[oIndex] = e.target.value; s[qIndex] = { ...s[qIndex], options: newOpt }; setQuizData(s); }} 
                                      className={cn("w-full bg-transparent font-dm text-[13px] outline-none z-10 font-medium", isCorrect ? "text-white" : "text-white/60 placeholder-white/10")} />
                                 </div>
                               );
                            })}
                         </div>
                       )}

                       {q.type === "short" && (
                         <div className="bg-white/5 border border-white/10 rounded-[12px] px-4 py-3">
                           <label className="text-[9px] uppercase font-dm font-bold text-[#FBBC04] tracking-widest block mb-1">Keywords</label>
                           <input value={(q.correct_keywords||[]).join(", ")} placeholder="e.g. react, hooks" 
                              onChange={e => { const s = [...quizData]; s[qIndex] = { ...s[qIndex], correct_keywords: e.target.value.split(",").map((k: string) => k.trim()).filter(Boolean) }; setQuizData(s); }}
                              className="w-full bg-transparent font-dm text-sm outline-none text-white placeholder-white/10" />
                         </div>
                       )}

                       <div className="mt-2 border-t border-white/10 pt-4 flex flex-col gap-2">
                         <label className="text-[10px] uppercase font-dm font-bold text-white/40">Explanation (Shown after answering)</label>
                         <textarea value={q.explanation || ""} placeholder="Explain why this is correct..." 
                           onChange={e => { const s = [...quizData]; s[qIndex] = { ...s[qIndex], explanation: e.target.value }; setQuizData(s); }}
                           rows={1} className="w-full bg-white/5 border border-white/10 rounded-[12px] px-4 py-2 font-dm text-sm text-white outline-none focus:border-white/30 resize-y placeholder-white/20" />
                       </div>
                    </motion.div>
                  ))}

                  {quizData.length > 0 && (
                    <button onClick={() => setQuizData([...quizData, { question: "", type: "mcq", options: ["", "", "", ""], correctIndex: 0, points: 100, explanation: "", correct_keywords: [] }])}
                      className="self-center mt-4 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-syne font-bold text-sm hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-sm backdrop-blur-sm">
                      <Plus size={18} /> Spawn Another Challenge
                    </button>
                  )}
               </div>
            )}
          </div>

          <div className="col-span-2">
            <button onClick={() => {
              const shortDate = dateStart ? format(dateStart, "MMM d") : undefined;
              const monthStr = dateStart ? format(dateStart, "MMMM") : undefined; // MMMM = 'February', for compatibility if month pill depends on it (Calendar logic handled internally but it's good form)

              // Handle local date timezone shift by manually pulling components
              const dateStartIso = dateStart
                ? `${dateStart.getFullYear()}-${String(dateStart.getMonth() + 1).padStart(2, '0')}-${String(dateStart.getDate()).padStart(2, '0')}`
                : undefined;

              onSave({
                slug, title, type,
                date_start: dateStartIso,
                date_display: dateDisplay,
                short_date: shortDate,
                month: monthStr,
                location, attendance, description,
                long_description: longDescription, image_url: imageUrl,
                duration, format: formatStr, is_featured: isFeatured, is_inter_college: isInterCollege,
                topics: topics.split(",").map(t => t.trim()).filter(Boolean),
                speakers: JSON.stringify(speakers),
                agenda: JSON.stringify(agenda),
                faqs: JSON.stringify(faqs),
                sponsors: JSON.stringify(sponsors),
                quiz_enabled: quizEnabled,   // Persisting quiz engine
                quiz_data: JSON.stringify(quizData),
                registration_link: registrationLink,
              });
            }}
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
const MemberModal = ({ member, onClose, onSave }: { member: any | null; onClose: () => void; onSave: (data: object) => void }) => {
  const [name, setName] = useState(member?.name || "");
  const [role, setRole] = useState(member?.role || "Core Member");
  const [seed, setSeed] = useState(member?.dicebear_seed || member?.seed || "preview");
  const [roleColor, setRoleColor] = useState(member?.role_color || member?.roleColor || "#4285F4");
  const [bio, setBio] = useState(member?.bio || "");
  const [teamType, setTeamType] = useState(member?.team_type || "core");
  const [isLead, setIsLead] = useState(member?.is_lead || false);
  const [linkedinUrl, setLinkedinUrl] = useState(member?.linkedin_url || "");
  const [email, setEmail] = useState(member?.email || "");
  const [displayOrder, setDisplayOrder] = useState(member?.display_order || 0);
  const [isVisible, setIsVisible] = useState(member?.is_visible !== undefined ? member.is_visible : true);

  // NEW COLUMNS
  const [profilePictureUrl, setProfilePictureUrl] = useState(member?.profile_picture_url || "");
  const [branch, setBranch] = useState(member?.branch || "CS");
  const [year, setYear] = useState(member?.year || "TE");

  // Determines which avatar to render for the preview
  const activeAvatar = profilePictureUrl.trim() !== "" ? profilePictureUrl : `https://api.dicebear.com/9.x/micah/svg?seed=${seed || "preview"}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* MODAL HEADER */}
        <div className="sticky top-0 bg-white border-b border-foreground/[0.06] px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between rounded-t-[28px] z-10" style={{ position: "sticky", zIndex: "100000" }}>
          <h2 className="font-syne font-bold text-ink text-lg sm:text-xl flex items-center gap-2">{member ? "Edit Team Member" : "Onboard New Member"} {isLead && <span className="text-xl">👑</span>}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground/10"><X size={16} /></button>
        </div>

        <div className="px-5 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">

          {/* LIVE PREVIEW HERO */}
          <div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center bg-gradient-to-br from-foreground/[0.01] to-foreground/[0.03] p-6 rounded-[24px] border border-foreground/[0.04] relative overflow-hidden">

            {/* Background blur ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[60px] opacity-20" style={{ background: roleColor }} />

            {/* Avatar */}
            <div className="relative z-10 mb-3 group">
              <img src={activeAvatar} onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/9.x/micah/svg?seed=fallback`; }}
                className="w-28 h-28 object-cover rounded-full border-4 shadow-xl transition-all duration-300 group-hover:scale-105"
                style={{ borderColor: roleColor, backgroundColor: profilePictureUrl ? 'transparent' : 'white' }} alt="Avatar Preview" />
              <div className="absolute -bottom-2 right-0 px-3 py-1 rounded-full text-xs font-syne font-bold text-white shadow-md transform rotate-[-5deg]" style={{ background: roleColor }}>
                {role || "Role"}
              </div>
            </div>

            <h3 className="font-syne font-black text-2xl text-ink tracking-tight z-10 mt-2">{name || "Name Surname"}</h3>
            <p className="font-dm text-sm text-ink-muted flex items-center gap-1.5 z-10">
              {branch} • {year}
            </p>
          </div>

          <div className="col-span-1 sm:col-span-2 border-t border-foreground/[0.06] pt-4 mt-2">
            <h3 className="font-syne font-bold text-ink text-lg">Identity & Appearance</h3>
          </div>

          {/* BASIC INFO */}
          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="E.g. Sundar Pichai" className="border border-foreground/10 rounded-[12px] px-4 py-3 font-dm text-sm text-ink outline-none focus:border-[#4285F4] transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Profile Image URL (Overrides Dicebear)</label>
            <input value={profilePictureUrl} onChange={e => setProfilePictureUrl(e.target.value)} className="border border-foreground/10 rounded-[12px] px-4 py-3 font-dm text-sm text-ink outline-none focus:border-[#4285F4] transition-all" placeholder="https://..." />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-caveat text-ink-muted text-base">DiceBear Seed (Fallback)</label>
              <button onClick={() => setSeed(Math.random().toString(36).substring(7))} className="text-[10px] bg-foreground/[0.05] px-2 py-0.5 rounded-full font-dm font-semibold text-ink-muted hover:text-ink">Randomize</button>
            </div>
            <input value={seed} onChange={e => setSeed(e.target.value)} className="border border-foreground/10 rounded-[12px] px-4 py-3 font-dm text-sm text-ink outline-none focus:border-[#4285F4] transition-all bg-foreground/[0.01]" placeholder="e.g. Emery" disabled={!!profilePictureUrl.trim()} title={profilePictureUrl ? "Clear Custom Image URL to use Dicebear" : ""} />
          </div>

          <div className="col-span-1 sm:col-span-2 border-t border-foreground/[0.06] pt-4 mt-2">
            <h3 className="font-syne font-bold text-ink text-lg">GDG Designation</h3>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Role Title</label>
            <input value={role} onChange={e => setRole(e.target.value)} className="border border-foreground/10 rounded-[12px] px-4 py-3 font-dm text-sm text-ink outline-none focus:border-[#4285F4] transition-all" list="role-suggestions" />
            <datalist id="role-suggestions">
              <option value="Lead" />
              <option value="Tech Head" />
              <option value="Operations Head" />
              <option value="Creatives Head" />
              <option value="Core Member" />
              <option value="Volunteer" />
            </datalist>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Team Placement</label>
            <div className="grid grid-cols-2 gap-2 h-[46px]">
              {([['core', 'Core Team'], ['extended', 'Full Crew']] as const).map(([val, label]) => (
                <button key={val} type="button" onClick={() => setTeamType(val)}
                  className={`rounded-[12px] font-dm text-sm font-semibold border-2 transition-all flex items-center justify-center ${teamType === val ? 'border-[#4285F4] bg-[#4285F4]/[0.08] text-[#4285F4]' : 'border-foreground/10 text-ink-muted hover:bg-foreground/[0.02]'
                    }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Role Theme Color</label>
            <div className="flex gap-3 items-center h-[46px]">
              {["#4285F4", "#EA4335", "#FBBC04", "#34A853", "#7C3AED", "#111111"].map(c => (
                <button key={c} onClick={() => setRoleColor(c)} className="w-[34px] h-[34px] rounded-full border-[3px] transition-all shadow-sm flex items-center justify-center"
                  style={{ background: c, borderColor: roleColor === c ? "#111" : "transparent" }}>
                  {roleColor === c && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </button>
              ))}
              <input type="color" value={roleColor} onChange={e => setRoleColor(e.target.value)} className="w-9 h-9 p-0 border-0 rounded-full cursor-pointer overflow-hidden opacity-50 hover:opacity-100 transition-opacity" title="Custom Hex" />
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2 border-t border-foreground/[0.06] pt-4 mt-2">
            <h3 className="font-syne font-bold text-ink text-lg flex items-center gap-2">Academic Background 🎒</h3>
          </div>

          <div className="flex flex-col gap-2 col-span-1 sm:col-span-2">
            <label className="font-caveat text-ink-muted text-base">Engineering Branch</label>
            <div className="flex flex-wrap gap-2">
              {["Computer", "IT", "Data Science", "AIML", "Civil", "Mechanical", "ECS", "AIMAC"].map(b => (
                <button key={b} onClick={() => setBranch(b)} className={`px-4 py-2 text-sm font-dm font-semibold rounded-[10px] transition-all border ${branch === b ? 'bg-ink text-white border-ink shadow-md' : 'bg-white border-foreground/10 text-ink-muted hover:border-foreground/20'}`}>
                  {b}
                </button>
              ))}
              <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="Other..." className="w-[100px] border-b-2 border-foreground/10 px-2 py-1 font-dm text-sm outline-none focus:border-[#4285F4]" />
            </div>
          </div>

          <div className="flex flex-col gap-2 col-span-1 sm:col-span-2">
            <label className="font-caveat text-ink-muted text-base">Current Year</label>
            <div className="flex flex-wrap gap-2">
              {["FE", "SE", "TE", "BE", "Alumni"].map(y => (
                <button key={y} onClick={() => setYear(y)} className={`px-5 py-2 text-sm font-dm font-semibold rounded-[10px] transition-all border ${year === y ? 'bg-[#34A853] text-white border-[#34A853] shadow-md' : 'bg-white border-foreground/10 text-ink-muted hover:border-foreground/20'}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2 border-t border-foreground/[0.06] pt-4 mt-2">
            <h3 className="font-syne font-bold text-ink text-lg">Social & Biometrics</h3>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">LinkedIn URL</label>
            <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" className="border border-foreground/10 rounded-[12px] px-4 py-3 font-dm text-sm text-ink outline-none focus:border-[#4285F4] transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Email Contact</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="name@gdgapsit.com" type="email" className="border border-foreground/10 rounded-[12px] px-4 py-3 font-dm text-sm text-ink outline-none focus:border-[#4285F4] transition-all" />
          </div>

          <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
            <label className="font-caveat text-ink-muted text-base">Member Bio (Short hook)</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="A short bio about their passion..." className="border border-foreground/10 rounded-[12px] px-4 py-3 font-dm text-sm text-ink outline-none focus:border-[#4285F4] resize-none transition-all" />
          </div>

          <div className="col-span-1 sm:col-span-2 bg-foreground/[0.02] p-4 rounded-[16px] border border-foreground/[0.05] grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 font-dm text-sm text-ink font-semibold cursor-pointer">
              <input type="checkbox" checked={isLead} onChange={e => setIsLead(e.target.checked)} className="w-5 h-5 accent-[#EA4335]" />
              Assign "Lead" Flag 👑
            </label>
            <label className="flex items-center gap-3 font-dm text-sm text-ink font-semibold cursor-pointer">
              <input type="checkbox" checked={isVisible} onChange={e => setIsVisible(e.target.checked)} className="w-5 h-5 accent-[#4285F4]" />
              Visible on Live Site
            </label>
            <div className="col-span-2 flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 font-dm text-sm text-ink font-semibold whitespace-nowrap">Display Order (Z-A):</label>
              <input type="number" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 0)} className="w-20 border border-foreground/10 rounded-[8px] px-3 py-1.5 font-dm text-sm outline-none font-semibold text-center bg-white focus:border-[#4285F4]" />
              <span className="font-dm text-xs text-ink-muted ml-2">Higher numbers display first.</span>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="col-span-1 sm:col-span-2 pt-2">
            <button onClick={() => onSave({
              name, role, role_color: roleColor, bio,
              dicebear_seed: seed, linkedin_url: linkedinUrl, email,
              is_lead: isLead, team_type: teamType,
              display_order: displayOrder, is_visible: isVisible,
              profile_picture_url: profilePictureUrl, branch, year
            })}
              className="w-full py-4 rounded-[16px] bg-[#4285F4] text-white font-syne font-bold text-lg hover:bg-[#3A75E0] transition-all shadow-[0_4px_16px_rgba(66,133,244,0.3)] flex justify-center items-center gap-2">
              <Save size={18} /> {member ? "Publish Member Updates" : "Complete Onboarding"}
            </button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default Admin;
