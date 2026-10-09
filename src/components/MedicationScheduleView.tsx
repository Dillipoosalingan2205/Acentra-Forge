import React from 'react';
import { Pill, Sun, CloudSun, Sunset, Moon, CheckCircle2, AlertCircle } from 'lucide-react';
import { TimelineTask } from '../types/aegis';
import { AudioPlayerButton } from './AudioPlayerButton';

interface MedicationScheduleViewProps {
  tasks: TimelineTask[];
  onToggleTaskComplete: (taskId: string) => void;
}

export const MedicationScheduleView: React.FC<MedicationScheduleViewProps> = ({
  tasks,
  onToggleTaskComplete,
}) => {
  const medicationTasks = tasks.filter((t) => t.category === 'medication');

  if (medicationTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-sm">
        No active discharge prescription medications identified in this report.
      </div>
    );
  }

  // Slot groupings
  const slots = [
    {
      id: 'Morning',
      label: 'Morning (Breakfast)',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      color: 'border-amber-200 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20',
    },
    {
      id: 'Afternoon',
      label: 'Afternoon (Lunch)',
      icon: <CloudSun className="w-5 h-5 text-orange-500" />,
      color: 'border-orange-200 bg-orange-50/40 dark:border-orange-900/60 dark:bg-orange-950/20',
    },
    {
      id: 'Evening',
      label: 'Evening (Dinner)',
      icon: <Sunset className="w-5 h-5 text-indigo-500" />,
      color: 'border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20',
    },
    {
      id: 'Bedtime',
      label: 'Night (Bedtime / PRN)',
      icon: <Moon className="w-5 h-5 text-purple-500" />,
      color: 'border-purple-200 bg-purple-50/40 dark:border-purple-900/60 dark:bg-purple-950/20',
    },
  ];

  // Distribute tasks across slots
  const getTasksForSlot = (slotId: string) => {
    return medicationTasks.filter((t) => {
      const orig = (t.original_text + ' ' + t.simplified_text_en).toLowerCase();
      if (t.time_of_day === slotId) return true;
      if (slotId === 'Morning' && (orig.includes('morning') || orig.includes('breakfast') || orig.includes('qd') || orig.includes('bid') || orig.includes('tid'))) return true;
      if (slotId === 'Afternoon' && (orig.includes('lunch') || orig.includes('afternoon') || orig.includes('tid'))) return true;
      if (slotId === 'Evening' && (orig.includes('evening') || orig.includes('dinner') || orig.includes('bid') || orig.includes('tid'))) return true;
      if (slotId === 'Bedtime' && (orig.includes('bedtime') || orig.includes('night') || orig.includes('qhs') || orig.includes('prn') || orig.includes('as needed'))) return true;
      return false;
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Medication Pill Organizer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {medicationTasks.length} active prescriptions scheduled across meal & rest times
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((slot) => {
          const slotTasks = getTasksForSlot(slot.id);

          return (
            <div
              key={slot.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all ${slot.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {slot.icon}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {slot.label}
                  </h4>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {slotTasks.length} {slotTasks.length === 1 ? 'med' : 'meds'}
                </span>
              </div>

              {slotTasks.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                  No medications scheduled for this time slot.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {slotTasks.map((task) => {
                    const isCompleted = task.status === 'Completed';

                    return (
                      <div
                        key={task.task_id}
                        className={`p-3 rounded-xl bg-white dark:bg-slate-900 border transition-all flex items-start gap-2.5 ${
                          isCompleted
                            ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 opacity-75'
                            : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                        }`}
                      >
                        <button
                          onClick={() => onToggleTaskComplete(task.task_id)}
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h5
                            className={`text-xs font-bold text-slate-900 dark:text-slate-100 ${
                              isCompleted ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.simplified_text_en}
                          </h5>
                          {task.simplified_text_lang && (
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                              {task.simplified_text_lang}
                            </p>
                          )}
                          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
                            Rx: {task.original_text}
                          </p>
                        </div>

                        <AudioPlayerButton text={task.simplified_text_en} size="sm" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
