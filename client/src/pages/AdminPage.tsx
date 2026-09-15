import React, { useState, useEffect } from 'react';
import { annadanamApi } from '../services/annadanamApi';
import { Annadanam } from '../types/annadanam';
import {
  ShieldCheck,
  Trash2,
  Edit3,
  Search,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  RefreshCw,
  Eye,
  KeyRound,
  Sparkles
} from 'lucide-react';

interface AdminPageProps {
  onNavigate: (page: 'home' | 'give' | 'take' | 'admin') => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('annadanam_admin_auth') === 'true';
  });
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [items, setItems] = useState<Annadanam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'serving' | 'expired'>('all');

  // Edit modal state
  const [editingItem, setEditingItem] = useState<Annadanam | null>(null);
  const [editName, setEditName] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editFood, setEditFood] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Include expired so admin sees everything
      const data = await annadanamApi.getAll({ includeExpired: true });
      setItems(data);
    } catch (e) {
      console.error('Failed to load admin items', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAll();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default master PIN is 1234 or admin
    if (pin.trim() === '1234' || pin.trim().toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('annadanam_admin_auth', 'true');
      setPinError(null);
    } else {
      setPinError('Invalid Admin PIN. (Default PIN is 1234)');
    }
  };

  const handleQuickDemoAccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('annadanam_admin_auth', 'true');
    setPinError(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('annadanam_admin_auth');
  };

  // Instant one-tap delete with optimistic UI
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    // Optimistic remove
    setItems((prev) => prev.filter((i) => i.id !== id));
    setActionSuccess(`Deleted "${name}"`);
    setTimeout(() => setActionSuccess(null), 3000);

    try {
      await annadanamApi.delete(id);
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  // Open edit modal
  const handleOpenEdit = (item: Annadanam) => {
    setEditingItem(item);
    setEditName(item.committeeName);
    setEditArea(item.area);
    setEditDate(item.date);
    setEditStartTime(item.startTime);
    setEditEndTime(item.endTime);
    setEditFood(item.foodType);
  };

  // Save edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updates = {
      committeeName: editName.trim(),
      area: editArea.trim(),
      date: editDate.trim(),
      startTime: editStartTime.trim(),
      endTime: editEndTime.trim(),
      foodType: editFood.trim()
    };

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === editingItem.id ? { ...i, ...updates } : i))
    );

    const savedId = editingItem.id;
    setEditingItem(null);
    setActionSuccess(`Updated details successfully!`);
    setTimeout(() => setActionSuccess(null), 3000);

    try {
      await annadanamApi.update(savedId, updates);
      await loadAll();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  // Extend 1 hour fast-action
  const handleExtendHour = async (item: Annadanam) => {
    const newEndTime = '05:00 PM';
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, endTime: newEndTime, isExpired: false, isServingNow: true } : i))
    );
    setActionSuccess(`Extended "${item.committeeName}" until ${newEndTime}!`);
    setTimeout(() => setActionSuccess(null), 3000);

    await annadanamApi.update(item.id, { endTime: newEndTime });
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (statusFilter === 'active' && item.isExpired) return false;
    if (statusFilter === 'expired' && !item.isExpired) return false;
    if (statusFilter === 'serving' && !item.isServingNow) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.committeeName.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.foodType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCount = items.length;
  const servingCount = items.filter((i) => i.isServingNow).length;
  const activeCount = items.filter((i) => !i.isExpired).length;
  const expiredCount = items.filter((i) => i.isExpired).length;

  // Unauthenticated PIN screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-900 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white rounded-2xl border-2 border-stone-800 p-6 sm:p-8 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-900 text-white flex items-center justify-center mx-auto mb-4 text-2xl">
            🛡️
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Admin Access Portal
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 mb-6">
            Manage, edit, or delete all Annadanam listings in real-time.
          </p>

          {pinError && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {pinError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Enter Admin PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN (Default: 1234)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-stone-900 focus:ring-2 focus:ring-stone-200 outline-hidden font-mono text-sm"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-stone-900 hover:bg-black text-white shadow-md active:scale-98 transition-all cursor-pointer"
            >
              Unlock Admin Panel
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-stone-100">
            <button
              onClick={handleQuickDemoAccess}
              className="text-xs font-bold text-orange-600 hover:text-orange-800 underline cursor-pointer"
            >
              ⚡ Instant 1-Click Demo Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-5 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center text-lg shrink-0">
            🛡️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Admin Control Center
            </h1>
            <p className="text-xs text-stone-500 font-medium">Real-time listing moderation & instant actions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('give')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
          >
            Exit Admin
          </button>
        </div>
      </div>

      {/* Action toast */}
      {actionSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          <div className="text-lg sm:text-xl font-black">{totalCount}</div>
          <div className="text-[10px] sm:text-xs uppercase font-bold tracking-wider opacity-80">All</div>
        </button>

        <button
          onClick={() => setStatusFilter('serving')}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
            statusFilter === 'serving'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <div className="text-lg sm:text-xl font-black flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {servingCount}
          </div>
          <div className="text-[10px] sm:text-xs uppercase font-bold tracking-wider opacity-80">Serving</div>
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50'
          }`}
        >
          <div className="text-lg sm:text-xl font-black">{activeCount}</div>
          <div className="text-[10px] sm:text-xs uppercase font-bold tracking-wider opacity-80">Active</div>
        </button>

        <button
          onClick={() => setStatusFilter('expired')}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
            statusFilter === 'expired'
              ? 'bg-stone-600 text-white border-stone-600 shadow-xs'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <div className="text-lg sm:text-xl font-black">{expiredCount}</div>
          <div className="text-[10px] sm:text-xs uppercase font-bold tracking-wider opacity-80">Expired</div>
        </button>
      </div>

      {/* Fast Instant Search Bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search by committee, area, city..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:border-stone-800 outline-hidden text-xs sm:text-sm font-medium bg-white"
          />
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="p-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 cursor-pointer"
          title="Reload Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Listings Table / Cards */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500 text-xs">
            No Annadanam records match this filter.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs hover:border-stone-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.isServingNow ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Serving Now
                    </span>
                  ) : item.isExpired ? (
                    <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                      Expired
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      Upcoming
                    </span>
                  )}
                  <span className="text-xs font-bold text-stone-900">{item.committeeName}</span>
                </div>

                <div className="text-xs text-stone-600 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-600" />
                    <strong>{item.area}</strong>, {item.city}
                  </span>
                  <span>📅 {item.date}</span>
                  <span>🕐 {item.startTime} – {item.endTime}</span>
                  <span className="text-orange-700 font-semibold">🍚 {item.foodType}</span>
                </div>
              </div>

              {/* Instant Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                {item.isExpired && (
                  <button
                    onClick={() => handleExtendHour(item)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 cursor-pointer"
                    title="Extend ending to 5:00 PM and make active"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Extend 1h</span>
                  </button>
                )}

                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-lg text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 cursor-pointer"
                  title="Edit details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.committeeName)}
                  className="p-2 rounded-lg text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer"
                  title="Delete permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-lg font-black text-stone-900">Edit Annadanam Details</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Committee Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Area / Location
                </label>
                <input
                  type="text"
                  required
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    required
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Food Type / Menu
                </label>
                <input
                  type="text"
                  value={editFood}
                  onChange={(e) => setEditFood(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="py-2.5 px-4 rounded-xl font-bold text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
