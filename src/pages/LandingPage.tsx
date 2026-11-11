import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Sparkles,
  Mic,
  Brain,
  Award,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileText,
  Volume2,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the AI mock interview work?',
      a: 'You choose your target job role (e.g. Full Stack Developer, Data Analyst, AI Engineer), difficulty, duration, and answer mode (Voice or Text). Our AI generates progressive technical and HR questions tailored to your profile or uploaded resume. You speak or type your answer, and receive an instant multi-dimensional rubric score with model answers and improvement tips.',
    },
    {
      q: 'Do I need special hardware to use the voice interview mode?',
      a: 'No! Any standard laptop, phone, or desktop microphone works seamlessly through your modern web browser using the native Web Speech API. Real-time audio waveform feedback guides your pacing and volume.',
    },
    {
      q: 'What categories are evaluated in each interview answer?',
      a: 'Your answers are evaluated across 6 core criteria: Technical Knowledge, Answer Relevance, Communication Skills, Problem-Solving Ability, Grammar & Language, and Confidence/Clarity indicators. Each question includes suggested ideal sample answers and missed key points.',
    },
    {
      q: 'Can I upload my resume to personalize my questions?',
      a: 'Yes! You can upload or paste your resume. Our AI extracts your programming languages, projects, work experience, and coursework to generate company-grade questions directly relevant to your background.',
    },
    {
      q: 'Is my interview data and audio private and secure?',
      a: 'Absolutely. Your responses, recordings, and evaluations are tied strictly to your authenticated account with row-level security isolation. Your data is never shared with third parties.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-500/10 via-sky-400/5 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Next-Gen AI Interview Simulator for Tech & HR</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Practice Smarter.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
                  Interview Better.
                </span>{' '}
                Get Hired.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Ace high-stakes technical, behavioral, and coding interviews with adaptive AI interviewers. Experience voice-driven questioning, real-time speech transcription, and comprehensive 6-pillar rubric scoring with concrete model answers.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to={user ? '/interview/new' : '/auth?mode=register'}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{user ? 'Start Practice Interview' : 'Get Started Free'}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to={user ? '/dashboard' : '/auth?mode=login'}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-base border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <span>{user ? 'Go to Dashboard' : 'Sign In with Demo Account'}</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Real Voice & Speech Recognition</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Tailored to Your Resume & Skills</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Deep Rubric Evaluation Reports</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Mock Card */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-blue-500/10 space-y-5">
                {/* Header with avatar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
                        AI
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Sarah Vance (AI Principal)</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Technical Bar Raiser • Live</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Question 2 of 5
                  </span>
                </div>

                {/* Sample Question */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      System Architecture
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Volume2 className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Speaking
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                    "How would you prevent cascading failures and manage high write spikes in a distributed microservices pipeline?"
                  </p>
                </div>

                {/* Voice Visualizer simulation */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-red-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Recording Answer...
                    </span>
                    <span className="font-mono">00:42 / 02:00</span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 h-10 py-1">
                    <div className="w-1.5 bg-blue-500 rounded-full animate-voice-1"></div>
                    <div className="w-1.5 bg-sky-400 rounded-full animate-voice-2"></div>
                    <div className="w-1.5 bg-indigo-400 rounded-full animate-voice-3"></div>
                    <div className="w-1.5 bg-blue-500 rounded-full animate-voice-4"></div>
                    <div className="w-1.5 bg-sky-300 rounded-full animate-voice-5"></div>
                    <div className="w-1.5 bg-indigo-500 rounded-full animate-voice-2"></div>
                    <div className="w-1.5 bg-blue-400 rounded-full animate-voice-3"></div>
                  </div>

                  <p className="text-xs text-slate-300 italic line-clamp-2">
                    "I would place an asynchronous message buffer like Kafka between services and implement circuit breakers with exponential backoff..."
                  </p>
                </div>

                {/* Mini Score Metric Preview */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 font-medium">Technical</p>
                    <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">92%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 font-medium">Relevance</p>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">90%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 font-medium">Confidence</p>
                    <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">88%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Everything You Need to Succeed
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Engineered for Realistic Interview Mastery
            </p>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Move beyond memorizing static questions. PrepPulse AI simulates live interviewer interactions with conversational depth, speech recognition, and comprehensive rubric scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Live Voice & Speech Recognition
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Speak directly into your microphone with instant speech-to-text conversion. Review and refine your transcribed thoughts before submission.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Dynamic Contextual Follow-ups
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                The AI listens to your previous answers and poses relevant follow-up probes testing nuances, tradeoffs, and edge cases just like a principal engineer.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                6-Pillar Detailed Rubric
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Rigorous objective breakdown of Technical Accuracy, Relevance, Communication, Problem Solving, Grammar, and Confidence indicators.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Resume & Profile Tailoring
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload your resume or configure your academic skills. Questions focus on your specific projects, tech stack, and targeted job role.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Longitudinal Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Track your progression charts, radar competency maps, and improvement percentages across multiple practice sessions over time.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Model Sample Answers
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Never wonder "what should I have said?" Every evaluation provides a model response illustrating the ideal structure, keywords, and tradeoff analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Simple 4-Step Process
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              How PrepPulse AI Prepares You
            </p>
            <p className="text-base text-slate-600 dark:text-slate-400">
              From configuration to comprehensive performance review in four straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Configure Your Session',
                desc: 'Select job role, difficulty (Beginner, Intermediate, Advanced), category (Technical, HR, Programming), and voice or text mode.',
              },
              {
                step: '02',
                title: 'Attend AI Interview',
                desc: 'Listen to the AI interviewer speak each question aloud. Answer naturally using your microphone or keyboard with live timer pacing.',
              },
              {
                step: '03',
                title: 'AI Evaluates Rubric',
                desc: 'Our Gemini 3.8 Flash engine dissects technical substance, articulation, edge cases, and confidence metrics against hiring rubrics.',
              },
              {
                step: '04',
                title: 'Review & Improve',
                desc: 'Examine strengths, weaknesses, model answers, and track your progress curves on the analytics dashboard to retake and refine.',
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <span className="text-3xl font-extrabold text-blue-600/30 dark:text-blue-400/30 block">
                  {s.step}
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{s.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US / COMPARISON */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Why PrepPulse AI
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Why Traditional Mock Interviews Fall Short
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-xs tracking-wider">
                <tr>
                  <th className="p-4 sm:p-5">Feature</th>
                  <th className="p-4 sm:p-5 text-blue-600 dark:text-blue-400">PrepPulse AI</th>
                  <th className="p-4 sm:p-5 text-slate-500">Human Peer Mock</th>
                  <th className="p-4 sm:p-5 text-slate-500">Generic Question Lists</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Voice Speech-to-Text Pacing</td>
                  <td className="p-4 sm:p-5 text-emerald-600 font-bold">Yes (Instant)</td>
                  <td className="p-4 sm:p-5 text-slate-500">Subjective</td>
                  <td className="p-4 sm:p-5 text-red-500">No</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Immediate Model Sample Answers</td>
                  <td className="p-4 sm:p-5 text-emerald-600 font-bold">Yes (For Every Question)</td>
                  <td className="p-4 sm:p-5 text-slate-500">Rarely</td>
                  <td className="p-4 sm:p-5 text-slate-500">Static / General</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Availability & Scheduling</td>
                  <td className="p-4 sm:p-5 text-emerald-600 font-bold">24/7 On Demand</td>
                  <td className="p-4 sm:p-5 text-red-500">Requires Coordination</td>
                  <td className="p-4 sm:p-5 text-emerald-600">24/7</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Tailored to Resume & Skills</td>
                  <td className="p-4 sm:p-5 text-emerald-600 font-bold">Yes (AI Extracted)</td>
                  <td className="p-4 sm:p-5 text-slate-500">Inconsistent</td>
                  <td className="p-4 sm:p-5 text-red-500">No</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Longitudinal Radar Tracking</td>
                  <td className="p-4 sm:p-5 text-emerald-600 font-bold">Automated</td>
                  <td className="p-4 sm:p-5 text-red-500">Manual Notes</td>
                  <td className="p-4 sm:p-5 text-red-500">None</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Proven Student Success
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Loved by College Grads & Career Changers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Priya Sharma',
                role: 'Software Engineer @ CloudScale',
                school: 'CS Grad 2025',
                quote:
                  'The voice mode forced me to stop freezing up during technical rounds. The AI pinpointed that I was missing hydration costs when explaining SSR, which actually came up in my real interview!',
                score: '94% on Final Mock',
              },
              {
                name: 'Marcus Chen',
                role: 'Full Stack Developer @ FinTech Hub',
                school: 'Bootcamp Graduate',
                quote:
                  'The suggested model answers are pure gold. Seeing exactly how a senior interviewer wants a response structured transformed my communication score from 68 to 91.',
                score: '91% on Final Mock',
              },
              {
                name: 'Jessica Williams',
                role: 'Data Analyst @ HealthMetrics',
                school: 'University of Michigan',
                quote:
                  'I loved uploading my resume and having the AI ask targeted questions about my thesis project and SQL optimizations. It felt 100% like a real hiring manager interview.',
                score: '89% on Final Mock',
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {t.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Frequently Asked Questions
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Got Questions? We’ve Got Answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-slate-900 dark:text-white flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-indigo-700 to-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Ready to Ace Your Next Technical & HR Round?
          </h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
            Join thousands of college graduates and ambitious developers mastering interview questions with real AI simulation.
          </p>
          <div className="pt-2">
            <Link
              to={user ? '/interview/new' : '/auth?mode=register'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-white text-blue-700 hover:bg-blue-50 shadow-xl transition-transform hover:scale-105"
            >
              <span>{user ? 'Start Your Practice Session' : 'Create Free Account Now'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base">PrepPulse AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering college students and job seekers through adaptive AI mock interviews, speech analysis, and hiring rubric evaluations.
            </p>
          </div>

          <div>
            <p className="font-bold text-white text-xs uppercase tracking-wider mb-3">Interview Categories</p>
            <ul className="space-y-2 text-xs">
              <li><Link to="/interview/new" className="hover:text-white">Technical Architecture</Link></li>
              <li><Link to="/interview/new" className="hover:text-white">Full Stack Engineering</Link></li>
              <li><Link to="/interview/new" className="hover:text-white">HR & Behavioral (STAR)</Link></li>
              <li><Link to="/interview/new" className="hover:text-white">Data Analyst & AI/ML</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-white text-xs uppercase tracking-wider mb-3">Platform</p>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link to="/analytics" className="hover:text-white">Performance Analytics</Link></li>
              <li><Link to="/profile" className="hover:text-white">Resume & Profile</Link></li>
              <li><Link to="/settings" className="hover:text-white">Settings & DB Schema</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-white text-xs uppercase tracking-wider mb-3">Technology</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by Google Gemini 3.8 Flash, Web Speech API, Express full-stack persistence, and Supabase database architecture.
            </p>
            <p className="text-[11px] text-slate-500 mt-4">
              © {new Date().getFullYear()} PrepPulse AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
