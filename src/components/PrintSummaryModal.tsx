import React from 'react';
import { X, Printer, Shield, CheckCircle2, AlertOctagon } from 'lucide-react';
import { RecoveryPlan } from '../types/aegis';

interface PrintSummaryModalProps {
  plan: RecoveryPlan;
  onClose: () => void;
}

export const PrintSummaryModal: React.FC<PrintSummaryModalProps> = ({ plan, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const { patient_summary, timeline_tasks, warning_signs, clinical_vitals, target_language } = plan;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Official Patient Recovery Sheet
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-sm"
            >
              Print Document
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="mt-6 space-y-6 text-slate-900 dark:text-slate-100 print:m-0 print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-indigo-950 dark:text-indigo-200">
                AEGIS POST-DISCHARGE RECOVERY PLAN
              </h1>
              <p className="text-xs text-slate-500">
                Hospital Care Coordination System • Verified Record
              </p>
            </div>
            <div className="text-right text-xs">
              <p><strong>Generated:</strong> {new Date(plan.analyzed_at).toLocaleDateString()}</p>
              <p><strong>Language:</strong> English + {target_language}</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-xs grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-slate-500 block">Patient Name:</span>
              <strong className="text-sm">{patient_summary.patient_name || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Patient ID:</span>
              <strong>{patient_summary.extracted_patient_id || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Discharge Date:</span>
              <strong>{patient_summary.discharge_date || 'N/A'}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block">Diagnosis / Procedure:</span>
              <strong>{patient_summary.diagnosis || 'Post-Op'}</strong>
            </div>
            {clinical_vitals?.allergies && (
              <div>
                <span className="text-slate-500 block">Known Allergies:</span>
                <strong className="text-rose-600">{clinical_vitals.allergies.join(', ')}</strong>
              </div>
            )}
          </div>

          {/* Recovery Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Instructions for the Patient &amp; Family:
            </h4>
            <p className="text-xs leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900">
              {patient_summary.simplified_english}
            </p>
          </div>

          {/* Emergency Warning Signs */}
          {warning_signs.length > 0 && (
            <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/70 dark:bg-rose-950/40 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300 mb-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>EMERGENCY RED-FLAG SIGNS:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-slate-200">
                {warning_signs.map((w, i) => (
                  <li key={i}>
                    <strong>{w.symptom}:</strong> {w.action_required} ({w.urgency})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prescriptions & Tasks Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Actionable Schedule &amp; Medications:
            </h4>
            <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-700">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="p-2 border border-slate-200 dark:border-slate-700">Category</th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700">Timing</th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700">Simple English Instruction</th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700">{target_language}</th>
                </tr>
              </thead>
              <tbody>
                {timeline_tasks.map((task) => (
                  <tr key={task.task_id} className="border-b border-slate-200 dark:border-slate-800">
                    <td className="p-2 border border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px]">
                      {task.category}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 font-mono">
                      {task.due_date} {task.time_of_day ? `(${task.time_of_day})` : ''}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700">
                      {task.simplified_text_en}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300">
                      {task.simplified_text_lang || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t text-[11px] text-slate-500 text-center">
            Automated discharge organization powered by Aegis AI. Please contact your surgical hospital for clinical questions.
          </div>
        </div>
      </div>
    </div>
  );
};
