import React, { useState } from 'react';
import { User, Calendar, Activity, ShieldCheck, Languages, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { PatientSummary, ClinicalVitals } from '../types/aegis';
import { AudioPlayerButton } from './AudioPlayerButton';

interface PatientOverviewCardProps {
  summary: PatientSummary;
  vitals?: ClinicalVitals;
  targetLanguage: string;
  confidenceScore?: number;
}

export const PatientOverviewCard: React.FC<PatientOverviewCardProps> = ({
  summary,
  vitals,
  targetLanguage,
  confidenceScore,
}) => {
  const [activeLangTab, setActiveLangTab] = useState<'english' | 'regional'>('english');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Banner / Demographics */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-lg flex-shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {summary.patient_name || 'Patient Recovery Plan'}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/30 text-indigo-200">
                  ID: {summary.extracted_patient_id || 'Extracted'}
                </span>
              </div>
              <p className="text-sm text-indigo-200/90 mt-1 flex items-center gap-2">
                <span className="font-semibold text-white">Diagnosis:</span>
                <span>{summary.diagnosis || 'Post-Discharge Care'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {summary.discharge_date && summary.discharge_date !== 'Data Not Provided in Upload' && (
              <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                <span>Discharge: {summary.discharge_date}</span>
              </div>
            )}
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Aegis Clinical Pipeline</span>
            </div>
            {typeof confidenceScore === 'number' && (
              <div className="px-3 py-1.5 rounded-lg bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 flex items-center gap-1.5 font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>AI Confidence: {confidenceScore}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Discharge Vitals Ribbon */}
        {vitals && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-200 font-semibold">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Vitals at Discharge:</span>
            </div>
            {vitals.bp && (
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-200 font-mono">
                BP: {vitals.bp}
              </span>
            )}
            {vitals.pulse && (
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-200 font-mono">
                HR: {vitals.pulse}
              </span>
            )}
            {vitals.spo2 && (
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-200 font-mono">
                SpO2: {vitals.spo2}
              </span>
            )}
            {vitals.temperature && (
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-200 font-mono">
                Temp: {vitals.temperature}
              </span>
            )}
            {vitals.allergies && vitals.allergies.length > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-rose-300 font-semibold">Allergies:</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-400/30 text-rose-200 font-medium">
                  {vitals.allergies.join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simplified Dual-Language Recovery Summary */}
      <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Patient Recovery Overview (5th-Grade Simplified)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Tabs */}
            <div className="inline-flex rounded-lg bg-slate-200 dark:bg-slate-800 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setActiveLangTab('english')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeLangTab === 'english'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setActiveLangTab('regional')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  activeLangTab === 'regional'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Languages className="w-3 h-3" />
                <span>{targetLanguage}</span>
              </button>
            </div>

            <AudioPlayerButton
              text={
                activeLangTab === 'english'
                  ? summary.simplified_english
                  : summary.simplified_indian_language || summary.simplified_english
              }
              label="Listen Aloud"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {activeLangTab === 'english' ? (
            <p className="whitespace-pre-line">{summary.simplified_english}</p>
          ) : (
            <p className="whitespace-pre-line font-medium text-slate-800 dark:text-slate-100">
              {summary.simplified_indian_language || 'Regional translation will appear here.'}
            </p>
          )}
        </div>

        {/* Deterministic Disclaimer Banner as per Blueprint */}
        <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-amber-800 dark:text-amber-300 font-medium">Clinical Disclaimer:</strong>{' '}
            This schedule is an automated organization of your uploaded discharge summary. Do not alter
            prescribed dosages without consulting your doctor.
          </p>
        </div>
      </div>
    </div>
  );
};
