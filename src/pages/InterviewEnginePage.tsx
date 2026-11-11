import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
import { useAuth } from '../context/AuthContext.js';
import { SpeechRecognitionHandler } from '../components/voice/SpeechRecognitionHandler.js';
import { TextToSpeechHandler } from '../components/voice/TextToSpeechHandler.js';
import {
  Sparkles,
  Volume2,
  Clock,
  Send,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Brain,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { Interview, InterviewQuestion } from '../types.js';

export const InterviewEnginePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Answer state
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluatingAll, setIsEvaluatingAll] = useState(false);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [followUpPrompt, setFollowUpPrompt] = useState<{ text: string; context: string } | null>(null);

  // Timers
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(15 * 60);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showExitModal, setShowExitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load interview details & questions
  useEffect(() => {
    const fetchSession = async () => {
      if (!token || !id) return;
      try {
        const res = await fetch(`/api/interviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Interview session not found');
        }

        const data = await res.json();
        setInterview(data.interview);
        setQuestions(data.questions || []);
        setTimeRemainingSeconds(data.interview.duration_minutes * 60);

        // Preload any already submitted answer for current question
        if (data.answers && data.answers.length > 0) {
          const answeredCount = data.answers.length;
          if (answeredCount < data.questions.length) {
            setCurrentQuestionIndex(answeredCount);
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to initialize interview');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id, token]);

  // Overall session countdown timer
  useEffect(() => {
    if (loading || isEvaluatingAll) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isEvaluatingAll]);

  // Reset timer on question change
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setFollowUpPrompt(null);
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) {
      setErrorMessage('Please provide an answer before advancing to the next question.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    try {
      const res = await fetch(`/api/interviews/${id}/answer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          user_answer_text: currentAnswer.trim(),
          time_taken_seconds: timeSpent,
          request_follow_up: !followUpPrompt && currentAnswer.length > 60 && currentQuestionIndex < questions.length - 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save answer');

      // If AI proposed a contextual follow-up probe and user hasn't seen one yet
      if (data.followUp && !followUpPrompt) {
        setFollowUpPrompt({
          text: data.followUp.followUpText,
          context: data.followUp.context,
        });
        setCurrentAnswer('');
        setIsSubmitting(false);
        return;
      }

      // Otherwise move to next question or evaluate
      setCurrentAnswer('');
      setFollowUpPrompt(null);

      if (isLastQuestion) {
        await handleFinishInterview();
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    setIsEvaluatingAll(true);
    try {
      const res = await fetch(`/api/interviews/${id}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');

      navigate(`/interview/report/${id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete evaluation');
      setIsEvaluatingAll(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Connecting to AI Interview Engine...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isEvaluatingAll) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-24 h-24 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 animate-spin"></div>
            <Brain className="w-10 h-10 text-blue-600 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Evaluating Your Answers...
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Gemini 3.8 Flash is analyzing your technical accuracy, answer relevance, articulation, and problem-solving breakdown to generate your comprehensive performance report.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold inline-block">
            Generating 6-category rubric scores, strengths, weaknesses & model sample answers...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeQuestionText = followUpPrompt ? followUpPrompt.text : currentQuestion?.question_text;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* Top Control Bar: Progress & Timer */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Progress
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-28 sm:w-44 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / Math.max(1, questions.length)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Session Countdown */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-sm font-bold text-slate-700 dark:text-slate-200">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{formatTimer(timeRemainingSeconds)}</span>
            </div>

            {/* End Interview early */}
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>End Early</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2 font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* AI INTERVIEWER AVATAR & QUESTION CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            {/* Avatar & Speaking wave */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-sky-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/20 ${
                    isInterviewerSpeaking ? 'ring-4 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900 animate-pulse' : ''
                  }`}
                >
                  AI
                </div>
                {isInterviewerSpeaking && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-ping" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Senior AI Interviewer
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {interview?.job_role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {interview?.category} • {interview?.difficulty} Level
                </p>
              </div>
            </div>

            {/* Read Aloud Text-to-Speech Controller */}
            {activeQuestionText && (
              <TextToSpeechHandler
                textToSpeak={activeQuestionText}
                autoPlay={true}
                onSpeakingChange={setIsInterviewerSpeaking}
              />
            )}
          </div>

          {/* Follow-up banner if active */}
          {followUpPrompt && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2.5 text-xs text-indigo-800 dark:text-indigo-200 font-semibold">
              <MessageSquare className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Contextual Follow-up Probe: Expanding on your prior response</span>
            </div>
          )}

          {/* Main Question Display */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {currentQuestion?.category || 'Question'}
              </span>
              {currentQuestion?.rationale && (
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Focus: {currentQuestion.rationale}
                </span>
              )}
            </div>

            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              "{activeQuestionText}"
            </p>

            {currentQuestion?.suggested_points && currentQuestion.suggested_points.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Key concepts to touch on:</span>
                {currentQuestion.suggested_points.map((pt, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600"
                  >
                    {pt}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ANSWER INPUT SECTION */}
          <div className="space-y-4 pt-2">
            {interview?.answer_mode === 'voice' ? (
              /* VOICE INTERVIEW INTERFACE */
              <SpeechRecognitionHandler
                isVoiceMode={true}
                currentTranscript={currentAnswer}
                onTranscriptChange={setCurrentAnswer}
              />
            ) : (
              /* TEXT INTERVIEW INTERFACE */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Type your detailed answer below:</span>
                  <div className="flex items-center gap-3">
                    <span>{currentAnswer.split(/\s+/).filter(Boolean).length} words</span>
                    <span>{currentAnswer.length} chars</span>
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Structure your answer clearly: state core definitions, explain the mechanism, provide a concrete real-world scenario, and mention tradeoffs..."
                  className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base leading-relaxed"
                />
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentAnswer('')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Answer</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || !currentAnswer.trim()}
                onClick={handleAnswerSubmit}
                className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? 'Submitting...'
                    : isLastQuestion
                    ? 'Submit & Finish Interview'
                    : 'Submit & Next Question'}
                </span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Early Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              End Interview Early?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              You can evaluate your responses so far to generate an evaluation report based on completed answers, or cancel to continue practicing.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Continue Practice
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  handleFinishInterview();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                End & Evaluate Now
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
