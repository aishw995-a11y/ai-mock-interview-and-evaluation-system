import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
import { useAuth } from '../context/AuthContext.js';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Printer,
  ChevronDown,
  ChevronUp,
  Brain,
  MessageSquare,
  Sparkles,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { EvaluationReport, Interview } from '../types.js';

export const EvaluationReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  useEffect(() => {
    const fetchReport = async () => {
      if (!token || !id) return;
      try {
        const res = await fetch(`/api/interviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load evaluation report');

        const data = await res.json();
        setInterview(data.interview);
        setReport(data.report || null);

        if (data.report && data.report.overall_score >= 80) {
          // Trigger celebratory confetti
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {}
        }
      } catch (err: any) {
        setError(err.message || 'Error loading report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Evaluation Report...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 space-y-4">
          <p className="text-red-600 font-bold">{error || 'Evaluation report not found.'}</p>
          <Link to="/dashboard" className="text-blue-600 hover:underline text-sm font-semibold">
            Return to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const categoryScores = [
    { title: 'Technical Knowledge', score: report.technical_score, desc: 'Conceptual accuracy & depth' },
    { title: 'Answer Relevance', score: report.relevance_score, desc: 'Targeted prompt adherence' },
    { title: 'Communication Skills', score: report.communication_score, desc: 'Structure, clarity & pacing' },
    { title: 'Problem Solving', score: report.problem_solving_score, desc: 'Analytical tradeoff reasoning' },
    { title: 'Grammar & Language', score: report.language_score, desc: 'Vocabulary & syntax precision' },
    { title: 'Confidence & Clarity', score: report.confidence_score, desc: 'Speech indicators & firmness' },
  ];

  const radarData = [
    { subject: 'Technical', A: report.technical_score, fullMark: 100 },
    { subject: 'Relevance', A: report.relevance_score, fullMark: 100 },
    { subject: 'Communication', A: report.communication_score, fullMark: 100 },
    { subject: 'Problem Solving', A: report.problem_solving_score, fullMark: 100 },
    { subject: 'Grammar', A: report.language_score, fullMark: 100 },
    { subject: 'Confidence', A: report.confidence_score, fullMark: 100 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 55) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200';
    if (score >= 70) return 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200';
    if (score >= 55) return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200';
    return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200';
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              AI Assessment Report
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {interview?.title || 'Mock Interview Evaluation'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Conducted on {new Date(report.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} • {interview?.difficulty} Level
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Download / Print PDF</span>
            </button>
            <Link
              to="/interview/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Interview</span>
            </Link>
          </div>
        </div>

        {/* OVERALL PERFORMANCE HERO & RADIAL SCORE */}
        <div className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Radial score gauge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Circular gauge */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  strokeWidth="8"
                  className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * report.overall_score) / 100}
                  strokeLinecap="round"
                  className="stroke-blue-600 fill-none transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {report.overall_score}
                </span>
                <span className="text-xs font-semibold text-slate-400">OUT OF 100</span>
              </div>
            </div>

            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadgeBg(report.overall_score)}`}>
                {report.overall_score >= 85 ? 'Exceptional Candidate' : report.overall_score >= 70 ? 'Interview Ready' : 'Needs Targeted Practice'}
              </span>
            </div>
          </div>

          {/* Executive Summary & Radar */}
          <div className="md:col-span-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Executive Hiring Evaluation</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {report.summary}
            </p>

            {/* Radar Visualizer */}
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Radar
                    name="Candidate Score"
                    dataKey="A"
                    stroke="#2563EB"
                    fill="#3B82F6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 6 CATEGORY-WISE PERFORMANCE CARDS */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Category Breakdown Scores
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {categoryScores.map((cat, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5 text-center"
              >
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight truncate">
                  {cat.title}
                </p>
                <p className={`text-2xl font-extrabold ${getScoreColor(cat.score)}`}>
                  {cat.score}%
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* STRENGTHS, WEAKNESSES & MISSING POINTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Strengths */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <h4>Noticed Strengths</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {report.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <h4>Areas to Tighten</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {report.weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Points */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Lightbulb className="w-4 h-4" />
              <h4>Key Points You Missed</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {report.missing_points.map((mp, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>{mp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* QUESTION-BY-QUESTION IN-DEPTH ACCORDION */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>Question-by-Question Detailed Feedback & Model Answers</span>
          </h3>

          <div className="space-y-3">
            {report.question_evaluations.map((qe, idx) => {
              const isExpanded = expandedQuestion === idx;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Question {idx + 1}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getScoreBadgeBg(qe.score)}`}>
                          Score: {qe.score}%
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white text-base">
                        {qe.question_text}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-5">
                      {/* User's Answer */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Your Submitted Answer:
                        </p>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic">
                          "{qe.user_answer}"
                        </p>
                      </div>

                      {/* AI Feedback */}
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          AI Interviewer Feedback:
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {qe.feedback}
                        </p>
                      </div>

                      {/* Missing concepts */}
                      {qe.missing_points && qe.missing_points.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            Concepts To Include Next Time:
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {qe.missing_points.map((pt, pIdx) => (
                              <span
                                key={pIdx}
                                className="px-2.5 py-1 rounded-lg text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              >
                                {pt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Better Way to Answer (Model Response) */}
                      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-200 text-xs font-bold uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>Better Way to Answer (Model Response):</span>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-100 leading-relaxed">
                          {qe.suggested_answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RECOMMENDED LEARNING TOPICS */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3>Personalized Learning Roadmap</h3>
          </div>
          <p className="text-xs text-slate-500">
            Based on gaps in this session, our AI recommends studying these key topics before your next interview round:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.recommended_topics.map((topic, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2.5"
              >
                <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {i + 1}
                </span>
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM NAV BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 no-print">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/history"
              className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
            >
              View All History
            </Link>
            <Link
              to="/interview/new"
              className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20"
            >
              Start New Mock Interview
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
