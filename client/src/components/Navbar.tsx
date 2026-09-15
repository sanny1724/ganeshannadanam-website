import React from 'react';
import { Home, Compass, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentPage: 'home' | 'give' | 'take' | 'admin';
  onNavigate: (page: 'home' | 'give' | 'take' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      {/* Top festive tricolor bar */}
      <div className="h-1.5 w-full bg-linear-to-r from-amber-500 via-orange-500 to-red-500" />
      
      <div className="max-w-2xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Logo & Title */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-xl shrink-0">
            🙏
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-amber-950 flex items-center gap-1.5 leading-tight">
              Annadanam Finder
              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded-full border border-orange-200">
                Vinayaka
              </span>
            </h1>
            <p className="text-[11px] text-stone-500 font-medium">Free Food & Prasadam Tracker</p>
          </div>
        </button>

        {/* Desktop Quick Nav Buttons (Hidden on mobile since BottomNav is used) */}
        <div className="hidden sm:flex items-center gap-2">
          {currentPage !== 'home' && (
            <button
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl text-stone-600 hover:text-amber-800 hover:bg-amber-50 active:bg-amber-100 transition-colors cursor-pointer"
              title="Home"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onNavigate('take')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'take'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span>🙏</span>
            <span>Find Food</span>
          </button>

          <button
            onClick={() => onNavigate('give')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'give'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 text-orange-950 hover:bg-orange-100 border border-orange-200'
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
