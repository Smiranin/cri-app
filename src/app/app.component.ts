import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

/**
 * Root component of the Movie Database application.
 *
 * This component serves as the main entry point and layout container for the entire application.
 * It provides the navigation structure and router outlet for displaying different pages.
 */
@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /**
   * The title of the application displayed in the header.
   * This is a readonly property that cannot be modified after initialization.
   */
  protected readonly title = 'Movie Database';
  protected readonly themeService = inject(ThemeService);

  /**
   * Toggle the application theme between light and dark mode
   */
  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
