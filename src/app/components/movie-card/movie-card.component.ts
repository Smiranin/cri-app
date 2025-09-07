import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { first } from 'rxjs';
import { EnrichedMovie, Movie } from '../../models/movie.model';
import { JoinPipe } from '../../pipes/join.pipe';
import { PosterSrcPipe } from '../../pipes/poster-src.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { MovieDataService } from '../../services/movie-data.service';

/**
 * A reusable card component for displaying movie information with interactive features.
 *
 * This component presents movie details in a card format including:
 * - Poster image with trailer overlay button
 * - Title, year, rating, and genre information
 * - Expandable plot description with show more/less functionality
 * - Favorite toggle with heart icon
 * - Responsive design for mobile and desktop
 */
@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterLink, PosterSrcPipe, TruncatePipe, JoinPipe],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
})
export class MovieCardComponent implements OnInit {
  /**
   * The movie data to display in the card.
   * Can be either a basic Movie or an EnrichedMovie with favorite status.
   */
  @Input({ required: true }) movie!: Movie | EnrichedMovie;

  /** Service for managing movie data and favorite operations. */
  private readonly movieDataService = inject(MovieDataService);

  /** Indicates whether this movie is marked as a favorite by the user. */
  protected isFavorite!: boolean;

  /** Controls whether the full description is shown or truncated. */
  protected isExpanded = false;

  /** Maximum number of characters to show in the description before truncating. */
  protected readonly maxDescriptionLength = 120;

  /**
   * Component initialization lifecycle hook.
   *
   * Determines the favorite status of the movie. If the movie is already enriched
   * with favorite data, uses that. Otherwise, fetches the favorite status from
   * the MovieDataService.
   */
  public ngOnInit(): void {
    // If the movie is already enriched, use its favorite status, otherwise fetch it
    if (this.isEnrichedMovie(this.movie)) {
      this.isFavorite = this.movie.isFavorite;
    } else {
      this.movieDataService
        .isMovieFavorite(this.movie.id)
        .pipe(first())
        .subscribe(isFavorite => {
          this.isFavorite = isFavorite;
        });
    }
  }

  /**
   * Toggles the favorite status of the current movie.
   *
   * This method updates both the local state and persists the change
   * through the MovieDataService.
   */
  protected toggleFavorite(): void {
    this.movieDataService.toggleMovieFavorite(this.movie.id);
    this.isFavorite = !this.isFavorite;
  }

  /**
   * Toggles between showing the full description and the truncated version.
   */
  protected toggleDescription(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Determines whether to show the "show more/less" toggle button.
   *
   * @returns True if the movie overview exists and exceeds the maximum length,
   *          false otherwise.
   */
  protected shouldShowToggle(): boolean {
    return Boolean(this.movie.overview && this.movie.overview.length > this.maxDescriptionLength);
  }

  /**
   * Type guard to determine if a movie object is an EnrichedMovie.
   *
   * @param movie - The movie object to check
   * @returns True if the movie has the isFavorite property (is EnrichedMovie),
   *          false if it's a basic Movie object.
   */
  private isEnrichedMovie(movie: Movie | EnrichedMovie): movie is EnrichedMovie {
    return 'isFavorite' in movie;
  }
}
