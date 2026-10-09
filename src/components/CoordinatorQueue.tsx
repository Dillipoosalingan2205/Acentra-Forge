import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  FileCheck,
  UserCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { TimelineTask } from '../types/aegis';

interface CoordinatorQueueProps {
  tasks: TimelineTask[];
  patientName?: string;
  onUpdateTask: (updatedTask: TimelineTask) => void;
}

export const CoordinatorQueue: React.FC<CoordinatorQueueProps> = ({
  tasks,
  patientName = 'Rahul Sharma',
  onUpdateTask,
}) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTextEn, setEditedTextEn] = useState<string>('');
  const [clinicianNote, setClinicianNote] = useState<string>('');

  const escalatedTasks = tasks.filter((t) => t.requires_human_escalation);
  const pendingReviewTasks = escalatedTasks.filter((t) => !t.reviewed_by_clinician);
  const reviewedTasks = escalatedTasks.filter((t) => t.reviewed_by_clinician);

  const startEditing = (task: TimelineTask) => {
    setEditingTaskId(task.task_id);
    setEditedTextEn(task.simplified_text_en);
    setClinicianNote(task.clinician_notes || 'Reviewed & verified against hospital EHR.');
  };

  const handleApprove = (task: TimelineTask) => {
    const updated: TimelineTask = {
      ...task,
      simplified_text_en: editingTaskId === task.task_id ? editedTextEn : task.simplified_text_en,
      status: 'Pending',
      requires_human_escalation: false,
      reviewed_by_clinician: true,
      clinician_notes: editingTaskId === task.task_id ? clinicianNote : 'Clinician signed off after verification.',
    };
    onUpdateTask(updated);
    setEditingTaskId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Human-in-the-Loop Clinical Triage Hub
                </h2>
                <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/40">
                  Agent 4 Guardrail Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Reviewing flagged recovery orders for patient: <strong className="text-white">{patientName}</strong>.
                Ensures zero unverified dosages or ambiguous clinical instructions reach the patient portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-center">
              <span className="block text-xl font-bold text-amber-400">{pendingReviewTasks.length}</span>
              <span className="text-slate-400 text-[10px] uppercase">Needs Sign-Off</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-center">
              <span className="block text-xl font-bold text-emerald-400">{reviewedTasks.length}</span>
              <span className="text-slate-400 text-[10px] uppercase">Verified & Approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Items Requiring Clinical Review ({pendingReviewTasks.length})</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click &ldquo;Verify &amp; Approve&rdquo; to release directly to patient app
          </span>
        </div>

        {pendingReviewTasks.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-slate-600 dark:text-slate-300 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              All Clinical Guardrails Cleared
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No ambiguous dosages, missing clinical parameters, or unverified orders remain in this discharge batch.
            </p>
          </div>
        ) : (
          pendingReviewTasks.map((task) => {
            const isEditing = editingTaskId === task.task_id;

            return (
              <div
                key={task.task_id}
                className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-300 dark:border-amber-800/80 shadow-sm overflow-hidden"
              >
                <div className="bg-amber-50/80 dark:bg-amber-950/40 p-4 border-b border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      {task.task_id}
                    </span>
                    <span className="text-xs uppercase font-bold text-slate-600 dark:text-slate-300">
                      Category: {task.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Guardrail Flag: {task.escalation_reason || 'Clinical Ambiguity / Missing Dose'}</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Side-by-side comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Original Document Order:
                      </span>
                      <p className="text-xs font-mono text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                        {task.original_text}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50">
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block mb-1">
                        Patient-Facing Translation:
                      </span>
                      {isEditing ? (
                        <textarea
                          value={editedTextEn}
                          onChange={(e) => setEditedTextEn(e.target.value)}
                          rows={3}
                          className="w-full text-xs p-2 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                        />
                      ) : (
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                          {task.simplified_text_en}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Clinician Note Entry */}
                  {isEditing && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                        Clinician Verification Note:
                      </label>
                      <input
                        type="text"
                        value={clinicianNote}
                        onChange={(e) => setClinicianNote(e.target.value)}
                        placeholder="e.g., Verified with cardiologist Dr. Gupta: Aspirin 75mg PO daily after breakfast."
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {!isEditing ? (
                      <button
                        onClick={() => startEditing(task)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit / Add EHR Note</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => handleApprove(task)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify &amp; Release to Patient Portal</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Previously Approved Audit Log */}
      {reviewedTasks.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Clinician Approved Audit Log ({reviewedTasks.length})</span>
          </h3>

          <div className="space-y-2">
            {reviewedTasks.map((task) => (
              <div
                key={task.task_id}
                className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-slate-500">{task.task_id}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {task.simplified_text_en}
                    </span>
                  </div>
                  {task.clinician_notes && (
                    <p className="text-slate-500 dark:text-slate-400">
                      <strong className="text-emerald-600 dark:text-emerald-400">Verified:</strong>{' '}
                      {task.clinician_notes}
                    </p>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold self-start sm:self-auto">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Approved for Portal</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
