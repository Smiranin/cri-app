import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieService } from '../../../services/movie.service';
import { Movie } from '../../../types/movie.interface';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent {
  private movieService = inject(MovieService);

  protected favoriteMovies$: Observable<Movie[]> = this.movieService.favoriteMovies$;
  protected loading$: Observable<boolean> = this.movieService.loading$;
  protected error$: Observable<string | null> = this.movieService.error$;
}
