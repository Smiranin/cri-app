import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { MovieFavoritesService } from '../../../services/movie-favorites.service';
import { Movie } from '../../../types/movie.interface';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
})
export class MovieCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) movie!: Movie;

  private favoritesService = inject(MovieFavoritesService);
  private destroy$ = new Subject<void>();

  protected isFavorite$!: Observable<boolean>;

  ngOnInit(): void {
    this.isFavorite$ = this.favoritesService.isFavorite(this.movie.id.toString());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected toggleFavorite(): void {
    this.favoritesService.toggleFavorite(this.movie.id.toString());
  }
}
