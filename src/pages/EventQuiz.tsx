import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { DoodleTrophy } from '@/components/illustrations/GoogleDoodle';
import { SEOHead } from '@/components/SEOHead';

interface Question {
  id: string; type: 'mcq' | 'short'; question: string; options?: string[];
  correct?: number; correctKeywords?: string[]; explanation: string; points: number;
}

const QUIZ_DATA: Record<string, { title: string; questions: Question[] }> = {
  'gen-ai-study-jams-2025': {
    title: 'Gen AI Study Jams Quiz',
    questions: [
      { id: 'q1', type: 'mcq', question: 'What does "LLM" stand for in AI?', options: ['Large Language Model','Long Learning Machine','Linear Logic Module','Light Language Mechanism'], correct: 0, explanation: 'LLM = Large Language Model, trained on vast text data.', points: 100 },
      { id: 'q2', type: 'mcq', question: 'Which Google AI model did we use during the Study Jam?', options: ['GPT-4','Gemini','LaMDA','BERT'], correct: 1, explanation: "Gemini is Google's flagship multimodal AI model.", points: 100 },
      { id: 'q3', type: 'short', question: 'Name one principle of Responsible AI you learned.', correctKeywords: ['fairness','transparency','accountability','privacy','safety'], explanation: 'Responsible AI principles include Fairness, Transparency, Accountability, Privacy, and Safety.', points: 150 },
      { id: 'q4', type: 'mcq', question: 'What is "prompt engineering"?', options: ['Writing code for AI','Crafting inputs to get better AI outputs','Training a new AI model','Testing AI performance'], correct: 1, explanation: 'Prompt engineering is crafting effective inputs to guide AI outputs.', points: 100 },
      { id: 'q5', type: 'mcq', question: 'Gemini can understand which types of input?', options: ['Text only','Text and images','Text, images, audio and video','Numbers only'], correct: 2, explanation: 'Gemini is multimodal — text, images, audio, and video!', points: 200 },
    ],
  },
  'hackapsit-2025': {
    title: 'HackAPSIT 2025 Quiz',
    questions: [
      { id: 'q1', type: 'mcq', question: 'How long was HackAPSIT 2025?', options: ['12 hours','24 hours','48 hours','36 hours'], correct: 1, explanation: 'HackAPSIT was a 24-hour hackathon, Nov 1–2, 2025.', points: 100 },
      { id: 'q2', type: 'short', question: 'Name one of the four tracks at HackAPSIT 2025.', correctKeywords: ['ai','ml','web3','sustainability','health'], explanation: 'The four tracks were: AI/ML, Web3, Sustainability, and Health Tech.', points: 150 },
    ],
  },
};

const DEFAULT_QUIZ: { title: string; questions: Question[] } = {
  title: 'GDG APSIT Knowledge Quiz',
  questions: [
    { id: 'dq1', type: 'mcq', question: 'What does GDG stand for?', options: ['Google Developer Groups','General Development Guide','Global Digital Gathering','Google DevOps Group'], correct: 0, explanation: 'GDG = Google Developer Groups.', points: 100 },
    { id: 'dq2', type: 'mcq', question: 'When was GDG on Campus APSIT founded?', options: ['2020','2021','2022','2023'], correct: 2, explanation: 'Founded in 2022 as GDSC APSIT, rebranded in 2024.', points: 100 },
    { id: 'dq3', type: 'short', question: 'What city is APSIT located in?', correctKeywords: ['thane'], explanation: 'APSIT is located in Thane, Maharashtra.', points: 100 },
  ],
};

const OPTION_COLORS = [
  { bg: '#4285F4', shape: '▲' },
  { bg: '#EA4335', shape: '◆' },
  { bg: '#34A853', shape: '●' },
  { bg: '#FBBC04', shape: '■' },
];

type QuizState = 'intro' | 'question' | 'finished';

