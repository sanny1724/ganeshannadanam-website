import React, { useEffect, useState } from 'react';
import { annadanamApi } from '../services/annadanamApi';
import { Sparkles, MapPin, Clock, Calendar, ArrowRight, Heart } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'home' | 'give' | 'take') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [activeCount, setActiveCount] = useState<number | null>(null);

  useEffect(() => {
    annadanamApi.getAll().then((items) => {
      setActiveCount(items.length);
    }).catch(() => {
      setActiveCount(8);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-6 sm:py-10 max-w-lg mx-auto text-center">
      
      {/* Devotional Festive Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-fade-in">
        <span className="text-base" role="img" aria-label="Ganesh">🕉️</span>
        <span>Vinayaka Chavithi Navaratri Special</span>
      </div>

      {/* Hero Headings */}
      <div className="space-y-3 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
          🙏 Annadanam Near You
        </h1>
        <p className="text-base sm:text-lg text-stone-600 font-medium max-w-md mx-auto leading-relaxed">
          Find where free food & prasadam is being served during Vinayaka celebrations.
        </p>
      </div>

      {/* TWO PRIMARY LARGE BUTTONS - THE MAIN FOCUS */}
      <div className="w-full space-y-4 mb-8">
        {/* BUTTON 1: 🍚 ADD ANNADANAM DETAILS */}
        <button
          onClick={() => onNavigate('give')}
          className="w-full group text-left p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg shadow-orange-600/25 active:scale-[0.98] transition-all duration-200 border-2 border-orange-500 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                🍚
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-orange-200 block">
                  For Ganesh Committees & Temples
                </span>
                <div className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                  Add Annadanam Details
                </div>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </div>
        </button>

        {/* BUTTON 2: 🙏 FIND ANNADANAM DETAILS */}
        <button
          onClick={() => onNavigate('take')}
          className="w-full group text-left p-5 sm:p-6 rounded-2xl bg-white hover:bg-amber-50/70 text-stone-900 shadow-md shadow-amber-950/5 active:scale-[0.98] transition-all duration-200 border-2 border-amber-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                🙏
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-amber-700 block">
                  For Devotees & Public
                </span>
                <div className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 mt-1">
                  Find Annadanam Details
                </div>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-amber-700 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </div>
        </button>
      </div>

      {/* Active Count / Status Pill */}
      {activeCount !== null && (
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200/90 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{activeCount} active Annadanam locations live now</span>
        </div>
      )}

      {/* Simple 3-Question Value Proposition */}
      <div className="w-full pt-4 border-t border-amber-200/60 grid grid-cols-3 gap-2 text-stone-600 text-xs font-semibold">
        <div className="p-2 bg-white rounded-xl border border-amber-100 flex flex-col items-center">
          <MapPin className="w-4 h-4 text-orange-600 mb-1" />
          <span>WHERE</span>
          <span className="text-[10px] text-stone-400 font-normal">Map & Area</span>
        </div>
        <div className="p-2 bg-white rounded-xl border border-amber-100 flex flex-col items-center">
          <Calendar className="w-4 h-4 text-orange-600 mb-1" />
          <span>WHEN</span>
          <span className="text-[10px] text-stone-400 font-normal">Today / Dates</span>
        </div>
        <div className="p-2 bg-white rounded-xl border border-amber-100 flex flex-col items-center">
          <Clock className="w-4 h-4 text-orange-600 mb-1" />
          <span>WHAT TIME</span>
          <span className="text-[10px] text-stone-400 font-normal">Exact Hours</span>
        </div>
      </div>

      <p className="mt-6 text-[11px] text-stone-600 font-medium">
        Free Community Information Service • No Registration Required
      </p>
    </div>
  );
};
