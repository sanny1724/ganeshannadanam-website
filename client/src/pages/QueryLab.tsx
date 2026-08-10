import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  Database,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Zap,
  Code2
} from 'lucide-react';
import { ApiService } from '../services/api';
import { LoadingSkeleton, ErrorAlert } from '../components/StatusComponents';

const SAMPLE_CYPHER_PRESETS = [
  {
    name: 'Query 1: Match Careers by Skills',
    cypher: `MATCH (role:JobRole)<-[req:REQUIRED_FOR]-(sk:Skill)
WHERE sk.id IN ['sk-python', 'sk-sql', 'sk-algorithms']
RETURN role.title AS title, role.avgSalary AS salary, count(sk) AS matchedSkills
ORDER BY matchedSkills DESC LIMIT 5`
  },
  {
    name: 'Query 5: Multi-Hop 2+ Traversal (Skill -> Role -> Company)',
    cypher: `MATCH (s:Skill)-[:REQUIRED_FOR]->(r:JobRole)<-[h:HIRES_FOR]-(c:Company)
WHERE s.id IN ['sk-python', 'sk-deep-learning']
RETURN s.name AS skill, r.title AS role, c.name AS company, h.salaryRange AS salary
ORDER BY c.name ASC LIMIT 8`
  },
  {
    name: 'Query 6: Variable Prerequisite Traversal',
    cypher: `MATCH (start:Skill {id: 'sk-python'})-[:PREREQUISITE_OF*1..2]->(target:Skill)-[:REQUIRED_FOR]->(r:JobRole)
RETURN start.name AS foundation, target.name AS advancedSkill, r.title AS unlockedRole
LIMIT 8`
  },
  {
    name: 'Critical Query: 6-Hop Traversal (User -> Role -> Domain -> Company)',
    cypher: `MATCH (u:User {id: 'usr-alex'})-[:HAS_SKILL]->(s:Skill)-[:REQUIRED_FOR]->(r1:JobRole)-[:BELONGS_TO]->(d:Domain)
MATCH (d)<-[:BELONGS_TO]-(r2:JobRole)<-[h:HIRES_FOR]-(c:Company)
WHERE r1 <> r2
RETURN u.name AS student, r1.title AS primaryRole, d.name AS domain, r2.title AS adjacentRole, c.name AS company
LIMIT 10`
  }
];

