import React from 'react';
import { ArrowRight, BookOpen, CheckCircle, ExternalLink, Flame, Layers, Star, Zap } from 'lucide-react';
import { SkillGapData } from '../types/graph';

export function LearningPathway({ roadmap }: { roadmap: SkillGapData['learningRoadmap'] }) {
  if (!roadmap || roadmap.length === 0) {
    return (
      <div className="p-8 glass-panel rounded-2xl border border-slate-800 text-center text-slate-400">
        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-sm">You already possess all required skills for this role!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Topological Graph Learning Pathway
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ordered dynamically via openCypher <code className="text-cyan-300 font-mono text-[11px]">[:PREREQUISITE_OF]</code> dependency DAG traversal.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          {roadmap.length} Milestones
        </span>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-8">
        {roadmap.map((stepItem, idx) => (
          <div key={stepItem.skill.id} className="relative group">
            {/* Step circle bullet on timeline */}
            <div className="absolute -left-[35px] top-1 w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-500 text-cyan-300 flex items-center justify-center text-xs font-bold shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
              {stepItem.step}
            </div>

            {/* Step Card */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 group-hover:border-slate-700 transition-all space-y-3">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-100">{stepItem.skill.name}</h4>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {stepItem.skill.category}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      stepItem.importance === 'Must-Have'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {stepItem.importance}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Difficulty: {stepItem.skill.difficulty}
                  </span>
                </div>
              </div>

              {/* Reason / Prerequisite note */}
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{stepItem.reason}</span>
              </p>

              {/* Unmet prerequisites notice */}
              {stepItem.unmetPrerequisites && stepItem.unmetPrerequisites.length > 0 && (
                <div className="text-xs text-amber-300/90 bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/30 flex items-start gap-2">
                  <span className="font-semibold text-amber-400">Prerequisites:</span>
                  <span>Complete {stepItem.unmetPrerequisites.join(', ')} first for optimal comprehension.</span>
                </div>
              )}

              {/* Associated Courses from Graph Traversal */}
              {stepItem.courses && stepItem.courses.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    Recommended Graph Courses ({stepItem.courses.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stepItem.courses.map((c) => (
                      <a
                        key={c.id}
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 transition-colors flex items-center justify-between text-xs group/link"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-medium text-slate-200 truncate group-hover/link:text-cyan-300">
                            {c.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{c.provider}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {c.rating}
                            </span>
                            <span>•</span>
                            <span>{c.durationHours}h</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover/link:text-cyan-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
