import React, { useState, useEffect } from 'react';
import { JobItem, AgentApiService, AgentSettingsData } from '../../services/agentApi';
import { CoPilotReviewModal } from './CoPilotReviewModal';
import {
  Briefcase,
  Play,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap,
  Filter,
  Trash2,
  RefreshCw,
  Eye,
  Sliders,
  FileText,
  Building,
  MapPin,
  Layers,
  Globe,
  Key,
  CheckCircle,
  Calendar
} from 'lucide-react';

export function JobHunterView() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [settings, setSettings] = useState<AgentSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [batching, setBatching] = useState(false);
  const [liveApplyingId, setLiveApplyingId] = useState<string | null>(null);
  const [liveApplyMsg, setLiveApplyMsg] = useState<{ id: string; text: string; success?: boolean } | null>(null);
  const [openingLogin, setOpeningLogin] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'applied' | 'all' | 'reviewing' | 'interviewing'>('applied');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedJobForReview, setSelectedJobForReview] = useState<JobItem | null>(null);
  const [searchKeywords, setSearchKeywords] = useState('Software Development Engineer, Full Stack, React, Node.js');

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, settingsData] = await Promise.all([
        AgentApiService.getJobs(),
        AgentApiService.getSettings()
      ]);
      setJobs(jobsData);
      setSettings(settingsData);
      if (settingsData.jobConfig.keywords?.length) {
        setSearchKeywords(settingsData.jobConfig.keywords.join(', '));
      }
    } catch (err) {
      console.error('Failed loading jobs data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchJobs = async () => {
    try {
      setSearching(true);
      const keywords = searchKeywords.split(',').map((k) => k.trim()).filter(Boolean);
      const targetPlatforms = platformFilter === 'all' 
        ? ['Naukri', 'LinkedIn', 'Indeed', 'Glassdoor'] as const
        : [platformFilter as any];

      const newFound = await AgentApiService.searchJobs({
        keywords,
        location: 'Hyderabad / Bengaluru / Remote',
        platforms: targetPlatforms as any,
        limit: 4
      });
      setJobs((prev) => [...newFound, ...prev.filter((p) => !newFound.some((n) => n.id === p.id))]);
    } catch (err) {
      console.error('Job search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleOpenLogin = async (portal: string = 'Naukri') => {
    try {
      setOpeningLogin(true);
      await AgentApiService.openLoginWindow(portal);
      setLiveApplyMsg({
        id: 'global',
        text: `Google Chrome opened to ${portal}. Sign in once to keep your cookies saved on this laptop!`,
        success: true
      });
    } catch (err: any) {
      setLiveApplyMsg({ id: 'global', text: `Failed opening login: ${err.message}`, success: false });
    } finally {
      setOpeningLogin(false);
    }
  };

  const handleLiveApplyBrowser = async (job: JobItem) => {
    try {
      setLiveApplyingId(job.id);
      setLiveApplyMsg({ id: job.id, text: `🤖 Launching laptop browser to ${job.company} on ${job.platform}...` });

      const res = await AgentApiService.applyJobLive(job.id);
      if (res.appliedOnPortal) {
        setLiveApplyMsg({ id: job.id, text: `✅ Successfully submitted live on ${job.platform}!`, success: true });
        await loadData();
      } else {
        setLiveApplyMsg({ id: job.id, text: `⚠️ ${res.message}`, success: false });
      }
    } catch (err: any) {
      setLiveApplyMsg({ id: job.id, text: `❌ Automation error: ${err.message}`, success: false });
    } finally {
      setLiveApplyingId(null);
    }
  };

  const handleProcessJob = async (jobId: string) => {
    try {
      const updated = await AgentApiService.processJob(jobId);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
      if (settings?.jobConfig.coPilotMode) {
        setSelectedJobForReview(updated);
      }
    } catch (err) {
      console.error('Process job error:', err);
    }
  };

  const handleBatchApply = async () => {
    try {
      setBatching(true);
      await AgentApiService.batchApply(4);
      await loadData();
    } catch (err) {
      console.error('Batch apply error:', err);
    } finally {
      setBatching(false);
    }
  };

  const handleToggleMode = async () => {
    if (!settings) return;
    const newCoPilot = !settings.jobConfig.coPilotMode;
    const updated = await AgentApiService.updateSettings({
      jobConfig: {
        ...settings.jobConfig,
        coPilotMode: newCoPilot,
        autoApply: !newCoPilot
      }
    });
    setSettings(updated);
  };

  const handleDeleteJob = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await AgentApiService.deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = activeFilter === 'all' || job.status === activeFilter;
    const matchesPlatform = platformFilter === 'all' || job.platform.toLowerCase() === platformFilter.toLowerCase();
    return matchesStatus && matchesPlatform;
  });

  const reviewingCount = jobs.filter((j) => j.status === 'reviewing').length;
  const appliedCount = jobs.filter((j) => j.status === 'applied').length;
  const interviewingCount = jobs.filter((j) => j.status === 'interviewing').length;

  const platformBadgeColor: Record<string, string> = {
    Naukri: 'bg-[#0078db]/15 text-[#38bdf8] border-[#0078db]/30',
    LinkedIn: 'bg-[#0a66c2]/15 text-[#60a5fa] border-[#0a66c2]/30',
    Indeed: 'bg-[#2164f3]/15 text-[#818cf8] border-[#2164f3]/30',
    Glassdoor: 'bg-[#0caa41]/15 text-[#4ade80] border-[#0caa41]/30',
    Greenhouse: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Lever: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Mode & Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Briefcase className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Autonomous Multi-Platform Job Bot
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 border-emerald-500/30 animate-pulse">
                <Zap className="w-3.5 h-3.5" /> 24/7 Autonomous Daemon Active
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Scouts & applies directly across <strong>Naukri.com</strong>, <strong>LinkedIn</strong>, <strong>Indeed</strong>, and <strong>Glassdoor</strong> under <strong>B Sannith Reddy</strong>.
            </p>

            {/* Platform Badges Pill list */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium">Supported Portals:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#0078db]/15 text-[#38bdf8] text-[11px] font-bold border border-[#0078db]/30">
                🇮🇳 Naukri.com
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#0a66c2]/15 text-[#60a5fa] text-[11px] font-bold border border-[#0a66c2]/30">
                LinkedIn Easy Apply
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#2164f3]/15 text-[#818cf8] text-[11px] font-bold border border-[#2164f3]/30">
                Indeed
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#0caa41]/15 text-[#4ade80] text-[11px] font-bold border border-[#0caa41]/30">
                Glassdoor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleOpenLogin('Naukri')}
              disabled={openingLogin}
              className="px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold border border-blue-500/30 transition flex items-center gap-2"
            >
              <Key className="w-4 h-4 text-blue-400" />
              {openingLogin ? 'Opening Chrome...' : '🔑 Open Naukri Chrome Session'}
            </button>
            <button
              onClick={handleSearchJobs}
              disabled={searching}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${searching ? 'animate-spin' : ''}`} />
              {searching ? 'Scouting Portals...' : 'Scout & Auto-Apply Next 4'}
            </button>
          </div>
        </div>

        {liveApplyMsg && (
          <div className={`mt-4 p-3.5 rounded-xl border text-xs font-medium ${liveApplyMsg.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'}`}>
            {liveApplyMsg.text}
          </div>
        )}

        {/* Quick Numbers Bar with Clickable Filter Triggers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div
            onClick={() => setActiveFilter('applied')}
            className={`cursor-pointer rounded-2xl p-4 transition border ${
              activeFilter === 'applied'
                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Applied Across Portals
            </span>
            <p className="text-2xl font-black text-cyan-300 mt-1">{appliedCount}</p>
            <span className="text-[10px] text-cyan-400 font-medium">Click to view all {appliedCount} applied</span>
          </div>

          <div
            onClick={() => setActiveFilter('all')}
            className={`cursor-pointer rounded-2xl p-4 transition border ${
              activeFilter === 'all'
                ? 'bg-indigo-950/40 border-indigo-500/50'
                : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-xs text-slate-400 font-medium">Total Scouted</span>
            <p className="text-2xl font-bold text-white mt-1">{jobs.length}</p>
            <span className="text-[10px] text-slate-400 font-medium">View all opportunities</span>
          </div>

          <div
            onClick={() => setActiveFilter('reviewing')}
            className={`cursor-pointer rounded-2xl p-4 transition border ${
              activeFilter === 'reviewing'
                ? 'bg-amber-950/40 border-amber-500/50'
                : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-xs text-amber-400 font-medium">Ready for Co-Pilot Review</span>
            <p className="text-2xl font-bold text-amber-300 mt-1">{reviewingCount}</p>
            <span className="text-[10px] text-amber-400 font-medium">1-click inspect</span>
          </div>

          <div
            onClick={() => setActiveFilter('interviewing')}
            className={`cursor-pointer rounded-2xl p-4 transition border ${
              activeFilter === 'interviewing'
                ? 'bg-emerald-950/40 border-emerald-500/50'
                : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-xs text-emerald-400 font-medium">Interview Pipeline</span>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{interviewingCount}</p>
            <span className="text-[10px] text-emerald-400 font-medium">Invites received</span>
          </div>
        </div>
      </div>

      {/* Prominent Status Filter Tabs Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter('applied')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeFilter === 'applied'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            🟢 Applied Jobs ({appliedCount})
          </button>

          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeFilter === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            📋 All Scouted Jobs ({jobs.length})
          </button>

          <button
            onClick={() => setActiveFilter('reviewing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeFilter === 'reviewing'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ⏳ Ready to Review ({reviewingCount})
          </button>

          <button
            onClick={() => setActiveFilter('interviewing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeFilter === 'interviewing'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🎯 Interview Pipeline ({interviewingCount})
          </button>
        </div>

        {/* Portal Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Portal:</span>
          {(['all', 'Naukri', 'LinkedIn', 'Indeed', 'Glassdoor'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                platformFilter === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Applied Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-cyan-400 mx-auto opacity-50" />
            <h3 className="text-base font-bold text-white">No jobs found under this filter</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Switch to the "🟢 Applied Jobs ({appliedCount})" tab to inspect all {appliedCount} applications submitted across portals.
            </p>
          </div>
        ) : (
          filteredJobs.map((job, idx) => (
            <div
              key={job.id}
              className={`group bg-slate-900/90 border rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between relative shadow-lg ${
                job.status === 'applied'
                  ? 'border-cyan-500/30 bg-gradient-to-b from-slate-900 to-cyan-950/10'
                  : job.status === 'reviewing'
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : job.status === 'interviewing'
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header tags */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${platformBadgeColor[job.platform] || 'bg-slate-800 text-slate-300'}`}>
                      {job.platform}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        job.status === 'applied'
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 font-bold'
                          : job.status === 'interviewing'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : job.status === 'reviewing'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {job.status === 'applied' ? '🟢 APPLIED ON PORTAL' : job.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      {job.matchScore}% Match
                    </span>
                    <button
                      onClick={(e) => handleDeleteJob(job.id, e)}
                      className="text-slate-500 hover:text-rose-400 transition p-1"
                      title="Remove job"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Company */}
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                  {job.jobTitle}
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-2">
                  <span className="text-slate-200 font-semibold">{job.company}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                </p>

                {/* Cover letter inspect pill */}
                {job.coverLetter && (
                  <div className="mt-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-indigo-300 font-medium flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" /> Tailored Cover Letter Attached
                    </span>
                    <button
                      onClick={() => setSelectedJobForReview(job)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-200 font-semibold"
                    >
                      Inspect Letter →
                    </button>
                  </div>
                )}

                {/* Notes & Details */}
                {job.notes && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mt-2.5 leading-relaxed">
                    {job.notes}
                  </p>
                )}
              </div>

              {/* Actions Bar */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" /> Open on {job.platform}
                </a>

                <div className="flex items-center gap-2 flex-wrap">
                  {job.status === 'applied' ? (
                    <span className="text-xs text-cyan-400 font-bold flex items-center gap-1.5 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleLiveApplyBrowser(job)}
                      disabled={liveApplyingId === job.id}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                    >
                      <Globe className={`w-3.5 h-3.5 ${liveApplyingId === job.id ? 'animate-spin' : ''}`} />
                      {liveApplyingId === job.id ? 'Applying in Chrome...' : '🚀 Live Apply in Chrome'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedJobForReview && (
        <CoPilotReviewModal
          job={selectedJobForReview}
          onClose={() => setSelectedJobForReview(null)}
          onSubmitted={(updated) => {
            setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
          }}
        />
      )}
    </div>
  );
}
