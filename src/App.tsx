import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { WatchProvider } from './context/WatchContext';
import { SettingsProvider } from './context/SettingsContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/layout/SearchModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { HomePage } from './pages/HomePage';
import { WatchPage } from './pages/WatchPage';
import { AZDirectoryPage } from './pages/AZDirectoryPage';
import { WatchlistPage } from './pages/WatchlistPage';

// Scroll to top automatically when navigating
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

export const AppContent: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcut: Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col selection:bg-brand-cyan/25 selection:text-brand-cyan">
      <ScrollToTop />

      {/* Top Navigation */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Content Pages */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/watch/:id/:episode?" element={<WatchPage />} />
          <Route path="/az" element={<AZDirectoryPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Global Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <SettingsModal />

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Bar for touch / iOS ergonomics */}
      <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <WatchProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </WatchProvider>
    </Router>
  );
}
