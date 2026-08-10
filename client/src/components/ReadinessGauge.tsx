import React from 'react';
import { CheckCircle2, AlertCircle, Award, Target } from 'lucide-react';

export function ReadinessGauge({
  score,
  matchedCount,
  totalRequired,
  targetRoleTitle
}: {
  score: number;
  matchedCount: number;
  totalRequired: number;
  targetRoleTitle?: string;
}) {
  const missingCount = Math.max(0, totalRequired - matchedCount);
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorScheme = {
    stroke: '#06b6d4', // cyan
    glow: 'rgba(6, 182, 212, 0.3)',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    status: 'Strong Trajectory'
  };

  if (score >= 80) {
    colorScheme = {
      stroke: '#10b981', // emerald
      glow: 'rgba(16, 185, 129, 0.3)',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      status: 'High Readiness'
    };
  } else if (score < 50) {
    colorScheme = {
      stroke: '#f59e0b', // amber
      glow: 'rgba(245, 158, 11, 0.3)',
      text: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      status: 'Foundational Phase'
    };
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Radial SVG Gauge */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-36 h-36 transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-800"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={colorScheme.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: `drop-shadow(0 0 8px ${colorScheme.glow})`
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold ${colorScheme.text} tracking-tight`}>{score}%</span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-0.5">Readiness</span>
        </div>
      </div>

      {/* Details & Target Breakdown */}
      <div className="flex-1 text-center md:text-left space-y-3">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${colorScheme.badge}`}>
            {colorScheme.status}
          </span>
          {targetRoleTitle && (
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Target: <strong className="text-slate-100">{targetRoleTitle}</strong>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-md">
          Calculated dynamically via openCypher graph requirements across verified skills, core frameworks, and domain dependencies.
        </p>

        {/* Skill count pills */}
        <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
          <div className="flex items-center space-x-1.5 text-xs text-emerald-300 bg-emerald-950/40 px-2.5 py-1.5 rounded-xl border border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span><strong>{matchedCount}</strong> Matched Skills</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-amber-300 bg-amber-950/40 px-2.5 py-1.5 rounded-xl border border-amber-800/40">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span><strong>{missingCount}</strong> Missing Gaps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
