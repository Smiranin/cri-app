import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe for truncating long text strings with customizable length and suffix.
 *
 * This pipe is useful for displaying previews of long content like movie descriptions,
 * comments, or any text that needs to fit within limited space. It provides options
 * for custom truncation length, suffix, and can be forced to show full text.
 *
 * @example
 * ```html
 * <!-- Basic usage with default settings (120 chars, '...' suffix) -->
 * <p>{{ movie.overview | truncate }}</p>
 *
 * <!-- Custom length and suffix -->
 * <p>{{ description | truncate:50:' [more]' }}</p>
 *
 * <!-- Conditional expansion -->
 * <p>{{ text | truncate:100:'...':isExpanded }}</p>
 *
 * <!-- In loops with different lengths -->
 * <div *ngFor="let item of items">
 *   <p>{{ item.content | truncate:80 }}</p>
 * </div>
 * ```
 */
@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  /**
   * Truncates a string to the specified length and adds a suffix if needed.
   *
   * @param value - The string to potentially truncate. If null/undefined, returns empty string.
   * @param maxLength - Maximum number of characters to display before truncation.
   *                   Defaults to 120 characters.
   * @param suffix - String to append when text is truncated. Defaults to '...'.
   * @param forceExpanded - If true, always returns the full text regardless of length.
   *                       Useful for toggle functionality.
   * @returns The original string if shorter than maxLength or forceExpanded is true,
   *          otherwise the truncated string with suffix appended.
   *
   */
  public transform(value: string, maxLength: number = 120, suffix: string = '...', forceExpanded?: boolean): string {
    if (!value) {
      return '';
    }

    // If forceExpanded is true or text is shorter than maxLength, return full text
    if (forceExpanded || value.length <= maxLength) {
      return value;
    }

    // Truncate and add suffix
    return value.substring(0, maxLength) + suffix;
  }
}
