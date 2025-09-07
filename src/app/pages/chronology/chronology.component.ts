import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { EnrichedMovie } from '../../models/movie.model';
import { MovieDataService } from '../../services/movie-data.service';

/**
 * Chronology page component displaying movies organized by decade in a timeline format.
 *
 * This component presents a visually appealing timeline view of movies grouped by their
 * release decades (1990s, 2000s, etc.) with a left-border timeline design. Movies within
 * each decade are sorted chronologically from oldest to newest, providing a historical
 * perspective on cinema.
 */
@Component({
  selector: 'app-chronology',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './chronology.component.html',
  styleUrls: ['./chronology.component.scss'],
})
export class ChronologyComponent implements OnInit {
  /** Service for fetching movie data and managing state. */
  private readonly movieDataService = inject(MovieDataService);

  /** Movies organized by decade (e.g., '1990s', '2000s'). */
  protected moviesByDecade!: { [decade: string]: EnrichedMovie[] };

  /** Observable indicating if movie data is currently being loaded. */
  protected readonly loading$: Observable<boolean> = this.movieDataService.loading$;

  /** Observable containing any error messages from data loading operations. */
  protected readonly error$: Observable<string | null> = this.movieDataService.error$;

  /**
   * Component initialization lifecycle hook.
   *
   * Loads movies grouped by decades for the chronological timeline view.
   * Movies within each decade are sorted by release date.
   */
  public ngOnInit(): void {
    this.movieDataService.getMoviesByDecades().subscribe(moviesByDecade => {
      this.moviesByDecade = moviesByDecade;
    });
  }

  /**
   * Extracts and sorts decade keys for display order.
   *
   * @param moviesByDecade - Object containing movies grouped by decade
   * @returns Array of decade strings sorted in reverse chronological order
   *          (newest decades first)
   */
  protected getDecades(moviesByDecade: { [decade: string]: EnrichedMovie[] }): string[] {
    return Object.keys(moviesByDecade).sort().reverse();
  }
}
