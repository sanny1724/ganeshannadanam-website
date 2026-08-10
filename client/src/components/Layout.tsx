import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Compass,
  GitBranch,
  Network,
  BookOpen,
  Terminal,
  Info,
  Database,
  ChevronDown,
  User,
  Sparkles,
  Menu,
  X,
  Target,
  ExternalLink
} from 'lucide-react';
import { UserProfile, DatabaseStatus } from '../types/graph';
import { ApiService } from '../services/api';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (u: UserProfile) => void;
  users: UserProfile[];
  children: React.ReactNode;
}

export function Layout({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  users,
  children
}: LayoutProps) {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    ApiService.getHealth()
      .then((data) => setDbStatus(data.database))
      .catch(() =>
        setDbStatus({
          connected: false,
          engine: 'In-Memory-Graph',
          uri: 'demo.cognodb.io',
          database: 'neo4j',
          checked: true
        })
      );
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'explore', label: 'Explore Careers', icon: Compass, badge: 'Query 1' },
    { id: 'skill-gap', label: 'Skill Gap Analyzer', icon: Target, badge: 'Query 2' },
    { id: 'paths', label: 'Career Path Explorer', icon: GitBranch, badge: 'Multi-Hop' },
    { id: 'graph', label: 'Graph Explorer', icon: Network, badge: 'Interactive' },
    { id: 'resources', label: 'Projects & Courses', icon: BookOpen, badge: 'Query 3-4' },
    { id: 'query-lab', label: 'Cypher Query Lab', icon: Terminal, badge: 'Benchmark' },
    { id: 'about', label: 'About & CognoDB', icon: Info, badge: null }
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
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Network className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  CareerGraph
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  CognoDB
                </span>
              </div>
              <span className="hidden sm:block text-[11px] text-slate-400">Intelligent Career & Skill Graph Explorer</span>
            </div>
          </div>
        </div>

        {/* Right Tools & User Selector */}
        <div className="flex items-center space-x-3">
          {/* Live Database Engine Status Pill */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                dbStatus?.connected ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm' : 'bg-cyan-400 shadow-cyan-400/50 shadow-sm'
              }`}
            />
            <span className="text-slate-300 font-medium">
              {dbStatus?.connected ? 'CognoDB Cloud' : 'High-Speed Graph Engine'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">openCypher</span>
          </div>

          {/* User Profile Switcher */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-xs transition-colors"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-500/30"
                />
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-200 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-cyan-400">{currentUser.experienceLevel}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-slate-800 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Demo Student Profile
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 p-2 rounded-xl text-left text-xs transition-colors ${
                        currentUser.id === u.id
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.experienceLevel}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
          <div className="space-y-1.5 pt-14 md:pt-0">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Graph Explorations
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
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Card / Interview Notice */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Wexa AI Take-Home</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Demonstrating why CognoDB & openCypher outperform relational databases for connected career graphs.
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
