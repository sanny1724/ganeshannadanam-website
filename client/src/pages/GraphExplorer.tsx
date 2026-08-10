import React, { useState, useEffect } from 'react';
import { Network, Sparkles, Filter, Database, Layers, Info } from 'lucide-react';
import { GraphSubgraph, GraphNode } from '../types/graph';
import { ApiService } from '../services/api';
import { GraphCanvas } from '../components/GraphCanvas';
import { LoadingSkeleton, ErrorAlert } from '../components/StatusComponents';
import { CypherQueryViewer } from '../components/CypherQueryViewer';

export function GraphExplorer() {
  const [subgraph, setSubgraph] = useState<GraphSubgraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cypherInfo, setCypherInfo] = useState<any>(null);

  const fetchGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiService.getGraphSubgraph({ limit: 180 });
      setSubgraph(res.subgraph);
      setCypherInfo(res.cypherQuery);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch graph nodes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Network className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Interactive Graph Explorer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore live interconnected graph entities: drag nodes, zoom/pan, inspect typed relationships, and filter by label.
          </p>
        </div>

        {subgraph && (
          <div className="flex items-center space-x-3 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 text-xs self-start md:self-auto">
            <div>
              <span className="text-slate-400 font-medium">Rendered Nodes: </span>
              <strong className="text-cyan-400">{subgraph.nodes.length}</strong>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400 font-medium">Relationships: </span>
              <strong className="text-indigo-400">{subgraph.edges.length}</strong>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton text="Extracting CognoDB graph nodes & relationships for canvas rendering..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchGraph} />
      ) : subgraph ? (
        <div className="space-y-6">
          {/* Interactive Force-Directed Canvas */}
          <GraphCanvas
            nodes={subgraph.nodes}
            edges={subgraph.edges}
            selectedNodeId={selectedNode?.id}
            onSelectNode={(n) => setSelectedNode(n)}
            height={620}
          />

          {/* Quick Guide Card */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-start space-x-3 text-xs text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-100">Interaction Tips: </span>
              Click on any node to open its property inspector drawer. Drag nodes to reshape graph clusters. Hover over nodes to highlight direct relationship edges and labels. Use the top toolbar to search or isolate specific entity types.
            </div>
          </div>

          {/* Underlying Cypher Query */}
          <CypherQueryViewer
            cypher={cypherInfo}
            title="Query 7: openCypher Subgraph Extraction Query"
          />
        </div>
      ) : null}
    </div>
  );
}
