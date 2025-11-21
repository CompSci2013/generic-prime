import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged, skip } from 'rxjs/operators';

/**
 * Domain-agnostic URL state management service
 *
 * Provides bidirectional synchronization between application state and URL query parameters.
 * The URL serves as the single source of truth for application state.
 *
 * @example
 * ```typescript
 * interface MyFilters {
 *   search: string;
 *   page: number;
 *   categories: string[];
 * }
 *
 * // Get current params
 * const filters = urlState.getParams<MyFilters>();
 *
 * // Update URL (triggers navigation)
 * urlState.setParams({ search: 'test', page: 1 });
 *
 * // Watch for changes
 * urlState.watchParams<MyFilters>().subscribe(filters => {
 *   console.log('URL changed:', filters);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class UrlStateService {
  private paramsSubject = new BehaviorSubject<Params>({});

  /**
   * Observable stream of URL query parameters
   */
  public params$: Observable<Params> = this.paramsSubject.asObservable();

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize from current URL
    this.initializeFromRoute();

    // Watch for URL changes
    this.watchRouteChanges();
  }

  /**
   * Get current URL query parameters as a typed object
   *
   * @template TParams - The shape of the parameters object
   * @returns Current query parameters
   */
  getParams<TParams = Params>(): TParams {
    return this.paramsSubject.value as TParams;
  }

  /**
   * Update URL query parameters
   *
   * Performs a shallow merge with existing parameters and navigates to the new URL.
   * Use null or undefined to remove a parameter.
   *
   * @template TParams - The shape of the parameters object
   * @param params - Partial parameters to update
   * @param replaceUrl - If true, replaces current history entry instead of pushing new one
   * @returns Promise that resolves when navigation completes
   *
   * @example
   * ```typescript
   * // Update specific params
   * await urlState.setParams({ page: 2, search: 'test' });
   *
   * // Remove a param by setting to null
   * await urlState.setParams({ search: null });
   *
   * // Replace history entry
   * await urlState.setParams({ page: 1 }, true);
   * ```
   */
  async setParams<TParams = Params>(
    params: Partial<TParams>,
    replaceUrl = false
  ): Promise<boolean> {
    const currentParams = this.paramsSubject.value;
    const mergedParams = { ...currentParams };

    // Merge new params, removing null/undefined values
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value === null || value === undefined) {
        delete mergedParams[key];
      } else {
        mergedParams[key] = value;
      }
    });

    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: mergedParams,
      replaceUrl,
      queryParamsHandling: '' // Don't preserve, use exact params
    });
  }

  /**
   * Watch URL query parameters as an observable stream
   *
   * @template TParams - The shape of the parameters object
   * @returns Observable of query parameters that emits on every URL change
   *
   * @example
   * ```typescript
   * interface Filters {
   *   search: string;
   *   page: number;
   * }
   *
   * urlState.watchParams<Filters>().subscribe(filters => {
   *   console.log('Filters changed:', filters);
   * });
   * ```
   */
  watchParams<TParams = Params>(): Observable<TParams> {
    return this.params$.pipe(
      map(params => params as TParams),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }

  /**
   * Clear all URL query parameters
   *
   * @param replaceUrl - If true, replaces current history entry
   * @returns Promise that resolves when navigation completes
   */
  async clearParams(replaceUrl = false): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl
    });
  }

  /**
   * Get a specific query parameter value
   *
   * @param key - Parameter key
   * @returns Parameter value or null if not found
   */
  getParam(key: string): any {
    return this.paramsSubject.value[key] || null;
  }

  /**
   * Set a specific query parameter
   *
   * @param key - Parameter key
   * @param value - Parameter value (null to remove)
   * @param replaceUrl - If true, replaces current history entry
   * @returns Promise that resolves when navigation completes
   */
  async setParam(
    key: string,
    value: any,
    replaceUrl = false
  ): Promise<boolean> {
    return this.setParams({ [key]: value } as any, replaceUrl);
  }

  /**
   * Check if a specific parameter exists in the URL
   *
   * @param key - Parameter key
   * @returns True if parameter exists
   */
  hasParam(key: string): boolean {
    return key in this.paramsSubject.value;
  }

  /**
   * Watch a specific parameter for changes
   *
   * @param key - Parameter key to watch
   * @returns Observable of parameter value
   */
  watchParam(key: string): Observable<any> {
    return this.params$.pipe(
      map(params => params[key] || null),
      distinctUntilChanged()
    );
  }

  /**
   * Serialize parameters to URL query string
   *
   * @param params - Parameters object
   * @returns Query string (without leading '?')
   */
  serializeParams(params: Params): string {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach(key => {
      const value = params[key];

      // Skip null/undefined
      if (value === null || value === undefined) {
        return;
      }

      // Handle arrays (comma-separated)
      if (Array.isArray(value)) {
        queryParams.set(key, value.join(','));
        return;
      }

      // Convert to string
      queryParams.set(key, String(value));
    });

    return queryParams.toString();
  }

  /**
   * Deserialize URL query string to parameters object
   *
   * @param queryString - Query string (with or without leading '?')
   * @returns Parameters object
   */
  deserializeParams(queryString: string): Params {
    const params: Params = {};
    const urlParams = new URLSearchParams(
      queryString.startsWith('?') ? queryString.slice(1) : queryString
    );

    urlParams.forEach((value, key) => {
      // Try to parse as number
      if (!isNaN(Number(value)) && value !== '') {
        params[key] = Number(value);
        return;
      }

      // Try to parse as boolean
      if (value === 'true' || value === 'false') {
        params[key] = value === 'true';
        return;
      }

      // Check for comma-separated values (arrays)
      if (value.includes(',')) {
        params[key] = value.split(',');
        return;
      }

      // Keep as string
      params[key] = value;
    });

    return params;
  }

  /**
   * Initialize from current route
   */
  private initializeFromRoute(): void {
    const snapshot = this.route.snapshot;
    this.paramsSubject.next(snapshot.queryParams);
  }

  /**
   * Watch for route changes and update internal state
   */
  private watchRouteChanges(): void {
    this.route.queryParams
      .pipe(
        skip(1), // Skip first emission since we already initialized from snapshot
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(params => {
        this.paramsSubject.next(params);
      });
  }
}
