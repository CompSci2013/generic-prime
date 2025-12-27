import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DomainConfig } from '../../models/domain-config.interface';
import { ResourceManagementService } from '../../services/resource-management.service';
import { PopOutContextService } from '../../services/popout-context.service';
import { PopOutMessageType } from '../../models/popout.interface';
import { SkeletonModule } from 'primeng/skeleton';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TableModule, SharedModule, NgIf, NgFor, NgStyle, ButtonModule, RippleModule, SkeletonModule]
})
export class BasicResultsTableComponent<TFilters = any, TData = any, TStatistics = any>
  implements OnInit, OnDestroy {

  readonly environment = environment;

  @Input() domainConfig!: DomainConfig<TFilters, TData, TStatistics>;

  /**
   * Emits when URL parameters should be updated (sort, page, size)
   * Used by parent components (e.g., panel-popout) to sync with main window
   */
  @Output() urlParamsChange = new EventEmitter<{ [key: string]: any }>();

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
    const page = event.first / event.rows + 1;
    const size = event.rows;

    // In pop-out mode, emit to parent for main window sync
    if (this.popOutContext.isInPopOut()) {
      this.urlParamsChange.emit({ page, size });
    } else {
      const newFilters = {
        ...this.currentFilters,
        page,
        size
      } as unknown as TFilters;
      this.resourceService.updateFilters(newFilters);
    }
  }

  /**
   * Handle sort events from PrimeNG Table
   */
  onSort(event: any): void {
    const sort = event.field;
    const sortDirection = event.order === 1 ? 'asc' : 'desc';
    const isPopOut = this.popOutContext.isInPopOut();

    console.log('[BasicResultsTable] onSort called', { sort, sortDirection, isPopOut });

    // In pop-out mode, emit to parent for main window sync
    if (isPopOut) {
      console.log('[BasicResultsTable] Emitting urlParamsChange', { sort, sortDirection });
      this.urlParamsChange.emit({ sort, sortDirection });
    } else {
      console.log('[BasicResultsTable] Calling updateFilters directly');
      const newFilters = {
        ...this.currentFilters,
        sort,
        sortDirection
      } as unknown as TFilters;
      this.resourceService.updateFilters(newFilters);
    }
  }

  /**
   * Refresh data
   */
  refresh(): void {
    this.resourceService.refresh();
  }
}