export function QueryLab() {
  const [activeTab, setActiveTab] = useState<'benchmark' | 'runner'>('benchmark');
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [loadingBenchmark, setLoadingBenchmark] = useState(true);

  // Runner state
  const [cypherInput, setCypherInput] = useState(SAMPLE_CYPHER_PRESETS[0].cypher);
  const [runningQuery, setRunningQuery] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  useEffect(() => {
    fetchBenchmark();
  }, []);

  const fetchBenchmark = async () => {
    try {
      setLoadingBenchmark(true);
      const res = await ApiService.getRelationalBenchmark('usr-alex');
      setBenchmarkData(res);
    } catch (err: any) {
      console.error('Benchmark load error:', err);
    } finally {
      setLoadingBenchmark(false);
    }
  };

  const handleRunCypher = async () => {
    try {
      setRunningQuery(true);
      setQueryError(null);
      const res = await ApiService.runCustomCypher(cypherInput);
      setQueryResult(res);
    } catch (err: any) {
      setQueryError(err.response?.data?.error || err.message || 'Cypher execution error');
    } finally {
      setRunningQuery(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              openCypher Query Lab & Architecture Benchmark
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare openCypher graph traversals against relational SQL JOINs and execute real-time queries.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'benchmark'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Graph vs Relational
          </button>
          <button
            onClick={() => setActiveTab('runner')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'runner'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Cypher Runner
          </button>
        </div>
      </div>

      {activeTab === 'benchmark' && (
        <div className="space-y-8">
          {/* Key Graph Architecture Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Cpu className="w-4 h-4" />
                <span>Index-Free Adjacency</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nodes hold direct physical pointers to adjacent relationship records in memory. Traversal time is proportional to subgraph size, not total database records.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>Zero Cost Multi-Hop</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Variable-length paths like <code className="text-cyan-300 font-mono text-[11px]">[:PREREQUISITE_OF*1..3]</code> execute natively without recursive SQL CTEs or Cartesian explosions.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>Dynamic Schema Agility</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Adding new relationships (e.g. <code className="text-cyan-300 font-mono text-[11px]">[:RECOMMENDS_PROJECT]</code>) requires zero table alterations or foreign-key lock migrations.
              </p>
            </div>
          </div>

          {/* Deep Side-by-Side Comparison */}
          {loadingBenchmark ? (
            <LoadingSkeleton text="Running benchmark analysis across graph and relational query plans..." />
          ) : benchmarkData ? (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Architectural Deep-Dive
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">
                    6-Hop Connected Opportunity Discovery Benchmark
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Goal: Given a student's skills, find career roles, their domains, adjacent opportunity roles in that same domain, and hiring companies with open headcount.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Graph Column */}
                  <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-bold text-cyan-200">CognoDB (openCypher)</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        O(k) Direct Pointers
                      </span>
                    </div>

                    <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                      <code>{benchmarkData.relationalComparison.graphApproach.query}</code>
                    </pre>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">JOIN Tables Scanned:</span>
                        <strong className="text-emerald-400">0 (Index-Free Adjacency)</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Query Complexity:</span>
                        <strong className="text-cyan-300 font-mono">O(k) Local Pointer Walk</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Schema Resilience:</span>
                        <strong className="text-emerald-400">High (Edge-Native)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Relational Column */}
                  <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-rose-400" />
                        <h4 className="text-sm font-bold text-rose-200">Relational RDBMS (PostgreSQL)</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        8 Foreign-Key JOINs
                      </span>
                    </div>

                    <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-rose-200/90 overflow-x-auto leading-relaxed">
                      <code>{benchmarkData.relationalComparison.relationalApproach.query}</code>
                    </pre>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">JOIN Tables Scanned:</span>
                        <strong className="text-rose-400">8 Tables + Foreign Index Scans</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Query Complexity:</span>
                        <strong className="text-rose-300 font-mono">O(N log N) with Cartesian Blowup</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Schema Resilience:</span>
                        <strong className="text-rose-400">Low (Requires Alter Table & Migrations)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traversal Results Table */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Live 6-Hop Traversal Results ({benchmarkData.results?.length || 0} Adjacent Opportunities Discovered)
                  </h4>
                  <span className="text-xs font-mono text-cyan-400">
                    Execution: {benchmarkData.graphExecutionTimeMs}ms
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Primary Role</th>
                        <th className="py-2.5 px-3">Domain</th>
                        <th className="py-2.5 px-3">Adjacent Role</th>
                        <th className="py-2.5 px-3">Hiring Company</th>
                        <th className="py-2.5 px-3">Salary Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {benchmarkData.results.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-200">{row.studentName}</td>
                          <td className="py-2.5 px-3 text-cyan-300">{row.primaryRole}</td>
                          <td className="py-2.5 px-3 text-slate-400">{row.techDomain}</td>
                          <td className="py-2.5 px-3 font-semibold text-purple-300">{row.adjacentOpportunityRole}</td>
                          <td className="py-2.5 px-3 text-emerald-400">{row.hiringCompany}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-300">{row.salaryRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Live Cypher Runner View */}
      {activeTab === 'runner' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Live openCypher Query Editor</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Execute safe read-only Cypher queries against CognoDB database engine.
                </p>
              </div>

              {/* Preset Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Presets:</span>
                <select
                  onChange={(e) => {
                    const preset = SAMPLE_CYPHER_PRESETS.find((p) => p.name === e.target.value);
                    if (preset) setCypherInput(preset.cypher);
                  }}
                  className="bg-slate-900 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {SAMPLE_CYPHER_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Code Input */}
            <div className="relative">
              <textarea
                value={cypherInput}
                onChange={(e) => setCypherInput(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 leading-relaxed resize-y"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Guarded against mutations (Read-Only: MATCH, RETURN, WHERE, WITH, ORDER BY, LIMIT).
              </span>

              <button
                onClick={handleRunCypher}
                disabled={runningQuery}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>{runningQuery ? 'Executing Query...' : 'Run openCypher'}</span>
              </button>
            </div>
          </div>

          {/* Results Output */}
          {queryError && <ErrorAlert title="Cypher Execution Error" message={queryError} />}

          {queryResult && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-slate-100">Query Output</h4>
                  <span className="text-xs text-slate-400 font-mono">({queryResult.records.length} records)</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-400">
                    Engine: <strong className="text-cyan-400">{queryResult.engine}</strong>
                  </span>
                  <span className="text-slate-400">
                    Latency: <strong className="text-emerald-400">{queryResult.executionTimeMs}ms</strong>
                  </span>
                </div>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-96">
                <code>{JSON.stringify(queryResult.records, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
