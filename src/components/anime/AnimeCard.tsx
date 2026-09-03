import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Play, Film } from 'lucide-react';
import { Anime } from '../../types/anime';
import { useWatch } from '../../context/WatchContext';
import { formatScore } from '../../utils/formatters';

interface AnimeCardProps {
  anime: Anime;
  showRank?: number;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, showRank }) => {
  const { isInWatchlist, toggleWatchlist } = useWatch();
  const bookmarked = isInWatchlist(anime.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(anime.id);
  };

  return (
    <Link
      to={`/watch/${anime.id}/1`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-dark-900 border border-white/5 hover:border-brand-cyan/40 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-cyan/10 hover:-translate-y-1.5 focus:outline-none"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-dark-850">
        <img
          src={anime.posterImage}
          alt={anime.title}
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          {/* Rating Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-dark-950/80 backdrop-blur-md border border-white/10 text-amber-400 text-xs font-bold shadow-lg">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{formatScore(anime.score)}</span>
          </div>

          {/* Watchlist Bookmark Button */}
          <button
            onClick={handleBookmark}
            type="button"
            className={`p-1.5 rounded-lg backdrop-blur-md border transition-all duration-200 active:scale-90 ${
              bookmarked
                ? 'bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/40'
                : 'bg-dark-950/70 hover:bg-dark-950 text-slate-300 hover:text-white border-white/10'
            }`}
            title={bookmarked ? 'Hapus dari Watchlist' : 'Simpan ke Watchlist'}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white stroke-white' : ''}`}
            />
          </button>
        </div>

        {/* Rank Badge (Optional for Top Charts) */}
        {showRank !== undefined && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-t from-white/90 to-white/40 drop-shadow-md">
              #{showRank}
            </span>
          </div>
        )}

        {/* Quality & Episode Badge */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <span className="px-1.5 py-0.5 rounded bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan text-[10px] font-bold">
            1080p
          </span>
          <span className="px-2 py-0.5 rounded bg-dark-950/80 backdrop-blur-md border border-white/10 text-slate-200 text-[10px] font-semibold">
            {anime.status === 'Ongoing' ? `EP ${anime.episodesCount}` : `${anime.episodesCount} EPS`}
          </span>
        </div>

        {/* Center Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-cyan to-brand-purple p-0.5 shadow-xl shadow-brand-cyan/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <div className="w-full h-full bg-dark-950/90 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-brand-cyan fill-brand-cyan ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-dark-900/90">
        <div>
          {/* Subtitle / Romaji */}
          {anime.japaneseTitle && (
            <p className="text-[11px] text-slate-500 font-medium truncate mb-0.5">
              {anime.japaneseTitle}
            </p>
          )}

          {/* Title */}
          <h3 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors line-clamp-2 leading-snug">
            {anime.title}
          </h3>
        </div>

        {/* Genre Tags */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {anime.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-medium"
            >
              {genre}
            </span>
          ))}
          {anime.year && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-mono ml-auto">
              {anime.year}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
