import { Movie } from './movie.interface';

export interface AppState {
  movies: MoviesState;
  favorites: FavoritesState;
  ui: UIState;
}

export interface MoviesState {
  allMovies: Movie[];
  loading: boolean;
  error: string | null;
}

export interface FavoritesState {
  favoriteIds: Set<string>;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  searchQuery: string;
  selectedMovieId: string | null;
}

export type MoviesByDecade = Record<string, Movie[]>;