export default function EventQuiz() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const quizData = QUIZ_DATA[slug || ''] || DEFAULT_QUIZ;
  const questions = quizData.questions;

  const [state, setState] = useState<QuizState>('intro');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; points: number }>>([]);
  const [shortInput, setShortInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef<any>(null);

  const question = questions[current];
  const totalPossible = questions.reduce((s, q) => s + q.points, 0);
  const percentage = Math.round((score / totalPossible) * 100);

  useEffect(() => {
    if (state !== 'question' || answered) return;
    setTimeLeft(question.type === 'short' ? 30 : 20);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, state, answered]);

  const handleTimeout = () => {
    if (answered) return;
    setAnswered(true);
    clearInterval(timerRef.current);
    setAnswers(prev => [...prev, { correct: false, points: 0 }]);
  };

  const handleMCQSelect = (idx: number) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setSelected(idx); setAnswered(true);
    const isCorrect = idx === question.correct;
    const points = isCorrect ? question.points : 0;
    setScore(s => s + points);
    setAnswers(prev => [...prev, { correct: isCorrect, points }]);
  };

  const handleShortSubmit = () => {
    if (answered || !shortInput.trim()) return;
    clearInterval(timerRef.current); setAnswered(true);
    const isCorrect = (question.correctKeywords || []).some(k => shortInput.toLowerCase().includes(k.toLowerCase()));
    const points = isCorrect ? question.points : 0;
    setScore(s => s + points);
    setAnswers(prev => [...prev, { correct: isCorrect, points }]);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1); setSelected(null); setAnswered(false); setShortInput('');
    } else { setState('finished'); }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: state === 'intro' ? 'hsl(var(--cream))' : '#0A0A0A' }}>
      <SEOHead title={`${quizData.title}`} description="Test your knowledge from the event" />

      {state === 'intro' && <div className="absolute inset-0 graph-bg opacity-50 pointer-events-none" />}

      {/* INTRO */}
      {state === 'intro' && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div className="max-w-lg w-full text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div className="inline-block mb-6" animate={{ y: [-8, 8, -8] }} transition={{ duration: 3, repeat: Infinity }}>
              <DoodleTrophy size={80} />
            </motion.div>
            <h1 className="font-syne font-black text-ink leading-tight mb-2" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>{quizData.title}</h1>
            <p className="font-dm text-ink-muted mb-8">{questions.length} questions · Test your knowledge</p>
            <div className="flex justify-center gap-6 mb-10">
              {[{ val: questions.length, label: 'Questions' }, { val: `${totalPossible}`, label: 'Total Points' }, { val: '20s', label: 'Per MCQ' }].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-syne font-black text-3xl text-[#4285F4]">{s.val}</div>
                  <div className="font-dm text-ink-muted text-xs">{s.label}</div>
                </div>
              ))}
            </div>
            <motion.button onClick={() => setState('question')}
              className="w-full py-5 rounded-[20px] font-syne font-black text-white text-xl shadow-[0_8px_32px_rgba(66,133,244,0.35)]"
              style={{ background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              🚀 Start Quiz
            </motion.button>
            <button onClick={() => navigate(-1)} className="mt-4 font-dm text-ink-muted text-sm hover:text-ink transition-colors">← Back to Event</button>
          </motion.div>
        </div>
      )}

      {/* QUESTION */}
      {state === 'question' && (
        <div className="min-h-screen flex flex-col">
          <div className="bg-[#111] border-b border-white/[0.08] px-5 py-3 flex items-center justify-between">
            <div className="font-dm-mono text-white/50 text-xs">Question {current + 1} / {questions.length}</div>
            <div className="flex-1 mx-8 bg-white/10 rounded-full h-1.5 overflow-hidden">
              <motion.div className="h-full rounded-full bg-[#FBBC04]" animate={{ width: `${((current) / questions.length) * 100}%` }} />
            </div>
            <div className="font-syne font-black text-[#FBBC04] text-lg">{score} pts</div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
            <div className="relative mb-8">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                <circle cx="40" cy="40" r="34" fill="none"
                  stroke={timeLeft <= 5 ? '#EA4335' : '#FBBC04'} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={213.6}
                  strokeDashoffset={213.6 - (timeLeft / (question.type === 'short' ? 30 : 20)) * 213.6}
                  transform="rotate(-90 40 40)" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-syne font-black text-white text-xl">{timeLeft}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.h2 key={question.id} className="font-syne font-black text-white text-center leading-tight mb-8"
                style={{ fontSize: 'clamp(1.3rem, 3.5vw, 2rem)' }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                {question.question}
              </motion.h2>
            </AnimatePresence>

            {question.type === 'mcq' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {(question.options || []).map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrect = answered && i === question.correct;
                  const isWrong = answered && isSelected && i !== question.correct;
                  return (
                    <motion.button key={i} onClick={() => handleMCQSelect(i)} disabled={answered}
                      className="relative rounded-[18px] p-4 sm:p-5 text-left overflow-hidden font-syne font-bold text-white text-base sm:text-lg transition-all disabled:cursor-default"
                      style={{ background: isCorrect ? '#34A853' : isWrong ? '#EA4335' : !answered ? OPTION_COLORS[i].bg : `${OPTION_COLORS[i].bg}55` }}
                      whileHover={!answered ? { scale: 1.03, y: -2 } : {}} whileTap={!answered ? { scale: 0.97 } : {}}
                      animate={isCorrect ? { scale: [1, 1.05, 1] } : isWrong ? { x: [-6, 6, -4, 4, 0] } : {}}>
                      <span className="text-2xl opacity-60 mr-3">{OPTION_COLORS[i].shape}</span>
                      {opt}
                      {isCorrect && <motion.span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>}
                      {isWrong && <motion.span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl" initial={{ scale: 0 }} animate={{ scale: 1 }}>✗</motion.span>}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {question.type === 'short' && (
              <div className="w-full">
                <input value={shortInput} onChange={e => setShortInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleShortSubmit()} disabled={answered}
                  placeholder="Type your answer here..."
                  className="w-full bg-white/10 border border-white/20 rounded-[16px] px-5 py-4 font-dm text-white text-lg placeholder:text-white/30 outline-none focus:border-[#FBBC04] transition-colors" />
                {!answered && (
                  <motion.button onClick={handleShortSubmit} disabled={!shortInput.trim()}
                    className="mt-3 w-full py-3.5 rounded-[14px] font-syne font-black text-white text-base disabled:opacity-40 bg-[#FBBC04]" whileTap={{ scale: 0.97 }}>
                    Submit Answer ↵
                  </motion.button>
                )}
              </div>
            )}

            <AnimatePresence>
              {answered && (
                <motion.div className="w-full mt-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <div className={`rounded-[16px] p-4 mb-4 flex items-start gap-3 ${answers[answers.length-1]?.correct ? 'bg-[#34A853]/20 border border-[#34A853]/30' : 'bg-[#EA4335]/20 border border-[#EA4335]/30'}`}>
                    <span className="text-2xl flex-shrink-0">{answers[answers.length-1]?.correct ? '🎉' : '💡'}</span>
                    <div>
                      <div className="font-syne font-bold text-white text-sm mb-1">
                        {answers[answers.length-1]?.correct ? `+${answers[answers.length-1].points} points!` : "Not quite — here's why:"}
                      </div>
                      <p className="font-dm text-white/70 text-sm leading-relaxed">{question.explanation}</p>
                    </div>
                  </div>
                  <motion.button onClick={handleNext}
                    className="w-full py-4 rounded-[16px] font-syne font-black text-ink text-lg bg-[#FBBC04]"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    {current < questions.length - 1 ? 'Next Question →' : 'See Results 🏆'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* FINISHED */}
      {state === 'finished' && (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0A0A]">
          <motion.div className="max-w-md w-full text-center relative z-10"
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div animate={{ rotate: [-5, 5, -5], y: [-4, 4, -4] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block mb-5">
              <DoodleTrophy size={100} />
            </motion.div>
            <div className="font-syne font-black text-[#FBBC04] mb-2" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}>{score}</div>
            <div className="font-dm text-white/50 text-base mb-2">out of {totalPossible} points</div>
            <div className="font-syne font-black text-white text-2xl mb-6">
              {percentage >= 90 ? '🌟 Excellent!' : percentage >= 70 ? '🎯 Great job!' : percentage >= 50 ? '👍 Good effort!' : '📚 Keep learning!'}
            </div>
            <div className="bg-white/[0.05] rounded-[20px] p-5 mb-6 text-left">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
                  <span className="text-lg">{answers[i]?.correct ? '✅' : '❌'}</span>
                  <span className="font-dm text-white/60 text-sm flex-1 line-clamp-1">{q.question}</span>
                  <span className="font-dm-mono text-xs font-bold" style={{ color: answers[i]?.correct ? '#34A853' : '#EA4335' }}>+{answers[i]?.points || 0}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setCurrent(0); setSelected(null); setAnswered(false); setScore(0); setAnswers([]); setShortInput(''); setState('intro'); }}
                className="flex-1 py-3.5 rounded-[14px] bg-white/[0.08] text-white font-syne font-bold text-sm hover:bg-white/[0.15] transition-colors active:scale-95">
                Try Again 🔄
              </button>
              <button onClick={() => navigate(`/events/${slug}`)}
                className="flex-1 py-3.5 rounded-[14px] bg-[#4285F4] text-white font-syne font-bold text-sm hover:bg-[#3A75E0] transition-colors active:scale-95">
                Back to Event
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
