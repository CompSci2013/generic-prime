import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DomainConfig, FilterOption } from '../../models/domain-config.interface';
import { ResourceManagementService } from '../../services/resource-management.service';
import { PopOutContextService } from '../../services/popout-context.service';
import { PopOutMessageType } from '../../models/popout.interface';

/**
 * Results Table Component
 *
 * Configuration-driven data table with integrated filtering.
 * Completely self-contained - handles filters, pagination, sorting, and data loading.
 *
 * @template TFilters - Domain-specific filter model type
 * @template TData - Domain-specific data model type
 * @template TStatistics - Domain-specific statistics model type
 *
 * @example
 * ```html
 * <app-results-table
 *   [domainConfig]="automobileDomainConfig">
 * </app-results-table>
 * ```
 */
@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsTableComponent<TFilters = any, TData = any, TStatistics = any>
  implements OnInit, OnDestroy {
  /**
   * Environment configuration for conditional test-id rendering
   */
  readonly environment = environment;

  /**
   * Domain configuration (required input) containing filters, table config, API endpoints, statistics, and more
   */
  @Input() domainConfig!: DomainConfig<TFilters, TData, TStatistics>;

  // Observables from resource service
  /**
   * Observable stream of current filter state from the resource management service
   */
  filters$!: Observable<TFilters>;

  /**
   * Observable stream of table data results matching current filters and pagination
   */
  results$!: Observable<TData[]>;

  /**
   * Observable stream of total results count for pagination calculation
   */
  totalResults$!: Observable<number>;

  /**
   * Observable stream of loading state indicating whether data is being fetched
   */
  loading$!: Observable<boolean>;

  /**
   * Observable stream of error state containing any error that occurred during data fetch
   */
  error$!: Observable<Error | null>;

  /**
   * Observable stream of statistics data aggregated from the results
   */
  statistics$!: Observable<TStatistics | undefined>;

  // Component state - using Record for dynamic property access from template
  /**
   * Current filter values synchronized from the filters$ observable
   */
  currentFilters: Record<string, any> = {};

  /**
   * Current table data results synchronized from the results$ observable
   */
  results: TData[] = [];

  /**
   * Total count of all results matching the filters (for pagination)
   */
  totalResults = 0;

  /**
   * Current loading state synchronized from the loading$ observable
   */
  loading = false;

  /**
   * Map of expanded row IDs for collapsible row details in the table
   */
  expandedRows: { [key: string]: boolean } = {};

  /**
   * Whether the filter panel is currently collapsed/hidden
   */
  filterPanelCollapsed = false;

  /**
   * Dynamically loaded filter options from API endpoints, keyed by filter field name
   */
  dynamicOptions: Record<string, FilterOption[]> = {};

  /**
   * RxJS Subject to signal component destruction and unsubscribe from all observables
   */
  private destroy$ = new Subject<void>();

  /**
   * Object reference exposed for template use in dynamic property iteration and access
   */
  Object = Object;

  /**
   * Calculate the first index for the paginator
   * Converts 1-indexed page number to 0-indexed first record position
   *
   * @returns First record index for current page
   */
  get paginatorFirst(): number {
    const page = this.currentFilters['page'] || 1;
    const size = this.currentFilters['size'] || 20;
    return (page - 1) * size;
  }

  constructor(
    private resourceService: ResourceManagementService<
      TFilters,
      TData,
      TStatistics
    >,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private popOutContext: PopOutContextService
  ) {}

  ngOnInit(): void {
    if (!this.domainConfig) {
      throw new Error('ResultsTableComponent requires domainConfig input');
    }

    // Load dynamic options for filters with optionsEndpoint
    this.loadDynamicFilterOptions();

    // Subscribe to state streams (service injected via constructor)
    this.filters$ = this.resourceService.filters$;
    this.results$ = this.resourceService.results$;
    this.totalResults$ = this.resourceService.totalResults$;
    this.loading$ = this.resourceService.loading$;
    this.error$ = this.resourceService.error$;
    this.statistics$ = this.resourceService.statistics$;

    // Subscribe to each stream independently to avoid combineLatest race condition
    // (Bug #1.3 / #16: combineLatest won't emit if one source doesn't change)

    this.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.currentFilters = { ...filters as any };
        this.cdr.markForCheck();
      });

    this.results$
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.results = results;
        this.cdr.markForCheck();
      });

    this.totalResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe(totalResults => {
        this.totalResults = totalResults;
        this.cdr.markForCheck();
      });

    this.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
        this.cdr.markForCheck();
      });

    // In pop-out windows: Subscribe to STATE_UPDATE messages from main window
    // This ensures Results Table gets filter updates even if there's a timing race condition
    // with the ResourceManagementService.syncStateFromExternal() method
    if (this.popOutContext.isInPopOut()) {
      this.popOutContext
        .getMessages$()
        .pipe(
          filter(msg => msg.type === PopOutMessageType.STATE_UPDATE),
          takeUntil(this.destroy$)
        )
        .subscribe(message => {
          if (message.payload && message.payload.state) {
            // Sync the pop-out state to the ResourceManagementService
            // This ensures this component and all sibling components get the updated state
            this.resourceService.syncStateFromExternal(message.payload.state);
            this.cdr.markForCheck();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // NOTE: Do NOT call resourceService.destroy() here!
    // ResourceManagementService is provided at the root level and should manage its own lifecycle.
    // If this component destroys the service, it will break other components still using it.
    // The service will be destroyed when the root component (DiscoverComponent) is destroyed.
  }

  /**
   * Handle pagination events from PrimeNG Table
   */
  onPageChange(event: any): void {
    const newFilters = {
      ...this.currentFilters,
      page: event.first / event.rows + 1,
      size: event.rows
    } as unknown as TFilters;
    this.resourceService.updateFilters(newFilters);
  }

  /**
   * Handle sort events from PrimeNG Table
   */
  onSort(event: any): void {
    const newFilters = {
      ...this.currentFilters,
      sort: event.field,
      sortDirection: event.order === 1 ? 'asc' as const : 'desc' as const
    } as unknown as TFilters;
    this.resourceService.updateFilters(newFilters);
  }

  /**
   * Handle filter input changes
   * When value is null/undefined/empty, pass undefined to signal removal
   */
  onFilterChange(field: string, value: any): void {
    const newFilters: Record<string, any> = {
      ...this.currentFilters,
      page: 1 // Reset to first page on filter change
    };

    // If value is null, undefined, empty string, or empty array, set to undefined
    // (updateFilters will remove keys with undefined values from URL)
    // Otherwise, set the new value
    const isEmpty = value === null ||
                    value === undefined ||
                    value === '' ||
                    (Array.isArray(value) && value.length === 0);

    if (isEmpty) {
      newFilters[field] = undefined;
    } else {
      newFilters[field] = value;
    }

    this.resourceService.updateFilters(newFilters as unknown as TFilters);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.resourceService.updateFilters({
      page: 1,
      size: this.currentFilters['size'] || 20
    } as unknown as TFilters);
  }

  /**
   * Toggle filter panel collapse state
   */
  toggleFilterPanel(): void {
    this.filterPanelCollapsed = !this.filterPanelCollapsed;
    this.cdr.markForCheck();
  }

  /**
   * Refresh data
   */
  refresh(): void {
    this.resourceService.refresh();
  }

  /**
   * Get options for a filter - returns dynamic options if loaded, otherwise static options
   */
  getFilterOptions(filterId: string): FilterOption[] {
    // Check for dynamically loaded options first
    if (this.dynamicOptions[filterId]) {
      return this.dynamicOptions[filterId];
    }

    // Fall back to static options from filter definition
    const filterDef = this.domainConfig.filters.find(f => f.id === filterId);
    return filterDef?.options || [];
  }

  /**
   * Load dynamic options for filters that specify an optionsEndpoint
   */
  private loadDynamicFilterOptions(): void {
    const filtersWithEndpoint = this.domainConfig.filters.filter(f => f.optionsEndpoint);

    filtersWithEndpoint.forEach(filterDef => {
      const endpoint = `${this.domainConfig.apiBaseUrl}/agg/${filterDef.optionsEndpoint}`;

      this.http.get<{ field: string; values: Array<{ value: string; count: number }> }>(endpoint)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            // Transform API response to FilterOption format
            this.dynamicOptions[filterDef.id] = response.values.map(item => ({
              value: item.value,
              label: item.value // Use value as label, could add count: `${item.value} (${item.count})`
            }));
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error(`Failed to load options for ${filterDef.id}:`, err);
            // Keep using static options if dynamic load fails
          }
        });
    });
  }
}
