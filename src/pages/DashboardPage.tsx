import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
import { useAuth } from '../context/AuthContext.js';
import {
  PlayCircle,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  Calendar,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Interview, AnalyticsData } from '../types.js';

export const DashboardPage: React.FC = () => {
  const { user, profile, token } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const [intRes, anaRes] = await Promise.all([
          fetch('/api/interviews', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/analytics', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (intRes.ok) {
          const intData = await intRes.json();
          setInterviews(intData.interviews || []);
        }

        if (anaRes.ok) {
          const anaData = await anaRes.json();
          setAnalytics(anaData.analytics || null);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const recentInterviews = interviews.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Welcome Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-navy-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Preparation Platform</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome Back, {user?.full_name || 'Candidate'}!
              </h2>
              <p className="text-blue-100 text-sm sm:text-base max-w-xl">
                Ready to level up your technical and behavioral interview performance? Take a personalized mock session today.
              </p>
            </div>

            <Link
              to="/interview/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-white text-blue-700 hover:bg-blue-50 shadow-lg shadow-black/10 transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Start New Interview</span>
            </Link>
          </div>
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Interviews */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Interviews</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics?.totalInterviews ?? interviews.length}
              </p>
              <p className="text-[11px] text-slate-400">Lifetime mock sessions</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart2 className="w-6 h-6" />
            </div>
          </div>

          {/* Average Score */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Score</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics?.avgScore ? `${analytics.avgScore}%` : 'N/A'}
              </p>
              <p className="text-[11px] text-slate-400">Across completed sessions</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Highest Score */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Highest Score</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics?.highestScore ? `${analytics.highestScore}%` : 'N/A'}
              </p>
              <p className="text-[11px] text-slate-400">Personal peak milestone</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Completed Interviews */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Sessions</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics?.completedCount ?? interviews.filter(i => i.status === 'completed').length}
              </p>
              <p className="text-[11px] text-slate-400">Evaluated with reports</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Charts & Skills Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Performance Progress Chart (8 cols) */}
          <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Score Progression Over Time
                </h3>
                <p className="text-xs text-slate-500">Historical performance trend across interview rounds</p>
              </div>
              <Link to="/analytics" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                View Full Analytics →
              </Link>
            </div>

            {analytics?.scoreProgression && analytics.scoreProgression.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.scoreProgression}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      name="Overall Score (%)"
                      stroke="#2563EB"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#scoreGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center p-6 text-slate-400">
                <TrendingUp className="w-10 h-10 mb-2 opacity-40 text-blue-500" />
                <p className="text-sm font-semibold">No interview sessions recorded yet</p>
                <p className="text-xs mt-1">Complete your first practice session to visualize score progression.</p>
                <Link
                  to="/interview/new"
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white"
                >
                  Start First Interview
                </Link>
              </div>
            )}
          </div>

          {/* Technical Skills & Profile Overview (4 cols) */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Technical Skills
                </h3>
                <Link to="/profile" className="text-xs text-blue-600 hover:underline font-bold">
                  Edit
                </Link>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium">Core Stack:</p>
                <div className="flex flex-wrap gap-1.5">
                  {(profile?.technical_skills && profile.technical_skills.length > 0) ? (
                    profile.technical_skills.slice(0, 8).map(skill => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills listed yet</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 font-medium">Programming Languages:</p>
                <div className="flex flex-wrap gap-1.5">
                  {(profile?.programming_languages && profile.programming_languages.length > 0) ? (
                    profile.programming_languages.map(lang => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No languages configured</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mt-4 text-xs space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">Target Role</p>
              <p className="text-blue-600 dark:text-blue-400 font-semibold">{profile?.preferred_job_role || 'Software Engineer'}</p>
              <p className="text-slate-500 text-[11px] pt-1">
                {profile?.college ? `${profile.degree} • ${profile.college}` : 'Add education details in profile'}
              </p>
            </div>
          </div>
        </div>

        {/* Improvement & Recommended Practice Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Areas That Need Improvement */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <h3>Areas That Need Improvement</h3>
            </div>
            {analytics?.weaknesses && analytics.weaknesses.length > 0 ? (
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {analytics.weaknesses.map((weakness, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Complete more interview sessions to pinpoint targeted weak points and technical blindspots.
              </p>
            )}
          </div>

          {/* Recommended Practice Topics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-base">
              <BookOpen className="w-5 h-5" />
              <h3>Recommended Practice Topics</h3>
            </div>
            {analytics?.recommendedTopics && analytics.recommendedTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analytics.recommendedTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Topics will be recommended automatically based on areas you missed during your interview answers.
              </p>
            )}
          </div>
        </div>

        {/* Recent Interview Activity Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Interview Activity
            </h3>
            <Link to="/history" className="text-xs font-bold text-blue-600 hover:underline">
              View All History →
            </Link>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Interview Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Difficulty</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {recentInterviews.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </td>
                      <td className="p-3.5 text-xs text-slate-500">
                        {item.category}
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.difficulty === 'Advanced'
                            ? 'bg-red-50 text-red-600 dark:bg-red-950/40'
                            : item.difficulty === 'Intermediate'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                        }`}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-3.5">
                        {item.report ? (
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">
                            {item.report.overall_score}%
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">In Progress</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {item.report ? (
                          <Link
                            to={`/interview/report/${item.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            <span>View Report</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <Link
                            to={`/interview/session/${item.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                          >
                            <span>Resume</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
              <p className="text-sm font-semibold">No interviews completed yet</p>
              <p className="text-xs mt-1">Start a practice session to begin recording interview scores.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
