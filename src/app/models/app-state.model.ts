import { Movie } from './movie.model';

/**
 * State interface for user's favorite movies and related operations.
 *
 * Manages the user's favorite movie IDs with loading and error states
 * for favorite-related operations.
 *
 * @interface FavoritesState
 */
export interface FavoritesState {
  /** Set of movie IDs that are marked as favorites (stored as strings for consistency). */
  favoriteIds: Set<string>;

  /** Indicates if favorite operations are currently in progress. */
  loading: boolean;

  /** Current error message for favorite operations, or null if no error. */
  error: string | null;
}

/**
 * Type alias for organizing movies by their release decades.
 *
 * Maps decade strings (e.g., '1990s', '2000s') to arrays of movies
 * from those decades. Used for chronological movie displays in the
 * ChronologyComponent.
 *
 * @example
 * ```typescript
 * const moviesByDecade: MoviesByDecade = {
 *   '1990s': [movie1, movie2],
 *   '2000s': [movie3, movie4],
 *   '2010s': [movie5, movie6]
 * };
 * ```
 */
export type MoviesByDecade = Record<string, Movie[]>;
