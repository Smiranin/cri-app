import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '../models/movie.model';
import { movies } from './stubs/movies.data';

/**
 * Service responsible for external API interactions related to movies.
 *
 * This service provides a clean interface for fetching movie data from external sources.
 * Currently uses static data from stubs for development/demo purposes, but is designed
 * to be easily replaced with real API calls to services like TMDB.
 *
 * **Currently Used Methods:**
 * - `getTopRatedMovies()` - For home page and general movie fetching
 * - `getTopRatedMoviesChronological()` - For chronology page timeline
 * - `getMovieDetails()` - For individual movie lookups by ID
 * - `searchMovies()` - For movie search functionality
 *
 * All methods return Observables to maintain consistency with HTTP client patterns
 * and to support easy migration to real API endpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class MovieApiService {
  /**
   * Fetches top rated movies sorted by rating in descending order.
   *
   * @param limit - Maximum number of movies to return. Defaults to 20.
   * @returns Observable emitting an array of movies sorted by vote_average (highest first).
   */
  public getTopRatedMovies(limit: number = 20): Observable<Movie[]> {
    // Simulate API call with static data
    // In a real implementation, this would make an HTTP request
    return of(movies).pipe(
      map(movieList =>
        movieList
          .sort((a, b) => b.vote_average - a.vote_average) // Sort by rating descending
          .slice(0, limit)
      )
    );
  }

  /**
   * Fetches top rated movies sorted chronologically by release date.
   *
   * First selects the highest-rated movies, then sorts them by release date
   * from oldest to newest. Useful for timeline or historical views.
   *
   * @param limit - Maximum number of movies to return. Defaults to 20.
   * @returns Observable emitting an array of top-rated movies sorted by release date (oldest first).
   */
  public getTopRatedMoviesChronological(limit: number = 20): Observable<Movie[]> {
    // Simulate API call with static data
    // In a real implementation, this would make an HTTP request with different sorting
    return of(movies).pipe(
      map(
        movieList =>
          movieList
            .sort((a, b) => b.vote_average - a.vote_average) // First sort by rating
            .slice(0, limit) // Take top rated movies
            .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()) // Then sort chronologically
      )
    );
  }

  /**
   * Fetches detailed information for a specific movie by ID.
   *
   * @param id - The unique identifier of the movie to retrieve.
   * @returns Observable emitting the movie object if found, or undefined if not found.
   */
  public getMovieDetails(id: number): Observable<Movie | undefined> {
    // Simulate API call with static data
    // In a real implementation, this would make an HTTP request to /movies/{id}
    return of(movies).pipe(map(movieList => movieList.find(movie => movie.id === id)));
  }

  /**
   * Searches movies by title, original title, overview, or genres.
   *
   * Performs case-insensitive text matching across multiple movie fields
   * to provide comprehensive search results.
   *
   * @param query - Search query string. Empty or whitespace-only queries return empty results.
   * @param limit - Maximum number of results to return. Defaults to 50.
   * @returns Observable emitting an array of movies matching the search criteria.
   */
  public searchMovies(query: string, limit: number = 50): Observable<Movie[]> {
    if (!query.trim()) {
      return of([]);
    }

    const lowerQuery = query.toLowerCase();
    return of(movies).pipe(
      map(movieList =>
        movieList
          .filter(
            movie =>
              movie.title.toLowerCase().includes(lowerQuery) ||
              movie.original_title.toLowerCase().includes(lowerQuery) ||
              movie.overview.toLowerCase().includes(lowerQuery) ||
              movie.genres.some(genre => genre.toLowerCase().includes(lowerQuery))
          )
          .slice(0, limit)
      )
    );
  }
}
