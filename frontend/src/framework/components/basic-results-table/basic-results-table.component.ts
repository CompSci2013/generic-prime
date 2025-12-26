import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DomainConfig } from '../../models/domain-config.interface';
import { ResourceManagementService } from '../../services/resource-management.service';
import { PopOutContextService } from '../../services/popout-context.service';
import { PopOutMessageType } from '../../models/popout.interface';

/**
 * Basic Results Table Component
 *
 * Pure display component for showing tabular data with pagination and sorting.
 * Does NOT include filter controls - use QueryPanelComponent or QueryControlComponent for filtering.
 *
 * Subscribes to ResourceManagementService for:
 * - results$ (data to display)
 * - totalResults$ (for pagination)
 * - loading$ (loading state)
 * - filters$ (for current page/size/sort)
 *
 * @template TFilters - Domain-specific filter model type
 * @template TData - Domain-specific data model type
 * @template TStatistics - Domain-specific statistics model type
 *
 * @example
 * ```html
 * <app-basic-results-table
 *   [domainConfig]="automobileDomainConfig">
 * </app-basic-results-table>
 * ```
 */
@Component({
  selector: 'app-basic-results-table',
  templateUrl: './basic-results-table.component.html',
  styleUrls: ['./basic-results-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicResultsTableComponent<TFilters = any, TData = any, TStatistics = any>
  implements OnInit, OnDestroy {

  readonly environment = environment;

  @Input() domainConfig!: DomainConfig<TFilters, TData, TStatistics>;

  // Observables from resource service
  results$!: Observable<TData[]>;
  totalResults$!: Observable<number>;
  loading$!: Observable<boolean>;
  filters$!: Observable<TFilters>;

  // Component state
  currentFilters: Record<string, any> = {};
  results: TData[] = [];
  totalResults = 0;
  loading = false;
  expandedRows: { [key: string]: boolean } = {};

  private destroy$ = new Subject<void>();

  Object = Object;

  /**
   * Calculate the first index for the paginator
   */
  get paginatorFirst(): number {
    const page = this.currentFilters['page'] || 1;
    const size = this.currentFilters['size'] || 20;
    return (page - 1) * size;
  }

  constructor(
    private resourceService: ResourceManagementService<TFilters, TData, TStatistics>,
    private cdr: ChangeDetectorRef,
    private popOutContext: PopOutContextService
  ) {}

  ngOnInit(): void {
    if (!this.domainConfig) {
      throw new Error('BasicResultsTableComponent requires domainConfig input');
    }

    // Subscribe to state streams
    this.filters$ = this.resourceService.filters$;
    this.results$ = this.resourceService.results$;
    this.totalResults$ = this.resourceService.totalResults$;
    this.loading$ = this.resourceService.loading$;

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

    // Pop-out window support
    if (this.popOutContext.isInPopOut()) {
      this.popOutContext
        .getMessages$()
        .pipe(
          filter(msg => msg.type === PopOutMessageType.STATE_UPDATE),
          takeUntil(this.destroy$)
        )
        .subscribe(message => {
          if (message.payload && message.payload.state) {
            this.resourceService.syncStateFromExternal(message.payload.state);
            this.cdr.markForCheck();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
   * Refresh data
   */
  refresh(): void {
    this.resourceService.refresh();
  }
}
