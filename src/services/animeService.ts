import type { Anime } from '../types/anime';
import { INITIAL_ANIMES, generateEpisodes } from './animeData';

export interface AnimeFilterOptions {
  query?: string;
  genre?: string;
  minScore?: number;
  maxScore?: number;
  letter?: string; // 'A'..'Z' or '#'
  status?: string;
  sortBy?: 'popularity' | 'score' | 'title' | 'year' | 'latest';
}

class AnimeService {
  private animes: Anime[] = INITIAL_ANIMES;
  private jikanCache: Map<string, any> = new Map();

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

  // Get anime by ID
  getById(id: number): Anime | undefined {
    return this.animes.find((a) => a.id === id);
  }

  // Filter & Search animes
  filter(options: AnimeFilterOptions = {}): Anime[] {
    let result = [...this.animes];

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
        const episodesCount = item.episodes || 12;
        return {
          id: item.mal_id + 100000, // Offset to avoid collisions
          title: item.title,
          japaneseTitle: item.title_japanese,
          romajiTitle: item.title_synonyms?.[0] || item.title,
          synopsis: item.synopsis || 'Tidak ada deskripsi tersedia.',
          posterImage:
            item.images?.webp?.large_image_url ||
            item.images?.jpg?.large_image_url ||
            'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=85',
          coverImage:
            item.images?.webp?.large_image_url ||
            'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=85',
          score: item.score || 7.5,
          scoredBy: item.scored_by || 10000,
          rank: item.rank || 100,
          popularity: item.popularity || 100,
          status: item.status === 'Currently Airing' ? 'Ongoing' : 'Completed',
          episodesCount,
          duration: item.duration || '24 min',
          season: item.season || 'Unknown',
          year: item.year || new Date().getFullYear(),
          genres: item.genres?.map((g: any) => g.name) || ['Action'],
          studios: item.studios?.map((s: any) => s.name) || ['Unknown'],
          trailerUrl: item.trailer?.embed_url,
          ratingBadge: item.rating?.includes('17+') ? '17+' : '13+',
          episodes: generateEpisodes(item.mal_id + 100000, item.title, Math.min(episodesCount, 24))
        };
      });

      this.jikanCache.set(cacheKey, fetchedAnimes);
      return fetchedAnimes;
    } catch {
      // On failure, filter local
      return this.filter({ query });
    }
  }
}

export const animeService = new AnimeService();
