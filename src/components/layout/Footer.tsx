import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Film, Sparkles, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-950 border-t border-white/5 pt-12 pb-24 md:pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Disclaimer */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="sm" showBadge={false} />
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              DKanime adalah platform streaming anime modern dengan kualitas tinggi (1080p, 720p, 480p, 360p).
              Didesain khusus dengan interface elegan, bebas dari lag, dan responsif di berbagai perangkat (Desktop, Tablet, iOS, Android).
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Disclaimer: Seluruh video dan media bersumber dari pihak ketiga.</span>
            </div>
          </div>

          {/* Col 2: Navigasi */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Jelajahi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-brand-cyan transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/az" className="hover:text-brand-cyan transition-colors">
                  A-Z Direktori Anime
                </Link>
              </li>
              <li>
                <Link to="/az?sort=score" className="hover:text-brand-cyan transition-colors">
                  Top Rating Anime
                </Link>
              </li>
              <li>
                <Link to="/az?status=Ongoing" className="hover:text-brand-cyan transition-colors">
                  Jadwal Rilis Anime
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-brand-cyan transition-colors">
                  Watchlist Favorit
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Fitur & Status */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Fitur Streaming
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Multi-resolusi 1080p / 720p / 480p / 360p
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                Pilihan Kecepatan Playback (0.5x - 2x)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                Mode Bioskop & Lampu Mati (Lights Off)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-pink" />
                Fitur Skip Intro 85 detik
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Dukungan Custom API Key & HLS Stream
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DKanime. Crafted for anime lovers.</p>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-slate-400">
              Ready for Vercel Deploy ⚡
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
