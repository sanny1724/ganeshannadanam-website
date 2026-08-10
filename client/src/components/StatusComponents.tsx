import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2, Sparkles } from 'lucide-react';

export function LoadingSkeleton({ text = 'Querying CognoDB graph...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 glass-panel rounded-2xl border border-slate-800">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse">{text}</p>
    </div>
  );
}

export function EmptyState({
  title = 'No results found',
  description = 'Try selecting different skills or adjusting your search filters.',
  actionLabel,
  onAction
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl border border-slate-800">
      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 mb-4 text-slate-400">
        <Info className="w-8 h-8 text-cyan-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mt-1 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorAlert({
  title = 'Database Connection Issue',
  message,
  onRetry
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-5 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-start space-x-4">
      <div className="p-2 bg-rose-900/50 rounded-xl text-rose-400 shrink-0">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-rose-200">{title}</h4>
        <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-medium rounded-lg border border-rose-700/50 transition-colors"
          >
            Retry Query
          </button>
        )}
      </div>
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'cyan'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: string;
  color?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'purple';
}) {
  const colorMap = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/10',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10'
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-slate-100 tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center space-x-2 mt-1">
            {trend && <span className="text-xs font-semibold text-emerald-400">{trend}</span>}
            {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl max-h-[85vh] rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
