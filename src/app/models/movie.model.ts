/**
 * Represents a movie object with core data from the movie database.
 *
 * This interface defines the structure for movie data throughout the application.
 * It includes all essential movie information needed for display and functionality.
 *
 * @interface Movie
 */
export interface Movie {
  /** Indicates if the movie is rated as adult content. */
  adult: boolean;

  /** Path to the backdrop image, or null if not available. */
  backdrop_path: string | null;

  /** Array of genre names associated with the movie. */
  genres: string[];

  /** Unique identifier for the movie. */
  id: number;

  /** Original language of the movie (ISO 639-1 code). */
  original_language: string;

  /** Original title of the movie in its native language. */
  original_title: string;

  /** Plot summary or description of the movie. */
  overview: string;

  /** Popularity score indicating trending status. */
  popularity: number;

  /** Path to the poster image, or null if not available. */
  poster_path: string | null;

  /** Release date in ISO format (YYYY-MM-DD). */
  release_date: string;

  /** Localized title of the movie. */
  title: string;

  /** Indicates if the movie has video content available. */
  video: boolean;

  /** Average user rating score. */
  vote_average: number;

  /** Total number of user votes/ratings. */
  vote_count: number;

  /** Optional trailer identifier for video content. */
  trailerId?: string | null;

  /** Optional URL to the movie trailer. */
  trailerUrl?: string;

  /** Optional source/provider of the trailer content. */
  trailerSource?: string;
}

/**
 * Extended movie interface that includes user's favorite status.
 *
 * This interface represents a movie object that has been enriched with
 * user-specific data, particularly the favorite status. Used throughout
 * the application when displaying movies with user interaction context.
 *
 * @interface EnrichedMovie
 * @extends Movie
 */
export interface EnrichedMovie extends Movie {
  /** Indicates whether this movie is marked as a favorite by the current user. */
  isFavorite: boolean;
}
