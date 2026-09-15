import React, { useEffect, useState } from 'react';
import { annadanamApi } from '../services/annadanamApi';
import { MapPin, Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'home' | 'give' | 'take' | 'admin') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [activeCount, setActiveCount] = useState<number | null>(null);

  useEffect(() => {
    annadanamApi.getAll().then((items) => {
      setActiveCount(items.length);
    }).catch(() => {
      setActiveCount(10);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 py-4 sm:py-8 max-w-md mx-auto text-center">
      
      {/* Devotional Festive Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-bold mb-4 shadow-xs">
        <span className="text-base" role="img" aria-label="Ganesh">🕉️</span>
        <span>Vinayaka Chavithi Navaratri Special</span>
      </div>

      {/* Hero Headings */}
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
          🙏 Annadanam Near You
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-xs mx-auto leading-relaxed">
          Find where free food & prasadam is being served during Vinayaka celebrations.
        </p>
      </div>

      {/* TWO PRIMARY LARGE MOBILE-FIRST BUTTONS */}
      <div className="w-full space-y-3.5 mb-6">
        {/* BUTTON 1: 🍚 ADD ANNADANAM DETAILS */}
        <button
          onClick={() => onNavigate('give')}
          className="w-full group text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white shadow-md shadow-orange-600/25 active:scale-[0.98] transition-all border border-orange-400 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0">
                🍚
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-orange-200 block truncate">
                  For Ganesh Committees & Temples
                </span>
                <div className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5 leading-snug">
                  Add Annadanam Details
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/80 shrink-0 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* BUTTON 2: 🙏 FIND ANNADANAM DETAILS */}
        <button
          onClick={() => onNavigate('take')}
          className="w-full group text-left p-4 sm:p-5 rounded-2xl bg-white hover:bg-amber-50/80 text-stone-900 shadow-md shadow-amber-950/5 active:scale-[0.98] transition-all border-2 border-amber-300 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">
                🙏
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-amber-700 block truncate">
                  For Devotees & Public
                </span>
                <div className="text-lg sm:text-xl font-black tracking-tight text-stone-900 mt-0.5 leading-snug">
                  Find Annadanam Details
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-700 shrink-0 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Active Count Live Badge */}
      {activeCount !== null && (
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold mb-5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>{activeCount} active Annadanam locations live today</span>
        </div>
      )}

      {/* Clean 3-Question Pillar */}
      <div className="w-full pt-3 border-t border-amber-200/60 grid grid-cols-3 gap-2 text-stone-700 text-xs font-semibold">
        <div className="p-2.5 bg-white rounded-xl border border-amber-100/90 flex flex-col items-center shadow-xs">
          <MapPin className="w-4 h-4 text-orange-600 mb-1" />
          <span className="font-bold text-stone-900">WHERE</span>
          <span className="text-[10px] text-stone-400 font-normal">Map & GPS</span>
        </div>
        <div className="p-2.5 bg-white rounded-xl border border-amber-100/90 flex flex-col items-center shadow-xs">
          <Calendar className="w-4 h-4 text-orange-600 mb-1" />
          <span className="font-bold text-stone-900">WHEN</span>
          <span className="text-[10px] text-stone-400 font-normal">Today / Dates</span>
        </div>
        <div className="p-2.5 bg-white rounded-xl border border-amber-100/90 flex flex-col items-center shadow-xs">
          <Clock className="w-4 h-4 text-orange-600 mb-1" />
          <span className="font-bold text-stone-900">WHAT TIME</span>
          <span className="text-[10px] text-stone-400 font-normal">Exact Hours</span>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-stone-500 font-medium">
        Free Community Service • 100% Free Food Finder
      </p>
    </div>
  );
};
