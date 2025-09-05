import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieService } from '../../../services/movie.service';
import { Movie } from '../../../types/movie.interface';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private movieService = inject(MovieService);

  protected topMovies$: Observable<Movie[]> = this.movieService.topMovies$;
  protected loading$: Observable<boolean> = this.movieService.loading$;
  protected error$: Observable<string | null> = this.movieService.error$;
}
