import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Film
} from 'lucide-react';
import { animeService } from '../services/animeService';
import type { Anime, AnimeEpisode } from '../types/anime';
import { AnimePlayer } from '../components/player/AnimePlayer';
import { EpisodeList } from '../components/anime/EpisodeList';
import { AnimeCard } from '../components/anime/AnimeCard';
import { useWatch } from '../context/WatchContext';
import { useSettings } from '../context/SettingsContext';
import { formatScore, formatNumber } from '../utils/formatters';

export const WatchPage: React.FC = () => {
  const { id, episode: epParam } = useParams<{ id: string; episode?: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatch();
  const { setIsSettingsOpen } = useSettings();

  const animeId = parseInt(id || '1', 10);
  const currentEpNumber = parseInt(epParam || '1', 10);

  const [anime, setAnime] = useState<Anime | undefined>(() => animeService.getById(animeId));
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isLightsOff, setIsLightsOff] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Stream state from AniVault / HLS API
  const [liveStream, setLiveStream] = useState<any>(null);
  const [isFetchingStream, setIsFetchingStream] = useState(false);

  useEffect(() => {
    const found = animeService.getById(animeId);
    if (found) {
      setAnime(found);
      document.title = `Nonton ${found.title} Ep ${currentEpNumber} - DKanime`;
    }
  }, [animeId, currentEpNumber]);

  // Fetch real stream for current anime & episode
  useEffect(() => {
    let isMounted = true;
    if (!anime) return;

    const fetchStream = async () => {
      setIsFetchingStream(true);
      try {
        const stream = await animeService.getEpisodeStream(anime, currentEpNumber);
        if (isMounted && stream) {
          setLiveStream(stream);
        }
      } catch (err) {
        console.warn('Stream fetch error:', err);
      } finally {
        if (isMounted) setIsFetchingStream(false);
      }
    };

    fetchStream();
    return () => {
      isMounted = false;
    };
  }, [anime?.id, currentEpNumber]);

  if (!anime) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4 text-center">
        <Film className="w-12 h-12 text-slate-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Anime Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400 mb-6 max-w-sm">
          Anime dengan ID ini mungkin telah dipindahkan atau belum tersedia.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-brand-cyan text-dark-950 font-bold text-xs shadow-lg shadow-brand-cyan/20 hover:bg-brand-cyanGlow transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // Find current episode or fallback to first, merged with live sources
  const baseEpisode: AnimeEpisode =
    anime.episodes.find((ep: AnimeEpisode) => ep.number === currentEpNumber) ||
    anime.episodes[0] || {
      id: 1,
      number: 1,
      title: 'Episode 1',
      duration: '24:00',
      sources: []
    };

  const currentEpisode: AnimeEpisode = {
    ...baseEpisode,
    sources: liveStream && liveStream.sources.length > 0 ? liveStream.sources : baseEpisode.sources,
    embedUrl: liveStream?.embedUrl || baseEpisode.embedUrl,
    subtitles: liveStream?.subtitles || baseEpisode.subtitles
  };

  const isBookmarked = isInWatchlist(anime.id);
  const relatedAnimes = animeService.getRelated(anime, 6);

  const handleNextEpisode = () => {
    if (currentEpNumber < anime.episodesCount) {
      navigate(`/watch/${anime.id}/${currentEpNumber + 1}`);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpNumber > 1) {
      navigate(`/watch/${anime.id}/${currentEpNumber - 1}`);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 pt-20 pb-20 relative">
      {/* Lights Off Dimmer Overlay */}
      {isLightsOff && (
        <div
          onClick={() => setIsLightsOff(false)}
          className="fixed inset-0 z-30 bg-black/95 backdrop-blur-md cursor-pointer transition-opacity duration-300"
          title="Klik di mana saja untuk menyalakan lampu"
        />
      )}

      <div
        className={`mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          isTheaterMode ? 'max-w-full px-2 sm:px-4' : 'max-w-7xl'
        }`}
      >
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between py-2 text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-1.5 truncate">
            <Link to="/" className="hover:text-brand-cyan">
              Beranda
            </Link>
            <span>/</span>
            <Link to="/az" className="hover:text-brand-cyan">
              Direktori
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold truncate">
              {anime.title}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrevEpisode}
              disabled={currentEpNumber <= 1}
              className="p-1.5 rounded-lg bg-dark-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Episode Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-brand-cyan">
              Ep {currentEpNumber} / {anime.episodesCount}
            </span>
            <button
              onClick={handleNextEpisode}
              disabled={currentEpNumber >= anime.episodesCount}
              className="p-1.5 rounded-lg bg-dark-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Episode Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Streaming Player Section */}
        <div className={`relative z-40 mb-6 ${isTheaterMode ? 'max-w-6xl mx-auto' : ''}`}>
          <AnimePlayer
            animeId={anime.id}
            animeTitle={anime.title}
            episode={currentEpisode}
            totalEpisodes={anime.episodesCount}
            onNextEpisode={handleNextEpisode}
            onPrevEpisode={handlePrevEpisode}
            isTheaterMode={isTheaterMode}
            setIsTheaterMode={setIsTheaterMode}
            isLightsOff={isLightsOff}
            setIsLightsOff={setIsLightsOff}
          />
        </div>

        {/* Server & Streaming Information Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-dark-900 border border-white/5 mb-6 text-xs">
          <div className="flex items-center gap-3">
            {isFetchingStream ? (
              <span className="flex items-center gap-1.5 text-brand-cyan font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
                Menghubungkan ke API Streaming Anime...
              </span>
            ) : liveStream ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Live Stream Terhubung: {liveStream.server || 'HLS Master'} (HD 1080p)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Streaming Aktif: Multi-Resolution HD
              </span>
            )}
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="text-slate-400 hidden sm:inline">
              {liveStream?.subtitles && liveStream.subtitles.length > 0
                ? `${liveStream.subtitles.length} Subtitle Tersedia (VTT)`
                : 'Pilihan Kualitas: Auto, 1080p, 720p, 480p, 360p'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-brand-cyan font-semibold transition-colors"
            >
              Pengaturan Player
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              title="Bagikan Tautan"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Grid: Anime Info & Episode Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Anime Metadata */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                {anime.japaneseTitle && (
                  <p className="text-xs text-slate-400 font-medium">
                    {anime.japaneseTitle}
                  </p>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {anime.title}
                </h1>
                <p className="text-xs text-brand-cyan font-semibold pt-1">
                  {currentEpisode.title}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleWatchlist(anime.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    isBookmarked
                      ? 'bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/20'
                      : 'bg-dark-900 hover:bg-dark-850 text-slate-200 border-white/10'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
                  {isBookmarked ? 'Tersimpan' : 'Tambah Watchlist'}
                </button>
              </div>
            </div>

            {/* Badges / Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-dark-900 border border-white/5 flex flex-col">
                <span className="text-[11px] text-slate-400">Skor Rating</span>
                <span className="text-base font-extrabold text-amber-400 flex items-center gap-1 mt-0.5">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {formatScore(anime.score)}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {formatNumber(anime.scoredBy)} pemilih
                </span>
              </div>

              <div className="p-3 rounded-xl bg-dark-900 border border-white/5 flex flex-col">
                <span className="text-[11px] text-slate-400">Status Rilis</span>
                <span className="text-sm font-bold text-white mt-0.5">
                  {anime.status}
                </span>
                <span className="text-[10px] text-brand-cyan mt-0.5">
                  {anime.episodesCount} Episode
                </span>
              </div>

              <div className="p-3 rounded-xl bg-dark-900 border border-white/5 flex flex-col">
                <span className="text-[11px] text-slate-400">Musim & Tahun</span>
                <span className="text-sm font-bold text-white mt-0.5">
                  {anime.season || 'Unknown'} {anime.year || ''}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {anime.duration}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-dark-900 border border-white/5 flex flex-col">
                <span className="text-[11px] text-slate-400">Studio Animasi</span>
                <span className="text-sm font-bold text-white truncate mt-0.5">
                  {anime.studios?.join(', ') || 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Kualitas FHD
                </span>
              </div>
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Genre
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.map((genre: string) => (
                  <Link
                    key={genre}
                    to={`/az?genre=${encodeURIComponent(genre)}`}
                    className="px-3 py-1 rounded-lg bg-dark-900 hover:bg-dark-850 border border-white/10 text-xs font-medium text-slate-300 hover:text-brand-cyan transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Sinopsis
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-dark-900/50 p-4 rounded-2xl border border-white/5">
                {anime.synopsis}
              </p>
            </div>
          </div>

          {/* Right Column (1 Col): Episode Selector */}
          <div className="space-y-6">
            <EpisodeList
              animeId={anime.id}
              episodes={anime.episodes}
              currentEpisodeNumber={currentEpNumber}
              onSelectEpisode={(num: number) => navigate(`/watch/${anime.id}/${num}`)}
            />
          </div>
        </div>

        {/* Related Anime Recommendations */}
        <section className="mt-16 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Rekomendasi Anime Terkait</h3>
            <Link
              to="/az"
              className="text-xs text-brand-cyan hover:underline font-semibold"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {relatedAnimes.map((rel: Anime) => (
              <AnimeCard key={rel.id} anime={rel} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
