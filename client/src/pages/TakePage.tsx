import React, { useState, useEffect, useMemo } from 'react';
import { annadanamApi } from '../services/annadanamApi';
import { Annadanam, ViewMode } from '../types/annadanam';
import { AnnadanamCard } from '../components/AnnadanamCard';
import { AnnadanamMap } from '../components/AnnadanamMap';
import {
  MapPin,
  Search,
  Calendar,
  Clock,
  Compass,
  Map,
  List,
  RefreshCw,
  ArrowLeft,
  Navigation,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

interface TakePageProps {
  onNavigate: (page: 'home' | 'give' | 'take' | 'admin') => void;
}

const QUICK_AREAS = ['All', 'Kukatpally', 'Balapur', 'Ameerpet', 'Madhapur', 'Khairatabad', 'Secunderabad', 'Dilsukhnagar'];

export const TakePage: React.FC<TakePageProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<Annadanam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [dateSelection, setDateSelection] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>('2026-09-15');
  const [includeExpired, setIncludeExpired] = useState<boolean>(false);

  // User Geolocation
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  // Effective date to filter
  const activeDateString = useMemo(() => {
    if (dateSelection === 'today') return '2026-09-15';
    if (dateSelection === 'tomorrow') return '2026-09-16';
    return customDate;
  }, [dateSelection, customDate]);

  // Fetch items
  const loadAnnadanams = async () => {
    setLoading(true);
    try {
      const data = await annadanamApi.getAll({
        search: searchQuery.trim() || undefined,
        area: selectedArea !== 'All' ? selectedArea : undefined,
        date: activeDateString,
        userLat: userLocation?.latitude,
        userLng: userLocation?.longitude,
        includeExpired: includeExpired
      });
      setItems(data);
    } catch (e) {
      console.error('Failed to load Annadanams', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnadanams();
  }, [searchQuery, selectedArea, activeDateString, userLocation, includeExpired]);

  // Request user GPS with high accuracy & IP fallback
  const handleUseMyLocation = () => {
    setIsLocating(true);
    setLocationMessage('Detecting GPS...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          setUserLocation(coords);
          setIsLocating(false);
          setLocationMessage(`📍 GPS Active (±${Math.round(pos.coords.accuracy || 10)}m)`);
        },
        async (err) => {
          console.warn('GPS error, attempting IP fallback:', err);
          try {
            const res = await fetch('https://ipwho.is/');
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              const coords = { latitude: data.latitude, longitude: data.longitude };
              setUserLocation(coords);
              setIsLocating(false);
              setLocationMessage(`📍 Set via Network (${data.city || 'Your Area'})`);
              return;
            }
          } catch (ipErr) {}

          setIsLocating(false);
          setUserLocation({ latitude: 17.3850, longitude: 78.4867 });
          setLocationMessage('📍 Defaulted to Central Location');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setUserLocation({ latitude: 17.3850, longitude: 78.4867 });
      setLocationMessage('📍 Central Location Set');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-3.5 sm:px-4 py-4 pb-20 sm:pb-8">
      {/* Top Header: Back & View Switcher */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-amber-900 active:scale-95 transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        {/* View Switcher: 📋 LIST and 🗺️ MAP */}
        <div className="bg-amber-100/90 p-1 rounded-xl flex items-center border border-amber-200/90 shadow-xs">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <List className="w-3.5 h-3.5 text-orange-600" />
            <span>LIST</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-orange-600" />
            <span>MAP</span>
          </button>
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-3">
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2 leading-tight">
          <span>🙏</span>
          <span>Find Annadanam</span>
        </h1>
        <p className="text-xs text-stone-600 font-medium mt-0.5">
          Real-time Annaprasadam locations & exact timings
        </p>
      </div>

      {/* STEP 1 — LOCATION & SEARCH (Mobile-first Compact Box) */}
      <div className="bg-white rounded-2xl border border-amber-200 p-3.5 sm:p-4 shadow-xs mb-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-[10px]">
              1
            </span>
            <span>Location & Search</span>
          </span>

          {locationMessage && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {locationMessage}
            </span>
          )}
        </div>

        {/* Big "📍 Use My Location" Button */}
        <button
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className={`w-full py-3 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
            userLocation
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
              : 'bg-linear-to-r from-orange-500 to-amber-500 text-white border-orange-600 shadow-xs'
          }`}
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>
            {isLocating
              ? 'Detecting GPS...'
              : userLocation
              ? '📍 GPS Active (Nearest Pandals First)'
              : '📍 Use My Location (Find Nearest)'}
          </span>
        </button>

        {/* Search City / Area */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔎 Search Area (e.g. Kukatpally, Ameerpet, Balapur)"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 text-xs sm:text-sm font-medium text-stone-900 bg-stone-50/50"
          />
        </div>

        {/* Horizontal Smooth Scroll Area Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {QUICK_AREAS.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedArea(a)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedArea === a
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2 — DATE SELECTOR */}
      <div className="bg-white rounded-2xl border border-amber-200 p-3 sm:p-3.5 shadow-xs mb-3.5">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-[10px]">
            2
          </span>
          <span>Select Date</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Today */}
          <button
            onClick={() => setDateSelection('today')}
            className={`py-2 px-2 rounded-xl font-extrabold text-xs text-center transition-all cursor-pointer border ${
              dateSelection === 'today'
                ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div>Today</div>
            <div className={`text-[10px] font-medium ${dateSelection === 'today' ? 'text-orange-200' : 'text-stone-400'}`}>
              15 Sep
            </div>
          </button>

          {/* Tomorrow */}
          <button
            onClick={() => setDateSelection('tomorrow')}
            className={`py-2 px-2 rounded-xl font-extrabold text-xs text-center transition-all cursor-pointer border ${
              dateSelection === 'tomorrow'
                ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div>Tomorrow</div>
            <div className={`text-[10px] font-medium ${dateSelection === 'tomorrow' ? 'text-orange-200' : 'text-stone-400'}`}>
              16 Sep
            </div>
          </button>

          {/* Custom Date */}
          <button
            onClick={() => setDateSelection('custom')}
            className={`py-2 px-2 rounded-xl font-extrabold text-xs text-center transition-all cursor-pointer border ${
              dateSelection === 'custom'
                ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div>Select Date</div>
            <div className={`text-[10px] font-medium ${dateSelection === 'custom' ? 'text-orange-200' : 'text-stone-400'}`}>
              Calendar
            </div>
          </button>
        </div>

        {dateSelection === 'custom' && (
          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-stone-900 bg-stone-50"
            />
          </div>
        )}
      </div>

      {/* RESULTS BAR */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-stone-900">
            {items.length} {items.length === 1 ? 'Annadanam' : 'Annadanams'}
          </span>
          {items.some((i) => i.isServingNow) && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Serving Now
            </span>
          )}
        </div>

        {/* Auto Expiration toggle */}
        <button
          onClick={() => setIncludeExpired(!includeExpired)}
          className="text-[10px] font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
        >
          {includeExpired ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{includeExpired ? 'Hide Expired' : 'Show Expired'}</span>
        </button>
      </div>

      {/* RENDER VIEW: LIST OR MAP */}
      {loading ? (
        <div className="py-12 text-center text-stone-500 space-y-2">
          <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold">Loading Annadanams...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-amber-300 p-6 text-center space-y-2.5">
          <div className="text-3xl">🍚</div>
          <h3 className="text-sm font-bold text-stone-800">No active Annadanam found</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Try choosing another area or switching to Tomorrow.
          </p>
          <button
            onClick={() => {
              setSelectedArea('All');
              setSearchQuery('');
              setDateSelection('today');
            }}
            className="text-xs font-bold text-orange-600 underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {items.map((item) => (
            <AnnadanamCard key={item.id} item={item} userLocation={userLocation} />
          ))}
        </div>
      ) : (
        <AnnadanamMap
          items={items}
          userLocation={userLocation}
          onUserLocationDetected={(coords) => setUserLocation(coords)}
        />
      )}
    </div>
  );
};
