import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface VoiceDictationProps {
  onTranscribed: (text: string) => void;
  isCompact?: boolean;
}

export const VoiceDictation: React.FC<VoiceDictationProps> = ({ onTranscribed, isCompact = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopMediaStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const stopMediaStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Audio Level Visualizer
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(updateLevel);
          }
        };
        updateLevel();
      } catch (audioErr) {
        console.warn('AudioContext visualization not available:', audioErr);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioForTranscription(audioBlob, mimeType);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error starting audio recording:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser or use the sample audio.'
          : 'Could not access microphone: ' + (err.message || 'Unknown error')
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopMediaStream();
    }
  };

  const sendAudioForTranscription = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setStatusMessage('Transcribing dictation with gemini-3.5-transcribe...');
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Data,
          mimeType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const result = await response.json();
      const transcribedText = result.text || '';

      if (transcribedText.trim()) {
        setStatusMessage('Successfully transcribed!');
        onTranscribed(transcribedText);
      } else {
        setStatusMessage('Audio recorded, but no speech was detected.');
      }
    } catch (err: any) {
      console.error('Transcription API error:', err);
      setErrorMessage('Transcription error: ' + (err.message || 'Failed'));
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Simulated doctor voice dictation for instant test
  const handleSimulateAudioDictation = () => {
    setIsTranscribing(true);
    setStatusMessage('Processing doctor voice dictation stream with gemini-3.5-transcribe...');
    setTimeout(() => {
      const sampleDictation = `Doctor dictation recorded at 16:30 PM:
Patient: Sunita Sen, 52-year-old female post laparoscopic cholecystectomy Day 1.
Vital signs stable. Hemoglobin 11.8, Afebrile.
Medication orders: 
Tab Cefuroxime 500mg orally twice daily for 5 days.
Tab Tramadol 50mg combined with Paracetamol 325mg as needed for severe pain, maximum three times a day.
Tab Omeprazole 20mg once daily before breakfast for 10 days.
Follow-up: 
Ultrasound abdomen in 8 days to check gallbladder fossa.
Visit surgical OPD on Day 12 for stitch inspection with Dr. Sen.
Care notes: Keep surgical dressings dry for 48 hours. Light diet, strictly low-fat.
Red flag warning: Contact emergency room immediately if patient develops fever above 101 Fahrenheit, severe jaundice, or intractable vomiting.`;
      
      onTranscribed(sampleDictation);
      setIsTranscribing(false);
      setStatusMessage('Doctor dictation transcribed successfully!');
    }, 900);
  };

  if (isCompact) {
    return (
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={isTranscribing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>Record Voice Note</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop ({formatSeconds(duration)})</span>
          </button>
        )}
        {isTranscribing && (
          <div className="flex items-center gap-1 text-xs text-slate-500 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Transcribing (gemini-3.5-transcribe)...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              Microphone Dictation
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                gemini-3.5-transcribe
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Speak discharge notes, clinical orders, or patient questions in any language
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulateAudioDictation}
          disabled={isRecording || isTranscribing}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          title="Simulate doctor voice dictation payload"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Insert Sample Dictation</span>
        </button>
      </div>

      {/* Recording Control & Waveform */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={isTranscribing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Mic className="w-4 h-4" />
            <span>Start Microphone Recording</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-900 dark:bg-rose-600 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Finish & Transcribe</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
                {formatSeconds(duration)}
              </span>
            </div>
          </div>
        )}

        {/* Real-time Level Bars */}
        {isRecording && (
          <div className="flex-1 flex items-center gap-1 h-6 w-full sm:w-auto overflow-hidden">
            {[...Array(16)].map((_, i) => {
              const height = Math.max(15, Math.min(100, audioLevel * (0.4 + (i % 3) * 0.3)));
              return (
                <div
                  key={i}
                  className="flex-1 bg-rose-500/80 rounded-full transition-all duration-75"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing with gemini-3.5-transcribe...</span>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
