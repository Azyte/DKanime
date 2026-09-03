import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  Star,
  Clock,
  ChevronRight,
  Play,
  Compass,
  Tv
} from 'lucide-react';
import { animeService } from '../services/animeService';
import { GENRES_LIST } from '../services/animeData';
import { HeroBanner } from '../components/anime/HeroBanner';
import { AnimeCard } from '../components/anime/AnimeCard';
import { useWatch } from '../context/WatchContext';
import { formatTime } from '../utils/formatters';
import type { Anime } from '../types/anime';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { history } = useWatch();
  const [selectedGenre, setSelectedGenre] = useState('All Genres');

  const trendingAnimes = animeService.getTrending();
  const topAiring = animeService.getTopAiring();
  const topRated = animeService.getTopRated();

  // Filter by selected genre pill
  const filteredCatalog =
    selectedGenre === 'All Genres'
      ? animeService.getAll().slice(0, 12)
      : animeService.filter({ genre: selectedGenre });

  // Get anime details for continue watching items
  const continueWatchingList = history
    .map((item) => {
      const anime = animeService.getById(item.animeId);
      return anime ? { ...item, anime } : null;
    })
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-dark-950 pb-20">
      {/* Hero Banner Carousel */}
      <HeroBanner animes={trendingAnimes} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20 space-y-12">
        {/* Continue Watching Section (if history exists) */}
        {continueWatchingList.length > 0 && (
          <section className="bg-dark-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-cyan" />
                <h2 className="text-lg font-bold text-white">Lanjutkan Menonton</h2>
              </div>
              <Link
                to="/watchlist"
                className="text-xs text-brand-cyan hover:underline flex items-center gap-1 font-semibold"
              >
                Lihat Semua Riwayat <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {continueWatchingList.map((item: any) => (
                <div
                  key={item.animeId}
                  onClick={() => navigate(`/watch/${item.animeId}/${item.episodeNumber}`)}
                  className="group flex items-center gap-3.5 p-3 rounded-xl bg-dark-950/70 border border-white/5 hover:border-brand-cyan/40 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-dark-850 shrink-0">
                    <img
                      src={item.anime.posterImage}
                      alt={item.anime.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-dark-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-brand-cyan fill-brand-cyan" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-brand-cyan transition-colors">
                      {item.anime.title}
                    </h4>
                    <p className="text-[11px] text-brand-cyan font-semibold mt-0.5">
                      Episode {item.episodeNumber}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {formatTime(item.currentTime)} / {formatTime(item.duration)}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full"
                        style={{ width: `${item.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending Now Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-pink/20 border border-brand-pink/30 flex items-center justify-center text-brand-pink">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Sedang Trending</h2>
                <p className="text-xs text-slate-400">Anime paling banyak ditonton minggu ini</p>
              </div>
            </div>
            <Link
              to="/az?sort=popularity"
              className="text-xs text-brand-cyan hover:underline flex items-center gap-1 font-semibold"
            >
              Lihat Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {trendingAnimes.map((anime: Anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>

        {/* Top Airing Season Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Sedang Tayang</h2>
                <p className="text-xs text-slate-400">Episode baru rilis setiap minggu</p>
              </div>
            </div>
            <Link
              to="/az?status=Ongoing"
              className="text-xs text-brand-cyan hover:underline flex items-center gap-1 font-semibold"
            >
              Lihat Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {topAiring.map((anime: Anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>

        {/* Top Rated Hall of Fame */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Top Rating MAL</h2>
                <p className="text-xs text-slate-400">Anime dengan skor evaluasi tertinggi</p>
              </div>
            </div>
            <Link
              to="/az?sort=score"
              className="text-xs text-brand-cyan hover:underline flex items-center gap-1 font-semibold"
            >
              Lihat Ranking <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {topRated.slice(0, 6).map((anime: Anime, index: number) => (
              <AnimeCard key={anime.id} anime={anime} showRank={index + 1} />
            ))}
          </div>
        </section>

        {/* Explore by Genre Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Jelajahi Genre</h2>
                <p className="text-xs text-slate-400">Pilih kategori anime favorit kamu</p>
              </div>
            </div>

            <Link
              to="/az"
              className="text-xs text-brand-cyan hover:underline font-semibold self-start sm:self-auto"
            >
              Buka Katalog A-Z Lengkap →
            </Link>
          </div>

          {/* Genre Pill Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {GENRES_LIST.map((genre: string) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  selectedGenre === genre
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-purple text-dark-950 shadow-md shadow-brand-cyan/20'
                    : 'bg-dark-900 hover:bg-dark-850 text-slate-300 border border-white/10 hover:border-white/20'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Filtered Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 pt-2">
            {filteredCatalog.map((anime: Anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
