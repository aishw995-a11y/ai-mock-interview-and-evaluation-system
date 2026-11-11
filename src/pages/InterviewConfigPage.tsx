import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Sparkles,
  Mic,
  FileText,
  Clock,
  Layers,
  Code2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  PlayCircle,
  Upload,
} from 'lucide-react';

export const InterviewConfigPage: React.FC = () => {
  const { profile, token } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState<
    'Technical Interview' | 'HR Interview' | 'Behavioral Interview' | 'Communication Skills' | 'Programming Interview'
  >('Technical Interview');

  const [jobRole, setJobRole] = useState(profile?.preferred_job_role || 'Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [answerMode, setAnswerMode] = useState<'voice' | 'text'>('voice');
  const [programmingLanguage, setProgrammingLanguage] = useState(
    profile?.programming_languages?.[0] || 'TypeScript'
  );
  const [useSavedProfile, setUseSavedProfile] = useState(true);
  const [resumeText, setResumeText] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedRoles = [
    'Software Developer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Data Analyst',
    'AI/ML Engineer',
    'Python Developer',
    'Java Developer',
    'Custom Job Role',
  ];

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const effectiveRole = jobRole === 'Custom Job Role' ? customRole.trim() : jobRole;
    if (!effectiveRole) {
      setError('Please specify a valid job role.');
      return;
    }

    setIsCreating(true);

    try {
      const res = await fetch('/api/interviews/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          job_role: effectiveRole,
          difficulty,
          duration_minutes: durationMinutes,
          answer_mode: answerMode,
          programming_language: programmingLanguage,
          resume_text: resumeText.trim() || undefined,
          use_saved_profile: useSavedProfile,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start interview session');
      }

      navigate(`/interview/session/${data.interview.id}`);
    } catch (err: any) {
      setError(err.message || 'Error generating interview questions.');
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Simulation Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Configure Your Mock Interview
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Customize target role, difficulty, interview category, and voice settings. Our AI interviewer will generate personalized questions tailored to your profile.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2.5 font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {isCreating ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 animate-spin"></div>
              <Sparkles className="w-8 h-8 text-blue-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Preparing Your Interview Session...
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Gemini 3.8 Flash is analyzing the {jobRole} requirements, factoring in {difficulty} criteria, and synthesizing targeted technical questions.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleStartInterview} className="space-y-8">
            {/* STEP 1: INTERVIEW CATEGORY */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Select Interview Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 'Technical Interview', title: 'Technical Interview', desc: 'Architecture, engineering tradeoffs, system mechanics' },
                  { id: 'HR Interview', title: 'HR & Cultural Fit', desc: 'Background, motivation, career vision, culture' },
                  { id: 'Behavioral Interview', title: 'Behavioral (STAR)', desc: 'Conflict resolution, leadership, adversity' },
                  { id: 'Communication Skills', title: 'Communication Skills', desc: 'Clarity, articulation, technical explanation' },
                  { id: 'Programming Interview', title: 'Programming & Logic', desc: 'Algorithms, data structures, language nuances' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      category === cat.id
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{cat.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2: JOB ROLE */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                2. Target Job Role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {predefinedRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setJobRole(role)}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      jobRole === role
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {jobRole === 'Custom Job Role' && (
                <div className="pt-2">
                  <input
                    type="text"
                    required
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Enter custom job role (e.g. Cloud Security Architect, iOS Engineer)"
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* STEP 3: DIFFICULTY & DURATION & MODE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Difficulty */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  3. Difficulty Level
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'Beginner', desc: 'Entry-level fundamentals' },
                    { id: 'Intermediate', desc: 'Production practical scenarios' },
                    { id: 'Advanced', desc: 'Architecture & edge cases' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id as any)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                        difficulty === d.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{d.id}</p>
                      <p className="text-[10px] text-slate-400">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  4. Session Duration
                </label>
                <div className="space-y-2">
                  {[
                    { mins: 5, label: '5 Minutes (3 Questions)' },
                    { mins: 10, label: '10 Minutes (4 Questions)' },
                    { mins: 15, label: '15 Minutes (5 Questions)' },
                    { mins: 30, label: '30 Minutes (7 Questions)' },
                  ].map((dur) => (
                    <button
                      key={dur.mins}
                      type="button"
                      onClick={() => setDurationMinutes(dur.mins)}
                      className={`w-full p-2.5 rounded-xl border text-center text-xs transition-all ${
                        durationMinutes === dur.mins
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Answer Mode */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  5. Interaction Mode
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setAnswerMode('voice')}
                    className={`w-full p-3 rounded-xl border text-left text-xs flex items-center gap-3 transition-all ${
                      answerMode === 'voice'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Voice Mode</p>
                      <p className="text-[10px] text-slate-500">Live Speech-to-Text</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnswerMode('text')}
                    className={`w-full p-3 rounded-xl border text-left text-xs flex items-center gap-3 transition-all ${
                      answerMode === 'text'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Text Mode</p>
                      <p className="text-[10px] text-slate-500">Keyboard typing</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 4: LANGUAGE & RESUME CUSTOMIZATION */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                6. Customization & Personalization
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Programming Language
                  </label>
                  <select
                    value={programmingLanguage}
                    onChange={(e) => setProgrammingLanguage(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                  >
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="Go">Go (Golang)</option>
                    <option value="Rust">Rust</option>
                    <option value="SQL">SQL & Database Internals</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="savedProfileCheck"
                    checked={useSavedProfile}
                    onChange={(e) => setUseSavedProfile(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="savedProfileCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Factor in my saved profile skills & projects ({profile?.technical_skills?.length || 0} skills)
                  </label>
                </div>
              </div>

              {/* Optional Resume paste */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Optional: Paste Resume / CV Excerpt for Deeper Tailoring
                  </span>
                  <span className="text-slate-400">PDF or Text format</span>
                </div>
                <textarea
                  rows={3}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste relevant resume experience, capstone projects, or specific tools..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Generate Questions & Start Interview</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};
