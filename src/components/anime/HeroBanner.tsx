import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Bookmark, Star, ChevronLeft, ChevronRight, Info, Film } from 'lucide-react';
import { Anime } from '../../types/anime';
import { useWatch } from '../../context/WatchContext';
import { formatScore } from '../../utils/formatters';

interface HeroBannerProps {
  animes: Anime[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ animes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatch();

  const currentAnime = animes[currentIndex] || animes[0];

  useEffect(() => {
    if (isPaused || animes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, animes.length]);

  if (!currentAnime) return null;

  const bookmarked = isInWatchlist(currentAnime.id);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + animes.length) % animes.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % animes.length);
  };

  return (
    <div
      className="relative w-full h-[520px] sm:h-[580px] lg:h-[650px] overflow-hidden bg-dark-950 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Backdrop Image */}
      <div className="absolute inset-0">
        <img
          key={currentAnime.id}
          src={currentAnime.coverImage}
          alt={currentAnime.title}
          className="w-full h-full object-cover object-center animate-fadeIn scale-105 duration-1000"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-dark-950/25 z-10" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl pt-16 sm:pt-0 space-y-4 sm:space-y-5">
          {/* Spotlight Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
            #1 Spotlight Hari Ini
          </div>

          {/* Titles */}
          <div>
            {currentAnime.japaneseTitle && (
              <p className="text-sm sm:text-base font-medium text-slate-400 mb-1">
                {currentAnime.japaneseTitle}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight line-clamp-2">
              {currentAnime.title}
            </h1>
          </div>

          {/* Badges / Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-900/80 border border-white/10 font-bold text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              {formatScore(currentAnime.score)}
            </div>
            <span className="px-2 py-0.5 rounded bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan font-bold text-xs">
              1080p FHD
            </span>
            {currentAnime.format === 'Movie' ? (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-600 border border-fuchsia-400/40 text-white font-bold text-xs shadow-md shadow-fuchsia-500/20 flex items-center gap-1">
                <Film className="w-3 h-3" />
                FILM LAYAR LEBAR (MOVIE)
              </span>
            ) : (
              <>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium text-xs">
                  {currentAnime.status}
                </span>
                {currentAnime.year && <span>{currentAnime.year}</span>}
                <span>•</span>
                <span>{currentAnime.episodesCount} Episode</span>
              </>
            )}
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-xl">
            {currentAnime.synopsis}
          </p>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 pt-1">
            {currentAnime.genres.map((g) => (
              <span
                key={g}
                className="text-xs px-3 py-1 rounded-lg bg-dark-900/60 backdrop-blur-md border border-white/10 text-slate-300 font-medium"
              >
                {g}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => navigate(`/watch/${currentAnime.id}/1`)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple hover:from-brand-cyanGlow hover:to-brand-purple text-dark-950 font-bold text-sm transition-all duration-300 shadow-xl shadow-brand-cyan/25 hover:shadow-brand-cyan/40 hover:scale-[1.02] active:scale-95 focus:outline-none"
            >
              <Play className="w-5 h-5 fill-dark-950 text-dark-950 ml-0.5" />
              {currentAnime.format === 'Movie' ? 'Tonton Full Movie' : 'Tonton Sekarang'}
            </button>

            <button
              onClick={() => toggleWatchlist(currentAnime.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm transition-all duration-200 active:scale-95 ${
                bookmarked
                  ? 'bg-brand-purple/20 text-brand-purple border-brand-purple/50'
                  : 'bg-dark-900/70 hover:bg-dark-900 text-white border-white/15 hover:border-white/30'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-brand-purple' : ''}`} />
              {bookmarked ? 'Tersimpan' : '+ Watchlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      <div className="hidden sm:flex absolute right-6 bottom-8 z-20 items-center gap-2">
        <button
          onClick={prevSlide}
          className="p-2.5 rounded-xl bg-dark-900/70 hover:bg-dark-900 border border-white/10 text-white hover:text-brand-cyan transition-all"
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="p-2.5 rounded-xl bg-dark-900/70 hover:bg-dark-900 border border-white/10 text-white hover:text-brand-cyan transition-all"
          aria-label="Slide berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
        {animes.map((anime, idx) => (
          <button
            key={anime.id}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-7 h-2 bg-brand-cyan shadow-sm shadow-brand-cyan'
                : 'w-2 h-2 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
