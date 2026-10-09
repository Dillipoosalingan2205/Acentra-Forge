import React, { useState } from 'react';
import {
  Pill,
  Calendar,
  FlaskConical,
  UserCheck,
  HeartHandshake,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { TimelineTask, TaskCategory } from '../types/aegis';
import { AudioPlayerButton } from './AudioPlayerButton';

interface TimelineTasksViewProps {
  tasks: TimelineTask[];
  targetLanguage: string;
  onToggleTaskComplete: (taskId: string) => void;
  onSelectProviderForBooking?: (provider: any, task: TimelineTask) => void;
}

export const TimelineTasksView: React.FC<TimelineTasksViewProps> = ({
  tasks,
  targetLanguage,
  onToggleTaskComplete,
  onSelectProviderForBooking,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryIcon = (cat: TaskCategory) => {
    switch (cat) {
      case 'medication':
        return <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'test':
        return <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'referral':
        return <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'care_instruction':
      default:
        return <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getCategoryBadgeClass = (cat: TaskCategory) => {
    switch (cat) {
      case 'medication':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'appointment':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'test':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'referral':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'care_instruction':
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Recovery Progress Bar & Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Patient Recovery Plan Progress
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {completedCount} of {tasks.length} tasks completed ({progressPercent}%)
          </p>
        </div>

        <div className="w-full sm:w-64 flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 min-w-8">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `All Tasks (${tasks.length})` },
          { id: 'medication', label: `Medications (${tasks.filter((t) => t.category === 'medication').length})` },
          { id: 'appointment', label: `Follow-Ups (${tasks.filter((t) => t.category === 'appointment').length})` },
          { id: 'test', label: `Tests & Labs (${tasks.filter((t) => t.category === 'test').length})` },
          { id: 'care_instruction', label: `Care & Dressing (${tasks.filter((t) => t.category === 'care_instruction').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-slate-900 text-white dark:bg-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            No recovery tasks found in this category.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isEscalated = task.requires_human_escalation && !task.reviewed_by_clinician;
            const isExpanded = expandedTasks[task.task_id] || false;

            return (
              <div
                key={task.task_id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isCompleted
                    ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 opacity-80'
                    : isEscalated
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    {/* Checkbox & Header */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleTaskComplete(task.task_id)}
                        className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/30'
                            : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-slate-800'
                        }`}
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4 fill-current" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(
                              task.category
                            )}`}
                          >
                            {getCategoryIcon(task.category)}
                            <span>{task.category.replace('_', ' ')}</span>
                          </span>

                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{task.due_date || 'Ongoing'}</span>
                          </span>

                          {task.time_of_day && task.time_of_day !== 'Anytime' && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {task.time_of_day}
                            </span>
                          )}

                          {isEscalated && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Needs Clinician Review</span>
                            </span>
                          )}

                          {task.reviewed_by_clinician && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified by Clinician</span>
                            </span>
                          )}

                          {typeof task.ai_confidence_score === 'number' && (
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                                task.ai_confidence_score >= 90
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : task.ai_confidence_score >= 75
                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {task.ai_confidence_score}% Confidence
                            </span>
                          )}
                        </div>

                        {/* Simplified Instruction (English) */}
                        <h4
                          className={`text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug ${
                            isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.simplified_text_en}
                        </h4>

                        {/* Regional Translation */}
                        {task.simplified_text_lang && (
                          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mt-1">
                            {task.simplified_text_lang}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Audio Player & Expand */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <AudioPlayerButton
                        text={`${task.simplified_text_en}. ${task.simplified_text_lang || ''}`}
                        size="sm"
                      />

                      <button
                        onClick={() => toggleExpand(task.task_id)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                        title={isExpanded ? 'Hide details' : 'Show clinical source & matched care'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Clinical Details & Provider Matches */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      {/* Original Discharge Text */}
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                          Original Physician Order in Upload:
                        </span>
                        <p className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                          {task.original_text}
                        </p>
                      </div>

                      {/* Escalation reason if any */}
                      {task.escalation_reason && (
                        <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Safety Guardrail Trigger:</span>
                          </span>
                          <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                            {task.escalation_reason}
                          </p>
                        </div>
                      )}

                      {/* Clinician verified note */}
                      {task.clinician_notes && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-200">
                          <strong className="block font-semibold mb-0.5">Clinical Coordinator Note:</strong>
                          {task.clinician_notes}
                        </div>
                      )}

                      {/* Matched Healthcare Providers preview */}
                      {task.matched_providers && task.matched_providers.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                              Nearby Matched Facilities ({task.matched_providers.length})
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {task.matched_providers.map((provider) => (
                              <div
                                key={provider.id}
                                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                      {provider.name}
                                    </h5>
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                      ★ {provider.rating}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>{provider.distance_km} km • {provider.facility_type}</span>
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                                  <a
                                    href={`tel:${provider.phone}`}
                                    className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>Call</span>
                                  </a>
                                  <button
                                    onClick={() => onSelectProviderForBooking?.(provider, task)}
                                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Details & Slots</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
