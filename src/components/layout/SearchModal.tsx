import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Star, Play, Film, Flame, Sparkles } from 'lucide-react';
import { animeService } from '../../services/animeService';
import { Anime } from '../../types/anime';
import { formatScore } from '../../utils/formatters';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setResults(animeService.getTrending().slice(0, 5));
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key and Ctrl+K globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(animeService.getTrending().slice(0, 5));
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      // Search local catalog first
      const local = animeService.filter({ query });
      if (local.length > 0) {
        setResults(local.slice(0, 8));
        setIsSearching(false);
      } else {
        // Try live streaming search
        const live = await animeService.searchAnimeLive(query);
        setResults(live.slice(0, 8));
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectAnime = (animeId: number) => {
    onClose();
    navigate(`/watch/${animeId}/1`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-dark-950/80 backdrop-blur-md animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-dark-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-dark-850/80">
          <Search className="w-5 h-5 text-brand-cyan shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul anime, karakter, atau genre..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results / Suggestions List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-white/5 space-y-2">
          <div className="flex items-center justify-between pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>{query.trim() ? 'Hasil Pencarian' : 'Trending Saat Ini'}</span>
            {isSearching && (
              <span className="text-brand-cyan animate-pulse">Mencari...</span>
            )}
          </div>

          {results.length === 0 && !isSearching && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Film className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
              <p className="text-sm">Tidak menemukan anime dengan kata kunci "{query}"</p>
              <p className="text-xs text-slate-500">
                Coba gunakan judul bahasa Inggris atau Jepang (misal: "Solo Leveling", "Frieren")
              </p>
            </div>
          )}

          {results.map((anime) => (
            <div
              key={anime.id}
              onClick={() => handleSelectAnime(anime.id)}
              className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-150 group"
            >
              {/* Thumbnail */}
              <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-dark-800 border border-white/5">
                <img
                  src={anime.posterImage}
                  alt={anime.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-dark-950/30 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Play className="w-5 h-5 text-white fill-white drop-shadow" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-brand-cyan transition-colors">
                    {anime.title}
                  </h4>
                  {anime.ratingBadge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                      {anime.ratingBadge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {formatScore(anime.score)}
                  </span>
                  <span>•</span>
                  <span>{anime.episodesCount} Episode</span>
                  <span>•</span>
                  <span className="text-slate-400 truncate">
                    {anime.genres.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-dark-950/80 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Gunakan panah atau klik untuk memilih anime</span>
          <button
            onClick={() => {
              onClose();
              navigate(`/az?search=${encodeURIComponent(query)}`);
            }}
            className="text-brand-cyan hover:underline"
          >
            Buka di A-Z Katalog →
          </button>
        </div>
      </div>
    </div>
  );
};
