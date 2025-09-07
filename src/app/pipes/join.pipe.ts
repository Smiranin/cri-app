import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to join an array of values into a readable string.
 *
 * This pipe transforms arrays into human-readable strings with customizable separators.
 * It handles null/undefined values gracefully and works with any array type.
 * Commonly used for displaying lists like movie genres, cast members, or tags.
 *
 * @example
 * ```html
 * <!-- Basic usage with default comma separator -->
 * {{ movieGenres | join }}
 * <!-- Output: "Action, Comedy, Drama" -->
 *
 * <!-- Custom separator -->
 * {{ tags | join:' • ' }}
 * <!-- Output: "tag1 • tag2 • tag3" -->
 *
 * <!-- Pipe chaining -->
 * {{ actors | slice:0:3 | join:', ' }}
 * <!-- Output: "Actor 1, Actor 2, Actor 3" -->
 * ```
 */
@Pipe({
  name: 'join',
  standalone: true,
})
export class JoinPipe implements PipeTransform {
  /**
   * Transforms an array into a joined string with the specified separator.
   *
   * @param value - Array of any type to be joined. Can be null or undefined.
   * @param separator - String to use as separator between array elements.
   *                   Defaults to ', ' (comma with space).
   * @returns Formatted string of joined values, or empty string if input is
   *          null, undefined, not an array, or empty array.
   */
  public transform(value: unknown[] | null | undefined, separator: string = ', '): string {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return '';
    }

    return value.join(separator);
  }
}
