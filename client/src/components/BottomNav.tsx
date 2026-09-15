import React from 'react';
import { Home, Compass, PlusCircle, Sparkles } from 'lucide-react';

interface BottomNavProps {
  currentPage: 'home' | 'give' | 'take' | 'admin';
  onNavigate: (page: 'home' | 'give' | 'take' | 'admin') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-amber-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] sm:hidden pb-[env(safe-area-inset-bottom,8px)]">
      <div className="grid grid-cols-3 h-16 max-w-md mx-auto px-2">
        {/* Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 ${
            currentPage === 'home'
              ? 'text-orange-600 font-extrabold'
              : 'text-stone-500 font-medium hover:text-stone-800'
          }`}
        >
          <div className={`p-1 rounded-xl ${currentPage === 'home' ? 'bg-orange-100/80' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Home</span>
        </button>

        {/* Find Annadanam */}
        <button
          onClick={() => onNavigate('take')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 ${
            currentPage === 'take'
              ? 'text-amber-700 font-extrabold'
              : 'text-stone-500 font-medium hover:text-stone-800'
          }`}
        >
          <div className={`p-1 rounded-xl ${currentPage === 'take' ? 'bg-amber-100/80' : ''}`}>
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Find Food</span>
        </button>

        {/* Add Annadanam Details */}
        <button
          onClick={() => onNavigate('give')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 ${
            currentPage === 'give'
              ? 'text-orange-600 font-extrabold'
              : 'text-stone-500 font-medium hover:text-stone-800'
          }`}
        >
          <div className={`p-1 rounded-xl ${currentPage === 'give' ? 'bg-orange-100/80' : ''}`}>
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Add Details</span>
        </button>
      </div>
    </nav>
  );
};
