import React, { useState } from 'react';
import {
  Shield,
  HeartPulse,
  Activity,
  Calendar,
  Pill,
  Building2,
  MessageSquare,
  Sparkles,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { RecoveryPlan, TimelineTask } from './types/aegis';
import { downloadICSFile } from './utils/calendarExport';
import { Navbar } from './components/Navbar';
import { DischargeInputSection, AnalyzePayload } from './components/DischargeInputSection';
import { EmergencyBanner } from './components/EmergencyBanner';
import { PatientOverviewCard } from './components/PatientOverviewCard';
import { TimelineTasksView } from './components/TimelineTasksView';
import { MedicationScheduleView } from './components/MedicationScheduleView';
import { ProviderMatchingSection } from './components/ProviderMatchingSection';
import { AskCoordinatorChat } from './components/AskCoordinatorChat';
import { CoordinatorQueue } from './components/CoordinatorQueue';
import { PrintSummaryModal } from './components/PrintSummaryModal';
import { AgentPipelineStatus } from './components/AgentPipelineStatus';

export default function App() {
  const [plan, setPlan] = useState<RecoveryPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'patient' | 'coordinator' | 'ingest'>('ingest');
  const [patientSubView, setPatientSubView] = useState<'timeline' | 'medications' | 'providers' | 'chat'>('timeline');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Hindi');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleAnalyze = async (payload: AnalyzePayload) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch('/api/analyze-discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dischargeText: payload.text,
          fileData: payload.fileData,
          mimeType: payload.mimeType,
          fileName: payload.fileName,
          targetLanguage: payload.language,
          modelChoice: payload.modelChoice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process discharge document');
      }

      setPlan(data);
      // Switch view to patient portal
      setActiveTab('patient');
      setPatientSubView('timeline');
    } catch (err: any) {
      console.error('Extraction error:', err);
      setErrorMessage(err.message || 'An error occurred while processing the discharge document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTaskComplete = (taskId: string) => {
    if (!plan) return;
    const updatedTasks = plan.timeline_tasks.map((t) => {
      if (t.task_id === taskId) {
        return {
          ...t,
          status: (t.status === 'Completed' ? 'Pending' : 'Completed') as any,
        };
      }
      return t;
    });
    setPlan({ ...plan, timeline_tasks: updatedTasks });
  };

  const handleUpdateTask = (updatedTask: TimelineTask) => {
    if (!plan) return;
    const updatedTasks = plan.timeline_tasks.map((t) =>
      t.task_id === updatedTask.task_id ? updatedTask : t
    );
    setPlan({ ...plan, timeline_tasks: updatedTasks });
  };

  const handleExportCalendar = () => {
    if (!plan) return;
    downloadICSFile(plan.timeline_tasks, plan.patient_summary);
  };

  const escalatedCount = plan
    ? plan.timeline_tasks.filter((t) => t.requires_human_escalation && !t.reviewed_by_clinician).length
    : 0;

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setErrorMessage(null);
        }}
        escalatedCount={escalatedCount}
        hasActivePlan={!!plan}
        onExportCalendar={handleExportCalendar}
        onPrint={() => setShowPrintModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Zero-Demo Guardrail Policy Notice:</strong>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* View 1: Ingest New Summary */}
        {activeTab === 'ingest' && (
          <div className="space-y-6">
            <DischargeInputSection
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
            <AgentPipelineStatus />
          </div>
        )}

        {/* View 2: Patient Care Portal */}
        {activeTab === 'patient' && plan && (
          <div className="space-y-6">
            {/* Top Multi-Agent Pipeline Status Indicator */}
            <AgentPipelineStatus confidenceScore={plan.pipeline_metadata?.ai_confidence_score} />

            {/* Red Flag Warning Alert Banner */}
            <EmergencyBanner warnings={plan.warning_signs} />

            {/* Patient Header & Dual-Language Overview */}
            <PatientOverviewCard
              summary={plan.patient_summary}
              vitals={plan.clinical_vitals}
              targetLanguage={plan.target_language}
              confidenceScore={plan.pipeline_metadata?.ai_confidence_score}
            />

            {/* Patient Subview Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setPatientSubView('timeline')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  patientSubView === 'timeline'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Recovery Timeline &amp; Tasks ({plan.timeline_tasks.length})</span>
              </button>

              <button
                onClick={() => setPatientSubView('medications')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  patientSubView === 'medications'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>Pillbox &amp; Meal Organizer</span>
              </button>

              <button
                onClick={() => setPatientSubView('providers')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  patientSubView === 'providers'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Matched Healthcare Facilities</span>
              </button>

              <button
                onClick={() => setPatientSubView('chat')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  patientSubView === 'chat'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask Recovery Assistant</span>
              </button>
            </div>

            {/* Subview Content */}
            {patientSubView === 'timeline' && (
              <TimelineTasksView
                tasks={plan.timeline_tasks}
                targetLanguage={plan.target_language}
                onToggleTaskComplete={handleToggleTaskComplete}
              />
            )}

            {patientSubView === 'medications' && (
              <MedicationScheduleView
                tasks={plan.timeline_tasks}
                onToggleTaskComplete={handleToggleTaskComplete}
              />
            )}

            {patientSubView === 'providers' && (
              <ProviderMatchingSection tasks={plan.timeline_tasks} />
            )}

            {patientSubView === 'chat' && <AskCoordinatorChat plan={plan} />}
          </div>
        )}

        {/* View 3: Clinician Hub (Human-in-the-Loop Review Queue) */}
        {activeTab === 'coordinator' && plan && (
          <CoordinatorQueue
            tasks={plan.timeline_tasks}
            patientName={plan.patient_summary?.patient_name}
            onUpdateTask={handleUpdateTask}
          />
        )}
      </main>

      {/* Printable Sheet Modal */}
      {showPrintModal && plan && (
        <PrintSummaryModal plan={plan} onClose={() => setShowPrintModal(false)} />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          Aegis Post-Discharge &amp; Care Coordination System • Powered by Google AI Studio &amp; Gemini 3.5
        </p>
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
          Enforcing Dynamic Multi-Agent Extraction &amp; Zero Demo Fallback Policy
        </p>
      </footer>
    </div>
  );
}
