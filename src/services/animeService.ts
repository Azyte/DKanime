import type { Anime, AnimeEpisode, SubtitleTrack, VideoSource } from '../types/anime';
import { INITIAL_ANIMES, generateEpisodes, generateMovieEpisode } from './animeData';
import type { AnimeFormat } from '../types/anime';

export interface AnimeFilterOptions {
  query?: string;
  genre?: string;
  format?: AnimeFormat | 'All';
  minScore?: number;
  maxScore?: number;
  letter?: string; // 'A'..'Z' or '#'
  status?: string;
  sortBy?: 'popularity' | 'score' | 'title' | 'year' | 'latest';
}

export interface EpisodeStreamResult {
  sources: VideoSource[];
  embedUrl?: string;
  subtitles?: SubtitleTrack[];
  server?: string;
  availableServers?: string[];
  playbackMode?: 'hls' | 'mp4';
}

// Known mappings to AniList and MAL IDs for instant stream resolution
const KNOWN_ANIME_IDS: Record<number, { anilistId: number; malId: number }> = {
  "1": {
    "anilistId": 151807,
    "malId": 52299
  },
  "2": {
    "anilistId": 154587,
    "malId": 52991
  },
  "3": {
    "anilistId": 145064,
    "malId": 51009
  },
  "4": {
    "anilistId": 16498,
    "malId": 16498
  },
  "5": {
    "anilistId": 101922,
    "malId": 38000
  },
  "6": {
    "anilistId": 21,
    "malId": 21
  },
  "7": {
    "anilistId": 127230,
    "malId": 44511
  },
  "8": {
    "anilistId": 150672,
    "malId": 52034
  },
  "9": {
    "anilistId": 116674,
    "malId": 41467
  },
  "10": {
    "anilistId": 130003,
    "malId": 47917
  },
  "11": {
    "anilistId": 120377,
    "malId": 42310
  },
  "12": {
    "anilistId": 171018,
    "malId": 57334
  },
  "13": {
    "anilistId": 1535,
    "malId": 1535
  },
  "14": {
    "anilistId": 5114,
    "malId": 5114
  },
  "15": {
    "anilistId": 11061,
    "malId": 11061
  },
  "16": {
    "anilistId": 125367,
    "malId": 43608
  },
  "17": {
    "anilistId": 146065,
    "malId": 51179
  },
  "18": {
    "anilistId": 9253,
    "malId": 9253
  },
  "19": {
    "anilistId": 158927,
    "malId": 53887
  },
  "20": {
    "anilistId": 136430,
    "malId": 49387
  },
  "21": {
    "anilistId": 21827,
    "malId": 33352
  },
  "22": {
    "anilistId": 163270,
    "malId": 54900
  },
  "23": {
    "anilistId": 392,
    "malId": 392
  },
  "24": {
    "anilistId": 159831,
    "malId": 54112
  },
  "101": { "anilistId": 131573, "malId": 48561 },
  "102": { "anilistId": 21519, "malId": 32281 },
  "103": { "anilistId": 20954, "malId": 28851 },
  "104": { "anilistId": 112151, "malId": 40456 },
  "105": { "anilistId": 142770, "malId": 50594 },
  "106": { "anilistId": 106286, "malId": 38826 },
  "107": { "anilistId": 141902, "malId": 50410 },
  "108": { "anilistId": 199, "malId": 199 },
  "109": { "anilistId": 431, "malId": 431 },
  "110": { "anilistId": 109979, "malId": 36699 }
};

class AnimeService {
  private animes: Anime[] = INITIAL_ANIMES;
  private jikanCache: Map<string, any> = new Map();
  private streamCache: Map<string, EpisodeStreamResult> = new Map();
  private searchCache: Map<string, Anime[]> = new Map();

