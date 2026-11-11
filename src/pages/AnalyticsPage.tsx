import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
import { useAuth } from '../context/AuthContext.js';
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { AnalyticsData } from '../types.js';

export const AnalyticsPage: React.FC = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.analytics || null);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Calculating Performance Analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            <span>Performance Analytics</span>
          </h2>
          <p className="text-sm text-slate-500">
            Longitudinal telemetry tracking your technical readiness, speech pacing, and skill trajectory across interview sessions.
          </p>
        </div>

        {/* 4 KPI Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Score</span>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {analytics?.avgScore ? `${analytics.avgScore}%` : 'N/A'}
            </p>
            <p className="text-[11px] text-slate-400">Target benchmark: 80%+</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Improvement Rate</span>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {analytics?.improvementPercentage ? `+${analytics.improvementPercentage}%` : '0%'}
              </p>
              {analytics?.improvementPercentage && analytics.improvementPercentage > 0 ? (
                <ArrowUpRight className="w-6 h-6 text-emerald-500" />
              ) : null}
            </div>
            <p className="text-[11px] text-slate-400">Growth from first session to latest</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Highest Score</span>
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {analytics?.highestScore ? `${analytics.highestScore}%` : 'N/A'}
            </p>
            <p className="text-[11px] text-slate-400">Personal peak performance</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Sessions</span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics?.completedCount ?? 0}
            </p>
            <p className="text-[11px] text-slate-400">Fully evaluated rounds</p>
          </div>
        </div>

        {/* CHART 1: SCORE PROGRESSION MULTI-LINE CHART */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Score Progression Over Time
            </h3>
            <p className="text-xs text-slate-500">
              Tracking Overall Score, Technical Knowledge, and Communication Articulation over your practice journey.
            </p>
          </div>

          {analytics?.scoreProgression && analytics.scoreProgression.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.scoreProgression}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="session" stroke="#94a3b8" fontSize={11} />
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
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Overall Score (%)"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="technical"
                    name="Technical Depth (%)"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="communication"
                    name="Communication (%)"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              Complete at least two interviews to render progression trends.
            </div>
          )}
        </div>

        {/* 2-COLUMN SECTION: RADAR ANALYSIS & CATEGORY COMPARISON */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart: Skill Competencies */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Rubric Competency Radar
              </h3>
              <p className="text-xs text-slate-500">Holistic balance across all 6 core evaluation pillars</p>
            </div>

            {analytics?.radarMetrics && analytics.radarMetrics.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analytics.radarMetrics}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                    <PolarRadiusAxis domain={[0, 100]} stroke="#94a3b8" />
                    <Radar
                      name="Average Score"
                      dataKey="value"
                      stroke="#2563EB"
                      fill="#3B82F6"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">No radar metrics available.</div>
            )}
          </div>

          {/* Bar Chart: Performance by Category */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category-Wise Performance
              </h3>
              <p className="text-xs text-slate-500">Average scores across different interview formats</p>
            </div>

            {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
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
                    <Bar dataKey="averageScore" name="Avg Score (%)" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                No category breakdown data available yet.
              </div>
            )}
          </div>
        </div>

        {/* STRONGEST VS WEAKEST SKILLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strongest Skills */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <h3>Consistently Strong Competencies</h3>
            </div>
            {analytics?.strengths && analytics.strengths.length > 0 ? (
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {analytics.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No strength trends recorded yet.</p>
            )}
          </div>

          {/* Weakest Skills */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <h3>Identified Weak Points</h3>
            </div>
            {analytics?.weaknesses && analytics.weaknesses.length > 0 ? (
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {analytics.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No weakness patterns recorded yet.</p>
            )}
          </div>
        </div>

        {/* AI ACTIONABLE RECOMMENDATIONS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-base">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3>Actionable Preparation Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics?.recommendedTopics && analytics.recommendedTopics.length > 0 ? (
              analytics.recommendedTopics.map((topic, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1"
                >
                  <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                    Priority {i + 1}
                  </span>
                  <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {topic}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Focus on real-world system tradeoffs and structural framing.
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">Recommendations will populate after more practice rounds.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
