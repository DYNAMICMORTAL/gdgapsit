import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, MapPin, Users, Share2, ArrowRight, Clock, ChevronDown, Linkedin, ArrowUpRight } from "lucide-react";
import { useEvent } from "@/hooks/useDB";
import { FadeInSection } from "@/components/AnimationUtils";
import { ShareEventModal } from "@/components/ShareEventModal";
import { SEOHead } from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const EventTimer = ({ eventDate }: { eventDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [percentLeft, setPercentLeft] = useState(100);
  const target = new Date(eventDate.split("–")[0]);

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const isPast = target.getTime() < Date.now();

  return (
    <div className="text-center sm:text-left">
      <span className="font-dm font-semibold text-ink-muted text-xs uppercase tracking-widest block mb-2">
        {isPast ? "status" : "launching in"}
      </span>
      {!isPast ? (
        <div className="font-syne font-black leading-none flex items-center justify-center sm:justify-start gap-1" style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)" }}>
          <span className="text-ink">{String(timeLeft.days).padStart(2, "0")}</span>
          <span className="text-ink/20">:</span>
          <span className="text-ink">{String(timeLeft.hours).padStart(2, "0")}</span>
          <span className="text-ink/20">:</span>
          <span className="text-[#4285F4]">{String(timeLeft.minutes).padStart(2, "0")}</span>
        </div>
      ) : (
        <div className="font-syne font-bold text-xl sm:text-2xl text-ink">
          Concluded <span className="text-[#34A853]">✓</span>
        </div>
      )}
      {!isPast && (
        <div className="flex gap-4 font-dm text-ink-muted/50 uppercase tracking-widest mt-1.5 justify-center sm:justify-start" style={{ fontSize: "10px" }}>
          <span>Days</span><span>Hrs</span><span className="ml-[6px]">Min</span>
        </div>
      )}
    </div>
  );
};

