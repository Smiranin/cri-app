import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';

/**
 * Service providing a unified, reactive interface for browser APIs.
 *
 * This service abstracts browser API interactions into RxJS observables,
 * providing consistent error handling and a reactive programming model
 * for client-side storage and browser feature access.
 */
@Injectable({
  providedIn: 'root',
})
export class BrowserApiService {
  /**
   * Stores a value in localStorage with automatic JSON serialization.
   *
   * The value is automatically serialized to JSON before storage.
   * Handles storage errors gracefully and provides reactive feedback.
   *
   * @param key - The storage key to use. Should be unique within your application.
   * @param value - The value to store. Can be any JSON-serializable type.
   * @returns Observable that completes successfully when stored, or emits an error if storage fails.
   */
  public setLocalStorageItem<T>(key: string, value: T): Observable<void> {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return from(Promise.resolve());
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
      return throwError(() => new Error('Failed to save to localStorage'));
    }
  }

  /**
   * Retrieves and deserializes a value from localStorage.
   *
   * Automatically parses the stored JSON value back to the specified type.
   * Returns null if the key doesn't exist or if parsing fails.
   *
   * @param key - The storage key to retrieve.
   * @returns Observable emitting the parsed value of type T, or null if not found or invalid.
   */
  public getLocalStorageItem<T>(key: string): Observable<T | null> {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return from(Promise.resolve(null));
      }
      const parsedItem = JSON.parse(item) as T;
      return from(Promise.resolve(parsedItem));
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return throwError(() => new Error('Failed to read from localStorage'));
    }
  }

  /**
   * Removes an item from localStorage
   * @param key - The key to remove
   * @returns Observable that completes when the operation is done
   */
  public removeLocalStorageItem(key: string): Observable<void> {
    try {
      localStorage.removeItem(key);
      return from(Promise.resolve());
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
      return throwError(() => new Error('Failed to remove from localStorage'));
    }
  }

  /**
   * Clears all localStorage items
   * @returns Observable that completes when the operation is done
   */
  public clearLocalStorage(): Observable<void> {
    try {
      localStorage.clear();
      return from(Promise.resolve());
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return throwError(() => new Error('Failed to clear localStorage'));
    }
  }

  /**
   * Sets an item in sessionStorage
   * @param key - The key to store the value under
   * @param value - The value to store (will be JSON stringified)
   * @returns Observable that completes when the operation is done
   */
  public setSessionStorageItem<T>(key: string, value: T): Observable<void> {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
      return from(Promise.resolve());
    } catch (error) {
      console.error('Failed to set sessionStorage item:', error);
      return throwError(() => new Error('Failed to save to sessionStorage'));
    }
  }

  /**
   * Gets an item from sessionStorage
   * @param key - The key to retrieve
   * @returns Observable with the parsed value or null if not found
   */
  public getSessionStorageItem<T>(key: string): Observable<T | null> {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return from(Promise.resolve(null));
      }
      const parsedItem = JSON.parse(item) as T;
      return from(Promise.resolve(parsedItem));
    } catch (error) {
      console.error('Failed to get sessionStorage item:', error);
      return throwError(() => new Error('Failed to read from sessionStorage'));
    }
  }

  /**
   * Removes an item from sessionStorage
   * @param key - The key to remove
   * @returns Observable that completes when the operation is done
   */
  public removeSessionStorageItem(key: string): Observable<void> {
    try {
      sessionStorage.removeItem(key);
      return from(Promise.resolve());
    } catch (error) {
      console.error('Failed to remove sessionStorage item:', error);
      return throwError(() => new Error('Failed to remove from sessionStorage'));
    }
  }

  /**
   * Clears all sessionStorage items
   * @returns Observable that completes when the operation is done
   */
  public clearSessionStorage(): Observable<void> {
    try {
      sessionStorage.clear();
      return from(Promise.resolve());
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
      return throwError(() => new Error('Failed to clear sessionStorage'));
    }
  }

  /**
   * Tests if localStorage is available and functional in the current browser.
   *
   * Performs a write/read/delete test to ensure localStorage is not only
   * present but also working (some browsers disable it in private mode).
   *
   * @returns True if localStorage is available and functional, false otherwise.
   */
  public isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if sessionStorage is available
   * @returns boolean indicating if sessionStorage is supported and available
   */
  public isSessionStorageAvailable(): boolean {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves the current window location object.
   *
   * Provides access to URL information in an observable format
   * for consistency with other service methods.
   *
   * @returns Observable emitting the current window.location object.
   */
  public getWindowLocation(): Observable<Location> {
    return from(Promise.resolve(window.location));
  }

  /**
   * Gets the current window dimensions
   * @returns Observable with width and height
   */
  public getWindowDimensions(): Observable<{ width: number; height: number }> {
    return from(
      Promise.resolve({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    );
  }

  /**
   * Gets the user agent string
   * @returns Observable with the user agent string
   */
  public getUserAgent(): Observable<string> {
    return from(Promise.resolve(navigator.userAgent));
  }
}
