import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3-force';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  Filter,
  Info,
  ExternalLink,
  Tag,
  ArrowRight
} from 'lucide-react';
import { GraphNode, GraphEdge } from '../types/graph';

const NODE_COLORS: Record<string, { bg: string; stroke: string; glow: string; text: string }> = {
  User: { bg: '#f59e0b', stroke: '#d97706', glow: 'rgba(245, 158, 11, 0.4)', text: '#ffffff' },
  Skill: { bg: '#06b6d4', stroke: '#0891b2', glow: 'rgba(6, 182, 212, 0.4)', text: '#ffffff' },
  JobRole: { bg: '#8b5cf6', stroke: '#7c3aed', glow: 'rgba(139, 92, 246, 0.4)', text: '#ffffff' },
  Technology: { bg: '#3b82f6', stroke: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)', text: '#ffffff' },
  Company: { bg: '#10b981', stroke: '#059669', glow: 'rgba(16, 185, 129, 0.4)', text: '#ffffff' },
  Project: { bg: '#f43f5e', stroke: '#e11d48', glow: 'rgba(244, 63, 94, 0.4)', text: '#ffffff' },
  Course: { bg: '#f97316', stroke: '#ea580c', glow: 'rgba(249, 115, 22, 0.4)', text: '#ffffff' },
  Certification: { bg: '#ec4899', stroke: '#db2777', glow: 'rgba(236, 72, 153, 0.4)', text: '#ffffff' },
  Domain: { bg: '#6366f1', stroke: '#4f46e5', glow: 'rgba(99, 102, 241, 0.4)', text: '#ffffff' }
};

interface SimNode extends d3.SimulationNodeDatum, GraphNode {
  radius: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  id: string;
  type: string;
  source: SimNode | string;
  target: SimNode | string;
  properties?: Record<string, any>;
}

