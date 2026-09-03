import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Search, Bookmark, Settings } from 'lucide-react';
import { useWatch } from '../../context/WatchContext';
import { useSettings } from '../../context/SettingsContext';

interface MobileBottomNavProps {
  onOpenSearch: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSearch }) => {
  const location = useLocation();
  const { watchlist } = useWatch();
  const { setIsSettingsOpen } = useSettings();

  const isHome = location.pathname === '/';
  const isBrowse = location.pathname.startsWith('/az');
  const isWatchlist = location.pathname === '/watchlist';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-950/90 backdrop-blur-xl border-t border-white/10 px-3 py-2 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            isHome ? 'text-brand-cyan font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Beranda</span>
        </Link>

        {/* Browse A-Z */}
        <Link
          to="/az"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            isBrowse ? 'text-brand-cyan font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className={`w-5 h-5 ${isBrowse ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">A-Z Katalog</span>
        </Link>

        {/* Search Modal Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 focus:outline-none"
        >
          <div className="w-8 h-8 -mt-3 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple flex items-center justify-center text-white shadow-lg shadow-brand-cyan/30 active:scale-95 transition-transform">
            <Search className="w-4 h-4 stroke-[2.5px]" />
          </div>
          <span className="text-[10px] tracking-tight">Cari</span>
        </button>

        {/* Watchlist */}
        <Link
          to="/watchlist"
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            isWatchlist ? 'text-brand-purple font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Bookmark className={`w-5 h-5 ${isWatchlist ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            {watchlist.length > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-brand-purple text-[9px] font-bold text-white flex items-center justify-center">
                {watchlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Watchlist</span>
        </Link>

        {/* Settings */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 focus:outline-none"
        >
          <Settings className="w-5 h-5 stroke-2" />
          <span className="text-[10px] tracking-tight">Setting</span>
        </button>
      </div>
    </div>
  );
};
