import { Pipe, PipeTransform } from '@angular/core';

/**
 * Union type representing the available TMDB poster image sizes.
 *
 * @see {@link https://developer.themoviedb.org/docs/image-basics} TMDB Image Documentation
 */
export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';

/**
 * Pipe for generating TMDB poster image URLs with proper sizing.
 *
 * This pipe transforms movie poster paths into complete TMDB image URLs
 * with the specified size. It handles missing poster paths gracefully
 * by providing fallback images and validates size parameters.
 *
 * @example
 * ```html
 * <!-- Basic usage with default size (w500) -->
 * <img [src]="movie.poster_path | posterSrc" [alt]="movie.title">
 *
 * <!-- Specific size for thumbnails -->
 * <img [src]="movie.poster_path | posterSrc:'w185'" [alt]="movie.title">
 *
 * <!-- High resolution for detail views -->
 * <img [src]="movie.poster_path | posterSrc:'original'" [alt]="movie.title">
 * ```
 */
@Pipe({
  name: 'posterSrc',
  standalone: true,
})
export class PosterSrcPipe implements PipeTransform {
  /** Base URL for TMDB image service. */
  private readonly baseImageUrl = 'https://image.tmdb.org/t/p/';

  /** Array of valid TMDB image sizes for validation. */
  private readonly validSizes: PosterSize[] = ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'];

  /**
   * Transforms a TMDB poster path into a complete image URL.
   *
   * @param posterPath - The poster path from TMDB API (e.g., '/abc123.jpg').
   *                    Can be null if no poster is available.
   * @param size - The desired image size. Must be one of the valid TMDB sizes.
   *              Defaults to 'w500' which provides good quality for most use cases.
   * @returns Complete URL to the poster image, or fallback placeholder if no path provided.
   *
   */
  public transform(posterPath: string | null, size: PosterSize = 'w500'): string {
    // Return fallback image if no poster path
    if (!posterPath) {
      return 'assets/no-poster-placeholder.svg';
    }

    // Validate size parameter
    if (!this.validSizes.includes(size)) {
      console.warn(`Invalid poster size "${size}". Using default "w500". Valid sizes:`, this.validSizes);
      size = 'w500';
    }

    return `${this.baseImageUrl}${size}${posterPath}`;
  }
}