export function GraphCanvas({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  height = 550
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId?: string;
  onSelectNode?: (node: GraphNode | null) => void;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [inspectorNode, setInspectorNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabelFilter, setSelectedLabelFilter] = useState('All');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<SimNode | null>(null);

  // Filter nodes & links
  const { filteredNodes, filteredEdges } = useMemo(() => {
    let fn = nodes;
    if (selectedLabelFilter !== 'All') {
      fn = fn.filter((n) => n.label === selectedLabelFilter);
    }
    const nodeIds = new Set(fn.map((n) => n.id));
    const fe = edges.filter((e) => {
      const sId = typeof e.source === 'object' ? (e.source as any).id : e.source;
      const tId = typeof e.target === 'object' ? (e.target as any).id : e.target;
      return nodeIds.has(sId) && nodeIds.has(tId);
    });
    return { filteredNodes: fn, filteredEdges: fe };
  }, [nodes, edges, selectedLabelFilter]);

  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 800;
    const canvasHeight = height;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = canvasHeight * window.devicePixelRatio;

    // Build Sim Nodes
    const simNodes: SimNode[] = filteredNodes.map((n) => ({
      ...n,
      radius: n.label === 'JobRole' || n.label === 'Domain' ? 18 : 14,
      x: n.x || width / 2 + (Math.random() - 0.5) * 400,
      y: n.y || canvasHeight / 2 + (Math.random() - 0.5) * 300
    }));

    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

    // Build Sim Links
    const simLinks: SimLink[] = filteredEdges
      .map((e) => {
        const sId = typeof e.source === 'object' ? (e.source as any).id : e.source;
        const tId = typeof e.target === 'object' ? (e.target as any).id : e.target;
        return {
          id: e.id,
          type: e.type,
          source: nodeMap.get(sId) || sId,
          target: nodeMap.get(tId) || tId,
          properties: e.properties
        };
      })
      .filter((l) => typeof l.source === 'object' && typeof l.target === 'object');

    simNodesRef.current = simNodes;
    simLinksRef.current = simLinks;

    // D3 Force Simulation
    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(75)
      )
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, canvasHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 12))
      .alpha(0.8)
      .alphaDecay(0.02);

    simulationRef.current = simulation;

    // Render loop
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function render() {
      if (!ctx || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr * zoomLevel, dpr * zoomLevel);
      ctx.translate(panOffset.x / zoomLevel, panOffset.y / zoomLevel);

      // Draw Links
      simLinksRef.current.forEach((link) => {
        const source = link.source as SimNode;
        const target = link.target as SimNode;
        if (!source.x || !source.y || !target.x || !target.y) return;

        const isHighlighted =
          hoveredNode && (hoveredNode.id === source.id || hoveredNode.id === target.id);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = isHighlighted ? '#38bdf8' : 'rgba(71, 85, 105, 0.35)';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();

        // Edge label if hovered
        if (isHighlighted) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(link.type, midX, midY - 4);
        }
      });

      // Draw Nodes
      simNodesRef.current.forEach((node) => {
        if (!node.x || !node.y) return;

        const colors = NODE_COLORS[node.label] || { bg: '#64748b', stroke: '#475569', glow: '', text: '#fff' };
        const isSelected = selectedNodeId === node.id || inspectorNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isSearchMatch =
          searchQuery.trim() !== '' &&
          node.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Glow ring
        if (isSelected || isHovered || isSearchMatch) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
          ctx.fillStyle = colors.glow || 'rgba(56, 189, 248, 0.4)';
          ctx.fill();
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = colors.bg;
        ctx.fill();
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.strokeStyle = isSelected ? '#ffffff' : colors.stroke;
        ctx.stroke();

        // Node Label
        ctx.fillStyle = '#f1f5f9';
        ctx.font = isSelected ? 'bold 11px Plus Jakarta Sans' : '10px Plus Jakarta Sans';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + node.radius + 12);
      });

      ctx.restore();
    }

    simulation.on('tick', render);

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredEdges, height, zoomLevel, panOffset, hoveredNode, selectedNodeId, inspectorNode, searchQuery]);

  // Pointer interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const clickY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

    // Find clicked node
    const clickedNode = simNodesRef.current.find((n) => {
      if (!n.x || !n.y) return false;
      const dx = n.x - clickX;
      const dy = n.y - clickY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      clickedNode.fx = clickedNode.x;
      clickedNode.fy = clickedNode.y;
      if (simulationRef.current) simulationRef.current.alphaTarget(0.3).restart();
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (draggedNodeRef.current) {
      const clickX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const clickY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
      draggedNodeRef.current.fx = clickX;
      draggedNodeRef.current.fy = clickY;
      return;
    }

    if (isDraggingRef.current) {
      setPanOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
      return;
    }

    // Hover check
    const mouseX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const mouseY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

    const hovered = simNodesRef.current.find((n) => {
      if (!n.x || !n.y) return false;
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });

    setHoveredNode(hovered || null);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.fx = null;
      draggedNodeRef.current.fy = null;
      draggedNodeRef.current = null;
      if (simulationRef.current) simulationRef.current.alphaTarget(0);
    }
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const clickY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

    const clicked = simNodesRef.current.find((n) => {
      if (!n.x || !n.y) return false;
      const dx = n.x - clickX;
      const dy = n.y - clickY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });

    setInspectorNode(clicked || null);
    if (onSelectNode) onSelectNode(clicked || null);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    if (simulationRef.current) simulationRef.current.alpha(0.5).restart();
  };

  return (
    <div className="relative glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800/80 bg-slate-900/70 z-10">
        <div className="flex items-center space-x-2">
          {/* Label Filter */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={selectedLabelFilter}
              onChange={(e) => setSelectedLabelFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none pr-2 py-0.5 cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Labels</option>
              {Object.keys(NODE_COLORS).map((lbl) => (
                <option key={lbl} value={lbl} className="bg-slate-900">{lbl}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 sm:w-48 bg-slate-950/80 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.2))}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            title="Reset View"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full" style={{ height }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          className="w-full h-full cursor-grab active:cursor-grabbing bg-slate-950 bg-dot-pattern"
        />

        {/* Node Label Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800/80 text-[10px] text-slate-300 max-w-sm pointer-events-none">
          {Object.entries(NODE_COLORS).map(([label, style]) => (
            <div key={label} className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-950/60">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.bg }} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Node Inspector Drawer */}
        {inspectorNode && (
          <div className="absolute top-3 right-3 w-80 glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-2xl z-20 space-y-3 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${NODE_COLORS[inspectorNode.label]?.bg}20`,
                    color: NODE_COLORS[inspectorNode.label]?.bg
                  }}
                >
                  :{inspectorNode.label}
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-1">{inspectorNode.name}</h4>
              </div>
              <button
                onClick={() => setInspectorNode(null)}
                className="text-slate-400 hover:text-slate-200 text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Properties List */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 max-h-56 overflow-y-auto">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Node Properties</div>
              {Object.entries(inspectorNode.properties || {}).map(([key, val]) => (
                <div key={key} className="text-xs flex items-start justify-between py-0.5 text-slate-300 font-mono">
                  <span className="text-slate-400 mr-2">{key}:</span>
                  <span className="text-cyan-300 text-right truncate max-w-[150px]">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
