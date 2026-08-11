import React, { useState, useEffect } from 'react';
import {
  Bot,
  Briefcase,
  Mail,
  Shield,
  Sliders,
  Sparkles,
  Menu,
  X,
  Bell,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { AgentApiService, AgentStatusData } from '../services/agentApi';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export function Layout({
  activeTab,
  setActiveTab,
  children
}: LayoutProps) {
  const [agentStatus, setAgentStatus] = useState<AgentStatusData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    AgentApiService.getStatus()
      .then((data) => setAgentStatus(data))
      .catch((err) => console.warn('Could not load agent status:', err));
  }, []);

  const navItems = [
    { id: 'agent', label: 'AI Assistant Overview', icon: Bot, badge: 'Live' },
    { id: 'agent-jobs', label: 'Job Discovery & Matching', icon: Briefcase, badge: agentStatus?.reviewingJobs ? `${agentStatus.reviewingJobs} Ready` : null },
    { id: 'agent-kanban', label: 'Application Kanban', icon: CheckCircle, badge: agentStatus?.appliedJobs ? `${agentStatus.appliedJobs} Tracked` : null },
    { id: 'agent-emails', label: 'Smart Email Radar', icon: Mail, badge: agentStatus?.unreadAlerts ? `${agentStatus.unreadAlerts} New` : null },
    { id: 'agent-ai-chat', label: 'AI Career & Email Chat', icon: Sparkles, badge: 'AI' },
    { id: 'agent-profile', label: 'Profile & Resumes', icon: Shield, badge: null },
    { id: 'agent-settings', label: 'Control Center & Logs', icon: Sliders, badge: null }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 glass-header px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('agent')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AI Desktop Assistant
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                </span>
              </div>
              <span className="hidden sm:block text-[11px] text-slate-400">Autonomous Job Hunter & Smart Email Monitor for Laptop</span>
            </div>
          </div>
        </div>

        {/* Right Status Indicator */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('agent-settings')}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-xs transition"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300 font-medium hidden sm:inline">Windows Toast:</span>
            <span className="text-emerald-400 font-semibold">Enabled</span>
          </button>

          <button
            onClick={() => setActiveTab('agent-profile')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 hover:bg-indigo-500/20 transition"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">{agentStatus?.candidateName || 'My Profile'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-64 glass-panel border-r border-slate-800/80 p-4 flex flex-col justify-between transform transition-transform duration-200 md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0 bg-slate-950/95 backdrop-blur-xl' : '-translate-x-full'
          }`}
        >
          <div className="space-y-2 pt-14 md:pt-0">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Assistant Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.badge === 'Live'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200">Local Laptop Daemon</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Auto-fills applications with Co-pilot review and notifies you instantly on important interview emails.
            </p>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-grid-pattern">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
