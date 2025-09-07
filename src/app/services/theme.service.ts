import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { BrowserApiService } from './browser-api.service';

/**
 * Available theme options for the application
 */
export type Theme = 'light' | 'dark';

/**
 * Theme constants for consistent usage throughout the application
 */
export const THEMES = {
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
} as const;

/**
 * Service for managing application theme (light/dark mode).
 *
 * This service provides functionality to:
 * - Toggle between light and dark themes
 * - Persist theme preference in localStorage
 * - Apply theme changes to the document root
 * - Provide reactive theme state through signals
 *
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly DARK_THEME_CLASS = 'dark-theme';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browserApi = inject(BrowserApiService);

  /**
   * Signal containing the current theme
   */
  private readonly _currentTheme = signal<Theme>(THEMES.LIGHT);

  /**
   * Readonly signal for the current theme
   */
  readonly currentTheme = this._currentTheme.asReadonly();

  /**
   * Computed signal indicating if dark mode is active
   */
  readonly isDarkMode = signal(false);

  constructor() {
    this.initializeTheme();

    // Effect to apply theme changes to DOM and update isDarkMode signal
    effect(() => {
      const theme = this._currentTheme();
      this.isDarkMode.set(theme === THEMES.DARK);
      this.applyTheme(theme);
      this.saveTheme(theme);
    });
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Try to get saved theme from localStorage
    this.browserApi.getLocalStorageItem<string>(this.THEME_KEY).subscribe({
      next: savedTheme => {
        if (savedTheme && (savedTheme === THEMES.LIGHT || savedTheme === THEMES.DARK)) {
          this._currentTheme.set(savedTheme as Theme);
          return;
        }

        // Fall back to system preference
        this.browserApi.prefersDarkColorScheme().subscribe({
          next: prefersDark => {
            this._currentTheme.set(prefersDark ? THEMES.DARK : THEMES.LIGHT);
          },
          error: () => {
            this._currentTheme.set(THEMES.LIGHT); // Default to light theme if detection fails
          },
        });
      },
      error: () => {
        // If localStorage access fails, fall back to system preference
        this.browserApi.prefersDarkColorScheme().subscribe({
          next: prefersDark => {
            this._currentTheme.set(prefersDark ? THEMES.DARK : THEMES.LIGHT);
          },
          error: () => {
            this._currentTheme.set(THEMES.LIGHT); // Default to light theme if detection fails
          },
        });
      },
    });
  }

  /**
   * Apply theme class to document root
   */
  private applyTheme(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.browserApi.getDocument().subscribe({
      next: document => {
        if (document) {
          if (theme === THEMES.DARK) {
            document.documentElement.classList.add(this.DARK_THEME_CLASS);
          } else {
            document.documentElement.classList.remove(this.DARK_THEME_CLASS);
          }
        }
      },
      error: error => {
        console.warn('Failed to access document for theme application:', error);
      },
    });
  }

  /**
   * Save theme preference to localStorage
   */
  private saveTheme(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.browserApi.setLocalStorageItem(this.THEME_KEY, theme).subscribe({
      error: error => {
        console.warn('Failed to save theme preference:', error);
      },
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this._currentTheme() === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    this._currentTheme.set(newTheme);
  }

  /**
   * Set specific theme
   */
  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
  }
}
