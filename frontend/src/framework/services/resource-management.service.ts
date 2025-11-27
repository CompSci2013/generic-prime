import { InjectionToken } from '@angular/core';
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

  /**
   * Observable of highlight filters
   */
  public highlights$: Observable<any>;

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

    this.highlights$ = this.state$.pipe(
      map(state => state.highlights || {}),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
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
   * Extract highlight filters from URL parameters
   * Extracts parameters with h_ prefix (e.g., h_yearMin, h_manufacturer)
   *
   * Normalizes separators: Converts pipes (|) to commas (,) for backend compatibility.
   * Backend expects comma-separated values: h_manufacturer=Ford,Buick
   *
   * @param urlParams - URL parameters
   * @returns Highlight filters object
   */
  private extractHighlights(urlParams: Record<string, any>): any {
    if (!this.config.supportsHighlights) {
      return {};
    }

    const prefix = this.config.highlightPrefix || 'h_';
    const highlights: Record<string, any> = {};

    Object.keys(urlParams).forEach(key => {
      if (key.startsWith(prefix)) {
        const highlightKey = key.substring(prefix.length);
        let value = urlParams[key];

        // Normalize separators: Convert pipes to commas for backend compatibility
        // Supports both h_manufacturer=Ford,Buick and h_manufacturer=Ford|Buick
        if (typeof value === 'string' && value.includes('|')) {
          value = value.replace(/\|/g, ',');
        }

        highlights[highlightKey] = value;
      }
    });

    return highlights;
  }

  /**
   * Initialize filters from current URL
   */
  private initializeFromUrl(): void {
    const urlParams = this.urlState.getParams();
    const filters = this.config.filterMapper.fromUrlParams(urlParams);
    const highlights = this.extractHighlights(urlParams);

    this.updateState({ filters, highlights });

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
        const highlights = this.extractHighlights(urlParams);
        this.updateState({ filters, highlights });

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

    // Get current highlights from state
    const highlights = this.stateSubject.value.highlights;

    this.config.apiAdapter
      .fetchData(filters, highlights)
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
   * Sync state from external source (e.g., pop-out receiving state from main window)
   *
   * This method allows pop-out windows to receive full state from the main window
   * via BroadcastChannel and update their local state without making API calls.
   *
   * Architecture:
   * - Main window: URL → ResourceManagementService → state$ → BroadcastChannel
   * - Pop-out window: BroadcastChannel → syncStateFromExternal() → state$ → components
   *
   * @param externalState - Complete state object from main window
   *
   * @example
   * ```typescript
   * // In PanelPopoutComponent
   * case PopOutMessageType.STATE_UPDATE:
   *   this.resourceService.syncStateFromExternal(message.payload.state);
   *   break;
   * ```
   */
  public syncStateFromExternal(
    externalState: ResourceState<TFilters, TData, TStatistics>
  ): void {
    this.stateSubject.next(externalState);
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

/**
 * Injection token for ResourceManagementService
 *
 * Use this token to provide and inject a shared instance of ResourceManagementService.
 * Typically provided at the page component level (DiscoverComponent, PanelPopoutComponent)
 * and injected into child components that need access to shared state.
 *
 * @example
 * ```typescript
 * // In parent component (DiscoverComponent)
 * providers: [{
 *   provide: RESOURCE_MANAGEMENT_SERVICE,
 *   useFactory: (urlState: UrlStateService, domainConfig: DomainConfig) => {
 *     return new ResourceManagementService(urlState, {
 *       filterMapper: domainConfig.urlMapper,
 *       apiAdapter: domainConfig.apiAdapter,
 *       cacheKeyBuilder: domainConfig.cacheKeyBuilder,
 *       defaultFilters: {}
 *     });
 *   },
 *   deps: [UrlStateService, DOMAIN_CONFIG]
 * }]
 *
 * // In child component
 * constructor(
 *   @Inject(RESOURCE_MANAGEMENT_SERVICE)
 *   private resourceService: ResourceManagementService<TFilters, TData, TStatistics>
 * ) {}
 * ```
 */
export const RESOURCE_MANAGEMENT_SERVICE = new InjectionToken<ResourceManagementService<any, any, any>>(
  'ResourceManagementService'
);
