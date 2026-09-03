import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Clock,
  Play,
  Trash2,
  Compass
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { animeService } from '../services/animeService';
import { AnimeCard } from '../components/anime/AnimeCard';
import { formatTime } from '../utils/formatters';

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { watchlist, history, clearHistory } = useWatch();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history'>('watchlist');

  // Load animes from watchlist IDs
  const watchlistAnimes = watchlist
    .map((id: number) => animeService.getById(id))
    .filter(Boolean);

  // Load history with anime details
  const historyItems = history
    .map((item: any) => {
      const anime = animeService.getById(item.animeId);
      return anime ? { ...item, anime } : null;
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Koleksi & Riwayat Saya
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Kelola anime tersimpan dan lanjutkan episode yang belum selesai kamu tonton.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center rounded-2xl bg-dark-900 border border-white/10 p-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'watchlist'
                  ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Watchlist ({watchlistAnimes.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-brand-cyan text-dark-950 shadow-md shadow-brand-cyan/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Riwayat ({historyItems.length})
            </button>
          </div>
        </div>

        {/* Watchlist Tab Content */}
        {activeTab === 'watchlist' && (
          <div>
            {watchlistAnimes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
                {watchlistAnimes.map((anime: any) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-4 bg-dark-900/50 rounded-2xl border border-white/5 p-8">
                <Bookmark className="w-12 h-12 text-slate-500 mx-auto opacity-50" />
                <h3 className="text-lg font-bold text-white">Watchlist Masih Kosong</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Kamu belum menambahkan anime apa pun ke dalam watchlist. Tekan tombol bookmark pada kartu anime untuk menyimpannya di sini.
                </p>
                <Link
                  to="/az"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-dark-950 font-bold text-xs shadow-lg shadow-brand-cyan/20 hover:opacity-90 transition-all"
                >
                  <Compass className="w-4 h-4" /> Jelajahi Anime Sekarang
                </Link>
              </div>
            )}
          </div>
        )}

        {/* History Tab Content */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {historyItems.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Semua Riwayat
                </button>
              </div>
            )}

            {historyItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyItems.map((item: any) => (
                  <div
                    key={item.animeId}
                    className="flex items-center gap-4 p-3.5 rounded-2xl bg-dark-900 border border-white/10 hover:border-brand-cyan/40 transition-all group"
                  >
                    {/* Poster */}
                    <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-dark-850 shrink-0">
                      <img
                        src={item.anime.posterImage}
                        alt={item.anime.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        onClick={() =>
                          navigate(`/watch/${item.animeId}/${item.episodeNumber}`)
                        }
                        className="absolute inset-0 bg-dark-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-6 h-6 text-brand-cyan fill-brand-cyan" />
                      </button>
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                      <div>
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-cyan transition-colors">
                          {item.anime.title}
                        </h4>
                        <p className="text-xs text-brand-cyan font-semibold mt-0.5">
                          Episode {item.episodeNumber}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-1">
                          Posisi: {formatTime(item.currentTime)} / {formatTime(item.duration)}
                        </p>
                      </div>

                      <div className="space-y-2 mt-2">
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full"
                            style={{ width: `${item.progressPercentage}%` }}
                          />
                        </div>

                        <button
                          onClick={() =>
                            navigate(`/watch/${item.animeId}/${item.episodeNumber}`)
                          }
                          className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Play className="w-3 h-3 fill-slate-200" /> Lanjutkan Menonton
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-4 bg-dark-900/50 rounded-2xl border border-white/5 p-8">
                <Clock className="w-12 h-12 text-slate-500 mx-auto opacity-50" />
                <h3 className="text-lg font-bold text-white">Belum Ada Riwayat Tontonan</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Riwayat tontonan kamu akan otomatis dicatat setiap kali kamu memutar episode anime.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cyan text-dark-950 font-bold text-xs shadow-lg shadow-brand-cyan/20 hover:bg-brand-cyanGlow transition-all"
                >
                  Mulai Nonton di Beranda
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
