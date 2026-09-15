import React from 'react';
import { MapPin, Calendar, Clock, Navigation, Compass, ExternalLink } from 'lucide-react';
import { Annadanam } from '../types/annadanam';

interface AnnadanamCardProps {
  item: Annadanam;
  userLocation?: { latitude: number; longitude: number } | null;
}

// Format date into "15 September 2026"
function formatEventDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

export const AnnadanamCard: React.FC<AnnadanamCardProps> = ({ item, userLocation }) => {
  // Exact Google Maps Directions URL (uses origin coordinates if user GPS active)
  const getDirectionsUrl = () => {
    if (userLocation && item.latitude && item.longitude) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${item.latitude},${item.longitude}&travelmode=driving`;
    }
    if (item.latitude && item.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}&travelmode=driving`;
    }
    const query = encodeURIComponent(`${item.committeeName}, ${item.address}, ${item.area}, ${item.city}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  // Exact Google Maps Pin Link
  const getExactPinUrl = () => {
    if (item.latitude && item.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.committeeName}, ${item.address}, ${item.area}, ${item.city}`)}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200/90 p-5 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between">
      {/* Top accent glow */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          item.isServingNow
            ? 'bg-linear-to-r from-emerald-500 to-green-500'
            : 'bg-linear-to-r from-amber-400 to-orange-500'
        }`}
      />

      <div>
        {/* Header Badges: Status & Distance */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.isServingNow ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Serving Now
              </span>
            ) : item.isExpired ? (
              <span className="inline-flex items-center text-stone-500 bg-stone-100 font-semibold text-xs px-2.5 py-0.5 rounded-full">
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 font-semibold text-xs px-2.5 py-0.5 rounded-full border border-amber-200">
                <span>⏳</span> Upcoming
              </span>
            )}

            {item.foodType && (
              <span className="text-xs font-semibold bg-orange-50 text-orange-800 px-2.5 py-0.5 rounded-full border border-orange-200">
                🍚 {item.foodType}
              </span>
            )}
          </div>

          {item.distanceKm !== undefined && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
              <span>📍</span> {item.distanceKm} km
            </span>
          )}
        </div>

        {/* Committee Name */}
        <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight flex items-baseline gap-2 mb-2 leading-snug">
          <span className="text-amber-600 shrink-0 text-xl">🙏</span>
          <span>{item.committeeName}</span>
        </h3>

        {/* 3 Core Answers: WHERE, WHEN, WHAT TIME */}
        <div className="space-y-2 text-stone-700 text-sm mt-3 mb-4 bg-amber-50/40 p-3 rounded-xl border border-amber-100/70">
          {/* WHERE */}
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-stone-900">
                {item.area}, {item.city}
              </div>
              <div className="text-xs text-stone-500 leading-relaxed mt-0.5">
                {item.address}
              </div>
              {item.latitude && item.longitude && (
                <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                  GPS: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </div>
              )}
            </div>
          </div>

          {/* WHEN */}
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
            <div className="font-semibold text-stone-900">
              {formatEventDate(item.date)}
            </div>
          </div>

          {/* WHAT TIME */}
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-orange-600 shrink-0" />
            <div className="font-bold text-stone-900 tracking-tight">
              {item.startTime} – {item.endTime}
            </div>
          </div>
        </div>
      </div>

      {/* Actions: 🧭 GET DIRECTIONS (Primary) + 📍 EXACT PIN (Secondary) */}
      <div className="space-y-2 mt-2">
        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-orange-600/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Compass className="w-5 h-5 text-amber-200" />
          <span>🧭 GET DIRECTIONS</span>
        </a>

        <a
          href={getExactPinUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 px-3 rounded-lg text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 flex items-center justify-center gap-1.5 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
          <span>Open Exact Coordinates on Google Maps</span>
        </a>
      </div>
    </div>
  );
};
