import React, { useState } from 'react';
import { AlertOctagon, PhoneCall, ChevronDown, ChevronUp, ShieldAlert, HeartPulse } from 'lucide-react';
import { WarningSign } from '../types/aegis';

interface EmergencyBannerProps {
  warnings: WarningSign[];
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ warnings }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!warnings || warnings.length === 0) return null;

  const hasImmediateEmergency = warnings.some((w) => w.urgency.toLowerCase().includes('immediate'));

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
        hasImmediateEmergency
          ? 'bg-rose-50/95 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/80 text-rose-950 dark:text-rose-100'
          : 'bg-amber-50/95 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/80 text-amber-950 dark:text-amber-100'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl flex-shrink-0 ${
                hasImmediateEmergency
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-500 text-white'
              }`}
            >
              <AlertOctagon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-rose-600 text-white">
                  Red-Flag Warning Signs
                </span>
                <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold">
                  {warnings.length} critical symptom{warnings.length > 1 ? 's' : ''} monitored
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Seek Immediate Medical Attention if You Experience:
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                These symptoms require urgent clinical evaluation. Do not wait for your scheduled follow-up.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-transform active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Emergency (108 / ER)</span>
            </a>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 cursor-pointer"
              aria-label={isExpanded ? 'Collapse warning details' : 'Expand warning details'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Warning Items Grid */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-rose-200 dark:border-rose-900/60 grid grid-cols-1 md:grid-cols-2 gap-3">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-rose-200/70 dark:border-rose-900/50 flex items-start gap-2.5"
              >
                <div className="mt-0.5 p-1 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 flex-shrink-0">
                  <HeartPulse className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {warning.symptom}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        warning.urgency.toLowerCase().includes('immediate')
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                      }`}
                    >
                      {warning.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 dark:text-rose-300 font-medium mt-1">
                    Action: {warning.action_required}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
