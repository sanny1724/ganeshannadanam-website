import React, { useState, useEffect } from 'react';
import {
  JobItem,
  ApplicationStatus,
  AgentApiService
} from '../../services/agentApi';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Calendar,
  AlertCircle,
  FileText,
  Filter,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { CoPilotReviewModal } from './CoPilotReviewModal';

const KANBAN_COLUMNS: Array<{ id: ApplicationStatus; label: string; color: string; bg: string }> = [
  { id: 'DISCOVERED', label: 'Discovered', color: 'text-slate-300 border-slate-700', bg: 'bg-slate-900/60' },
  { id: 'READY_TO_APPLY', label: 'Ready to Apply', color: 'text-amber-400 border-amber-500/30', bg: 'bg-amber-950/20' },
  { id: 'APPLIED', label: 'Applied', color: 'text-cyan-400 border-cyan-500/30', bg: 'bg-cyan-950/20' },
  { id: 'ASSESSMENT', label: 'Assessment', color: 'text-purple-400 border-purple-500/30', bg: 'bg-purple-950/20' },
  { id: 'INTERVIEW', label: 'Interview', color: 'text-emerald-400 border-emerald-500/30', bg: 'bg-emerald-950/20' },
  { id: 'OFFER', label: 'Offer', color: 'text-yellow-400 border-yellow-500/30', bg: 'bg-yellow-950/20' },
  { id: 'REJECTED', label: 'Rejected', color: 'text-rose-400 border-rose-500/30', bg: 'bg-rose-950/20' }
];

export function ApplicationKanbanView() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [filterSource, setFilterSource] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await AgentApiService.getJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (jobId: string, newStatus: ApplicationStatus) => {
    try {
      const updated = await AgentApiService.updateJobStatus(jobId, newStatus);
      setJobs(prev => prev.map(j => (j.id === jobId ? updated : j)));
    } catch (err) {
      console.error('Status transition failed:', err);
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (filterSource !== 'all' && j.platform.toLowerCase() !== filterSource.toLowerCase()) return false;
    return true;
  });

  const getNextStatus = (current: string): ApplicationStatus | null => {
    if (current === 'DISCOVERED') return 'READY_TO_APPLY';
    if (current === 'READY_TO_APPLY' || current === 'reviewing') return 'APPLIED';
    if (current === 'APPLIED' || current === 'applied') return 'ASSESSMENT';
    if (current === 'ASSESSMENT') return 'INTERVIEW';
    if (current === 'INTERVIEW') return 'OFFER';
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Application Tracker & Kanban Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track multi-platform applications from initial discovery to interview offers and assessments.
          </p>
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-400" /> Source:
          </span>
          {(['all', 'LinkedIn', 'Naukri', 'Internshala', 'Indeed', 'Glassdoor'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterSource(p)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                filterSource === p
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map(col => {
          const colJobs = filteredJobs.filter(j => {
            const status = (j.status || '').toUpperCase();
            if (col.id === 'READY_TO_APPLY' && (status === 'READY_TO_APPLY' || status === 'REVIEWING')) return true;
            if (col.id === 'APPLIED' && (status === 'APPLIED')) return true;
            if (col.id === 'DISCOVERED' && (status === 'DISCOVERED' || status === 'FOUND')) return true;
            return status === col.id;
          });

          return (
            <div
              key={col.id}
              className={`rounded-3xl border ${col.color} ${col.bg} p-4 flex flex-col min-h-[500px] shadow-lg`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className={`text-xs font-extrabold uppercase tracking-wider ${col.color.split(' ')[0]}`}>
                  {col.label}
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-950/80 text-white border border-slate-800">
                  {colJobs.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
                {colJobs.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-[11px] text-slate-500 italic">
                    Empty column
                  </div>
                ) : (
                  colJobs.map(job => {
                    const nextSt = getNextStatus(job.status);
                    return (
                      <div
                        key={job.id}
                        className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 space-y-2.5 shadow-md transition group relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            {job.platform}
                          </span>
                          <span className="text-[11px] font-black text-indigo-400">
                            {job.matchScore}%
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition">
                            {job.jobTitle}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {job.company}
                          </p>
                        </div>

                        {job.nextAction && (
                          <div className="text-[10px] text-cyan-300 bg-cyan-950/40 p-1.5 rounded-lg border border-cyan-500/20 line-clamp-2">
                            👉 {job.nextAction}
                          </div>
                        )}

                        {job.actionDeadline && (
                          <div className="text-[10px] text-purple-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-purple-400" /> Deadline: {new Date(job.actionDeadline).toLocaleDateString()}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-1">
                          {job.coverLetter && (
                            <button
                              onClick={() => setSelectedJob(job)}
                              className="text-[10px] text-indigo-400 hover:text-indigo-200 font-semibold flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" /> Letter
                            </button>
                          )}

                          <a
                            href={job.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Portal
                          </a>

                          {nextSt && (
                            <button
                              onClick={() => handleStatusChange(job.id, nextSt)}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 flex items-center gap-0.5 transition ml-auto"
                            >
                              Next <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cover Letter / Review Modal */}
      {selectedJob && (
        <CoPilotReviewModal
          job={selectedJob as any}
          onClose={() => setSelectedJob(null)}
          onSubmitted={updated => {
            setJobs(prev => prev.map(j => (j.id === updated.id ? (updated as any) : j)));
          }}
        />
      )}
    </div>
  );
}
