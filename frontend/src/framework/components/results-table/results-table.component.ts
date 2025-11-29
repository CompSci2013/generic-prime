import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomainConfig, FilterOption } from '../../models/domain-config.interface';
import { ResourceManagementService } from '../../services/resource-management.service';

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
   * Domain configuration (required)
   * Contains all configuration for filters, table, API, etc.
   */
  @Input() domainConfig!: DomainConfig<TFilters, TData, TStatistics>;

  // Observables from resource service
  filters$!: Observable<TFilters>;
  results$!: Observable<TData[]>;
  totalResults$!: Observable<number>;
  loading$!: Observable<boolean>;
  error$!: Observable<Error | null>;
  statistics$!: Observable<TStatistics | undefined>;

  // Component state - using Record for dynamic property access from template
  currentFilters: Record<string, any> = {};
  results: TData[] = [];
  totalResults = 0;
  loading = false;
  expandedRows: { [key: string]: boolean } = {};

  /** Dynamically loaded options for select filters (keyed by filter id) */
  dynamicOptions: Record<string, FilterOption[]> = {};

  /** Subject for unsubscribing on destroy */
  private destroy$ = new Subject<void>();

  // Expose Object for template use (for dynamic rendering)
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
    private http: HttpClient
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

    // Combine all state streams into single subscription for proper cleanup
    combineLatest([
      this.filters$,
      this.results$,
      this.totalResults$,
      this.loading$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([filters, results, totalResults, loading]) => {
      this.currentFilters = { ...filters as any };
      this.results = results;
      this.totalResults = totalResults;
      this.loading = loading;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.resourceService) {
      this.resourceService.destroy();
    }
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
