import { Component, OnInit, OnDestroy, Inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DOMAIN_CONFIG } from '../../../framework/services/domain-config-registry.service';
import { DomainConfig } from '../../../framework/models';
import { UrlStateService } from '../../../framework/services/url-state.service';
import { ResourceManagementService } from '../../../framework/services/resource-management.service';
import { AutoSearchFilters, VehicleResult, VehicleStatistics } from '../../../domain-config/automobile';
import { Observable } from 'rxjs';

/**
 * Discover Component
 *
 * Main feature component for domain-agnostic data discovery.
 * Uses PrimeNG Table directly with domain configuration.
 *
 * Architecture:
 * - URL-first state management
 * - Domain configuration drives UI
 * - PrimeNG components (no custom wrappers)
 * - ResourceManagementService for state orchestration
 */
@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscoverComponent implements OnInit, OnDestroy {
  // Domain configuration
  domainConfig: DomainConfig<AutoSearchFilters, VehicleResult, VehicleStatistics>;

  // State management service
  private resourceService!: ResourceManagementService<AutoSearchFilters, VehicleResult, VehicleStatistics>;

  // Observables from resource service
  filters$!: Observable<AutoSearchFilters>;
  results$!: Observable<VehicleResult[]>;
  totalResults$!: Observable<number>;
  loading$!: Observable<boolean>;
  error$!: Observable<Error | null>;
  statistics$!: Observable<VehicleStatistics | undefined>;

  // Component state
  currentFilters: AutoSearchFilters = new AutoSearchFilters();
  results: VehicleResult[] = [];
  totalResults = 0;
  loading = false;
  expandedRows: { [key: string]: boolean } = {};

  constructor(
    @Inject(DOMAIN_CONFIG) domainConfig: DomainConfig<any, any, any>,
    private urlStateService: UrlStateService,
    private cdr: ChangeDetectorRef
  ) {
    // Type assertion for domain config
    this.domainConfig = domainConfig as DomainConfig<AutoSearchFilters, VehicleResult, VehicleStatistics>;
  }

  ngOnInit(): void {
    // Create resource management service
    this.resourceService = new ResourceManagementService<
      AutoSearchFilters,
      VehicleResult,
      VehicleStatistics
    >(
      this.urlStateService,
      {
        filterMapper: this.domainConfig.urlMapper,
        apiAdapter: this.domainConfig.apiAdapter,
        cacheKeyBuilder: this.domainConfig.cacheKeyBuilder,
        defaultFilters: new AutoSearchFilters({
          page: 1,
          size: this.domainConfig.tableConfig.rows || 20
        })
      }
    );

    // Subscribe to state streams
    this.filters$ = this.resourceService.filters$;
    this.results$ = this.resourceService.results$;
    this.totalResults$ = this.resourceService.totalResults$;
    this.loading$ = this.resourceService.loading$;
    this.error$ = this.resourceService.error$;
    this.statistics$ = this.resourceService.statistics$;

    // Subscribe to sync component state (for template)
    this.filters$.subscribe(filters => {
      this.currentFilters = filters;
      this.cdr.markForCheck();
    });

    this.results$.subscribe(results => {
      this.results = results;
      this.cdr.markForCheck();
    });

    this.totalResults$.subscribe(total => {
      this.totalResults = total;
      this.cdr.markForCheck();
    });

    this.loading$.subscribe(loading => {
      this.loading = loading;
      this.cdr.markForCheck();
    });

    // Note: No need to call initialize() - constructor handles it automatically
  }

  ngOnDestroy(): void {
    // Clean up resource service
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
    };
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
    };
    this.resourceService.updateFilters(newFilters);
  }

  /**
   * Handle filter input changes
   */
  onFilterChange(field: string, value: any): void {
    const newFilters = {
      ...this.currentFilters,
      [field]: value,
      page: 1 // Reset to first page on filter change
    };
    this.resourceService.updateFilters(newFilters);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.resourceService.updateFilters(
      new AutoSearchFilters({
        page: 1,
        size: this.currentFilters.size
      })
    );
  }

  /**
   * Refresh data
   */
  refresh(): void {
    this.resourceService.refresh();
  }
}
