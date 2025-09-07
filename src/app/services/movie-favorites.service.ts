import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, distinctUntilChanged, map, Observable, of, tap } from 'rxjs';
import { FavoritesState } from '../models/app-state.model';
import { BrowserApiService } from './browser-api.service';

/**
 * Service responsible for managing user's favorite movies with persistent storage.
 *
 * This service provides a reactive interface for managing user's movie favorites
 * with automatic persistence to localStorage. It maintains state through RxJS
 * subjects and provides both asynchronous and synchronous access patterns.
 *
 * Key features:
 * - Reactive state management with RxJS observables
 * - Automatic persistence to localStorage
 * - Synchronous and asynchronous favorite checking
 * - Error handling with graceful fallbacks
 * - Optimistic updates for responsive UI
 *
 */
@Injectable({
  providedIn: 'root',
})
export class MovieFavoritesService {
  /** Browser API service for localStorage operations. */
  private readonly browserApiService = inject(BrowserApiService);

  /** Key used for storing favorites in localStorage. */
  private readonly STORAGE_KEY = 'movie-favorites';

  /** Initial state configuration for the favorites service. */
  private readonly initialState: FavoritesState = {
    favoriteIds: new Set<string>(),
    loading: false,
    error: null,
  };

  /** Internal state subject for reactive state management. */
  private readonly favoritesState$ = new BehaviorSubject<FavoritesState>(this.initialState);

  /** Observable exposing the complete favorites state. */
  public readonly state$ = this.favoritesState$.asObservable();

  /** Observable emitting the set of favorite movie IDs. */
  public readonly favoriteIds$ = this.state$.pipe(map(state => state.favoriteIds));

  /** Observable emitting favorite IDs as an array of strings. */
  public readonly favorites$ = this.favoriteIds$.pipe(map(favoriteIds => Array.from(favoriteIds)));

  /** Observable indicating if favorite operations are in progress. */
  public readonly loading$ = this.state$.pipe(
    map(state => state.loading),
    distinctUntilChanged()
  );

  /** Observable containing error messages from favorite operations. */
  public readonly error$ = this.state$.pipe(
    map(state => state.error),
    distinctUntilChanged()
  );

  /**
   * Initializes the service and loads existing favorites from storage.
   */
  public constructor() {
    this.loadFavorites();
  }

  /**
   * Updates the internal service state by merging new values with existing state.
   *
   * @param partialState - Partial state object containing properties to update.
   * @private
   */
  private updateState(partialState: Partial<FavoritesState>): void {
    const currentState = this.favoritesState$.value;
    this.favoritesState$.next({ ...currentState, ...partialState });
  }

  /**
   * Checks if a movie is marked as favorite (reactive).
   *
   * Returns an observable that emits the current favorite status and
   * will emit again whenever the favorite status changes.
   *
   * @param movieId - Unique identifier of the movie to check.
   * @returns Observable emitting true if the movie is favorited, false otherwise.
   *
   */
  public isFavorite(movieId: number): Observable<boolean> {
    return this.favoriteIds$.pipe(map(favoriteIds => favoriteIds.has(movieId.toString())));
  }

  /**
   * Synchronously checks if a movie is marked as favorite.
   *
   * Provides immediate access to favorite status without subscribing to observables.
   * Useful for conditional logic and immediate UI updates.
   *
   * @param movieId - Unique identifier of the movie to check.
   * @returns True if the movie is currently favorited, false otherwise.
   *
   */
  public isFavoriteSync(movieId: number): boolean {
    return this.favoritesState$.value.favoriteIds.has(movieId.toString());
  }

  /**
   * Retrieves all favorite movie IDs as an array of numbers.
   *
   * Converts the internal string-based storage format to numeric IDs
   * for easier consumption by other services and components.
   *
   * @returns Observable emitting an array of favorite movie IDs as numbers.
   *
   */
  public getFavorites(): Observable<number[]> {
    return this.favorites$.pipe(map(favoriteStrings => favoriteStrings.map(id => parseInt(id, 10))));
  }

  /**
   * Toggles the favorite status of a movie with automatic persistence.
   *
   * Adds the movie to favorites if not currently favorited, or removes it
   * if currently favorited. Changes are immediately persisted to localStorage.
   *
   * @param movieId - Unique identifier of the movie to toggle.
   *
   */
  public toggleFavorite(movieId: number): void {
    if (this.isFavoriteSync(movieId)) {
      this.removeFavorite(movieId);
    } else {
      this.addFavorite(movieId);
    }
  }

  /**
   * Adds a movie to the favorites collection if not already present.
   *
   * @param movieId - Unique identifier of the movie to add.
   * @private
   */
  private addFavorite(movieId: number): void {
    const movieIdString = movieId.toString();
    const currentState = this.favoritesState$.value;

    if (!currentState.favoriteIds.has(movieIdString)) {
      const newSet = new Set(currentState.favoriteIds);
      newSet.add(movieIdString);
      this.updateState({ favoriteIds: newSet });
      this.saveFavorites();
    }
  }

  /**
   * Removes a movie from the favorites collection if currently present.
   *
   * @param movieId - Unique identifier of the movie to remove.
   * @private
   */
  private removeFavorite(movieId: number): void {
    const movieIdString = movieId.toString();
    const currentState = this.favoritesState$.value;

    if (currentState.favoriteIds.has(movieIdString)) {
      const newSet = new Set(currentState.favoriteIds);
      newSet.delete(movieIdString);
      this.updateState({ favoriteIds: newSet });
      this.saveFavorites();
    }
  }

  /**
   * Updates the loading state for favorite operations.
   *
   * @param loading - True to indicate loading is in progress, false otherwise.
   */
  public setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  /**
   * Updates the error state for favorite operations.
   *
   * @param error - Error message string, or null to clear the error state.
   */
  public setError(error: string | null): void {
    this.updateState({ error });
  }

  /**
   * Loads favorite movie IDs from localStorage on service initialization.
   *
   * Handles errors gracefully and sets appropriate loading/error states.
   * Called automatically during service construction.
   *
   * @private
   */
  private loadFavorites(): void {
    this.setLoading(true);

    this.browserApiService
      .getLocalStorageItem<string[]>(this.STORAGE_KEY)
      .pipe(
        tap(favoriteArray => {
          if (favoriteArray) {
            this.updateState({
              favoriteIds: new Set(favoriteArray),
              loading: false,
              error: null,
            });
          } else {
            this.setLoading(false);
          }
        }),
        catchError(error => {
          console.warn('Failed to load favorites from localStorage:', error);
          this.updateState({
            loading: false,
            error: 'Failed to load favorites',
          });
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Persists current favorite movie IDs to localStorage.
   *
   * Called automatically whenever favorites are modified.
   * Handles storage errors gracefully with appropriate error states.
   *
   * @private
   */
  private saveFavorites(): void {
    const favoriteArray = Array.from(this.favoritesState$.value.favoriteIds);

    this.browserApiService
      .setLocalStorageItem(this.STORAGE_KEY, favoriteArray)
      .pipe(
        catchError(error => {
          console.warn('Failed to save favorites to localStorage:', error);
          this.setError('Failed to save favorites');
          return of(void 0);
        })
      )
      .subscribe();
  }
}
