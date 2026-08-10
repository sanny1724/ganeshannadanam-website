import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  ArrowRight,
  Sparkles,
  Building,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';
import { Skill, Domain } from '../types/graph';
import { ApiService } from '../services/api';
import { LoadingSkeleton, ErrorAlert, EmptyState } from '../components/StatusComponents';
import { CypherQueryViewer } from '../components/CypherQueryViewer';

export function CareerPathExplorer({ skills }: { skills: Skill[] }) {
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || 'sk-python');
  const [pathData, setPathData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cypherInfo, setCypherInfo] = useState<any>(null);

  const fetchPaths = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiService.getCareerPaths(selectedSkillId);
      if (res?.data) {
        setPathData(res.data);
        setCypherInfo(res.cypherQuery);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to discover career pathways.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSkillId) {
      fetchPaths();
    }
  }, [selectedSkillId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Multi-Hop Career Path Discovery</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore 2 to 5-hop relationship traversals from foundational skills to high-paying tech careers and hiring companies.
          </p>
        </div>

        {/* Starting Skill Selector */}
        <div className="flex items-center space-x-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 self-start md:self-auto">
          <span className="text-xs text-slate-400 font-medium pl-2">Starting Skill:</span>
          <select
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
            className="bg-slate-950 text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton text="Traversing multi-hop graph branches in CognoDB..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchPaths} />
      ) : pathData ? (
        <div className="space-y-8">
          {/* Summary & Unlocked Downstream Skills */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-100">
                  Starting Node: <span className="text-cyan-300 font-mono">{pathData.startingSkill?.name}</span>
                </h3>
              </div>
              <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                {pathData.discoveredPaths?.length || 0} Graph Pathways Discovered
              </span>
            </div>

            {pathData.downstreamSkillsUnlocked && pathData.downstreamSkillsUnlocked.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Direct Downstream Skills Unlocked via <code className="text-cyan-300 text-[10px]">[:PREREQUISITE_OF]</code>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pathData.downstreamSkillsUnlocked.map((s: Skill) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSkillId(s.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-cyan-500/40 text-xs transition-colors flex items-center space-x-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Discovered Paths Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Multi-Hop Traversal Pathways
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {pathData.discoveredPaths.map((path: any) => (
                <div
                  key={path.pathId}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all space-y-4"
                >
                  {/* Traversal Flow Sequence */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {path.hops.map((hop: any, idx: number) => (
                      <React.Fragment key={idx}>
                        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2">
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{hop.type}:</span>
                          <span className="font-semibold text-slate-100">{hop.name}</span>
                        </div>
                        {idx < path.hops.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Destination Career & Hiring Companies */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                        <h4 className="text-sm font-bold text-slate-100">{path.targetRole.title}</h4>
                        <span className="text-[10px] font-semibold text-emerald-400 font-mono">
                          {path.targetRole.avgSalary}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{path.targetRole.description}</p>
                    </div>

                    {path.hiringCompanies && path.hiringCompanies.length > 0 && (
                      <div className="text-right shrink-0">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1 flex items-center gap-1 sm:justify-end">
                          <Building className="w-3 h-3 text-emerald-400" />
                          Hiring Companies
                        </div>
                        <div className="flex flex-wrap sm:justify-end gap-1.5">
                          {path.hiringCompanies.map((c: any) => (
                            <span
                              key={c.name}
                              className="px-2 py-0.5 rounded-md bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 text-[11px]"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Underlying Cypher Query */}
          <CypherQueryViewer
            cypher={cypherInfo}
            title="Query 6: Variable Multi-Hop Career Traversal Cypher"
          />
        </div>
      ) : (
        <EmptyState title="No paths discovered for this skill" />
      )}
    </div>
  );
}
