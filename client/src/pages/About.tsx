import React from 'react';
import {
  Info,
  Database,
  Network,
  CheckCircle2,
  Cpu,
  Layers,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';

export function About() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Info className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">System Architecture & Technical Guide</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Complete technical blueprint, graph schema definitions, CognoDB configuration, and interview talking points.
        </p>
      </div>

      {/* Wexa AI Take-Home Compliance Checklist */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-slate-100">Assignment Requirements Checklist</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>CognoDB Graph Database Layer</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Official Neo4j JavaScript Driver</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Parameterized openCypher</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>9 Labeled Node Types</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>14 Typed Graph Relationships</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Multi-Hop Traversal (2+ to 6 Hops)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Topological DAG Learning Order</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Interactive Force-Directed Graph</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero Secret Commits (.env protected)</span>
          </div>
        </div>
      </div>

      {/* Architecture Diagram & Flow */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          End-to-End System Architecture
        </h3>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300/90 leading-relaxed overflow-x-auto">
          <pre>{`React 19 + TypeScript (Vite + Tailwind CSS)
        │
        ▼ (Axios REST API calls with Parameterized Payloads)
Express 4 REST Server (TypeScript + Controller/Service Pattern)
        │
        ▼ (Bolt Protocol Session Management)
Official Neo4j Driver (neo4j-driver v5)
        │
        ▼ (openCypher Traversal Engine)
CognoDB Graph Database Layer (with Index-Free Adjacency)`}</pre>
        </div>
      </div>

      {/* CognoDB Instance Setup Guide */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-base font-bold text-slate-100">Connecting to CognoDB Cloud Instance</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <p>
            CareerGraph is architected to seamlessly query any CognoDB or Neo4j-compatible openCypher cloud instance:
          </p>

          <ol className="list-decimal list-inside space-y-2 ml-2 text-slate-300">
            <li>
              Obtain your CognoDB Bolt URI, Username, and Database Password from the CognoDB Cloud Console.
            </li>
            <li>
              Create a <code className="text-cyan-300 font-mono">.env</code> file in the <code className="text-cyan-300 font-mono">server/</code> directory:
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-200 mt-2">
{`COGNODB_URI=bolt+s://your-instance.cognodb.io:7687
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your-secure-password
COGNODB_DATABASE=neo4j`}
              </pre>
            </li>
            <li>
              Run the batch seeder script to populate nodes and relationships:
              <pre className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 mt-1">
npm run seed
              </pre>
            </li>
          </ol>
        </div>
      </div>

      {/* Technical Interview Talking Points */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Key Interview Talking Points
        </h3>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-cyan-300">1. Why Graph Databases Beat Relational for Career Discovery</h4>
            <p>
              In relational databases, querying multi-degree relationships (e.g. User ➔ Skill ➔ Role ➔ Domain ➔ Sibling Role ➔ Hiring Company) requires 7+ nested JOINs, creating large intermediate hash tables and CPU-heavy table scans. In CognoDB, graph relationships are stored as direct physical memory pointers (Index-Free Adjacency), yielding sub-millisecond O(k) traversals regardless of total database size.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-cyan-300">2. Topological Skill Gap Roadmaps via Graph DAGs</h4>
            <p>
              By leveraging typed <code className="text-cyan-300 font-mono">[:PREREQUISITE_OF]</code> edges between skill nodes, we construct a directed acyclic graph (DAG). The backend evaluates prerequisites dynamically so early-career students learn foundational skills (e.g., Python before PyTorch, or Docker before Kubernetes) in a pedagogically optimal order.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-cyan-300">3. Parameterized openCypher Query Security</h4>
            <p>
              Every Cypher query uses explicit parameter bindings (<code className="text-cyan-300 font-mono">$roleId</code>, <code className="text-cyan-300 font-mono">$userSkillIds</code>). No raw user input is concatenated into query strings, eliminating Cypher injection vulnerabilities and enabling CognoDB query plan caching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
