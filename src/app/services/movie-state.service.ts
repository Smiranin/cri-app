import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, distinctUntilChanged, map, of, shareReplay, tap } from 'rxjs';
import { Movie } from '../models/movie.model';
import { MovieApiService } from './movie-api.service';

/**
 * Represents a cached movie collection with metadata.
 *
 * @interface MovieCache
 */
interface MovieCache {
  /** Array of cached movie objects. */
  movies: Movie[];
  /** Timestamp when this cache entry was last updated (milliseconds since epoch). */
  lastUpdated: number;
  /** Type of movie collection this cache represents. */
  type: 'top-rated' | 'chronological' | 'all';
}

/**
 * Internal state structure for the MovieStateService.
 *
 * @interface MovieStateServiceState
 */
interface MovieStateServiceState {
  /** Map of cache entries keyed by cache identifier strings. */
  cache: Map<string, MovieCache>;
  /** Global loading state for any movie data operations. */
  loading: boolean;
  /** Current error message, if any. */
  error: string | null;
}

/**
 * Service responsible for managing movie data state and intelligent caching.
 * The service maintains an internal cache with configurable expiration times and
 * provides reactive state through RxJS observables.
 */
@Injectable({
  providedIn: 'root',
})
export class MovieStateService {
  /** Injected movie API service for fetching data from external sources. */
  private readonly movieApiService = inject(MovieApiService);

  /** Cache duration in milliseconds (5 minutes). */
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  /** Initial state configuration for the service. */
  private readonly initialState: MovieStateServiceState = {
    cache: new Map(),
    loading: false,
    error: null,
  };

  /** Internal state subject for reactive state management. */
  private readonly state$ = new BehaviorSubject<MovieStateServiceState>(this.initialState);

  /**
   * Observable that emits the current loading state.
   * Emits true when any movie data operation is in progress.
   */
  public readonly loading$ = this.state$.asObservable().pipe(
    map(state => state.loading),
    distinctUntilChanged()
  );

  /**
   * Observable that emits the current error state.
   * Emits null when no errors are present, or an error message string.
   */
  public readonly error$ = this.state$.asObservable().pipe(
    map(state => state.error),
    distinctUntilChanged()
  );

  /**
   * Retrieves movies with intelligent caching to prevent duplicate API calls.
   *
   * This method first checks the cache for valid data matching the request.
   * If valid cached data exists, it returns immediately. Otherwise, it fetches
   * fresh data from the API, caches it, and returns the result.
   *
   * @param type - Type of movie collection to fetch. Defaults to 'top-rated'.
   * @param limit - Maximum number of movies to return. Defaults to 20.
   * @returns Observable emitting an array of movies. On errors, returns cached data if available, otherwise empty array.
   */
  public getMovies(type: 'top-rated' | 'chronological' | 'all' = 'top-rated', limit: number = 20): Observable<Movie[]> {
    const cacheKey = `${type}-${limit}`;
    const cachedData = this.getCachedMovies(cacheKey);

    // Return cached data if it's still valid
    if (cachedData && this.isCacheValid(cachedData)) {
      return of(cachedData.movies);
    }

    // Fetch fresh data if cache is invalid or doesn't exist
    this.setLoading(true);

    const apiCall$ = this.getApiCall(type, limit).pipe(
      tap(movies => {
        this.updateMovieCache(cacheKey, movies, type);
        this.setLoading(false);
        this.setError(null);
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to fetch movies');
        console.error('Error fetching movies:', error);

        // Return cached data if available, even if expired
        if (cachedData) {
          return of(cachedData.movies);
        }
        return of([]);
      }),
      shareReplay(1)
    );

    return apiCall$;
  }

  /**
   * Retrieves a specific movie by its ID, utilizing cache when possible.
   *
   * First searches through all cached movie collections for the requested movie.
   * If not found in cache, fetches directly from the API.
   *
   * @param id - Unique identifier of the movie to retrieve.
   * @returns Observable emitting the movie object if found, or undefined if not found.
   */
  public getMovieById(id: number): Observable<Movie | undefined> {
    // First check if we have the movie in any of our cached collections
    const currentState = this.state$.value;

    for (const cache of currentState.cache.values()) {
      const movie = cache.movies.find(m => m.id === id);
      if (movie) {
        return of(movie);
      }
    }

    // If not found in cache, fetch from API
    this.setLoading(true);

    return this.movieApiService.getMovieDetails(id).pipe(
      tap(() => {
        this.setLoading(false);
        this.setError(null);
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to fetch movie details');
        console.error('Error fetching movie by ID:', error);
        return of(undefined);
      })
    );
  }