// --- EVENT QUIZ COMPONENT ---
const EventQuiz = ({ eventSlug, quizData }: { eventSlug: string, quizData: any[] }) => {
  const [step, setStep] = useState<'intro' | 'lobby' | 'quiz' | 'result' | 'leaderboard'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0); // Cumulative points
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation states
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [shortAns, setShortAns] = useState("");

  const startQuiz = () => {
    if (!participantName.trim()) return alert("Please enter your name to join!");
    setStep('quiz');
    setStartTime(Date.now());
  };

  const evaluateAnswer = (isCorrect: boolean) => {
    const points = quizData[currentQ].points || 100;
    if (isCorrect) setScore(s => s + points);

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback('none');
      setShortAns("");
      if (currentQ < quizData.length - 1) {
        setCurrentQ(q => q + 1);
      } else {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeTaken(elapsed);
        setStep('result');
        submitScore(elapsed, score + (isCorrect ? points : 0));
      }
    }, 1500); // Wait 1.5s to show feedback
  };

  const handleMcq = (selectedIdx: number) => {
    if (feedback !== 'none') return; // Prevent double clicks
    evaluateAnswer(selectedIdx === quizData[currentQ].correctIndex);
  };

  const handleShortAns = () => {
    if (feedback !== 'none') return;
    const ans = shortAns.trim().toLowerCase();
    const keywords = (quizData[currentQ].correct_keywords || []).map((k: string) => k.toLowerCase());
    const isCorrect = keywords.some((k: string) => ans.includes(k));
    evaluateAnswer(isCorrect);
  };

  const submitScore = async (time: number, finalScore: number) => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/events/${eventSlug}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_name: participantName,
          participant_email: participantEmail,
          score: finalScore,
          total_questions: quizData.length,
          time_taken_seconds: time
        })
      });
      fetchLeaderboard();
    } catch (e) {
      console.error(e);
      setStep('leaderboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/events/${eventSlug}/quiz/leaderboard`);
      if (res.ok) setLeaderboard(await res.json());
      setStep('leaderboard');
    } catch (e) { console.error(e); }
  };

  // --- Real-time Sync Logic ---
  const [sessionState, setSessionState] = useState<any>(null);
  const [arenaParticipants, setArenaParticipants] = useState<any[]>([]);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/events/${eventSlug}`);
        if (!res.ok) return;
        const data = await res.json();
        const state = data.quiz_state || { status: 'idle' };
        setSessionState(state);
        setArenaParticipants(state.participants || []);

        // Logic to move from intro -> lobby or lobby -> quiz
        if (state.status === 'lobby' && step === 'intro' && participantName) {
          // We might already be in lobby if we joined
        }

        if (state.status === 'active' && (step === 'intro' || step === 'lobby')) {
          // Sync starting
          if (participantName) {
            setStep('quiz');
            setStartTime(new Date(state.startTime).getTime());
          }
        }

        if (state.status === 'active' && step === 'quiz') {
          const elapsed = Math.floor((Date.now() - new Date(state.startTime).getTime()) / 1000);
          if (elapsed >= state.timer) {
            // Quiz time up!
            setStep('leaderboard');
            fetchLeaderboard();
          }
        }

        if (state.status === 'finished' && step === 'quiz') {
          setStep('leaderboard');
          fetchLeaderboard();
        }
      } catch (e) { console.error("Poll error", e); }
    };

    poll(); // Initial poll
    const id = setInterval(poll, 3000); // Poll every 3s
    return () => clearInterval(id);
  }, [eventSlug, step, participantName]);

  const joinLobby = async () => {
    if (!participantName.trim()) return alert("Enter your name!");
    try {
      const res = await fetch(`/api/events/${eventSlug}/quiz/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: participantName })
      });
      if (res.ok) {
        setStep('lobby');
      }
    } catch (e) { console.error(e); }
  };

  const question = quizData[currentQ] || { question: "", options: [], type: "mcq", points: 100 };

  return (
    <div className="w-full bg-white rounded-[24px] sm:rounded-[36px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-foreground/[0.06] mt-10 relative">

      {/* Dynamic Feedback Overlay */}
      {feedback !== 'none' && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className={cn("absolute inset-0 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md",
            feedback === 'correct' ? "bg-[#34A853]/90" : "bg-[#EA4335]/90")}>
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: feedback === 'correct' ? [0, 10, -10, 0] : [0, -10, 10, 0] }} transition={{ duration: 0.5 }} className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6">
            <span className="text-5xl">{feedback === 'correct' ? '🎉' : '💥'}</span>
          </motion.div>
          <h3 className="font-syne font-black text-white text-4xl mb-2 drop-shadow-md">
            {feedback === 'correct' ? 'Perfect Match!' : 'Missed It!'}
          </h3>
          <p className="font-dm font-bold text-white/90 text-lg">
            {feedback === 'correct' ? `+ ${question.points || 100} Points Added` : 'No points awarded'}
          </p>
          {feedback === 'wrong' && question.explanation && (
            <div className="mt-6 bg-black/20 p-4 rounded-[16px] max-w-sm text-center">
              <span className="uppercase text-[10px] font-bold text-white/70 tracking-widest block mb-1">Explanation</span>
              <p className="text-white text-sm font-dm">{question.explanation}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-[#0F1115] to-[#1A1D24] p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <h2 className="font-syne font-black text-2xl drop-shadow-sm flex items-center gap-2">
            Challenge Arena <span className="text-3xl">⚔️</span>
          </h2>
          {step === 'quiz' && (
            <div className="font-dm-mono font-bold text-[10px] sm:text-xs bg-white/10 px-3 sm:px-4 py-1.5 rounded-full border border-white/10 shadow-sm flex items-center gap-2">
              <span className="text-[#34A853]">⭐ {score}</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="hidden sm:inline">Q{currentQ + 1} / {quizData.length}</span>
              <span className="sm:hidden">{currentQ + 1}/{quizData.length}</span>
              {sessionState?.status === 'active' && (
                <>
                  <span className="w-px h-3 bg-white/20" />
                  <span className="text-[#EA4335] animate-pulse">
                    {Math.max(0, sessionState.timer - Math.floor((Date.now() - new Date(sessionState.startTime).getTime()) / 1000))}s
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        {/* TIMER PROGRESS BAR */}
        {step === 'quiz' && sessionState?.status === 'active' && (
          <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: `${Math.max(0, ((sessionState.timer - (Math.floor((Date.now() - new Date(sessionState.startTime).getTime()) / 1000))) / sessionState.timer) * 100)}%` }}
              transition={{ duration: 1, ease: "linear" }}
              className="h-full bg-[#4285F4]"
            />
          </div>
        )}
      </div>

      <div className="p-6 sm:p-10 min-h-[300px] flex flex-col justify-center transition-all">

        {step === 'intro' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#4285F4] to-[#34A853] rounded-3xl rotate-12 flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(66,133,244,0.3)]">
              <span className="text-4xl -rotate-12">🎮</span>
            </div>
            <h3 className="font-syne font-bold text-ink text-2xl mb-2">Prove Your Knowledge</h3>
            <p className="font-dm text-ink-muted text-sm mb-8">Compete against other attendees. Fast and accurate answers yield the highest scores required to dominate the leaderboard.</p>

            <div className="w-full space-y-3 mb-6">
              <input value={participantName} onChange={e => setParticipantName(e.target.value)} placeholder="Your Display Name (Required)" className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-[12px] px-5 py-4 font-dm font-bold text-ink text-center outline-none focus:border-[#4285F4] focus:bg-white transition-all shadow-inner" />
              <input value={participantEmail} onChange={e => setParticipantEmail(e.target.value)} placeholder="Email Address (Optional)" className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-[12px] px-5 py-3 font-dm text-sm text-ink text-center outline-none focus:border-[#4285F4] focus:bg-white transition-all shadow-inner" />
            </div>

            <button onClick={joinLobby} className="w-full bg-ink text-white font-syne font-bold text-lg py-4 rounded-[16px] hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all active:scale-[0.98]">
              Join Lobby →
            </button>
            <button onClick={fetchLeaderboard} className="mt-4 font-dm text-sm font-semibold text-ink-muted hover:text-ink transition-colors underline decoration-foreground/20 underline-offset-4">
              Skip & View Leaderboard
            </button>
          </motion.div>
        )}

        {step === 'lobby' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center max-w-lg mx-auto py-6">
            <div className="relative mb-10">
              <div className="w-24 h-24 bg-[#4285F4]/10 rounded-full flex items-center justify-center animate-pulse">
                <Users size={40} className="text-[#4285F4]" />
              </div>
              <div className="absolute -top-2 -right-2 bg-[#34A853] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">LIVE</div>
            </div>

            <h3 className="font-syne font-bold text-ink text-2xl mb-2">The Gathering</h3>
            <p className="font-dm text-ink-muted text-sm mb-10">You're in the lobby! Wait for the admin to initiate the challenge. Watch others joining the arena below.</p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {arenaParticipants.map((p, i) => (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: i * 0.05 }}
                  key={i} className="bg-white border border-foreground/[0.08] px-4 py-2 rounded-full shadow-sm flex items-center gap-2 group">
                  <div className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
                  <span className="font-dm font-bold text-ink text-sm uppercase tracking-tight">{p.name}</span>
                </motion.div>
              ))}
              {arenaParticipants.length === 0 && (
                <p className="text-xs font-dm-mono text-ink-muted/50 uppercase tracking-widest">Awaiting participants...</p>
              )}
            </div>

            <div className="w-full p-4 bg-foreground/[0.03] rounded-[20px] border border-foreground/[0.06] flex items-center justify-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-ink/20 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <span className="font-dm font-semibold text-xs text-ink-muted uppercase tracking-widest">Waiting for admin to start...</span>
            </div>
          </motion.div>
        )}

        {step === 'quiz' && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center text-center">
              <span className="bg-[#FBBC04]/20 text-[#FBBC04] font-dm-mono font-bold text-xs px-3 py-1 rounded-full mb-4 inline-block shadow-sm">
                {question.points || 100} POINTS {question.type === "short" ? "• SHORT ANSWER" : "• MULTIPLE CHOICE"}
              </span>
              <h3 className="font-syne font-black text-ink text-2xl sm:text-3xl tracking-tight leading-snug">
                {question.question}
              </h3>
            </div>

            {(!question.type || question.type === 'mcq') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {question.options.map((opt: string, i: number) => {
                  const colors = [
                    "bg-[#EA4335] text-white hover:bg-[#D93025] hover:shadow-[0_4px_15px_rgba(234,67,53,0.3)]",
                    "bg-[#4285F4] text-white hover:bg-[#1A73E8] hover:shadow-[0_4px_15px_rgba(66,133,244,0.3)]",
                    "bg-[#FBBC04] text-ink hover:bg-[#F9AB00] hover:shadow-[0_4px_15px_rgba(251,188,4,0.3)]",
                    "bg-[#34A853] text-white hover:bg-[#1E8E3E] hover:shadow-[0_4px_15px_rgba(52,168,83,0.3)]"
                  ];
                  return (
                    <button key={i} onClick={() => handleMcq(i)}
                      className={cn(
                        "relative overflow-hidden p-6 rounded-[20px] font-dm font-bold text-lg sm:text-xl text-left flex items-center gap-4 transition-all active:scale-95 border-b-4 border-black/20",
                        colors[i % 4]
                      )}>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-inner flex items-center justify-center flex-shrink-0 text-sm font-black">
                        {["A", "B", "C", "D"][i]}
                      </div>
                      <span className="flex-1 drop-shadow-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {question.type === 'short' && (
              <div className="flex flex-col gap-4">
                <input value={shortAns} onChange={e => setShortAns(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleShortAns()}
                  autoFocus
                  placeholder="Type your answer here..."
                  className="w-full bg-foreground/[0.02] border-2 border-foreground/10 rounded-[20px] px-6 py-5 font-dm font-bold text-xl text-ink text-center outline-none focus:border-[#4285F4] focus:bg-white transition-all shadow-inner" />
                <button onClick={handleShortAns} disabled={!shortAns.trim()}
                  className="w-full sm:w-auto self-center bg-[#4285F4] text-white font-syne font-bold text-lg px-10 py-4 rounded-full hover:scale-105 transition-all shadow-[0_4px_20px_rgba(66,133,244,0.3)] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none">
                  Submit Answer &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'result' && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-24 h-24 border-4 border-[#34A853]/20 border-t-[#34A853] rounded-full animate-spin mb-6" />
            <h3 className="font-syne font-bold text-ink text-2xl animate-pulse">Computing final score...</h3>
          </div>
        )}

        {step === 'leaderboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col min-h-[400px]">
            <div className="flex items-end justify-between mb-8 border-b border-foreground/10 pb-4">
              <h3 className="font-syne font-black text-ink text-3xl">Live Leaderboard 🏆</h3>
              <span className="font-dm font-bold text-[#4285F4] bg-[#4285F4]/10 px-4 py-1.5 rounded-full text-sm">
                Top {leaderboard.length} Players
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="font-dm text-ink-muted text-lg mb-4">No scores yet. Be the first to conquer the quiz!</p>
                <button onClick={() => setStep('intro')} className="bg-[#FBBC04] text-ink font-syne font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-md">
                  Take the Quiz
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {leaderboard.map((lb, i) => (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    key={i} className={cn(
                      "flex items-center gap-4 p-4 rounded-[16px] border transition-all hover:scale-[1.01] overflow-hidden relative",
                      i === 0 ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-md" :
                        i === 1 ? "bg-slate-50 border-slate-200 shadow-sm" :
                          i === 2 ? "bg-orange-50/50 border-orange-100 shadow-sm" : "bg-white border-foreground/[0.05] hover:border-foreground/20"
                    )}>
                    {i === 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 blur-[30px] rounded-full translate-x-10 -translate-y-10" />}
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-syne font-black text-xl shadow-inner border-2",
                      i === 0 ? "bg-yellow-400 text-yellow-900 border-yellow-300" :
                        i === 1 ? "bg-slate-300 text-slate-800 border-slate-200" :
                          i === 2 ? "bg-orange-300 text-orange-900 border-orange-200" : "bg-foreground/[0.04] text-ink-muted border-transparent"
                    )}>
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0 z-10">
                      <h4 className="font-dm font-bold text-ink text-lg truncate flex items-center gap-2">
                        {lb.participant_name}
                        {i === 0 && <span className="text-xl shadow-yellow-200 drop-shadow-md animate-bounce-slow">👑</span>}
                      </h4>
                      <p className="font-dm-mono text-xs text-ink-muted mt-0.5">{lb.time_taken_seconds}s total combat time</p>
                    </div>
                    <div className="flex flex-col items-end z-10">
                      <span className="font-syne font-black text-3xl text-ink leading-none">{lb.score}</span>
                      <span className="font-dm text-[10px] uppercase font-bold text-ink-muted mt-1 tracking-widest bg-white/50 px-2 py-0.5 rounded-full">PTS</span>
                    </div>
                  </motion.div>
                ))}

                <div className="mt-6 flex justify-center">
                  <button onClick={() => { setParticipantName(""); setScore(0); setStep('intro'); }} className="font-dm text-sm font-bold text-ink bg-foreground/[0.03] border border-foreground/[0.08] hover:bg-foreground/[0.06] hover:shadow-sm px-6 py-3 rounded-full transition-all flex items-center gap-2">
                    <ArrowLeft size={16} /> Re-enter Arena
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
};

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading } = useEvent(slug!);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="graph-bg min-h-screen pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#4285F4]/30 border-t-[#4285F4] rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="graph-bg min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-syne font-black text-4xl text-ink">Event not found</h1>
          <Link to="/events" className="font-dm text-[#4285F4] hover:underline mt-4 inline-block">← Back to Events</Link>
        </div>
      </div>
    );
  }

  // Helper to safely parse JSONB originating as arrays or strings
  const safeParseArray = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  // Normalise DB
  const e = {
    ...event,
    badgeColor: event.badge_color ?? '#4285F4',
    typeColor: event.type_color ?? '#4285F4',
    gradient: event.gradient ?? `from-[${event.banner_color_1 ?? '#4285F4'}] to-[${event.banner_color_2 ?? '#1A73E8'}]`,
    longDescription: event.long_description ?? event.description ?? '',
    interCollege: event.is_inter_college ?? false,
    registrationLink: event.registration_link ?? '',
    topics: safeParseArray(event.topics),
    speakers: safeParseArray(event.speakers),
    agenda: safeParseArray(event.agenda),
    faqs: safeParseArray(event.faqs),
    sponsors: safeParseArray(event.sponsors),
    date: event.date_display ?? '',
    isQuizActive: event.quiz_enabled === true,
  };

  const stats = [
    { label: "Attendees", value: e.attendance },
    { label: "Duration", value: e.duration },
    { label: "Format", value: e.format },
  ];

  const mouseCursorSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="%23fff" stroke="%23000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>`;

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      <SEOHead title={e.title} description={e.description} type="event"
        eventData={{ startDate: e.date, location: e.location, organizer: 'GDG on Campus APSIT' }} />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-6 mb-4">
        <Link to="/events" className="inline-flex items-center gap-2 font-dm text-sm text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={15} /> Back to Events
        </Link>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-start">

          {/* Luma-style Main Content Column */}
          <div className="w-full flex flex-col gap-8 lg:gap-12">

            {/* HERO BANNER - Inspiration Image Aesthetic */}
            <FadeInSection>
              <div className={cn(
                "relative rounded-[24px] sm:rounded-[36px] overflow-hidden flex flex-col justify-center items-center w-full group",
                !e.image_url ? "bg-[#0A4D2E]" : "" /* Dark Forest Green from inspiration */
              )}
                style={{
                  minHeight: "clamp(260px, 40vw, 400px)",
                  cursor: `url('${mouseCursorSvg}'), auto`,
                  ...(e.image_url
                    ? { backgroundImage: `url(${e.image_url})`, backgroundPosition: 'center', backgroundSize: 'cover' }
                    : {}
                  )
                }}>

                {/* Custom Overlay Typography matching the Inspiration Vibe */}
                {!e.image_url && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-10 z-10 w-full overflow-hidden">
                    <h1 className="font-syne font-black uppercase text-center leading-[0.85] tracking-tight drop-shadow-md z-20 w-full"
                      style={{ fontSize: "clamp(3rem, 9vw, 2.5rem)", color: "#22EB7B" }}>
                      {e.title}
                    </h1>

                    {/* Floating Doodles inside */}
                    <motion.div
                      animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-[8%] left-[5%] text-[4rem] sm:text-[6rem] opacity-90 drop-shadow-[3px_3px_0px_#000] -rotate-12 select-none"
                    >
                      💡
                    </motion.div>

                    <motion.div
                      animate={{ y: [15, -15, 15], rotate: [5, -5, 5] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute bottom-[10%] right-[8%] w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#FF4593] border-[3px] sm:border-[5px] border-black flex items-center justify-center shadow-[4px_4px_0px_#000] select-none z-30"
                    >
                      <span className="font-syne font-black text-black text-xl sm:text-3xl rotate-12">🙂</span>
                    </motion.div>
                  </div>
                )}

                {/* Small labels on banner top */}
                <div className="absolute top-5 left-5 right-5 flex justify-between z-30 pointer-events-none">
                  <span className="font-dm font-semibold text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                    {e.type}
                  </span>
                  {e.interCollege && (
                    <span className="bg-[#4285F4] text-white text-xs font-dm font-semibold px-3 py-1 rounded-full shadow-sm">
                      🏫 Inter-College
                    </span>
                  )}
                </div>
              </div>
            </FadeInSection>

            {/* EVENT DETAILS */}
            <FadeInSection delay={0.1}>
              <div className="prose max-w-none">
                <h2 className="font-syne font-bold text-ink text-2xl sm:text-3xl mb-4">About the Event</h2>
                <p className="font-dm text-ink-muted text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                  {e.longDescription}
                </p>
              </div>

              {e.topics && e.topics.length > 0 && (
                <div className="mt-8">
                  <span className="font-dm font-semibold text-ink-muted text-xs uppercase tracking-widest block mb-4">You will learn</span>
                  <div className="flex flex-wrap gap-2">
                    {e.topics.map((t: string) => (
                      <span key={t} className="text-sm px-4 py-2 rounded-full font-dm font-medium border border-foreground/[0.08] text-ink shadow-sm bg-white">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </FadeInSection>

            {/* AGENDA SECTION */}
            {e.agenda && e.agenda.length > 0 && (
              <FadeInSection delay={0.15}>
                <h3 className="font-syne font-bold text-ink text-2xl sm:text-3xl mb-6">Agenda</h3>
                <div className="flex flex-col gap-4">
                  {e.agenda.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 rounded-[20px] bg-white border border-foreground/[0.05] shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-md transition-shadow">
                      <div className="flex flex-col items-center gap-1 min-w-[70px] pt-1">
                        <span className="font-syne font-black text-ink text-sm sm:text-base text-center">{item.time.split(" ")[0]}</span>
                        <span className="font-dm font-semibold text-ink-muted text-xs uppercase">{item.time.split(" ")[1]}</span>
                      </div>
                      <div className="bg-foreground/[0.04] w-px" />
                      <div className="flex-1">
                        <h4 className="font-dm font-bold text-ink text-base sm:text-lg leading-tight">{item.title}</h4>
                        {item.description && <p className="font-dm text-ink-muted text-sm mt-1.5 leading-relaxed">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </FadeInSection>
            )}

            {/* SPEAKERS SECTION */}
            {e.speakers && e.speakers.length > 0 && (
              <FadeInSection delay={0.2}>
                <h3 className="font-syne font-bold text-ink text-2xl sm:text-3xl mb-6 mt-4">Speakers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {e.speakers.map((speaker: any, i: number) => (
                    <div key={i} className="group relative flex items-center gap-4 bg-white border border-foreground/[0.05] p-4 rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-1 transition-all duration-300">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-foreground/[0.02] border border-foreground/[0.05] flex-shrink-0">
                        <img src={speaker.avatar || `https://api.dicebear.com/9.x/micah/svg?seed=${speaker.name}`} alt={speaker.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-dm font-bold text-ink text-base truncate">{speaker.name}</h4>
                        <p className="font-dm text-xs text-ink-muted truncate mt-0.5">{speaker.role} {speaker.company && `• ${speaker.company}`}</p>
                      </div>
                      {speaker.linkedinUrl && speaker.linkedinUrl !== "#" && (
                        <a href={speaker.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-foreground/[0.03] flex items-center justify-center text-ink-muted hover:text-[#0077b5] hover:bg-[#0077b5]/10 transition-colors">
                          <Linkedin size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </FadeInSection>
            )}

            {/* SPONSORS SECTION */}
            {e.sponsors && e.sponsors.length > 0 && (
              <FadeInSection delay={0.25}>
                <h3 className="font-syne font-bold text-ink text-2xl sm:text-3xl mb-6 mt-4">Powered By</h3>
                <div className="flex flex-wrap gap-6 items-center">
                  {e.sponsors.map((sponsor: any, i: number) => (
                    <div key={i} className="h-12 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                      <img src={sponsor.logo} alt={sponsor.name} className="h-full object-contain" />
                    </div>
                  ))}
                </div>
              </FadeInSection>
            )}

            {/* FAQS SECTION */}
            {e.faqs && e.faqs.length > 0 && (
              <FadeInSection delay={0.3}>
                <h3 className="font-syne font-bold text-ink text-2xl sm:text-3xl mb-6 mt-4">Got Questions?</h3>
                <div className="flex flex-col gap-3">
                  {e.faqs.map((faq: any, i: number) => {
                    const isOpen = activeFaq === i;
                    return (
                      <div key={i} className={cn("bg-white border rounded-[20px] overflow-hidden transition-all duration-300", isOpen ? "border-ink shadow-sm" : "border-foreground/[0.06]")}>
                        <button onClick={() => setActiveFaq(isOpen ? null : i)} className="w-full flex items-center justify-between p-5 text-left focus:outline-none">
                          <span className="font-dm font-bold text-ink pr-4">{faq.question}</span>
                          <ChevronDown size={18} className={cn("text-ink-muted transition-transform duration-300 flex-shrink-0", isOpen && "rotate-180 text-ink")} />
                        </button>
                        <div className={cn("px-5 font-dm text-ink-muted text-sm leading-relaxed transition-all duration-300 overflow-hidden", isOpen ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0")}>
                          {faq.answer}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FadeInSection>
            )}

            {/* HIGH PERFORMANCE QUIZ COMPONENT MOUNT */}
            {e.isQuizActive && e.quiz_data && (
              <FadeInSection delay={0.35}>
                <EventQuiz eventSlug={e.slug} quizData={safeParseArray(e.quiz_data)} />
              </FadeInSection>
            )}

          </div>

          {/* RIGHT COLUMN - Sticky Action Sidebar (Luma Layout) */}
          <div className="w-full flex border-t pt-8 mt-4 lg:mt-0 lg:pt-0 lg:border-t-0 flex-col gap-5 lg:sticky lg:top-8 max-w-[400px] mx-auto lg:max-w-none">

            <FadeInSection delay={0.2}>
              {/* Main Action Card */}
              <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-foreground/[0.05]">
                <EventTimer eventDate={e.date} />

                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-foreground/[0.06] space-y-4">
                  <div className="flex bg-[#F7F7F7] p-4 rounded-[16px] gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} className="text-[#4285F4]" />
                    </div>
                    <div>
                      <p className="font-dm font-medium text-ink text-sm sm:text-base">{e.date}</p>
                      <p className="font-dm text-xs text-ink-muted mt-0.5">{new Date(e.date).getFullYear() === new Date().getFullYear() ? 'This Year' : ''}</p>
                    </div>
                  </div>

                  <div className="flex bg-[#F7F7F7] p-4 rounded-[16px] gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-[#EA4335]" />
                    </div>
                    <div>
                      <p className="font-dm font-medium text-ink text-sm sm:text-base leading-snug break-words">{e.location}</p>
                      <p className="font-dm text-xs text-ink-muted mt-0.5">Location details</p>
                    </div>
                  </div>
                </div>

                {/* Primary Call To Action - RSVP (Luma vibe) */}
                {new Date(e.date.split("–")[0]).getTime() < Date.now() ? (
                  <button disabled className={cn(
                    "w-full mt-6 py-4 rounded-[16px] font-dm font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 bg-foreground/[0.05] text-ink-muted cursor-not-allowed"
                  )}>
                    Event Closed
                  </button>
                ) : e.registrationLink ? (
                  <a href={e.registrationLink} target="_blank" rel="noopener noreferrer" className={cn(
                    "w-full mt-6 py-4 rounded-[16px] font-dm font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 bg-[#0F1115] text-white hover:opacity-90 active:scale-[0.98] shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
                  )}>
                    Register Now <ArrowRight size={16} />
                  </a>
                ) : (
                  <button disabled className={cn(
                    "w-full mt-6 py-4 rounded-[16px] font-dm font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 bg-foreground/[0.05] text-ink-muted cursor-not-allowed"
                  )}>
                    Registration Link Not Available
                  </button>
                )}

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button onClick={() => setShareOpen(true)} className="flex items-center justify-center gap-2 border border-foreground/[0.08] text-ink py-2.5 rounded-[12px] font-dm font-medium text-xs hover:bg-[#F7F7F7] transition-colors focus:ring-2 focus:ring-inset focus:ring-black">
                    <Share2 size={13} /> Share Event
                  </button>
                  <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border border-foreground/[0.08] text-ink py-2.5 rounded-[12px] font-dm font-medium text-xs hover:bg-[#F7F7F7] transition-colors focus:ring-2 focus:ring-inset focus:ring-black">
                    <Calendar size={13} /> Add to Cal
                  </a>
                </div>
              </div>

              {/* Minimal Stats Card (Removes useless GitHub/Community bloat) */}
              <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-foreground/[0.05] mt-5 flex justify-between">
                {stats.filter(s => s.value && s.value.trim() !== "").map((stat, i) => (
                  <div key={stat.label} className={cn("flex flex-col", i !== 0 && "pl-6 border-l border-foreground/[0.06]")}>
                    <span className="font-dm text-[11px] uppercase tracking-widest text-ink-muted mb-1">{stat.label}</span>
                    <span className="font-dm font-medium text-ink text-sm truncate max-w-[100px]">{stat.value}</span>
                  </div>
                ))}
              </div>

            </FadeInSection>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar for Mobile View */}
      <div className={cn(
        "fixed bottom-0 inset-x-0 p-4 bg-white/80 backdrop-blur-xl border-t border-foreground/10 z-50 lg:hidden shadow-2xl transition-transform duration-300 translate-y-0"
      )}>
        {new Date(e.date.split("–")[0]).getTime() < Date.now() ? (
          <button disabled className={cn(
            "w-full py-4 rounded-[16px] font-dm font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 bg-foreground/[0.05] text-ink-muted cursor-not-allowed"
          )}>
            Event Closed
          </button>
        ) : e.registrationLink ? (
          <a href={e.registrationLink} target="_blank" rel="noopener noreferrer" className={cn(
            "w-full py-4 rounded-[16px] font-dm font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 bg-[#0F1115] text-white active:scale-[0.98] shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
          )}>
            Register Now <ArrowRight size={16} />
          </a>
        ) : (
          <button disabled className={cn(
            "w-full py-4 rounded-[16px] font-dm font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 bg-foreground/[0.05] text-ink-muted cursor-not-allowed"
          )}>
            Registration Link Not Available
          </button>
        )}
      </div>

      <ShareEventModal event={{ title: e.title, slug: e.slug, date: e.date, location: e.location, typeColor: e.typeColor }}
        isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
};

export default EventDetail;
