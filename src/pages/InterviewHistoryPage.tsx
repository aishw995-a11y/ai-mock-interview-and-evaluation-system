import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
import { useAuth } from '../context/AuthContext.js';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  ArrowRight,
  Trash2,
  PlayCircle,
  FileText,
} from 'lucide-react';
import { Interview } from '../types.js';

export const InterviewHistoryPage: React.FC = () => {
  const { token } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchInterviews = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/interviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInterviews(data.interviews || []);
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [token]);

  const handleDelete = async (interviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this interview record?')) return;
    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInterviews(interviews.filter(i => i.id !== interviewId));
      }
    } catch (err) {
      console.error('Failed to delete interview:', err);
    }
  };

  // Filter & Search logic
  const filtered = interviews.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.job_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'All' || item.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date_desc') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'date_asc') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sortBy === 'score_desc') {
      return (b.report?.overall_score || 0) - (a.report?.overall_score || 0);
    }
    if (sortBy === 'score_asc') {
      return (a.report?.overall_score || 0) - (b.report?.overall_score || 0);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-7 h-7 text-blue-600" />
              <span>Interview History</span>
            </h2>
            <p className="text-sm text-slate-500">
              Review and reopen all your previous mock interviews and comprehensive AI evaluations.
            </p>
          </div>

          <Link
            to="/interview/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
          >
            <PlayCircle className="w-4 h-4" />
            <span>New Interview</span>
          </Link>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search role or keyword..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value="All">All Categories</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="HR Interview">HR Interview</option>
                <option value="Behavioral Interview">Behavioral Interview</option>
                <option value="Communication Skills">Communication Skills</option>
                <option value="Programming Interview">Programming Interview</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value="All">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="score_desc">Highest Score</option>
                <option value="score_asc">Lowest Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results List / Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {paginated.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 rounded-l-xl">Role & Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Score</th>
                    <th className="p-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {paginated.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <div>
                          <span>{item.job_role}</span>
                          <span className="text-xs text-slate-400 block font-normal">
                            Mode: {item.answer_mode === 'voice' ? '🎙️ Voice' : '⌨️ Text'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {item.category}
                      </td>
                      <td className="p-4">
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
                      <td className="p-4 text-xs text-slate-500">
                        {item.duration_minutes} mins
                      </td>
                      <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-4">
                        {item.report ? (
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">
                            {item.report.overall_score}%
                          </span>
                        ) : (
                          <span className="text-xs text-amber-500 font-semibold">In Progress</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.report ? (
                            <Link
                              to={`/interview/report/${item.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-colors"
                            >
                              <span>View Report</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <Link
                              to={`/interview/session/${item.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 text-xs font-bold"
                            >
                              <span>Resume</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
              <p className="text-sm font-semibold">No interviews match your filters</p>
              <p className="text-xs mt-1">Try resetting the search terms or category selector.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} records
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
