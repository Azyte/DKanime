import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Star,
  RotateCcw,
  Film
} from 'lucide-react';
import { animeService } from '../services/animeService';
import { GENRES_LIST } from '../services/animeData';
import { AnimeCard } from '../components/anime/AnimeCard';
import type { Anime } from '../types/anime';

const ALPHABETS = [
  'ALL',
  '#',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

interface AZDirectoryPageProps {
  defaultFormat?: 'All' | 'TV' | 'Movie';
}

export const AZDirectoryPage: React.FC<AZDirectoryPageProps> = ({ defaultFormat }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query state
  const queryParam = searchParams.get('search') || '';
  const letterParam = searchParams.get('letter') || 'ALL';
  const genreParam = searchParams.get('genre') || 'All Genres';
  const formatParam = (searchParams.get('format') as any) || defaultFormat || 'All';
  const sortParam = (searchParams.get('sort') as any) || 'popularity';
  const statusParam = searchParams.get('status') || 'All';
  const minScoreParam = searchParams.get('minScore') ? parseFloat(searchParams.get('minScore')!) : 0;

  // Local component states
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedLetter, setSelectedLetter] = useState(letterParam);
  const [selectedGenre, setSelectedGenre] = useState(genreParam);
  const [selectedFormat, setSelectedFormat] = useState<'All' | 'TV' | 'Movie'>(formatParam);
  const [selectedSort, setSelectedSort] = useState<'popularity' | 'score' | 'title' | 'year'>(sortParam);
  const [selectedStatus, setSelectedStatus] = useState(statusParam);
  const [minScore, setMinScore] = useState<number>(minScoreParam);

  // Sync state to URL params
  const updateParams = (newFilters: {
    search?: string;
    letter?: string;
    genre?: string;
    format?: string;
    sort?: string;
    status?: string;
    minScore?: number;
  }) => {
    const params = new URLSearchParams();
    const s = newFilters.search !== undefined ? newFilters.search : searchQuery;
    const l = newFilters.letter !== undefined ? newFilters.letter : selectedLetter;
    const g = newFilters.genre !== undefined ? newFilters.genre : selectedGenre;
    const f = newFilters.format !== undefined ? newFilters.format : selectedFormat;
    const so = newFilters.sort !== undefined ? newFilters.sort : selectedSort;
    const st = newFilters.status !== undefined ? newFilters.status : selectedStatus;
    const ms = newFilters.minScore !== undefined ? newFilters.minScore : minScore;

    if (s) params.set('search', s);
    if (l && l !== 'ALL') params.set('letter', l);
    if (g && g !== 'All Genres') params.set('genre', g);
    if (f && f !== 'All') params.set('format', f);
    if (so && so !== 'popularity') params.set('sort', so);
    if (st && st !== 'All') params.set('status', st);
    if (ms > 0) params.set('minScore', ms.toString());

    setSearchParams(params);
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    updateParams({ letter });
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    updateParams({ genre });
  };

  const handleFormatChange = (format: 'All' | 'TV' | 'Movie') => {
    setSelectedFormat(format);
    updateParams({ format });
  };

  const handleSortChange = (sort: 'popularity' | 'score' | 'title' | 'year') => {
    setSelectedSort(sort);
    updateParams({ sort });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    updateParams({ status });
  };

  const handleScoreChange = (score: number) => {
    setMinScore(score);
    updateParams({ minScore: score });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLetter('ALL');
    setSelectedGenre('All Genres');
    setSelectedFormat('All');
    setSelectedSort('popularity');
    setSelectedStatus('All');
    setMinScore(0);
    setSearchParams(new URLSearchParams());
  };

  // Filter animes based on combined criteria
  const filteredAnimes: Anime[] = useMemo(() => {
    return animeService.filter({
      query: searchQuery,
      letter: selectedLetter,
      genre: selectedGenre,
      format: selectedFormat !== 'All' ? selectedFormat : undefined,
      status: selectedStatus,
      minScore: minScore > 0 ? minScore : undefined,
      sortBy: selectedSort
    });
  }, [searchQuery, selectedLetter, selectedGenre, selectedFormat, selectedStatus, minScore, selectedSort]);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title & Intro */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            {selectedFormat === 'Movie' ? 'Koleksi Anime Movie & Layar Lebar' : 'Katalog Anime A-Z'}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              {filteredAnimes.length} {selectedFormat === 'Movie' ? 'Film' : 'Judul'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            {selectedFormat === 'Movie'
              ? 'Tonton film anime layar lebar terbaik (Full Movie 1080p) dengan takarir bahasa Indonesia dan kualitas bioskop jernih.'
              : 'Cari dan jelajahi seluruh koleksi serial anime dan film layar lebar berdasarkan abjad nama, format tayangan, rating MyAnimeList, dan genre.'}
          </p>
        </div>

        {/* Alphabet Bar */}
        <div className="bg-dark-900 border border-white/10 rounded-2xl p-3 shadow-xl">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {ALPHABETS.map((letter) => {
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-cyan to-brand-purple text-dark-950 shadow-md shadow-brand-cyan/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-dark-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search by Name */}
            <div className="relative">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Cari Berdasarkan Nama
              </label>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    updateParams({ search: e.target.value });
                  }}
                  placeholder="Ketik judul anime..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            {/* Format / Tipe Select */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Format / Tipe
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => handleFormatChange(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan cursor-pointer"
              >
                <option value="All" className="bg-dark-900">Semua Tipe</option>
                <option value="TV" className="bg-dark-900">Serial TV (Series)</option>
                <option value="Movie" className="bg-dark-900">🎬 Anime Movie (Layar Lebar)</option>
              </select>
            </div>

            {/* Genre Select */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan cursor-pointer"
              >
                {GENRES_LIST.map((genre: string) => (
                  <option key={genre} value={genre} className="bg-dark-900">
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan cursor-pointer"
              >
                <option value="All" className="bg-dark-900">Semua Status</option>
                <option value="Ongoing" className="bg-dark-900">Sedang Tayang (Ongoing)</option>
                <option value="Completed" className="bg-dark-900">Tamat (Completed)</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Urutkan Berdasarkan
              </label>
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan cursor-pointer"
              >
                <option value="popularity" className="bg-dark-900">Terpopuler</option>
                <option value="score" className="bg-dark-900">Rating Tertinggi</option>
                <option value="title" className="bg-dark-900">Judul (A-Z)</option>
                <option value="year" className="bg-dark-900">Tahun Terbaru</option>
              </select>
            </div>
          </div>

          {/* Rating Filter Pills & Reset Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Minimal Rating:
              </span>
              {[0, 7.5, 8.0, 8.5, 9.0].map((score) => {
                const isActive = minScore === score;
                return (
                  <button
                    key={score}
                    onClick={() => handleScoreChange(score)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-400 text-dark-950 shadow-sm shadow-amber-400/30'
                        : 'bg-dark-950 text-slate-300 hover:text-white border border-white/5'
                    }`}
                  >
                    {score === 0 ? 'Semua' : `${score}+`}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Anime Cards Grid */}
        {filteredAnimes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {filteredAnimes.map((anime: Anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-4 bg-dark-900/50 rounded-2xl border border-white/5 p-8">
            <Film className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Tidak Ditemukan Anime</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tidak ada anime yang cocok dengan kombinasi filter dan kata kunci yang kamu pilih.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-brand-cyan text-dark-950 font-bold text-xs shadow-lg shadow-brand-cyan/20 hover:bg-brand-cyanGlow transition-all"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
