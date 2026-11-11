import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface TextToSpeechHandlerProps {
  textToSpeak: string;
  autoPlay?: boolean;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export const TextToSpeechHandler: React.FC<TextToSpeechHandlerProps> = ({
  textToSpeak,
  autoPlay = true,
  onSpeakingChange,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    if (autoPlay && !isMuted && textToSpeak) {
      speak(textToSpeak);
    }

    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    };
  }, [textToSpeak]);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window) || isMuted) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // comfortable natural pacing
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      onSpeakingChange?.(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleMute = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    }
    setIsMuted(!isMuted);
  };

  const handleReplay = () => {
    if (isMuted) setIsMuted(false);
    speak(textToSpeak);
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleReplay}
        title="Replay question audio"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          isSpeaking
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{isSpeaking ? 'Reading Aloud...' : 'Read Aloud'}</span>
      </button>

      <button
        type="button"
        onClick={handleToggleMute}
        title={isMuted ? 'Unmute AI interviewer' : 'Mute AI interviewer'}
        className={`p-1.5 rounded-lg border text-xs transition-colors ${
          isMuted
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
        }`}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
