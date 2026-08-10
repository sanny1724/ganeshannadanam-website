import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Target,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building,
  Briefcase,
  Compass,
  Zap,
  Code2
} from 'lucide-react';
import { UserProfile, CareerRecommendation, SkillGapData, Skill } from '../types/graph';
import { ApiService } from '../services/api';
import { StatCard, LoadingSkeleton, ErrorAlert } from '../components/StatusComponents';
import { ReadinessGauge } from '../components/ReadinessGauge';
import { CypherQueryViewer } from '../components/CypherQueryViewer';

interface DashboardProps {
  currentUser: UserProfile;
  skills: Skill[];
  onNavigate: (tab: string, context?: any) => void;
}

export function Dashboard({ currentUser, skills, onNavigate }: DashboardProps) {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [targetGapData, setTargetGapData] = useState<SkillGapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cypherQueryInfo, setCypherQueryInfo] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch matching careers
      const matchRes = await ApiService.getCareerRecommendations(currentUser.currentSkillIds);
      setRecommendations(matchRes.recommendations);
      setCypherQueryInfo(matchRes.cypherQuery);

      // Fetch skill gap for target role
      if (currentUser.targetRoleId) {
        const gapRes = await ApiService.getSkillGap(
          currentUser.targetRoleId,
          currentUser.currentSkillIds
        );
        setTargetGapData(gapRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load graph dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  if (loading) return <LoadingSkeleton text="Traversing CognoDB career graph for active student profile..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchDashboardData} />;

  const topMatch = recommendations[0];
  const userSkillObjects = skills.filter((s) => currentUser.currentSkillIds.includes(s.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-cyan-500/40 shadow-xl shadow-cyan-500/10"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                  Welcome back, {currentUser.name}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {currentUser.experienceLevel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                {currentUser.bio}
              </p>
              <div className="flex items-center space-x-2 mt-3 text-xs text-slate-400">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Career Role:</span>
                <strong className="text-slate-100">{targetGapData?.role.title || 'Machine Learning Engineer'}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigate('skill-gap', { roleId: currentUser.targetRoleId })}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2"
            >
              <span>Analyze Skill Gap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Explore All Roles</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Career Readiness"
          value={`${targetGapData?.readinessScore || 0}%`}
          subtitle="Target Role Match"
          icon={TrendingUp}
          trend="+14% this month"
          color="cyan"
        />
        <StatCard
          title="Matching Career Roles"
          value={recommendations.filter((r) => r.matchPercentage >= 50).length}
          subtitle="Over 50% skill match"
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Verified Skills"
          value={currentUser.currentSkillIds.length}
          subtitle="Connected to graph"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Skill Gaps to Close"
          value={targetGapData?.missingCount || 0}
          subtitle="Topological learning order"
          icon={AlertCircle}
          color="amber"
        />
      </div>

      {/* Readiness Gauge & Target Role Breakdown */}
      {targetGapData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Target Role Readiness Assessment
              </h2>
              <p className="text-xs text-slate-400">
                Calculated dynamically from required skill nodes and prerequisite graph traversals.
              </p>
            </div>
          </div>

          <ReadinessGauge
            score={targetGapData.readinessScore}
            matchedCount={targetGapData.matchedCount}
            totalRequired={targetGapData.totalRequired}
            targetRoleTitle={targetGapData.role.title}
          />
        </div>
      )}

      {/* Current Skills vs Missing Skills Visual Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Verified Skills */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Current Verified Skills</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
              {userSkillObjects.length} Skills
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {userSkillObjects.map((s) => (
              <span
                key={s.id}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-800 text-xs flex items-center space-x-1.5 hover:border-emerald-500/40 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-medium">{s.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({s.category})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills for Target Role */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Missing Gaps for Target Career</h3>
            </div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/50">
              {targetGapData?.missingCount || 0} Gaps
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {targetGapData?.missingSkills && targetGapData.missingSkills.length > 0 ? (
              targetGapData.missingSkills.map((s) => (
                <span
                  key={s.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-slate-200 border border-amber-500/20 text-xs flex items-center space-x-1.5 hover:border-amber-400/50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-[10px] text-rose-300 font-semibold px-1 py-0.2 rounded bg-rose-950/50">
                    {s.importance}
                  </span>
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No missing skills detected! Ready to apply.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Matching Career Roles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              Top Graph-Matched Career Roles
            </h2>
            <p className="text-xs text-slate-400">
              Discovered by calculating Jaccard edge overlap between your skills and role requirements.
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All ({recommendations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendations.slice(0, 3).map((rec) => (
            <div
              key={rec.roleId}
              className="glass-panel-interactive p-5 rounded-2xl border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {rec.domain?.name || 'General'}
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/50">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>{rec.matchPercentage}% Match</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 tracking-tight">{rec.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{rec.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Salary Range:</span>
                    <span className="font-semibold text-emerald-400 font-mono">{rec.avgSalary}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Hiring Companies:</span>
                    <span className="font-medium text-slate-200">{rec.hiringCompanies.length} Top Tech</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigate('skill-gap', { roleId: rec.roleId })}
                  className="flex-1 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold rounded-xl text-xs border border-cyan-500/20 transition-colors text-center"
                >
                  Skill Gap
                </button>
                <button
                  onClick={() => onNavigate('resources', { roleId: rec.roleId })}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl text-xs border border-slate-800 transition-colors text-center"
                >
                  Projects
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Underlying Cypher Query Viewer */}
      <CypherQueryViewer
        cypher={cypherQueryInfo}
        title="Query 1: Dynamic Career Matching openCypher"
      />
    </div>
  );
}
