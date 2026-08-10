import React, { useState } from 'react';
import { Code2, Copy, Check, ChevronDown, ChevronUp, Database, Sparkles } from 'lucide-react';
import { CypherQueryInfo } from '../types/graph';

export function CypherQueryViewer({
  cypher,
  title = 'Underlying openCypher Query',
  defaultExpanded = false
}: {
  cypher?: CypherQueryInfo | string;
  title?: string;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  if (!cypher) return null;

  const queryString = typeof cypher === 'string' ? cypher : cypher.query;
  const params = typeof cypher === 'object' && cypher.parameters ? cypher.parameters : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(queryString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden my-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/60 hover:bg-slate-900/90 transition-colors text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-cyan-300 tracking-wide uppercase">openCypher Engine</span>
            <h4 className="text-sm font-medium text-slate-200">{title}</h4>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="hidden sm:inline">Parameterized Cypher</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 bg-slate-950/90 border-t border-slate-800/80 space-y-4">
          <div className="relative">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Cypher</span>
                </>
              )}
            </button>
            <pre className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono text-cyan-200/90 overflow-x-auto leading-relaxed">
              <code>{queryString.trim()}</code>
            </pre>
          </div>

          {params && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Runtime Parameters (Safe Parameterization)</span>
              </div>
              <pre className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/70 text-xs font-mono text-amber-300/90 overflow-x-auto">
                <code>{JSON.stringify(params, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
