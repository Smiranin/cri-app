import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { movies } from '../data/movies.data';
import { MoviesByDecade, MoviesState } from '../types/app-state.interface';
import { Movie } from '../types/movie.interface';
import { MovieFavoritesService } from './movie-favorites.service';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly initialState: MoviesState = {
    allMovies: movies,
    loading: false,
    error: null,
  };

  private readonly moviesState$ = new BehaviorSubject<MoviesState>(this.initialState);
  private favoritesService = inject(MovieFavoritesService);

  // Public state selectors
  public readonly state$ = this.moviesState$.asObservable();
  public readonly allMovies$ = this.state$.pipe(map(state => state.allMovies));
  public readonly loading$ = this.state$.pipe(map(state => state.loading));
  public readonly error$ = this.state$.pipe(map(state => state.error));

  // Derived observables
  public readonly topMovies$ = this.allMovies$.pipe(
    map(movies => movies.sort((a, b) => a.vote_average - b.vote_average))
  );

  public readonly favoriteMovies$ = combineLatest([
    this.allMovies$,
    this.favoritesService.favoriteIds$,
  ]).pipe(
    map(([movies, favoriteIds]) => movies.filter(movie => favoriteIds.has(movie.id.toString())))
  );

  public readonly moviesByDecade$ = this.allMovies$.pipe(
    map(movies => {
      const groupedByDecade: MoviesByDecade = {};

      movies.forEach(movie => {
        const decade = movie.release_date.substring(0, 3) + '0s';
        if (!groupedByDecade[decade]) {
          groupedByDecade[decade] = [];
        }
        groupedByDecade[decade].push(movie);
      });

      // Sort decades and movies within each decade
      const sortedDecades: MoviesByDecade = {};
      Object.keys(groupedByDecade)
        .sort()
        .forEach(decade => {
          sortedDecades[decade] = groupedByDecade[decade].sort(
            (a, b) => parseInt(a.release_date) - parseInt(b.release_date)
          );
        });

      return sortedDecades;
    })
  );

  // State mutation methods
  private updateState(partialState: Partial<MoviesState>): void {
    const currentState = this.moviesState$.value;
    this.moviesState$.next({ ...currentState, ...partialState });
  }

  public setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  public setError(error: string | null): void {
    this.updateState({ error });
  }

  // Utility methods that return observables
  public getMovieById(id: string): Observable<Movie | undefined> {
    return this.allMovies$.pipe(map(movies => movies.find(movie => movie.id.toString() === id)));
  }

  public getMovieByTrailerId(trailerId: string): Observable<Movie | undefined> {
    return this.allMovies$.pipe(
      map(movies => movies.find(movie => movie.id.toString() === trailerId))
    );
  }

  public searchMovies(query: string): Observable<Movie[]> {
    return this.allMovies$.pipe(
      map(movies => {
        if (!query.trim()) {
          return movies;
        }

        const lowerQuery = query.toLowerCase();
        return movies.filter(
          movie =>
            movie.title.toLowerCase().includes(lowerQuery) ||
            movie.genre_ids.some(genre => genre.toString().toLowerCase().includes(lowerQuery)) ||
            movie.original_title.toLowerCase().includes(lowerQuery)
        );
      })
    );
  }

  // Synchronous methods for components that need immediate values
  public getMovieByIdSync(id: string): Movie | undefined {
    const currentMovies = this.moviesState$.value.allMovies;
    return currentMovies.find(movie => movie.id.toString() === id);
  }

  public getMovieByTrailerIdSync(trailerId: string): Movie | undefined {
    const currentMovies = this.moviesState$.value.allMovies;
    return currentMovies.find(movie => movie.id.toString() === trailerId);
  }
}
