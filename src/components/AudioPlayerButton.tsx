import React, { useState, useRef } from 'react';
import { Volume2, Loader2, Square } from 'lucide-react';

interface AudioPlayerButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  text,
  label = 'Listen',
  className = '',
  size = 'sm',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error('TTS request failed');
      }

      const data = await res.json();
      if (!data.audioBase64) {
        throw new Error('No audio returned');
      }

      const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('TTS playback error, falling back to speech synthesis:', err);
      // Fallback to browser SpeechSynthesis if server TTS has an issue
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      onClick={handlePlay}
      disabled={isLoading}
      title={isPlaying ? 'Stop audio' : 'Listen with Gemini Voice'}
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors cursor-pointer ${
        isSmall ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5'
      } ${
        isPlaying
          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800'
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} animate-spin`} />
      ) : isPlaying ? (
        <Square className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} fill-current`} />
      ) : (
        <Volume2 className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'}`} />
      )}
      <span>{isLoading ? 'Loading...' : isPlaying ? 'Stop' : label}</span>
    </button>
  );
};
