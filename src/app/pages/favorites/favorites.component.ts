import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { EnrichedMovie } from '../../models/movie.model';
import { MovieDataService } from '../../services/movie-data.service';

/**
 * Favorites page component displaying user's personal favorite movies collection.
 *
 * This component shows all movies that the user has marked as favorites,
 * providing a dedicated view for managing their personal movie collection.
 * Features an informative empty state when no favorites exist, encouraging
 * users to start building their collection.
 *
 */
@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  /** Service for fetching movie data and managing favorites. */
  private readonly movieDataService = inject(MovieDataService);

  /**
   * Array of user's favorite movies.
   * Null indicates data hasn't been loaded yet, empty array means no favorites.
   */
  protected favoriteMovies: EnrichedMovie[] | null = null;

  /** Observable indicating if favorite movies are currently being loaded. */
  protected readonly loading$: Observable<boolean> = this.movieDataService.loading$;

  /** Observable containing any error messages from data loading operations. */
  protected readonly error$: Observable<string | null> = this.movieDataService.error$;

  /**
   * Component initialization lifecycle hook.
   *
   * Loads the user's favorite movies from the data service.
   * The movies are already enriched with favorite status (always true for this list).
   */
  public ngOnInit(): void {
    this.movieDataService.getFavoriteMovies().subscribe(favoriteMovies => {
      this.favoriteMovies = favoriteMovies;
    });
  }
}
