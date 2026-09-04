export type VideoQuality = 'auto' | '1080p' | '720p' | '480p' | '360p';

export interface SubtitleTrack {
  url: string;
  lang: string;
  default?: boolean;
}

export interface VideoSource {
  quality: VideoQuality;
  url: string;
  format: 'mp4' | 'hls' | 'embed';
  label?: string;
}

export interface AnimeEpisode {
  id: number;
  number: number;
  title: string;
  thumbnail?: string;
  duration: string;
  synopsis?: string;
  sources: VideoSource[];
  embedUrl?: string;
  subtitles?: SubtitleTrack[];
}

export interface Anime {
  id: number;
  anilistId?: number;
  malId?: number;
  title: string;
  japaneseTitle?: string;
  romajiTitle?: string;
  synopsis: string;
  posterImage: string;
  coverImage: string;
  score: number;
  scoredBy?: number;
  rank?: number;
  popularity?: number;
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  episodesCount: number;
  duration: string;
  season?: string;
  year?: number;
  genres: string[];
  studios?: string[];
  trailerUrl?: string;
  ratingBadge?: string; // e.g., '13+', '17+'
  episodes: AnimeEpisode[];
}

export interface WatchHistoryItem {
  animeId: number;
  episodeNumber: number;
  currentTime: number; // in seconds
  duration: number; // in seconds
  progressPercentage: number;
  updatedAt: number; // timestamp
}

export interface StreamSettings {
  apiKey: string;
  apiEndpoint: string;
  preferredQuality: VideoQuality;
  autoPlay: boolean;
  autoNext: boolean;
  autoSkipIntro: boolean;
  activeServer: string;
}
