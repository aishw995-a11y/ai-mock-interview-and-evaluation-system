import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Check, RefreshCw } from 'lucide-react';

interface SpeechRecognitionHandlerProps {
  onTranscriptChange: (text: string) => void;
  currentTranscript: string;
  isVoiceMode: boolean;
}

export const SpeechRecognitionHandler: React.FC<SpeechRecognitionHandlerProps> = ({
  onTranscriptChange,
  currentTranscript,
  isVoiceMode,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setPermissionError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const combined = (finalTranscript + interimTranscript).trim();
        if (combined) {
          onTranscriptChange(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
          setIsRecording(false);
        } else if (event.error === 'no-speech') {
          // ignore transient silence
        } else {
          setPermissionError(`Voice input notice: ${event.error}. You can also type your answer directly.`);
        }
      };

      recognition.onend = () => {
        // If still supposed to be recording, restart (speech recognition times out on silence)
        if (isRecording) {
          try {
            recognition.start();
          } catch {
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Failed to initialize speech recognition:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Timer & audio wave simulation when recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      // Simulate audio fluctuation for active wave animation
      const interval = setInterval(() => {
        setVolumeLevel(Math.floor(Math.random() * 60) + 30);
      }, 150);

      return () => {
        clearInterval(timerRef.current);
        clearInterval(interval);
      };
    } else {
      setVolumeLevel(0);
      setRecordingSeconds(0);
    }
  }, [isRecording]);

  const toggleRecording = () => {
    setPermissionError(null);
    if (!isSupported) {
      setPermissionError('Your browser does not support the Web Speech API. Please use Google Chrome, Edge, or type your answer.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        console.error('Stop error:', err);
      }
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Start error:', err);
        // Sometimes restarting requires re-instantiation
        try {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';
          rec.start();
          recognitionRef.current = rec;
          setIsRecording(true);
        } catch (e2) {
          setPermissionError('Unable to access microphone. Please ensure microphone permissions are granted.');
        }
      }
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isVoiceMode) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleRecording}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 shadow-sm ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span>{isRecording ? 'Stop Recording' : 'Start Recording Voice'}</span>
          </button>

          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span>Recording: {formatSeconds(recordingSeconds)}</span>
            </div>
          )}
        </div>

        {/* Real-time audio waveform visualizer */}
        <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500 font-mono mr-1">Mic Level</span>
          <div className={`w-1 rounded-full transition-all duration-150 ${isRecording ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`} style={{ height: isRecording ? `${Math.max(6, volumeLevel * 0.4)}px` : '6px' }}></div>
          <div className={`w-1 rounded-full transition-all duration-150 ${isRecording ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`} style={{ height: isRecording ? `${Math.max(6, volumeLevel * 0.8)}px` : '8px' }}></div>
          <div className={`w-1 rounded-full transition-all duration-150 ${isRecording ? 'bg-sky-400' : 'bg-slate-300 dark:bg-slate-700'}`} style={{ height: isRecording ? `${Math.max(6, volumeLevel * 0.9)}px` : '6px' }}></div>
          <div className={`w-1 rounded-full transition-all duration-150 ${isRecording ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`} style={{ height: isRecording ? `${Math.max(6, volumeLevel * 0.6)}px` : '10px' }}></div>
          <div className={`w-1 rounded-full transition-all duration-150 ${isRecording ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`} style={{ height: isRecording ? `${Math.max(6, volumeLevel * 0.4)}px` : '6px' }}></div>
        </div>
      </div>

      {permissionError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-medium">Microphone Notice</p>
            <p className="text-xs mt-0.5 opacity-90">{permissionError}</p>
          </div>
        </div>
      )}

      {/* Editable transcribed text area */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Recognized Speech (You can edit or type to refine your answer):</span>
          <span>{currentTranscript.split(/\s+/).filter(Boolean).length} words</span>
        </div>
        <textarea
          rows={5}
          value={currentTranscript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder={isRecording ? "Listening to your voice... Speak clearly into your microphone." : "Click 'Start Recording Voice' and speak, or type your response here..."}
          className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base leading-relaxed resize-y"
        />
      </div>
    </div>
  );
};
