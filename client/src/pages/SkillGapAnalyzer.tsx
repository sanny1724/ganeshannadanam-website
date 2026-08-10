import React, { useState, useEffect } from 'react';
import {
  Target,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  GitBranch,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { UserProfile, JobRole, Skill, SkillGapData } from '../types/graph';
import { ApiService } from '../services/api';
import { ReadinessGauge } from '../components/ReadinessGauge';
import { LearningPathway } from '../components/LearningPathway';
import { LoadingSkeleton, ErrorAlert } from '../components/StatusComponents';
import { CypherQueryViewer } from '../components/CypherQueryViewer';

interface SkillGapAnalyzerProps {
  currentUser: UserProfile;
  jobRoles: JobRole[];
  skills: Skill[];
  initialRoleId?: string;
  onNavigate: (tab: string, context?: any) => void;
}

export function SkillGapAnalyzer({
  currentUser,
  jobRoles,
  skills,
  initialRoleId,
  onNavigate
}: SkillGapAnalyzerProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    initialRoleId || currentUser.targetRoleId || jobRoles[0]?.id || 'role-ml-eng'
  );
  const [gapData, setGapData] = useState<SkillGapData | null>(null);
  const [pivots, setPivots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cypherInfo, setCypherInfo] = useState<any>(null);

  useEffect(() => {
    if (initialRoleId) {
      setSelectedRoleId(initialRoleId);
    }
  }, [initialRoleId]);

  const fetchSkillGap = async () => {
    try {
      setLoading(true);
      setError(null);

      const [gapRes, pivotRes] = await Promise.all([
        ApiService.getSkillGap(selectedRoleId, currentUser.currentSkillIds),
        ApiService.getAlternativePivots(selectedRoleId)
      ]);

      if (gapRes?.data) {
        setGapData(gapRes.data);
        setCypherInfo(gapRes.cypherQuery);
      }
      if (pivotRes?.data?.pivots) {
        setPivots(pivotRes.data.pivots.slice(0, 3));
      } else {
        setPivots([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to compute skill gap graph traversal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGap();
  }, [selectedRoleId, currentUser]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Role Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Target className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Skill Gap & Roadmap Analyzer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate readiness against target role requirements and discover an optimal learning order via graph dependency DAGs.
          </p>
        </div>

        {/* Role Selector Dropdown */}
        <div className="flex items-center space-x-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 self-start md:self-auto">
          <span className="text-xs text-slate-400 font-medium pl-2">Target Role:</span>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="bg-slate-950 text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {jobRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton text="Traversing graph relationships to extract prerequisite dependency chain..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchSkillGap} />
      ) : gapData ? (
        <div className="space-y-8">
          {/* Readiness Summary Gauge */}
          <ReadinessGauge
            score={gapData.readinessScore}
            matchedCount={gapData.matchedCount}
            totalRequired={gapData.totalRequired}
            targetRoleTitle={gapData.role.title}
          />

          {/* Matched vs Missing Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">Acquired & Matched Skills</h3>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  {gapData.matchedSkills.length} Matched
                </span>
              </div>

              <div className="space-y-2">
                {gapData.matchedSkills.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-semibold text-slate-200">{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({s.category})</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-100">Identified Skill Gaps</h3>
                </div>
                <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40">
                  {gapData.missingSkills.length} Needed
                </span>
              </div>

              <div className="space-y-2">
                {gapData.missingSkills.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="font-semibold text-slate-200">{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({s.category})</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        s.importance === 'Must-Have'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {s.importance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Topological Learning Order */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <LearningPathway roadmap={gapData.learningRoadmap} />
          </div>

          {/* Lateral Career Pivots / Alternative Roles */}
          {pivots.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-cyan-400" />
                    Adjacent Career Pivots (High Skill Overlap)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Roles sharing highest Jaccard skill adjacency with {gapData.role.title}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pivots.map((p) => (
                  <div
                    key={p.role.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {p.effortLevel}
                        </span>
                        <span className="text-xs font-bold text-cyan-400">{p.overlapPercentage}% Overlap</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{p.role.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.role.description}</p>
                    </div>

                    <button
                      onClick={() => setSelectedRoleId(p.role.id)}
                      className="mt-4 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors text-center"
                    >
                      Analyze This Pivot
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Underlying Cypher Query */}
          <CypherQueryViewer
            cypher={cypherInfo}
            title="Query 2: Topological Prerequisite DAG & Skill Gap Cypher"
          />
        </div>
      ) : null}
    </div>
  );
}
