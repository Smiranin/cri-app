import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { EnrichedMovie } from '../../models/movie.model';
import { MovieDataService } from '../../services/movie-data.service';

/**
 * Home page component displaying the top-rated movies.
 *
 * This component serves as the main landing page of the application,
 * showing a curated list of the top 20 highest-rated movies in a responsive
 * grid layout. Features loading states, error handling, and real-time
 * favorite status for each movie.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  /** Service for fetching movie data and managing state. */
  private readonly movieDataService = inject(MovieDataService);

  /** Array of top-rated movies to display on the home page. */
  protected topMovies: EnrichedMovie[] = [];

  /** Observable indicating if movie data is currently being loaded. */
  protected readonly loading$: Observable<boolean> = this.movieDataService.loading$;

  /** Observable containing any error messages from data loading operations. */
  protected readonly error$: Observable<string | null> = this.movieDataService.error$;

  /**
   * Component initialization lifecycle hook.
   *
   * Loads the top-rated movies for display on the home page.
   * The movies are fetched with their favorite status enriched.
   */
  public ngOnInit(): void {
    this.movieDataService.getHomeMovies().subscribe(movies => {
      this.topMovies = movies;
    });
  }
}
