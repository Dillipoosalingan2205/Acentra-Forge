import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Mic,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  Check,
  ShieldCheck,
  Languages,
  Sliders,
  FileCode,
  FileSpreadsheet,
  X,
  Eye,
  FileUp,
} from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';
import { VoiceDictation } from './VoiceDictation';

export interface AnalyzePayload {
  text: string;
  fileData?: string;
  mimeType?: string;
  fileName?: string;
  language: string;
  modelChoice: string;
}

interface DischargeInputSectionProps {
  onAnalyze: (payload: AnalyzePayload) => Promise<void>;
  isLoading: boolean;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

interface AttachedFile {
  name: string;
  size: number;
  mimeType: string;
  dataUrl: string;
}

export const DischargeInputSection: React.FC<DischargeInputSectionProps> = ({
  onAnalyze,
  isLoading,
  selectedLanguage,
  onLanguageChange,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [modelChoice, setModelChoice] = useState<string>('gemini-3.5-flash');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectSample = (sampleId: string) => {
    const found = SAMPLE_CASES.find((s) => s.id === sampleId);
    if (found) {
      setInputText(found.content);
      setActiveSampleId(sampleId);
      setAttachedFile(null);
      setValidationError(null);
    }
  };

  const processFile = (file: File) => {
    setValidationError(null);
    setActiveSampleId(null);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const reader = new FileReader();

    if (isPdf) {
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAttachedFile({
          name: file.name,
          size: file.size,
          mimeType: 'application/pdf',
          dataUrl,
        });
      };
      reader.readAsDataURL(file);
    } else {
      // For text-based files, also read as text into the textarea for easy inspection
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setInputText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLoadSamplePdf = async () => {
    try {
      setValidationError(null);
      const res = await fetch('/sample-discharge-summary.pdf');
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAttachedFile({
          name: 'Apollo_Cholecystectomy_Discharge_Summary.pdf',
          size: blob.size,
          mimeType: 'application/pdf',
          dataUrl,
        });
        setActiveSampleId(null);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load sample PDF:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasText = inputText.trim().length > 0;
    const hasFile = !!attachedFile;

    if (!hasText && !hasFile) {
      setValidationError(
        'No patient record detected. Please upload a PDF, paste a discharge summary, or dictate notes to generate a recovery plan.'
      );
      return;
    }

    setValidationError(null);
    await onAnalyze({
      text: inputText,
      fileData: attachedFile?.dataUrl,
      mimeType: attachedFile?.mimeType,
      fileName: attachedFile?.name,
      language: selectedLanguage,
      modelChoice,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Intro Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Agentic Clinical Extraction Engine
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              PDF &amp; Multimodal Enabled
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Ingest Clinical Discharge Document
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Upload hospital summaries as PDF, enter physician dictated notes, or paste clinical records.
            Aegis parses PDF document structures, tables, medications, and warning signs directly with Gemini.
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Upload PDF / File</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showVoiceRecorder
                ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <Mic className="w-4 h-4 text-rose-600" />
            <span>Voice Dictation (gemini-3.5-transcribe)</span>
          </button>
        </div>
      </div>

      {/* Voice Dictation Drawer */}
      {showVoiceRecorder && (
        <VoiceDictation
          onTranscribed={(transcribedText) => {
            setInputText((prev) => (prev ? prev + '\n\n' + transcribedText : transcribedText));
            setActiveSampleId(null);
            setValidationError(null);
          }}
        />
      )}

      {/* 1-Click Testing Samples from Blueprint */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>One-Click Test Cases &amp; Sample PDF</span>
          </label>
          <button
            type="button"
            onClick={handleLoadSamplePdf}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Load Hospital Sample PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_CASES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeSampleId === sample.id
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      sample.hasEscalation
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    }`}
                  >
                    {sample.badge}
                  </span>
                  {activeSampleId === sample.id && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {sample.patient}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {sample.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop PDF Attachment Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]'
            : attachedFile
            ? 'border-emerald-400 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20'
            : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 hover:border-slate-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.json,.csv"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {attachedFile ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-300 dark:border-emerald-800/60 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-rose-200 dark:border-rose-900">
                PDF
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {attachedFile.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    {formatFileSize(attachedFile.size)}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                  ✓ PDF attached for Gemini multimodal extraction
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  const win = window.open();
                  if (win) {
                    win.document.write(
                      `<iframe src="${attachedFile.dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                    );
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                title="Remove attached PDF"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 sm:py-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Drag &amp; drop patient discharge PDF here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 dark:text-indigo-400 underline font-semibold cursor-pointer"
              >
                browse files
              </button>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF documents up to 50MB, text notes, and lab reports
            </p>
          </div>
        )}
      </div>

      {/* Main Text Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {attachedFile
                  ? 'Optional Clinician Notes / Addendum (Combined with PDF)'
                  : 'Discharge Summary Text / EHR Document Stream'}
              </span>
            </label>

            {inputText && (
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setActiveSampleId(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear Text
              </button>
            )}
          </div>

          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setValidationError(null);
            }}
            rows={attachedFile ? 4 : 8}
            placeholder={
              attachedFile
                ? 'Optional: Add any doctor comments, oral addendums, or phone instructions to process alongside the uploaded PDF...'
                : `Paste clinical discharge note, surgery summary, prescription list, or dictation text here...

Example:
PATIENT: Rahul Sharma | DISCHARGE DATE: 2026-10-08
DIAGNOSIS: Laparoscopic Cholecystectomy
MEDICATIONS: Amoxicillin 625mg BID x 5 days, Paracetamol 650mg PRN
FOLLOW-UP: Ultrasound & LFT in 10 days; Surgical OPD in 2 weeks...`
            }
            className="w-full text-xs sm:text-sm font-mono p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Zero-Demo Policy Error:</strong> {validationError}
            </p>
          </div>
        )}

        {/* Pipeline Configuration Bar & Submit */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Target Language Selector */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
              <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Target Translation:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-transparent font-bold text-indigo-600 dark:text-indigo-400 focus:outline-hidden cursor-pointer"
              >
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* AI Model Choice */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Pipeline Model:</span>
              <select
                value={modelChoice}
                onChange={(e) => setModelChoice(e.target.value)}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (Standard Agentic &amp; PDF)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Clinical)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting from {attachedFile ? 'PDF' : 'Document'}...</span>
              </>
            ) : (
              <>
                <span>Orchestrate Recovery Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
