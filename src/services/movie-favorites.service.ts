import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { FavoritesState } from '../types/app-state.interface';

@Injectable({
  providedIn: 'root',
})
export class MovieFavoritesService {
  private readonly STORAGE_KEY = 'movie-favorites';

  private readonly initialState: FavoritesState = {
    favoriteIds: new Set<string>(),
    loading: false,
    error: null,
  };

  private readonly favoritesState$ = new BehaviorSubject<FavoritesState>(this.initialState);

  // Public state selectors
  public readonly state$ = this.favoritesState$.asObservable();
  public readonly favoriteIds$ = this.state$.pipe(map(state => state.favoriteIds));
  public readonly favorites$ = this.favoriteIds$.pipe(map(favoriteIds => Array.from(favoriteIds)));
  public readonly loading$ = this.state$.pipe(map(state => state.loading));
  public readonly error$ = this.state$.pipe(map(state => state.error));

  constructor() {
    this.loadFavorites();
  }

  // State mutation methods
  private updateState(partialState: Partial<FavoritesState>): void {
    const currentState = this.favoritesState$.value;
    this.favoritesState$.next({ ...currentState, ...partialState });
  }

  public isFavorite(movieId: string): Observable<boolean> {
    return this.favoriteIds$.pipe(map(favoriteIds => favoriteIds.has(movieId)));
  }

  public isFavoriteSync(movieId: string): boolean {
    return this.favoritesState$.value.favoriteIds.has(movieId);
  }

  public addFavorite(movieId: string): void {
    const currentState = this.favoritesState$.value;
    if (!currentState.favoriteIds.has(movieId)) {
      const newSet = new Set(currentState.favoriteIds);
      newSet.add(movieId);
      this.updateState({ favoriteIds: newSet });
      this.saveFavorites();
    }
  }

  public removeFavorite(movieId: string): void {
    const currentState = this.favoritesState$.value;
    if (currentState.favoriteIds.has(movieId)) {
      const newSet = new Set(currentState.favoriteIds);
      newSet.delete(movieId);
      this.updateState({ favoriteIds: newSet });
      this.saveFavorites();
    }
  }

  public toggleFavorite(movieId: string): void {
    if (this.isFavoriteSync(movieId)) {
      this.removeFavorite(movieId);
    } else {
      this.addFavorite(movieId);
    }
  }

  public setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  public setError(error: string | null): void {
    this.updateState({ error });
  }

  private loadFavorites(): void {
    try {
      this.setLoading(true);
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const favoriteArray = JSON.parse(stored) as string[];
        this.updateState({
          favoriteIds: new Set(favoriteArray),
          loading: false,
          error: null,
        });
      } else {
        this.setLoading(false);
      }
    } catch (error) {
      console.warn('Failed to load favorites from localStorage:', error);
      this.updateState({
        loading: false,
        error: 'Failed to load favorites',
      });
    }
  }

  private saveFavorites(): void {
    try {
      const favoriteArray = Array.from(this.favoritesState$.value.favoriteIds);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favoriteArray));
    } catch (error) {
      console.warn('Failed to save favorites to localStorage:', error);
      this.setError('Failed to save favorites');
    }
  }
}
