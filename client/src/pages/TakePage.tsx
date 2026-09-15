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
  ListFilter,
  Map,
  List,
  RefreshCw,
  ArrowLeft,
  Navigation,
  Eye,
  EyeOff
} from 'lucide-react';

interface TakePageProps {
  onNavigate: (page: 'home' | 'give' | 'take') => void;
}

const QUICK_AREAS = ['All', 'Kukatpally', 'Balapur', 'Ameerpet', 'Madhapur', 'Khairatabad', 'Secunderabad'];

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
    setLocationMessage('Detecting your GPS position...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          setUserLocation(coords);
          setIsLocating(false);
          setLocationMessage(`📍 GPS Active (Accuracy ±${Math.round(pos.coords.accuracy || 10)}m)`);
        },
        async (err) => {
          console.warn('GPS error, attempting IP location fallback:', err);
          try {
            const res = await fetch('https://ipwho.is/');
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              const coords = { latitude: data.latitude, longitude: data.longitude };
              setUserLocation(coords);
              setIsLocating(false);
              setLocationMessage(`📍 Location Set via Network (${data.city || 'Your Area'})`);
              return;
            }
          } catch (ipErr) {
            console.warn('IP fallback failed:', ipErr);
          }

          setIsLocating(false);
          // Default to central Hyderabad if all fail
          setUserLocation({ latitude: 17.3850, longitude: 78.4867 });
          setLocationMessage('📍 Defaulted to Hyderabad Center (Sorted by Distance)');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setUserLocation({ latitude: 17.3850, longitude: 78.4867 });
      setLocationMessage('📍 Defaulted to Hyderabad Center');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Top row: Back button & Page title */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* View Switcher: 📋 LIST and 🗺️ MAP */}
        <div className="bg-amber-100/80 p-1 rounded-xl flex items-center border border-amber-200">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>📋 LIST</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'map'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>🗺️ MAP</span>
          </button>
        </div>
      </div>

      {/* Main Heading */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <span>🙏</span>
          <span>Find Annadanam</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
          Real-time Annaprasadam locations, dates and serving timings.
        </p>
      </div>

      {/* STEP 1 — LOCATION */}
      <div className="bg-white rounded-2xl border border-amber-200/90 p-4 sm:p-5 shadow-xs mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-[11px]">
            1
          </span>
          <span>Step 1 — Location</span>
        </div>

        {/* Big "📍 Use My Location" button */}
        <button
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer mb-3 border-2 ${
            userLocation
              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
              : 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-500/20'
          }`}
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>
            {isLocating
              ? 'Detecting Location...'
              : userLocation
              ? '📍 GPS Active (Nearest Annadanams First)'
              : '📍 Use My Location'}
          </span>
        </button>

        {locationMessage && (
          <div className="text-center text-[11px] font-semibold text-emerald-700 mb-2">
            {locationMessage}
          </div>
        )}

        {/* 🔎 Search City / Area */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔎 Search City / Area (e.g. Kukatpally, Ameerpet, Balapur)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-hidden text-sm font-medium text-stone-900 bg-stone-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Area Chips */}
        <div>
          <span className="text-[11px] font-semibold text-stone-500 mr-2">Popular:</span>
          <div className="inline-flex flex-wrap gap-1.5 mt-1">
            {QUICK_AREAS.map((a) => (
              <button
                key={a}
                onClick={() => setSelectedArea(a)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedArea === a
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 2 — DATE */}
      <div className="bg-white rounded-2xl border border-amber-200/90 p-4 sm:p-5 shadow-xs mb-5">
        <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-[11px]">
            2
          </span>
          <span>Step 2 — Date</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Today */}
          <button
            onClick={() => setDateSelection('today')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-center transition-all cursor-pointer border-2 ${
              dateSelection === 'today'
                ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div>Today</div>
            <div className={`text-[10px] ${dateSelection === 'today' ? 'text-orange-200' : 'text-stone-400'}`}>
              15 Sep
            </div>
          </button>

          {/* Tomorrow */}
          <button
            onClick={() => setDateSelection('tomorrow')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-center transition-all cursor-pointer border-2 ${
              dateSelection === 'tomorrow'
                ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div>Tomorrow</div>
            <div className={`text-[10px] ${dateSelection === 'tomorrow' ? 'text-orange-200' : 'text-stone-400'}`}>
              16 Sep
            </div>
          </button>

          {/* Select Date */}
          <button
            onClick={() => setDateSelection('custom')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-center transition-all cursor-pointer border-2 ${
              dateSelection === 'custom'
                ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div>Select Date</div>
            <div className={`text-[10px] ${dateSelection === 'custom' ? 'text-orange-200' : 'text-stone-400'}`}>
              Custom
            </div>
          </button>
        </div>

        {dateSelection === 'custom' && (
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-900 bg-stone-50 focus:border-orange-500 outline-hidden"
            />
          </div>
        )}
      </div>

      {/* RESULTS HEADER & COUNTER */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-stone-900">
            {items.length} {items.length === 1 ? 'Annadanam' : 'Annadanams'} Found
          </span>
          {items.some((i) => i.isServingNow) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Serving Now
            </span>
          )}
        </div>

        {/* Automatic Expiration discrete control */}
        <button
          onClick={() => setIncludeExpired(!includeExpired)}
          className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
        >
          {includeExpired ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{includeExpired ? 'Hide Expired' : 'Show Expired'}</span>
        </button>
      </div>

      {/* VIEW RENDER: LIST OR MAP */}
      {loading ? (
        <div className="py-16 text-center text-stone-500 space-y-3">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Finding nearest Annadanam locations...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-amber-300 p-8 text-center space-y-3">
          <div className="text-3xl">🍚</div>
          <h3 className="text-base font-bold text-stone-800">No active Annadanam found for this selection</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Try choosing another area or switching to "Tomorrow" to see upcoming Annadanam events.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedArea('All');
                setSearchQuery('');
                setDateSelection('today');
              }}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
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

      {/* Helpful footer */}
      <div className="mt-8 text-center border-t border-amber-200/60 pt-4">
        <p className="text-xs text-stone-500 font-medium">
          Know about another Annadanam pandal?{' '}
          <button
            onClick={() => onNavigate('give')}
            className="text-orange-600 font-bold hover:underline cursor-pointer"
          >
            Add it here 🍚
          </button>
        </p>
      </div>
    </div>
  );
};
