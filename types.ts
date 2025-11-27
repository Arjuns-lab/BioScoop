export type ContentType = 'movie' | 'series';
export type Language = 'Telugu' | 'Tamil' | 'Hindi' | 'Kannada' | 'Malayalam' | 'English';

export interface Episode {
  id: string;
  season: number;
  episodeNumber: number;
  title: string;
  duration: string;
  videoUrl: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface Content {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  languages: Language[];
  genres: string[];
  releaseYear: number;
  posterUrl: string;
  bannerUrl: string;
  rating: number;
  trending: boolean;
  
  // Movie specific
  videoUrl?: string; // Main movie file
  duration?: string;
  
  // Series specific
  seasons?: Season[];
  
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  watchlist: string[];
  continueWatching: { contentId: string; progress: number }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}