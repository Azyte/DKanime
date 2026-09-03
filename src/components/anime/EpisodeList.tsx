import React, { useState } from 'react';
import { LayoutGrid, List, Play, CheckCircle2, Search } from 'lucide-react';
import { AnimeEpisode } from '../../types/anime';
import { useWatch } from '../../context/WatchContext';

interface EpisodeListProps {
  animeId: number;
  episodes: AnimeEpisode[];
  currentEpisodeNumber: number;
  onSelectEpisode: (epNumber: number) => void;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  animeId,
  episodes,
  currentEpisodeNumber,
  onSelectEpisode,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const { getProgress } = useWatch();

  const currentProgress = getProgress(animeId);

  // Group episodes into chunks of 25 for easier navigation
  const chunkSize = 25;
  const chunks: AnimeEpisode[][] = [];
  for (let i = 0; i < episodes.length; i += chunkSize) {
    chunks.push(episodes.slice(i, i + chunkSize));
  }

  // Active episodes to display
  const activeChunk = chunks[selectedRangeIndex] || episodes;
  const filteredEpisodes = activeChunk.filter(
    (ep) =>
      ep.number.toString().includes(searchFilter) ||
      ep.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="bg-dark-900 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white">Daftar Episode</h3>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-mono">
            {episodes.length} Total
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick search */}
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cari episode..."
              className="w-32 sm:w-40 px-3 py-1.5 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-cyan"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center rounded-xl bg-dark-950 border border-white/10 p-0.5 text-slate-400">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-brand-cyan text-dark-950 font-bold'
                  : 'hover:text-white'
              }`}
              title="Tampilan Kotak"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-brand-cyan text-dark-950 font-bold'
                  : 'hover:text-white'
              }`}
              title="Tampilan List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Range Tabs (if more than 25 episodes) */}
      {chunks.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {chunks.map((chunk, idx) => {
            const start = idx * chunkSize + 1;
            const end = Math.min((idx + 1) * chunkSize, episodes.length);
            const isActive = selectedRangeIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => setSelectedRangeIndex(idx)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                  isActive
                    ? 'bg-white/15 text-white border border-brand-cyan/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {start} - {end}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid View Mode */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 max-h-72 overflow-y-auto pr-1">
          {filteredEpisodes.map((ep) => {
            const isCurrent = ep.number === currentEpisodeNumber;
            const isWatched = currentProgress && currentProgress.episodeNumber > ep.number;

            return (
              <button
                key={ep.id}
                onClick={() => onSelectEpisode(ep.number)}
                className={`relative py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 active:scale-90 ${
                  isCurrent
                    ? 'bg-gradient-to-tr from-brand-cyan to-brand-purple text-dark-950 shadow-lg shadow-brand-cyan/30 scale-105'
                    : 'bg-dark-950/80 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/20'
                }`}
              >
                <span>{ep.number}</span>
                {isWatched && (
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* List View Mode */}
      {viewMode === 'list' && (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filteredEpisodes.map((ep) => {
            const isCurrent = ep.number === currentEpisodeNumber;
            return (
              <div
                key={ep.id}
                onClick={() => onSelectEpisode(ep.number)}
                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                  isCurrent
                    ? 'bg-white/10 border border-brand-cyan/50 shadow-md shadow-brand-cyan/10'
                    : 'bg-dark-950/60 hover:bg-white/5 border border-white/5'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-dark-850 shrink-0">
                  {ep.thumbnail && (
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-dark-950/40 flex items-center justify-center">
                    <Play className={`w-3.5 h-3.5 ${isCurrent ? 'text-brand-cyan fill-brand-cyan' : 'text-white'}`} />
                  </div>
                </div>

                {/* Title and details */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-xs font-semibold truncate ${
                      isCurrent ? 'text-brand-cyan' : 'text-slate-200 group-hover:text-white'
                    }`}
                  >
                    {ep.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {ep.duration}
                  </p>
                </div>

                {/* Status Indicator */}
                {isCurrent && (
                  <span className="px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan text-[10px] font-bold">
                    Diputar
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
