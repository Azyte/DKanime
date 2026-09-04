import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  Bookmark,
  Settings,
  Sparkles,
  TrendingUp,
  Menu,
  X,
  Play
} from 'lucide-react';
import { Logo } from './Logo';
import { useWatch } from '../../context/WatchContext';
import { useSettings } from '../../context/SettingsContext';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { watchlist } = useWatch();
  const { setIsSettingsOpen, settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: '🎬 Movie', path: '/movies' },
    { label: 'A-Z Direktori', path: '/az' },
    { label: 'Top Rating', path: '/az?sort=score' },
    { label: 'Sedang Tayang', path: '/az?status=Ongoing' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark-950/85 backdrop-blur-xl border-b border-white/5 py-3 shadow-2xl shadow-black/50'
          : 'bg-gradient-to-b from-dark-950/90 via-dark-950/50 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Logo />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path.includes('?') &&
                  `${location.pathname}${location.search}` === link.path);

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'text-white bg-white/10 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & Search */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 sm:gap-3 px-3.5 py-2 rounded-xl bg-dark-850/80 hover:bg-dark-800 border border-white/10 text-slate-300 hover:text-white text-sm transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
            title="Cari anime (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-cyan transition-colors" />
            <span className="hidden sm:inline text-xs text-slate-400 group-hover:text-slate-200">
              Cari anime...
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-dark-750 px-1.5 py-0.5 rounded border border-white/5">
              ⌘K
            </kbd>
          </button>

          {/* Watchlist Button */}
          <Link
            to="/watchlist"
            className="relative p-2.5 rounded-xl bg-dark-850/80 hover:bg-dark-800 border border-white/10 text-slate-300 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/40 group hidden sm:flex"
            title="Watchlist Saya"
          >
            <Bookmark className="w-4 h-4 group-hover:text-brand-purple transition-colors" />
            {watchlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-dark-950">
                {watchlist.length}
              </span>
            )}
          </Link>

          {/* Settings / API Key Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="relative p-2.5 rounded-xl bg-dark-850/80 hover:bg-dark-800 border border-white/10 text-slate-300 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 group"
            title="Pengaturan Streaming & API Key"
          >
            <Settings className="w-4 h-4 group-hover:text-brand-cyan group-hover:rotate-45 transition-all duration-300" />
            {settings.apiKey ? (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl bg-dark-850/80 hover:bg-dark-800 border border-white/10 text-slate-300 md:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 bg-dark-950/95 backdrop-blur-2xl border-b border-white/10 mt-2 space-y-1 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/watchlist"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
          >
            <span>Watchlist Saya</span>
            <span className="px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple text-xs font-semibold">
              {watchlist.length}
            </span>
          </Link>
        </div>
      )}
    </header>
  );
};
