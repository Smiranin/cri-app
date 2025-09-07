import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, computed, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { EnrichedMovie } from '../../models/movie.model';
import { JoinPipe } from '../../pipes/join.pipe';
import { MovieDataService } from '../../services/movie-data.service';

/**
 * Component for displaying movie trailer previews in a modal-like overlay.
 *
 * This component handles loading and displaying YouTube video trailers for movies with:
 * - Full-screen modal overlay with click-to-close functionality
 * - YouTube URL conversion from various formats to embeddable URLs
 * - Loading states and error handling for failed video loads
 * - Keyboard navigation (Escape key to close)
 * - Movie information display (title, year, plot, rating, genres)
 * - Fallback link for external video access
 *
 * **Route Integration:**
 * - Uses route parameter `trailerId` to load specific movie
 * - Navigates back to home on close
 */
@Component({
  selector: 'app-trailer-preview',
  standalone: true,
  imports: [CommonModule, JoinPipe],
  templateUrl: './trailer-preview.component.html',
  styleUrls: ['./trailer-preview.component.scss'],
})
export class TrailerPreviewComponent implements OnInit {
  /** Signal input containing the trailer ID from route parameters. */
  protected readonly trailerId = input<string>('');

  /** The movie data associated with the trailer being displayed. */
  protected movieData?: EnrichedMovie;

  /** Flag indicating if there was an error loading the video. */
  protected hasVideoError = false;

  /** Flag indicating if the video is currently loading. */
  protected isVideoLoading = true;

  /** Router service for navigation. */
  private readonly router = inject(Router);

  /** Service for fetching movie data. */
  private readonly movieDataService = inject(MovieDataService);

  /** DestroyRef for automatic subscription cleanup. */
  private readonly destroyRef = inject(DestroyRef);

  /** DOM Sanitizer for safely handling URLs. */
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Computed signal that generates a sanitized embed URL for the video player.
   *
   * Converts the trailer URL to an embeddable format and sanitizes it for use
   * in an iframe. Returns null if no valid URL can be generated.
   *
   * @returns A sanitized resource URL or null if unavailable.
   */
  protected readonly embedUrl = computed(() => {
    const id = this.trailerId();
    if (!this.movieData?.trailerUrl || !id) {
      return null;
    }

    const url = this.convertToEmbedUrl(this.movieData.trailerUrl);
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  /**
   * Component initialization lifecycle hook.
   *
   * Loads movie data based on the trailer ID from route parameters.
   * Handles error states when the trailer ID is invalid or when
   * movie data cannot be loaded.
   */
  public ngOnInit(): void {
    // Load movie data based on trailer ID from route params
    const trailerId = this.trailerId();
    if (trailerId) {
      // Convert trailer ID to movie ID and fetch movie
      const movieId = parseInt(trailerId, 10);
      if (!isNaN(movieId)) {
        this.movieDataService
          .getMovieById(movieId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: movie => {
              this.movieData = movie;
              this.isVideoLoading = false;
            },
            error: error => {
              console.error('Failed to load movie data:', error);
              this.hasVideoError = true;
              this.isVideoLoading = false;
            },
          });
      } else {
        this.hasVideoError = true;
        this.isVideoLoading = false;
      }
    } else {
      this.hasVideoError = true;
      this.isVideoLoading = false;
    }
  }

  /**
   * Handles the Escape key press to close the trailer preview.
   *
   * This provides keyboard accessibility for users to exit the trailer
   * without needing to click the close button.
   */
  @HostListener('document:keydown.escape')
  protected handleEscapeKey(): void {
    this.closeTrailer();
  }

  /**
   * Handles successful video load events.
   *
   * Resets loading and error states when the video successfully loads.
   */
  protected onVideoLoad(): void {
    this.isVideoLoading = false;
    this.hasVideoError = false;
  }

  /**
   * Handles video load error events.
   *
   * Sets the error state and stops the loading indicator when
   * the video fails to load.
   */
  protected onVideoError(): void {
    this.hasVideoError = true;
    this.isVideoLoading = false;
    console.error('Failed to load video');
  }

  /**
   * Attempts to retry loading the video after an error.
   *
   * Resets the error state and shows the loading indicator
   * to give the user a chance to reload the video.
   */
  protected retryVideo(): void {
    this.hasVideoError = false;
    this.isVideoLoading = true;
  }

  /**
   * Opens the trailer video in a new browser tab.
   *
   * This provides an alternative way to view the video if the
   * embedded player is not working properly.
   */
  protected openVideoInNewTab(): void {
    const url = this.movieData?.trailerUrl || '';
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Converts various YouTube URL formats to embeddable URLs.
   *
   * Supports conversion from:
   * - Standard YouTube watch URLs (youtube.com/watch?v=...)
   * - Shortened YouTube URLs (youtu.be/...)
   * - Already embedded URLs (youtube.com/embed/...)
   *
   * @param url - The original YouTube URL to convert
   * @returns An embeddable YouTube URL with autoplay and no related videos,
   *          or an empty string if conversion fails.
   */
  private convertToEmbedUrl(url: string): string {
    try {
      // Handle different YouTube URL formats
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';
      }

      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';
      }

      // If already an embed URL, return as is
      if (url.includes('youtube.com/embed/')) {
        return url;
      }

      // For other video sources, return as is
      return url;
    } catch (error) {
      console.error('Error converting URL to embed format:', error);
      return '';
    }
  }

  /**
   * Closes the trailer preview and navigates back to the home page.
   *
   * This method is called when the user wants to exit the trailer view,
   * either by clicking the close button or pressing the Escape key.
   */
  protected closeTrailer(): void {
    // Navigate back to previous route
    this.router.navigate(['/']);
  }
}
