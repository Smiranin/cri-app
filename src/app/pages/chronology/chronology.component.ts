import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieService } from '../../../services/movie.service';
import { MoviesByDecade } from '../../../types/app-state.interface';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';

@Component({
  selector: 'app-chronology',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './chronology.component.html',
  styleUrls: ['./chronology.component.scss'],
})
export class ChronologyComponent {
  private movieService = inject(MovieService);

  protected moviesByDecade$: Observable<MoviesByDecade> = this.movieService.moviesByDecade$;
  protected loading$: Observable<boolean> = this.movieService.loading$;
  protected error$: Observable<string | null> = this.movieService.error$;

  protected getDecades(moviesByDecade: MoviesByDecade): string[] {
    return Object.keys(moviesByDecade).sort().reverse();
  }
}
