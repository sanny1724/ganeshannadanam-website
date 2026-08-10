import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Code,
  Award,
  ExternalLink,
  Star,
  Clock,
  Zap,
  CheckCircle2,
  FolderGit2,
  Filter,
  Sparkles
} from 'lucide-react';
import { UserProfile, JobRole, Project, Course, Certification } from '../types/graph';
import { ApiService } from '../services/api';
import { LoadingSkeleton, ErrorAlert } from '../components/StatusComponents';
import { CypherQueryViewer } from '../components/CypherQueryViewer';

interface ProjectsCoursesProps {
  currentUser: UserProfile;
  jobRoles: JobRole[];
  initialRoleId?: string;
}

export function ProjectsCourses({ currentUser, jobRoles, initialRoleId }: ProjectsCoursesProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    initialRoleId || currentUser.targetRoleId || jobRoles[0]?.id || 'role-ml-eng'
  );
  const [activeTab, setActiveTab] = useState<'projects' | 'courses' | 'certs'>('projects');
  const [data, setData] = useState<{
    roleTitle: string;
    projects: Project[];
    courses: Course[];
    certifications: Certification[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cypherQueries, setCypherQueries] = useState<any[]>([]);

  useEffect(() => {
    if (initialRoleId) {
      setSelectedRoleId(initialRoleId);
    }
  }, [initialRoleId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiService.getRoleRecommendations(
        selectedRoleId,
        currentUser.currentSkillIds
      );
      setData(res.data);
      setCypherQueries(res.cypherQueries);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch graph recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedRoleId, currentUser]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Target Role Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Graph-Recommended Projects & Resources
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Curated hands-on capstone projects and accredited courses linked to missing skills via graph edges.
          </p>
        </div>

        {/* Role Selector */}
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

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'projects'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-800'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Capstone Projects ({data?.projects?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'courses'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Courses ({data?.courses?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('certs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'certs'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Industry Certifications ({data?.certifications?.length || 0})</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton text="Traversing graph relationships for role-specific portfolio projects..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchRecommendations} />
      ) : data ? (
        <div className="space-y-6">
          {/* Projects View */}
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="glass-panel p-6 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-100">{proj.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          proj.difficulty === 'Advanced'
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {proj.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{proj.description}</p>

                    {/* Gap Skills Unlocked */}
                    {proj.gapSkillsUnlocked && proj.gapSkillsUnlocked.length > 0 && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/30">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          Closes Your Skill Gaps ({proj.gapSkillsUnlocked.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {proj.gapSkillsUnlocked.map((s) => (
                            <span key={s.id} className="text-[11px] text-amber-200 font-medium">
                              • {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tech Stack Pills */}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {proj.technologies.map((t) => (
                          <span
                            key={t.id}
                            className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>~{proj.estimatedHours} Hours</span>
                    </div>

                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors"
                    >
                      <span>View GitHub Repo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Courses View */}
          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.courses.map((crs) => (
                <div
                  key={crs.id}
                  className="glass-panel p-6 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          {crs.provider}
                        </span>
                        <h3 className="text-base font-bold text-slate-100 mt-1">{crs.title}</h3>
                      </div>

                      <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{crs.rating}</span>
                      </div>
                    </div>

                    {/* Skills taught */}
                    {crs.skillsTaught && crs.skillsTaught.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                          Skills Taught:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {crs.skillsTaught.map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[11px]"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{crs.durationHours} Hours ({crs.level})</span>
                    </div>

                    <a
                      href={crs.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold rounded-xl border border-cyan-500/30 flex items-center space-x-1.5 transition-colors"
                    >
                      <span>Enroll Online</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications View */}
          {activeTab === 'certs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="glass-panel p-6 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                          {cert.issuer}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 mt-0.5">{cert.name}</h3>
                      </div>
                    </div>

                    {cert.validatedSkills && cert.validatedSkills.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                          Industry Skills Validated:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {cert.validatedSkills.map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-200 border border-slate-800 text-[11px]"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Valid: {cert.validityYears} Years</span>
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-pink-300 font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors"
                    >
                      <span>Exam Blueprint</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Underlying Cypher Queries */}
          {cypherQueries.map((cq, idx) => (
            <CypherQueryViewer key={idx} cypher={cq} title={cq.name || `Recommendation Query ${idx + 1}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
