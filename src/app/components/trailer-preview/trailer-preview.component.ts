import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { Movie } from '../../../types/movie.interface';

@Component({
  selector: 'app-trailer-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trailer-preview.component.html',
  styleUrls: ['./trailer-preview.component.scss'],
})
export class TrailerPreviewComponent implements OnInit, OnDestroy {
  @Input() trailerId?: string;
  @Output() trailerClosed = new EventEmitter<void>();

  protected movie?: Movie;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);

  ngOnInit() {
    // Get trailer ID from route params
    this.route.params.subscribe(params => {
      const trailerId = params['trailerId'] || this.trailerId;
      if (trailerId) {
        this.movie = this.movieService.getMovieByTrailerIdSync(trailerId);
      }
    });

    // Add escape key listener
    document.addEventListener('keydown', this.handleEscKey);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleEscKey);
  }

  private handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.closeTrailer();
    }
  };

  protected getYouTubeEmbedUrl(): string {
    if (!this.movie?.id) {
      return '';
    }
    return `https://www.youtube.com/embed/${this.movie.id}?autoplay=1&rel=0`;
  }

  protected closeTrailer(): void {
    this.trailerClosed.emit();
    // Navigate back if we're in a route
    if (this.route.snapshot.url.length > 0) {
      this.router.navigate(['/']);
    }
  }
}
