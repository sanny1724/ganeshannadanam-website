import React, { useState, useEffect } from 'react';
import {
  AgentStatusData,
  JobItem,
  EmailAlertItem,
  AuditLogItem,
  AnalyticsData,
  AgentApiService
} from '../../services/agentApi';
import {
  Bot,
  Activity,
  Briefcase,
  Mail,
  Bell,
  Play,
  RefreshCw,
  Sparkles,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  Trash2,
  Calendar,
  Flame,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
}

export function AgentControlCenter({ onNavigate }: Props) {
  const [status, setStatus] = useState<AgentStatusData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [emailAlerts, setEmailAlerts] = useState<EmailAlertItem[]>([]);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusData, analyticsData, jobsData, emailsData, logsData] = await Promise.all([
        AgentApiService.getStatus(),
        AgentApiService.getAnalytics().catch(() => null),
        AgentApiService.getJobs(),
        AgentApiService.getEmailAlerts(),
        AgentApiService.getLogs()
      ]);
      setStatus(statusData);
      setAnalytics(analyticsData);
      setJobs(jobsData);
      setEmailAlerts(emailsData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load agent overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickScout = async () => {
    try {
      setActionInProgress(true);
      await AgentApiService.searchJobs({ limit: 4 });
      await loadData();
    } catch (err) {
      console.error('Scout error:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleQuickScan = async () => {
    try {
      setActionInProgress(true);
      await AgentApiService.scanEmails();
      await loadData();
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleClearLogs = async () => {
    await AgentApiService.clearLogs();
    setLogs([]);
  };

  const highPriorityEmails = emailAlerts.filter(e => e.urgency === 'high' || e.category === 'INTERVIEW' || e.category === 'ASSESSMENT').slice(0, 3);
  const appliedJobs = jobs.filter(j => j.status === 'APPLIED' || j.status === 'applied');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Control Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/50 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Bot className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                AI Desktop Agent Control Center
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> 24/7 Daemon Active
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Full Autopilot
              </span>
            </div>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Autonomous job hunting, multi-resume intelligence, and real-time email triage agent running locally for <strong>B Sannith Reddy</strong>.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onNavigate('ai-chat')}
              className="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" /> Ask AI Assistant
            </button>
            <button
              onClick={() => onNavigate('kanban')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-indigo-400" /> Kanban Pipeline
            </button>
            <button
              onClick={handleQuickScout}
              disabled={actionInProgress}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Scout Target Jobs
            </button>
          </div>
        </div>

        {notificationMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Real-time Status Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div
            onClick={() => onNavigate('jobs')}
            className="bg-slate-950/50 hover:bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Discovered Roles</span>
              <Briefcase className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
            </div>
            <p className="text-2xl font-black text-white">{jobs.length}</p>
            <span className="text-[11px] text-indigo-400 font-medium">
              {appliedJobs.length} applied
            </span>
          </div>

          <div
            onClick={() => onNavigate('emails')}
            className="bg-slate-950/50 hover:bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Priority Alerts</span>
              <Flame className="w-4 h-4 text-rose-400 group-hover:scale-110 transition" />
            </div>
            <p className="text-2xl font-black text-rose-300">
              {emailAlerts.filter(e => e.urgency === 'high').length}
            </p>
            <span className="text-[11px] text-rose-400 font-medium">Interviews & assessments</span>
          </div>

          <div
            onClick={() => onNavigate('kanban')}
            className="bg-slate-950/50 hover:bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Applied Pipeline</span>
              <CheckCircle className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
            </div>
            <p className="text-2xl font-black text-cyan-300">
              {appliedJobs.length}
            </p>
            <span className="text-[11px] text-cyan-400 font-medium">10-state Kanban tracked</span>
          </div>

          <div
            onClick={() => onNavigate('profile')}
            className="bg-slate-950/50 hover:bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Candidate Profile</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            </div>
            <p className="text-base font-bold text-white truncate">{status?.candidateName || 'B Sannith Reddy'}</p>
            <span className="text-[11px] text-emerald-400 font-medium">AI Resume Parsed</span>
          </div>
        </div>
      </div>

      {/* Conversion Funnel & Analytics */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-indigo-400">
            <TrendingUp className="w-4 h-4" /> Application Pipeline & Conversion Funnel
          </h2>
          <span className="text-xs text-slate-400 font-medium">Live Recruiter Metrics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold">1. Discovered</span>
            <p className="text-lg font-bold text-white mt-0.5">{jobs.length}</p>
          </div>
          <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl">
            <span className="text-[10px] text-cyan-400 uppercase font-bold">2. Applied</span>
            <p className="text-lg font-bold text-cyan-300 mt-0.5">{appliedJobs.length}</p>
          </div>
          <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-2xl">
            <span className="text-[10px] text-purple-400 uppercase font-bold">3. Assessments</span>
            <p className="text-lg font-bold text-purple-300 mt-0.5">{jobs.filter(j => j.status === 'ASSESSMENT').length}</p>
          </div>
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
            <span className="text-[10px] text-emerald-400 uppercase font-bold">4. Interviews</span>
            <p className="text-lg font-bold text-emerald-300 mt-0.5">{jobs.filter(j => j.status === 'INTERVIEW' || j.status === 'interviewing').length}</p>
          </div>
          <div className="p-3 bg-yellow-950/20 border border-yellow-500/20 rounded-2xl col-span-2 sm:col-span-1">
            <span className="text-[10px] text-yellow-400 uppercase font-bold">5. Offers</span>
            <p className="text-lg font-bold text-yellow-300 mt-0.5">{jobs.filter(j => j.status === 'OFFER').length}</p>
          </div>
        </div>
      </div>

      {/* Two Columns: Actionable Radar Highlights + Live Applied Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Important Email Feed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-purple-400">
                <Mail className="w-4 h-4" /> Priority Email Alerts
              </h2>
              <button
                onClick={() => onNavigate('emails')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                View All ({emailAlerts.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {highPriorityEmails.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No urgent emails detected yet.</p>
              ) : (
                highPriorityEmails.map(email => (
                  <div
                    key={email.id}
                    className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {email.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(email.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">{email.subject}</h3>
                    <p className="text-[11px] text-slate-400">From: {email.senderName || email.sender}</p>
                    {email.extractedInfo?.meetingUrl && (
                      <a
                        href={email.extractedInfo.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1"
                      >
                        <Calendar className="w-3 h-3" /> Join Meeting <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('emails')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Open Email Radar
          </button>
        </div>

        {/* Live Applied Jobs Feed */}
        <div className="bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-cyan-400">
                <CheckCircle className="w-4 h-4 text-cyan-400" /> 🟢 Tracked Applications ({appliedJobs.length})
              </h2>
              <button
                onClick={() => onNavigate('kanban')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                View Kanban Board →
              </button>
            </div>

            <div className="space-y-3">
              {appliedJobs.slice(0, 4).map(job => (
                <div
                  key={job.id}
                  className="p-3.5 bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/30 rounded-2xl space-y-1.5 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {job.platform} • {job.status}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold">{job.matchScore}% Match</span>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-1">{job.jobTitle}</h3>
                  <p className="text-[11px] text-slate-400">{job.company} • {job.location}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('kanban')}
            className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Inspect Applications in Kanban
          </button>
        </div>
      </div>

      {/* Cybernetic Live Terminal / Activity Stream */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Agent Audit Log & Observability Stream
            </span>
          </div>
          <button
            onClick={handleClearLogs}
            className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
          {logs.length === 0 ? (
            <p className="text-slate-600">Console ready. Waiting for events...</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-600 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                    log.result === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : log.result === 'FAILED'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  {log.agent}
                </span>
                <span className="text-slate-300">{log.action}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
