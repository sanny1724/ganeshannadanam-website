import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Filter,
  Briefcase,
  Building,
  Target,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Code2,
  Layers,
  Plus,
  X
} from 'lucide-react';
import { UserProfile, Skill, Domain, CareerRecommendation } from '../types/graph';
import { ApiService } from '../services/api';
import { LoadingSkeleton, ErrorAlert, EmptyState } from '../components/StatusComponents';
import { CypherQueryViewer } from '../components/CypherQueryViewer';

interface CareerExplorerProps {
  currentUser: UserProfile;
  skills: Skill[];
  domains: Domain[];
  onNavigate: (tab: string, context?: any) => void;
}

export function CareerExplorer({ currentUser, skills, domains, onNavigate }: CareerExplorerProps) {
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSkillIds, setActiveSkillIds] = useState<string[]>(currentUser.currentSkillIds);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cypherInfo, setCypherInfo] = useState<any>(null);
  const [skillSelectorOpen, setSkillSelectorOpen] = useState(false);

  useEffect(() => {
    setActiveSkillIds(currentUser.currentSkillIds);
  }, [currentUser]);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiService.getCareerRecommendations(activeSkillIds, selectedDomain);
      setRecommendations(res.recommendations);
      setCypherInfo(res.cypherQuery);
    } catch (err: any) {
      setError(err.message || 'Failed to query career graph.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, [activeSkillIds, selectedDomain]);

  const toggleSkill = (skillId: string) => {
    if (activeSkillIds.includes(skillId)) {
      setActiveSkillIds(activeSkillIds.filter((id) => id !== skillId));
    } else {
      setActiveSkillIds([...activeSkillIds, skillId]);
    }
  };

  const filteredCareers = recommendations.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Explore Career Paths</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Traverse CognoDB relationship graph to discover job roles, calculate match scores, and explore hiring tech companies.
          </p>
        </div>

        {/* Skill Customizer Toggle */}
        <button
          onClick={() => setSkillSelectorOpen(!skillSelectorOpen)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors self-start md:self-auto"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Interactive Skill Simulator ({activeSkillIds.length} Active)</span>
        </button>
      </div>

      {/* Interactive Skill Selector Box (Expandable) */}
      {skillSelectorOpen && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Simulate Skill Profile</h3>
              <p className="text-xs text-slate-400">Click skills to add or remove them and see real-time graph match percentage updates.</p>
            </div>
            <button
              onClick={() => setActiveSkillIds(currentUser.currentSkillIds)}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Reset to Profile
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
            {skills.map((s) => {
              const isSelected = activeSkillIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSkill(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search job title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 text-slate-200 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDomain('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedDomain === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
            }`}
          >
            All Domains
          </button>
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedDomain === d.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
              }`}
            >
              {d.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Career Cards Grid */}
      {loading ? (
        <LoadingSkeleton text="Computing career match percentages across graph relationships..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchCareers} />
      ) : filteredCareers.length === 0 ? (
        <EmptyState
          title="No career roles match your filter"
          description="Try selecting a different domain or adding more skills in the simulator."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCareers.map((rec) => (
            <div
              key={rec.roleId}
              className="glass-panel p-6 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800/90 text-cyan-300 border border-slate-700">
                      {rec.domain?.name || 'Technology'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 tracking-tight mt-1.5">{rec.title}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-extrabold text-sm shadow-sm">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{rec.matchPercentage}% Match</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {rec.matchedSkillsCount} of {rec.totalRequiredCount} Skills
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{rec.description}</p>

                {/* Salary & Experience metrics */}
                <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Avg Salary:</span>
                    <span className="font-semibold text-emerald-400 font-mono">{rec.avgSalary}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Experience Level:</span>
                    <span className="font-semibold text-slate-200">{rec.experienceRequired}</span>
                  </div>
                </div>

                {/* Matched Skills */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Matched Skills ({rec.matchedSkills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.matchedSkills.length > 0 ? (
                      rec.matchedSkills.map((s) => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 text-[11px] font-medium"
                        >
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None matched yet</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="space-y-2 mt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    Missing Gaps ({rec.missingSkills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.missingSkills.map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-medium"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connected Hiring Companies */}
                {rec.hiringCompanies.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-cyan-400" />
                      Hiring Companies from Graph
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rec.hiringCompanies.map((c) => (
                        <span
                          key={c.name}
                          className="px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-200 border border-slate-800 text-[11px] font-medium"
                        >
                          {c.name} <span className="text-slate-400">({c.openPositions} open)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => onNavigate('skill-gap', { roleId: rec.roleId })}
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-500/20"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Analyze Gap & Roadmap</span>
                </button>
                <button
                  onClick={() => onNavigate('resources', { roleId: rec.roleId })}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl text-xs border border-slate-800 transition-colors"
                >
                  Projects ({rec.recommendedProjectsCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Underlying Cypher Query */}
      <CypherQueryViewer
        cypher={cypherInfo}
        title="Query 1: Parameterized Multi-Criteria Career Matching"
      />
    </div>
  );
}