  /**
   * Updates the internal movie cache with new data.
   *
   * Creates or updates a cache entry with the provided movies and metadata.
   * The cache entry includes a timestamp for expiration tracking.
   *
   * @param cacheKey - Unique identifier for this cache entry (typically includes type and limit).
   * @param movies - Array of movie objects to cache.
   * @param type - Type classification of the cached data for organizational purposes.
   * @private
   */
  private updateMovieCache(cacheKey: string, movies: Movie[], type: 'top-rated' | 'chronological' | 'all'): void {
    const currentState = this.state$.value;
    const newCache = new Map(currentState.cache);

    newCache.set(cacheKey, {
      movies,
      lastUpdated: Date.now(),
      type,
    });

    this.updateState({ cache: newCache });
  }

  /**
   * Clears all cached movie data and resets the cache to empty state.
   *
   * Use this method when you need to force fresh data fetching for all subsequent requests.
   * This might be useful after significant data updates or user logout scenarios.
   */
  public clearCache(): void {
    this.updateState({ cache: new Map() });
  }

  /**
   * Searches for movies using both cached data and API fallback.
   *
   * First performs a search across all cached movie collections.
   * If sufficient results are found in cache, returns them immediately.
   * Otherwise, performs an API search for comprehensive results.
   *
   * @param query - Search query string. Empty queries return empty results.
   * @param limit - Maximum number of search results to return. Defaults to 50.
   * @returns Observable emitting an array of movies matching the search criteria.
   */
  public searchMovies(query: string, limit: number = 50): Observable<Movie[]> {
    if (!query.trim()) {
      return of([]);
    }

    // Search in cached data first
    const currentState = this.state$.value;
    const allCachedMovies: Movie[] = [];

    for (const cache of currentState.cache.values()) {
      allCachedMovies.push(...cache.movies);
    }

    // Remove duplicates based on ID
    const uniqueCachedMovies = allCachedMovies.filter(
      (movie, index, self) => self.findIndex(m => m.id === movie.id) === index
    );

    const lowerQuery = query.toLowerCase();
    const cachedResults = uniqueCachedMovies.filter(
      movie =>
        movie.title.toLowerCase().includes(lowerQuery) ||
        movie.original_title.toLowerCase().includes(lowerQuery) ||
        movie.overview.toLowerCase().includes(lowerQuery)
    );

    // If we have enough cached results, return them
    if (cachedResults.length >= limit) {
      return of(cachedResults.slice(0, limit));
    }

    // Otherwise, fetch from API
    this.setLoading(true);

    return this.movieApiService.searchMovies(query, limit).pipe(
      tap(() => {
        this.setLoading(false);
        this.setError(null);
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to search movies');
        console.error('Error searching movies:', error);
        return of(cachedResults.slice(0, limit));
      })
    );
  }

  /**
   * Retrieves cached movie data for the specified cache key.
   *
   * @param cacheKey - The unique identifier for the cache entry to retrieve.
   * @returns The cached movie data if it exists, or undefined if not found.
   * @private
   */
  private getCachedMovies(cacheKey: string): MovieCache | undefined {
    return this.state$.value.cache.get(cacheKey);
  }

  /**
   * Determines if a cache entry is still valid based on its age.
   *
   * Compares the cache entry's timestamp against the configured cache duration.
   *
   * @param cache - The cache entry to validate.
   * @returns True if the cache is still within the valid time window, false otherwise.
   * @private
   */
  private isCacheValid(cache: MovieCache): boolean {
    return Date.now() - cache.lastUpdated < this.CACHE_DURATION;
  }

  /**
   * Selects and executes the appropriate API method based on the movie type requested.
   *
   * Routes the request to the correct MovieApiService method based on the type parameter.
   *
   * @param type - The type of movie collection to fetch.
   * @param limit - Maximum number of movies to fetch.
   * @returns Observable emitting the requested movie collection from the API.
   * @private
   */
  private getApiCall(type: 'top-rated' | 'chronological' | 'all', limit: number): Observable<Movie[]> {
    switch (type) {
      case 'top-rated':
        return this.movieApiService.getTopRatedMovies(limit);
      case 'chronological':
        return this.movieApiService.getTopRatedMoviesChronological(limit);
      case 'all':
        // For 'all', we'll fetch top-rated as default
        return this.movieApiService.getTopRatedMovies(limit);
      default:
        return this.movieApiService.getTopRatedMovies(limit);
    }
  }

  /**
   * Updates the internal service state by merging new values with existing state.
   *
   * @param partialState - Partial state object containing properties to update.
   * @private
   */
  private updateState(partialState: Partial<MovieStateServiceState>): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, ...partialState });
  }

  /**
   * Updates the global loading state.
   *
   * @param loading - True to indicate loading is in progress, false otherwise.
   * @private
   */
  private setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  /**
   * Updates the global error state.
   *
   * @param error - Error message string, or null to clear the error state.
   * @private
   */
  private setError(error: string | null): void {
    this.updateState({ error });
  }
}
