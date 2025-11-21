// No Angular imports needed - this is a plain TypeScript class
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import {
  map,
  distinctUntilChanged,
  takeUntil,
  catchError,
  tap,
  finalize,
  switchMap
} from 'rxjs/operators';
import { UrlStateService } from './url-state.service';
import {
  ResourceManagementConfig,
  ResourceState
} from '../models/resource-management.interface';

/**
 * Generic resource management service
 *
 * Orchestrates state management with URL-first architecture:
 * URL → Filters → API → Data → Components
 *
 * @template TFilters - The shape of filter objects
 * @template TData - The shape of individual data items
 * @template TStatistics - The shape of statistics objects (optional)
 *
 * @example
 * ```typescript
 * interface SearchFilters {
 *   search: string;
 *   page: number;
 *   size: number;
 * }
 *
 * interface Item {
 *   id: string;
 *   name: string;
 * }
 *
 * const service = new ResourceManagementService<SearchFilters, Item>(
 *   urlState,
 *   config
 * );
 *
 * // Subscribe to data
 * service.results$.subscribe(items => console.log(items));
 *
 * // Update filters (triggers URL update → data fetch)
 * service.updateFilters({ search: 'test', page: 1 });
 * ```
 *
 * NOTE: This is a plain TypeScript class, NOT an Angular service.
 * Create instances manually in your components by passing urlState and config.
 * Call destroy() in your component's ngOnDestroy() to clean up subscriptions.
 */
export class ResourceManagementService<TFilters, TData, TStatistics = any> {
  private urlState: UrlStateService;
  private stateSubject: BehaviorSubject<ResourceState<TFilters, TData, TStatistics>>;
  private destroy$ = new Subject<void>();
  private config: ResourceManagementConfig<TFilters, TData, TStatistics>;

  /**
   * Observable of complete state
   */
  public state$: Observable<ResourceState<TFilters, TData, TStatistics>>;

  /**
   * Observable of current filters
   */
  public filters$: Observable<TFilters>;

  /**
   * Observable of data results
   */
  public results$: Observable<TData[]>;

  /**
   * Observable of total results count
   */
  public totalResults$: Observable<number>;

  /**
   * Observable of loading state
   */
  public loading$: Observable<boolean>;

  /**
   * Observable of error state
   */
  public error$: Observable<Error | null>;

  /**
   * Observable of statistics
   */
  public statistics$: Observable<TStatistics | undefined>;

  constructor(
    urlState: UrlStateService,
    config: ResourceManagementConfig<TFilters, TData, TStatistics>
  ) {
    this.urlState = urlState;
    this.config = config;
    // Initialize state
    this.stateSubject = new BehaviorSubject<
      ResourceState<TFilters, TData, TStatistics>
    >({
      filters: this.config.defaultFilters,
      results: [],
      totalResults: 0,
      loading: false,
      error: null,
      statistics: undefined
    });

    // Create observable streams
    this.state$ = this.stateSubject.asObservable();

    this.filters$ = this.state$.pipe(
      map(state => state.filters),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );

    this.results$ = this.state$.pipe(
      map(state => state.results),
      distinctUntilChanged()
    );

    this.totalResults$ = this.state$.pipe(
      map(state => state.totalResults),
      distinctUntilChanged()
    );

    this.loading$ = this.state$.pipe(
      map(state => state.loading),
      distinctUntilChanged()
    );

    this.error$ = this.state$.pipe(
      map(state => state.error),
      distinctUntilChanged()
    );

    this.statistics$ = this.state$.pipe(
      map(state => state.statistics),
      distinctUntilChanged()
    );

    // Initialize from URL and watch for changes
    this.initializeFromUrl();
    this.watchUrlChanges();
  }

  /**
   * Update filters (triggers URL update → data fetch)
   *
   * @param partial - Partial filter updates
   */
  updateFilters(partial: Partial<TFilters>): void {
    const currentFilters = this.stateSubject.value.filters;
    const newFilters = { ...currentFilters, ...partial };

    // Update URL (this will trigger watchUrlChanges which fetches data)
    const urlParams = this.config.filterMapper.toUrlParams(newFilters);
    this.urlState.setParams(urlParams);
  }

  /**
   * Clear all filters (reset to defaults)
   */
  clearFilters(): void {
    const urlParams = this.config.filterMapper.toUrlParams(
      this.config.defaultFilters
    );
    this.urlState.setParams(urlParams, true); // Replace history entry
  }

  /**
   * Refresh data with current filters
   */
  refresh(): void {
    const currentFilters = this.stateSubject.value.filters;
    this.fetchData(currentFilters);
  }

  /**
   * Get current state snapshot
   *
   * @returns Current state
   */
  getCurrentState(): ResourceState<TFilters, TData, TStatistics> {
    return this.stateSubject.value;
  }

  /**
   * Get current filters snapshot
   *
   * @returns Current filters
   */
  getCurrentFilters(): TFilters {
    return this.stateSubject.value.filters;
  }

  /**
   * Initialize filters from current URL
   */
  private initializeFromUrl(): void {
    const urlParams = this.urlState.getParams();
    const filters = this.config.filterMapper.fromUrlParams(urlParams);

    this.updateState({ filters });

    // Fetch data if auto-fetch is enabled
    if (this.config.autoFetch !== false) {
      this.fetchData(filters);
    }
  }

  /**
   * Watch for URL changes and update state
   */
  private watchUrlChanges(): void {
    this.urlState
      .watchParams()
      .pipe(takeUntil(this.destroy$))
      .subscribe(urlParams => {
        const filters = this.config.filterMapper.fromUrlParams(urlParams);
        this.updateState({ filters });

        // Fetch data if auto-fetch is enabled
        if (this.config.autoFetch !== false) {
          this.fetchData(filters);
        }
      });
  }

  /**
   * Fetch data from API
   *
   * @param filters - Filters to apply
   */
  private fetchData(filters: TFilters): void {
    // Set loading state
    this.updateState({ loading: true, error: null });

    this.config.apiAdapter
      .fetchData(filters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error fetching data:', error);
          this.updateState({
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
            results: [],
            totalResults: 0
          });
          return of(null);
        }),
        finalize(() => {
          // Ensure loading is set to false
          const currentState = this.stateSubject.value;
          if (currentState.loading) {
            this.updateState({ loading: false });
          }
        })
      )
      .subscribe(response => {
        if (response) {
          this.updateState({
            results: response.results,
            totalResults: response.total,
            statistics: response.statistics,
            loading: false,
            error: null
          });
        }
      });
  }

  /**
   * Update state (partial update)
   *
   * @param partial - Partial state update
   */
  private updateState(
    partial: Partial<ResourceState<TFilters, TData, TStatistics>>
  ): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, ...partial };
    this.stateSubject.next(newState);
  }

  /**
   * Clean up subscriptions and resources
   * Call this in your component's ngOnDestroy()
   */
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
