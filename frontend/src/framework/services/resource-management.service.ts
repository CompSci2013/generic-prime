import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  takeUntil
} from 'rxjs/operators';
import { DomainConfig } from '../models/domain-config.interface';
import {
  ResourceManagementConfig,
  ResourceState
} from '../models/resource-management.interface';
import { DOMAIN_CONFIG } from './domain-config-registry.service';
import { PopOutContextService } from './popout-context.service';
import { UrlStateService } from './url-state.service';

/**
 * Generic resource management service
 *
 * Orchestrates state management with URL-first architecture:
 * URL → Filters → API → Data → Components
 *
 * This service is provided at a component level (e.g., DiscoverComponent)
 * and configured via the DOMAIN_CONFIG injection token. This allows for
 * multiple instances of the service to exist, each configured for a different
 * data domain (e.g., Automobiles, Agriculture).
 *
 * It is also context-aware: when used within a pop-out window, it automatically
 * disables API calls (`autoFetch: false`).
 *
 * @template TFilters - The shape of filter objects
 * @template TData - The shape of individual data items
 * @template TStatistics - The shape of statistics objects (optional)
 */
@Injectable()
export class ResourceManagementService<TFilters, TData, TStatistics = any>
  implements OnDestroy {
  private stateSubject: BehaviorSubject<
    ResourceState<TFilters, TData, TStatistics>
  >;
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
    private urlState: UrlStateService,
    @Inject(DOMAIN_CONFIG)
    private domainConfig: DomainConfig<TFilters, TData, TStatistics>,
    private popOutContext: PopOutContextService
  ) {
    // 1. Create the internal configuration from the injected domain config
    this.config = {
      filterMapper: this.domainConfig.urlMapper,
      apiAdapter: this.domainConfig.apiAdapter,
      cacheKeyBuilder: this.domainConfig.cacheKeyBuilder,
      defaultFilters: (this.domainConfig.defaultFilters || {}) as TFilters,
      supportsHighlights: this.domainConfig.features?.highlights ?? false,
      highlightPrefix: 'h_',
      // Service is context-aware: disable auto-fetching if in a pop-out
      autoFetch: !this.popOutContext.isInPopOut()
    };

    // 2. Initialize state
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

    // 3. Create observable streams from state
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

    // 4. Initialize from URL and watch for changes
    this.initializeFromUrl();
    this.watchUrlChanges();
  }

  /**
   * Update filters (triggers URL update → data fetch)
   *
   * Pass undefined for a filter value to remove it from the filters.
   *
   * @param partial - Partial filter updates (undefined values = remove key)
   */
  updateFilters(partial: Partial<TFilters>): void {
    const currentFilters = this.stateSubject.value.filters;
    const merged = { ...currentFilters, ...partial };

    // Remove keys with undefined/null values (these should be cleared from URL)
    const newFilters: Record<string, any> = {};
    for (const key of Object.keys(merged)) {
      const value = (merged as Record<string, any>)[key];
      if (value !== undefined && value !== null && value !== '') {
        newFilters[key] = value;
      }
    }

    // Get the new URL params
    const newUrlParams = this.config.filterMapper.toUrlParams(
      newFilters as TFilters
    );

    // Get current URL params to find which ones need to be removed
    const currentUrlParams = this.config.filterMapper.toUrlParams(currentFilters);

    // Build final params: new params + null for removed params
    const finalParams: Record<string, any> = { ...newUrlParams };
    for (const key of Object.keys(currentUrlParams)) {
      if (!(key in newUrlParams)) {
        // This param was in current but not in new - explicitly set to null to remove
        finalParams[key] = null;
      }
    }

    // Update URL (this will trigger watchUrlChanges which fetches data)
    this.urlState.setParams(finalParams);
  }

  /**
   * Clear all filters (reset to defaults)
   */
  clearFilters(): void {
    // Get current URL params to find which ones need to be removed
    const currentFilters = this.stateSubject.value.filters;
    const currentUrlParams = this.config.filterMapper.toUrlParams(currentFilters);

    // Get default URL params
    const defaultUrlParams = this.config.filterMapper.toUrlParams(
      this.config.defaultFilters
    );

    // Build final params: default params + null for removed params
    const finalParams: Record<string, any> = { ...defaultUrlParams };
    for (const key of Object.keys(currentUrlParams)) {
      if (!(key in defaultUrlParams)) {
        finalParams[key] = null;
      }
    }

    this.urlState.setParams(finalParams, true); // Replace history entry
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
    if (this.config.autoFetch) {
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
        if (this.config.autoFetch) {
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
   */
  public syncStateFromExternal(
    externalState: ResourceState<TFilters, TData, TStatistics>
  ): void {
    this.stateSubject.next(externalState);
  }

  /**
   * Clean up subscriptions on component destroy
   */
  destroy(): void {
    this.ngOnDestroy();
  }

  /**
   * Clean up subscriptions on component destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
