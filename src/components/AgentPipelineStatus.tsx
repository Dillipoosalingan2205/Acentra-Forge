import React from 'react';
import { FileSearch, CalendarRange, Languages, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';

interface AgentPipelineStatusProps {
  currentStage?: 'idle' | 'extracting' | 'orchestrating' | 'translating' | 'guardrailing' | 'matching' | 'completed';
  confidenceScore?: number;
}

export const AgentPipelineStatus: React.FC<AgentPipelineStatusProps> = ({ currentStage = 'completed', confidenceScore }) => {
  const agents = [
    {
      num: 1,
      name: 'Clinical Extractor',
      icon: <FileSearch className="w-4 h-4" />,
      desc: 'Parses vitals, drugs, & lab dates',
    },
    {
      num: 2,
      name: 'Task Orchestrator',
      icon: <CalendarRange className="w-4 h-4" />,
      desc: 'Constructs recovery timeline',
    },
    {
      num: 3,
      name: 'Translation Agent',
      icon: <Languages className="w-4 h-4" />,
      desc: '5th-grade English + Regional Indian Lang',
    },
    {
      num: 4,
      name: 'Guardrail & Safety',
      icon: <ShieldCheck className="w-4 h-4" />,
      desc: 'Flags missing dosages & red flags',
    },
    {
      num: 5,
      name: 'Provider Matcher',
      icon: <Building2 className="w-4 h-4" />,
      desc: 'Matches nearby labs & clinics',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Aegis Multi-Agent Coordination Workflow</span>
        </h4>
        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
          {typeof confidenceScore === 'number'
            ? `AI Confidence: ${confidenceScore}% • All 5 Agents Active`
            : 'All 5 Agents Active & Verified'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {agents.map((agent) => (
          <div
            key={agent.num}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-left"
          >
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mb-1">
              {agent.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Agent {agent.num}
              </span>
            </div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {agent.name}
            </h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {agent.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
