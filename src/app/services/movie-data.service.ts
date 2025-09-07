import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, map, of, shareReplay, switchMap } from 'rxjs';
import { EnrichedMovie, Movie } from '../models/movie.model';
import { MovieFavoritesService } from './movie-favorites.service';
import { MovieStateService } from './movie-state.service';

/**
 * Facade service that provides a unified interface for movie data operations.
 *
 * This service acts as the primary interface between components and the underlying
 * movie data services. It coordinates data from multiple sources:
 * - MovieStateService for cached movie data
 * - MovieFavoritesService for user preferences
 *
 * **Primary Use Cases:**
 * - Home page: `getHomeMovies()` - Top-rated movies with favorites
 * - Chronology page: `getMoviesByDecades()` - Movies grouped by decades
 * - Favorites page: `getFavoriteMovies()` - User's favorite movies
 * - Trailer preview: `getMovieById()` - Individual movie lookup
 * - Movie cards: `toggleMovieFavorite()`, `isMovieFavorite()` - Favorite management
 *
 * Key responsibilities:
 * - Enriching movie data with user's favorite status
 * - Providing high-level operations for common use cases
 * - Abstracting the complexity of coordinating multiple services
 * - Maintaining consistent data shapes across the application
 *
 * All movies returned from this service are EnrichedMovie objects that include
 * the user's favorite status, making them ready for direct use in components.
 */
@Injectable({
  providedIn: 'root',
})
export class MovieDataService {
  /** Core movie data and caching service. */
  private readonly movieStateService = inject(MovieStateService);

  /** User favorites management service. */
  private readonly favoritesService = inject(MovieFavoritesService);

  /** Observable indicating if movie data operations are in progress. */
  public readonly loading$ = this.movieStateService.loading$;

  /** Observable containing error messages from movie data operations. */
  public readonly error$ = this.movieStateService.error$;

  /** Observable indicating if favorite operations are in progress. */
  public readonly favoritesLoading$ = this.favoritesService.loading$;

  /** Observable containing error messages from favorite operations. */
  public readonly favoritesError$ = this.favoritesService.error$;

  /**
   * Retrieves movies for the home page with favorite status enrichment.
   *
   * Returns the top 20 highest-rated movies with each movie's favorite status
   * included for immediate use in the UI.
   *
   * @returns Observable emitting an array of enriched movies for the home page.
   */
  public getHomeMovies(): Observable<EnrichedMovie[]> {
    return this.getEnrichedMovies('top-rated', 20);
  }

  /**
   * Retrieves all movies marked as favorites by the user.
   *
   * Returns complete movie data for all favorited movies. All returned movies
   * will have isFavorite set to true by definition.
   *
   * @returns Observable emitting an array of the user's favorite movies.
   *
   */
  public getFavoriteMovies(): Observable<EnrichedMovie[]> {
    return this.favoritesService.getFavorites().pipe(
      switchMap(favoriteIds => {
        if (favoriteIds.length === 0) {
          return of([]);
        }

        // Get all movies and filter by favorite IDs
        return this.movieStateService.getMovies('top-rated', 1000).pipe(
          map(allMovies => {
            const favoriteMovies = allMovies.filter(movie => favoriteIds.includes(movie.id));

            // Enrich with favorite status (will always be true for this list)
            return favoriteMovies.map(movie => ({
              ...movie,
              isFavorite: true,
            }));
          })
        );
      }),
      shareReplay(1)
    );
  }

  /**
   * Toggles a movie's favorite status for the current user.
   *
   * Adds the movie to favorites if not currently favorited,
   * or removes it from favorites if currently favorited.
   *
   * @param movieId - Unique identifier of the movie to toggle.
   */
  public toggleMovieFavorite(movieId: number): void {
    this.favoritesService.toggleFavorite(movieId);
  }

  /**
   * Checks if a specific movie is marked as a favorite.
   *
   * @param movieId - Unique identifier of the movie to check.
   * @returns Observable emitting true if the movie is favorited, false otherwise.
   *
   */
  public isMovieFavorite(movieId: number): Observable<boolean> {
    return this.favoritesService.isFavorite(movieId);
  }

  /**
   * Retrieves a specific movie by ID with favorite status enrichment.
   *
   * Combines movie data from the state service with favorite status
   * to provide a complete enriched movie object.
   *
   * @param movieId - Unique identifier of the movie to retrieve.
   * @returns Observable emitting the enriched movie if found, or undefined if not found.
   *
   */
  public getMovieById(movieId: number): Observable<EnrichedMovie | undefined> {
    return combineLatest([
      this.movieStateService.getMovieById(movieId),
      this.favoritesService.isFavorite(movieId),
    ]).pipe(
      map(([movie, isFavorite]) => {
        if (!movie) {
          return undefined;
        }
        return {
          ...movie,
          isFavorite,
        };
      })
    );
  }

  /**
   * Retrieves all movies organized by decades with favorite status enrichment.
   *
   * Returns a comprehensive collection of movies grouped by their release decades,
   * with each movie enriched with favorite status. Movies within each decade
   * are sorted chronologically.
   *
   * @returns Observable emitting an object with decade keys and enriched movie arrays as values.
   *
   */
  public getMoviesByDecades(): Observable<{ [decade: string]: EnrichedMovie[] }> {
    return this.movieStateService.getMovies('top-rated', 1000).pipe(
      switchMap(movies => this.enrichMoviesWithFavoriteStatus(movies)),
      map(enrichedMovies => {
        const groupedByDecade: { [decade: string]: EnrichedMovie[] } = {};

        enrichedMovies.forEach(movie => {
          const decade = movie.release_date.substring(0, 3) + '0s';
          if (!groupedByDecade[decade]) {
            groupedByDecade[decade] = [];
          }
          groupedByDecade[decade].push(movie);
        });

        // Sort movies within each decade by release date
        Object.keys(groupedByDecade).forEach(decade => {
          groupedByDecade[decade].sort(
            (a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
          );
        });

        return groupedByDecade;
      }),
      shareReplay(1)
    );
  }

  /**
   * Internal method to fetch movies and enrich them with favorite status.
   *
   * @param type - Type of movie collection to fetch.
   * @param limit - Maximum number of movies to fetch.
   * @returns Observable emitting an array of enriched movies.
   * @private
   */
  private getEnrichedMovies(type: 'top-rated' | 'chronological' | 'all', limit: number): Observable<EnrichedMovie[]> {
    return this.movieStateService.getMovies(type, limit).pipe(
      switchMap(movies => this.enrichMoviesWithFavoriteStatus(movies)),
      shareReplay(1)
    );
  }

  /**
   * Transforms an array of basic Movie objects into EnrichedMovie objects with favorite status.
   *
   * @param movies - Array of basic movie objects to enrich.
   * @returns Observable emitting an array of enriched movies with favorite status included.
   * @private
   */
  private enrichMoviesWithFavoriteStatus(movies: Movie[]): Observable<EnrichedMovie[]> {
    if (movies.length === 0) {
      return of([]);
    }

    return this.favoritesService.favoriteIds$.pipe(
      map(favoriteIds => {
        return movies.map(movie => ({
          ...movie,
          isFavorite: favoriteIds.has(movie.id.toString()),
        }));
      })
    );
  }
}
