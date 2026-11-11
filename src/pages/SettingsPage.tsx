import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  Settings,
  Lock,
  Mic,
  Volume2,
  Moon,
  Sun,
  Shield,
  Database,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  KeyRound,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile, updateProfile, token, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Password update form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [updatingPass, setUpdatingPass] = useState(false);

  // Mic test tool
  const [testingMic, setTestingMic] = useState(false);
  const [micTestText, setMicTestText] = useState('');
  const [micSupportNotice, setMicSupportNotice] = useState<string | null>(null);

  // TTS test tool
  const [ttsTestPhrase, setTtsTestPhrase] = useState('Welcome to PrepPulse AI. Your voice and answers are sounding crystal clear.');
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  // SQL schema state
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    fetch('/api/system/schema-sql')
      .then(res => res.text())
      .then(data => setSqlSchema(data))
      .catch(() => {});
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setUpdatingPass(true);
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPassSuccess(false), 4000);
    } catch (err: any) {
      setPassError(err.message || 'Error updating password');
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleTestMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupportNotice('Web Speech API is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (testingMic) {
      setTestingMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setTestingMic(true);
        setMicTestText('Listening... Say something!');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMicTestText(`Recognized: "${transcript}"`);
      };

      recognition.onerror = (event: any) => {
        setMicTestText(`Error: ${event.error}`);
        setTestingMic(false);
      };

      recognition.onend = () => {
        setTestingMic(false);
      };

      recognition.start();
    } catch (err) {
      setMicSupportNotice('Microphone test could not start. Please verify microphone permission.');
      setTestingMic(false);
    }
  };

  const handleTestTTS = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsTestPhrase);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsTtsPlaying(true);
    utterance.onend = () => setIsTtsPlaying(false);
    utterance.onerror = () => setIsTtsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlSchema], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase_interview_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-blue-600" />
            <span>Platform Settings</span>
          </h2>
          <p className="text-sm text-slate-500">
            Manage account security, audio hardware testing, theme appearance, and database configuration.
          </p>
        </div>

        {/* SECTION 1: THEME APPEARANCE */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <span>Interface Appearance</span>
          </h3>
          <p className="text-xs text-slate-500">
            Select your preferred color theme for comfortable daytime or low-light practice sessions.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md pt-1">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-center transition-all ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-6 h-6 mx-auto mb-1 text-amber-500" />
              <span className="text-sm">Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-center transition-all ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-950/60 text-blue-200 font-bold ring-2 ring-blue-500'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-6 h-6 mx-auto mb-1 text-sky-400" />
              <span className="text-sm">Dark Mode</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: AUDIO HARDWARE TESTING */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-600" />
            <span>Voice & Audio Hardware Diagnostic</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Microphone test */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                  Microphone Test
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Web Speech API</span>
              </div>
              <p className="text-xs text-slate-500">
                Click test and speak into your mic to verify browser recognition accuracy.
              </p>
              <button
                type="button"
                onClick={handleTestMic}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  testingMic
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{testingMic ? 'Listening (Speak Now)...' : 'Test Microphone'}</span>
              </button>

              {micTestText && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                  {micTestText}
                </div>
              )}
              {micSupportNotice && (
                <p className="text-xs text-amber-600 font-medium">{micSupportNotice}</p>
              )}
            </div>

            {/* Text-to-speech test */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                  Speaker / AI Voice Test
                </span>
                <span className="text-[10px] text-slate-400 font-mono">SpeechSynthesis</span>
              </div>
              <p className="text-xs text-slate-500">
                Test the interviewer's voice audio output volume and pronunciation.
              </p>
              <button
                type="button"
                onClick={handleTestTTS}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isTtsPlaying
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isTtsPlaying ? 'Playing Audio...' : 'Test Interviewer Voice'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: CHANGE PASSWORD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            <span>Account Security & Password</span>
          </h3>

          {passSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Password updated successfully!</span>
            </div>
          )}

          {passError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPass}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
            >
              {updatingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* SECTION 4: DATABASE SCHEMA & SUPABASE DEPLOYMENT */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Supabase PostgreSQL Schema & RLS Setup</span>
              </h3>
              <p className="text-xs text-slate-500">
                Production-ready SQL DDL with profiles, interviews, questions, answers, evaluation_reports, and Row Level Security policies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSql}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .sql</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-xs max-h-56 overflow-y-auto border border-slate-800">
            <pre className="whitespace-pre-wrap">{sqlSchema || '-- Loading database schema...'}</pre>
          </div>
        </div>

        {/* SECTION 5: ACCOUNT & SESSION DANGER ZONE */}
        <div className="p-6 sm:p-8 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-4">
          <h3 className="text-base font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            <span>Account Session</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Log out of your current device session. Your profile and interview evaluation history remain safely preserved.
          </p>

          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
          >
            Log Out of Session
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};