  constructor() {
    // Load local storage custom animes if any
    try {
      const custom = localStorage.getItem('dkanime_custom_catalog');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed)) {
          this.animes = [...INITIAL_ANIMES, ...parsed];
        }
      }
    } catch {
      // ignore
    }
  }

  // Get all animes
  getAll(): Anime[] {
    return this.animes;
  }

  // Get all movies
  getMovies(): Anime[] {
    return this.animes.filter((a) => a.format === 'Movie');
  }

  // Get anime by ID (from catalog, custom list, or live search cache)
  getById(id: number): Anime | undefined {
    const found = this.animes.find((a) => a.id === id);
    if (found) return found;

    for (const list of this.searchCache.values()) {
      const match = list.find((a) => a.id === id);
      if (match) return match;
    }

    for (const list of this.jikanCache.values()) {
      if (Array.isArray(list)) {
        const match = list.find((a: Anime) => a.id === id);
        if (match) return match;
      }
    }

    return undefined;
  }

  // Filter & Search animes
  filter(options: AnimeFilterOptions = {}): Anime[] {
    let result = [...this.animes];

    // Format filter
    if (options.format && options.format !== 'All') {
      result = result.filter(
        (a) => a.format?.toLowerCase() === options.format!.toLowerCase()
      );
    }

    // Search query
    if (options.query && options.query.trim() !== '') {
      const q = options.query.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.romajiTitle && a.romajiTitle.toLowerCase().includes(q)) ||
          (a.japaneseTitle && a.japaneseTitle.toLowerCase().includes(q)) ||
          a.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    // Genre filter
    if (options.genre && options.genre !== 'All Genres') {
      result = result.filter((a) =>
        a.genres.some((g) => g.toLowerCase() === options.genre!.toLowerCase())
      );
    }

    // Min Score
    if (options.minScore !== undefined && options.minScore > 0) {
      result = result.filter((a) => a.score >= options.minScore!);
    }

    // Status
    if (options.status && options.status !== 'All') {
      result = result.filter(
        (a) => a.status.toLowerCase() === options.status!.toLowerCase()
      );
    }

    // A-Z Letter
    if (options.letter && options.letter !== 'ALL') {
      if (options.letter === '#') {
        // Starts with non-letter
        result = result.filter((a) => /^[^a-zA-Z]/.test(a.title));
      } else {
        const letter = options.letter.toUpperCase();
        result = result.filter((a) => a.title.toUpperCase().startsWith(letter));
      }
    }

    // Sorting
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'score':
          result.sort((a, b) => b.score - a.score);
          break;
        case 'popularity':
          result.sort((a, b) => (a.popularity || 999) - (b.popularity || 999));
          break;
        case 'title':
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'year':
          result.sort((a, b) => (b.year || 0) - (a.year || 0));
          break;
        case 'latest':
          result.sort((a, b) => b.id - a.id);
          break;
      }
    }

    return result;
  }

  // Get Top Airing Anime
  getTopAiring(): Anime[] {
    return this.animes.filter((a) => a.status === 'Ongoing').slice(0, 8);
  }

  // Get Top Rated Anime
  getTopRated(): Anime[] {
    return [...this.animes].sort((a, b) => b.score - a.score).slice(0, 10);
  }

  // Get Trending Anime for Hero Carousel
  getTrending(): Anime[] {
    return [...this.animes]
      .sort((a, b) => (a.popularity || 99) - (b.popularity || 99))
      .slice(0, 6);
  }

  // Get Related Anime based on genres
  getRelated(anime: Anime, limit = 6): Anime[] {
    return this.animes
      .filter((a) => a.id !== anime.id)
      .map((a) => {
        const commonGenres = a.genres.filter((g) => anime.genres.includes(g));
        return { anime: a, score: commonGenres.length };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.anime);
  }

  // Optional Jikan live search with caching & graceful fallback
  async searchJikanLive(query: string): Promise<Anime[]> {
    if (!query || query.trim().length < 2) return [];
    const cacheKey = `jikan_${query.toLowerCase()}`;
    if (this.jikanCache.has(cacheKey)) {
      return this.jikanCache.get(cacheKey);
    }

    try {
      const res = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10&sfw=true`
      );
      if (!res.ok) throw new Error(`Jikan error ${res.status}`);
      const json = await res.json();
      if (!json.data || !Array.isArray(json.data)) return [];

      const fetchedAnimes: Anime[] = json.data.map((item: any) => {
        const isMovie = item.type === 'Movie' || item.episodes === 1;
        const episodesCount = isMovie ? 1 : (item.episodes || 12);
        const format: AnimeFormat = isMovie ? 'Movie' : 'TV';
        const animeId = item.mal_id + 100000;
        const durStr = item.duration || (isMovie ? '105 min' : '24 min');
        const img = item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png';
        const episodes = isMovie
          ? generateMovieEpisode(animeId, item.title, durStr, img)
          : generateEpisodes(animeId, item.title, Math.min(episodesCount, 24), img);

        return {
          id: animeId,
          malId: item.mal_id,
          title: item.title,
          japaneseTitle: item.title_japanese,
          romajiTitle: item.title_synonyms?.[0] || item.title,
          synopsis: item.synopsis || (isMovie ? `Nonton film ${item.title} sub Indo.` : 'Deskripsi anime.'),
          posterImage: img,
          coverImage: img,
          score: item.score || 7.5,
          scoredBy: item.scored_by || 10000,
          rank: item.rank || 100,
          popularity: item.popularity || 100,
          format,
          status: item.status === 'Currently Airing' ? 'Ongoing' : 'Completed',
          episodesCount,
          duration: durStr,
          season: item.season || 'Unknown',
          year: item.year || new Date().getFullYear(),
          genres: item.genres?.map((g: any) => g.name) || ['Action'],
          studios: item.studios?.map((s: any) => s.name) || ['Unknown'],
          trailerUrl: item.trailer?.embed_url,
          ratingBadge: item.rating?.includes('17+') ? '17+' : '13+',
          episodes
        };
      });

      this.jikanCache.set(cacheKey, fetchedAnimes);
      return fetchedAnimes;
    } catch {
      // On failure, filter local
      return this.filter({ query });
    }
  }

  // Live Anime Search powered by AniVault (AniList / MAL)
  async searchAnimeLive(query: string): Promise<Anime[]> {
    if (!query || query.trim().length < 2) return [];
    const cacheKey = `search_${query.toLowerCase().trim()}`;
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    try {
      const res = await fetch(`https://api.anivault.co/api/search?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const json = await res.json();
      if (!json.results || !Array.isArray(json.results) || json.results.length === 0) {
        return this.searchJikanLive(query);
      }

      const results: Anime[] = json.results.map((item: any) => {
        const isMovie = item.format === 'MOVIE' || item.format === 'Movie' || item.episodes === 1;
        const epCount = isMovie ? 1 : (item.episodes || 12);
        const format: AnimeFormat = isMovie ? 'Movie' : 'TV';
        const animeId = item.id || (item.malId ? item.malId + 100000 : Math.floor(Math.random() * 90000) + 10000);
        const durStr = isMovie ? (item.duration ? `${item.duration} min` : '105 min') : '24 min';
        const cover = item.coverImage || 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png';
        const episodes = isMovie
          ? generateMovieEpisode(animeId, item.title, durStr, cover)
          : generateEpisodes(animeId, item.title, Math.min(epCount, 24), cover);

        return {
          id: animeId,
          anilistId: item.id,
          malId: item.malId,
          title: item.title,
          romajiTitle: item.title,
          synopsis: isMovie
            ? `Nonton film anime layar lebar ${item.title} sub Indo / English resolusi Full HD 1080p di DKanime.`
            : `Nonton anime ${item.title} sub Indo / English resolusi HD 1080p, audio jernih, dan subtitle lengkap di DKanime.`,
          posterImage: cover,
          coverImage: cover,
          score: 8.4,
          scoredBy: 15000,
          rank: 50,
          popularity: 50,
          format,
          status: item.status === 'RELEASING' ? 'Ongoing' : 'Completed',
          episodesCount: epCount,
          duration: durStr,
          year: new Date().getFullYear(),
          genres: ['Action', 'Adventure', 'Animation'],
          ratingBadge: '13+',
          episodes
        };
      });

      this.searchCache.set(cacheKey, results);
      return results;
    } catch {
      return this.searchJikanLive(query);
    }
  }

  // Fetch real streaming video sources for any anime episode
  async getEpisodeStream(anime: Anime, episodeNumber: number): Promise<EpisodeStreamResult | null> {
    const cacheKey = `stream_${anime.id}_${episodeNumber}`;
    if (this.streamCache.has(cacheKey)) {
      return this.streamCache.get(cacheKey)!;
    }

    try {
      let anilistId = anime.anilistId || KNOWN_ANIME_IDS[anime.id]?.anilistId;
      let malId = anime.malId || KNOWN_ANIME_IDS[anime.id]?.malId;

      // If IDs are missing, resolve them automatically via AniVault search
      if (!anilistId && !malId) {
        const cleanTitle = (anime.romajiTitle || anime.title).replace(/\([^)]*\)/g, '').trim();
        const searchRes = await fetch(`https://api.anivault.co/api/search?q=${encodeURIComponent(cleanTitle)}`);
        if (searchRes.ok) {
          const searchJson = await searchRes.json();
          if (searchJson.results && searchJson.results.length > 0) {
            anilistId = searchJson.results[0].id;
            malId = searchJson.results[0].malId;
          }
        }
      }

      if (!anilistId && !malId) {
        return null;
      }

      const queryParam = anilistId ? `anilistId=${anilistId}` : `malId=${malId}`;
      const url = `https://api.anivault.co/api/watch?${queryParam}&ep=${episodeNumber}&type=sub`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Stream fetch error: ${res.status}`);

      const data = await res.json();
      const sources: VideoSource[] = [];

      // 1. Primary HLS Proxy Stream (CORS-enabled, Master 1080p/720p/480p Adaptive)
      if (data.hlsProxyUrl) {
        sources.push({
          quality: '1080p',
          url: data.hlsProxyUrl,
          format: 'hls',
          label: `${data.server || 'Server HLS (HD)'} - 1080p Master`
        });
      }

      // 2. Direct m3u8 CDN Stream
      if (data.m3u8 && data.m3u8 !== data.hlsProxyUrl) {
        sources.push({
          quality: '720p',
          url: data.m3u8,
          format: 'hls',
          label: 'Direct CDN Stream (Fast)'
        });
      }

      // 3. Fallback direct MP4 proxy if provided
      if (data.proxyVideoUrl) {
        sources.push({
          quality: '720p',
          url: data.proxyVideoUrl,
          format: 'mp4',
          label: 'Direct MP4 Stream'
        });
      }

      const result: EpisodeStreamResult = {
        sources,
        embedUrl: data.embedUrl,
        subtitles: Array.isArray(data.subtitles)
          ? data.subtitles.map((s: any) => ({
              url: s.url,
              lang: s.lang,
              default: s.default || s.lang?.toLowerCase().includes('english')
            }))
          : [],
        server: data.server,
        availableServers: data.availableServers,
        playbackMode: data.playbackMode
      };

      this.streamCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn('Live anime stream fetch warning:', err);
      return null;
    }
  }
}

export const animeService = new AnimeService();
