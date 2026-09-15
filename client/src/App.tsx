import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { GivePage } from './pages/GivePage';
import { TakePage } from './pages/TakePage';
import { AdminPage } from './pages/AdminPage';

type Page = 'home' | 'give' | 'take' | 'admin';

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash === 'give' || hash === 'take' || hash === 'admin') return hash as Page;
    return 'home';
  });

  // Keep URL hash in sync for mobile back/forward navigation
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : `/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash === 'give' || hash === 'take' || hash === 'admin') {
        setCurrentPage(hash as Page);
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-stone-900 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-950">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1 w-full pb-20 sm:pb-8">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'give' && <GivePage onNavigate={handleNavigate} />}
        {currentPage === 'take' && <TakePage onNavigate={handleNavigate} />}
        {currentPage === 'admin' && <AdminPage onNavigate={handleNavigate} />}
      </main>

      {/* Floating Bottom Navigation Bar for Mobile */}
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
