import React from 'react';
import { Utensils, Heart, Home, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentPage: 'home' | 'give' | 'take' | 'admin';
  onNavigate: (page: 'home' | 'give' | 'take' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      {/* Auspicious top festive accent bar */}
      <div className="h-1.5 w-full bg-linear-to-r from-amber-500 via-orange-500 to-red-500" />
      
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Title */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-left group transition-transform active:scale-95 cursor-pointer"
        >
          <span className="text-2xl select-none" role="img" aria-label="Ganesh Prasad">
            🙏
          </span>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-amber-950 flex items-center gap-1.5">
              Annadanam Finder
              <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full border border-orange-200">
                Vinayaka
              </span>
            </h1>
            <p className="text-[11px] text-stone-500 font-medium">Free Annaprasadam Discovery</p>
          </div>
        </button>

        {/* Navigation Quick Switches */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {currentPage !== 'home' && (
            <button
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl text-stone-600 hover:text-amber-800 hover:bg-amber-50 active:bg-amber-100 transition-colors cursor-pointer"
              title="Home"
              aria-label="Home"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => onNavigate('take')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
              currentPage === 'take'
                ? 'bg-amber-600 text-white shadow-amber-600/20'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span>🙏</span>
            <span>Find</span>
          </button>

          <button
            onClick={() => onNavigate('give')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
              currentPage === 'give'
                ? 'bg-orange-600 text-white shadow-orange-600/20'
                : 'bg-orange-50 text-orange-950 hover:bg-orange-100 border border-orange-200/60'
            }`}
          >
            <span>🍚</span>
            <span>Add Event</span>
          </button>
        </div>
      </div>
    </header>
  );
};
