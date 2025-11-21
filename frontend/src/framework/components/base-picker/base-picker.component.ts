import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  PickerConfig,
  PickerState,
  PickerSelectionEvent,
  PickerApiParams,
  getDefaultPickerState
} from '../../models/picker-config.interface';
import { PickerConfigRegistry } from '../../services/picker-config-registry.service';
import { UrlStateService } from '../../services/url-state.service';

/**
 * Base Picker Component
 *
 * Configuration-driven multi-select table component.
 * Thin wrapper around PrimeNG Table with selection management and URL synchronization.
 *
 * @template T - The data model type
 *
 * @example
 * ```html
 * <!-- Using config ID from registry -->
 * <app-base-picker
 *   [configId]="'vehicle-picker'"
 *   (selectionChange)="onSelectionChange($event)">
 * </app-base-picker>
 *
 * <!-- Using direct config -->
 * <app-base-picker
 *   [config]="vehiclePickerConfig"
 *   (selectionChange)="onSelectionChange($event)">
 * </app-base-picker>
 * ```
 */
@Component({
  selector: 'app-base-picker',
  templateUrl: './base-picker.component.html',
  styleUrls: ['./base-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasePickerComponent<T> implements OnInit, OnDestroy {
  /**
   * Picker configuration ID (loads from registry)
   * Either configId or config must be provided
   */
  @Input() configId?: string;

  /**
   * Direct picker configuration
   * Either configId or config must be provided
   */
  @Input() config?: PickerConfig<T>;

  /**
   * Emits when selection changes
   */
  @Output() selectionChange = new EventEmitter<PickerSelectionEvent<T>>();

  /** Picker state */
  state: PickerState<T> = getDefaultPickerState();

  /** Active picker config */
  activeConfig?: PickerConfig<T>;

  /** Destroy subject for cleanup */
  private destroy$ = new Subject<void>();

  constructor(
    private registry: PickerConfigRegistry,
    private urlState: UrlStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load configuration
    this.loadConfiguration();

    if (!this.activeConfig) {
      throw new Error(
        'BasePickerComponent requires either configId or config input'
      );
    }

    // Initialize state
    this.initializeState();

    // Subscribe to URL changes
    this.subscribeToUrlChanges();

    // Load initial data
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load configuration from registry or direct input
   */
  private loadConfiguration(): void {
    if (this.config) {
      this.activeConfig = this.config;
    } else if (this.configId) {
      this.activeConfig = this.registry.get<T>(this.configId);
    }
  }

  /**
   * Initialize picker state
   */
  private initializeState(): void {
    const pageSize = this.activeConfig!.pagination.defaultPageSize || 20;
    this.state = getDefaultPickerState<T>(pageSize);
  }

  /**
   * Subscribe to URL parameter changes for selection hydration
   */
  private subscribeToUrlChanges(): void {
    const urlParam = this.activeConfig!.selection.urlParam;

    this.urlState
      .watchParam(urlParam)
      .pipe(takeUntil(this.destroy$))
      .subscribe(urlValue => {
        if (urlValue) {
          this.hydrateFromUrl(urlValue);
        } else {
          // Clear selections if URL param is removed
          this.state.selectedKeys.clear();
          this.state.selectedItems = [];
          this.state.pendingHydration = [];
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Hydrate selections from URL parameter value
   */
  private hydrateFromUrl(urlValue: string): void {
    const config = this.activeConfig!;

    // Deserialize URL to partial items
    const partialItems = config.selection.deserializer(urlValue);

    // Generate keys from partial items
    const keyGenerator =
      config.selection.keyGenerator || config.row.keyGenerator;
    const keys = partialItems.map(item => keyGenerator(item as T));

    if (this.state.dataLoaded) {
      // Data already loaded, hydrate immediately
      this.hydrateSelections(keys);
    } else {
      // Data not loaded yet, store for pending hydration
      this.state.pendingHydration = keys;
    }

    this.cdr.markForCheck();
  }

  /**
   * Hydrate selections with loaded data
   */
  private hydrateSelections(keys: string[]): void {
    const config = this.activeConfig!;

    this.state.selectedKeys.clear();
    this.state.selectedItems = [];

    // Find matching items in loaded data
    keys.forEach(key => {
      const item = this.state.data.find(
        row => config.row.keyGenerator(row) === key
      );

      if (item) {
        this.state.selectedKeys.add(key);
        this.state.selectedItems.push(item);
      } else {
        // Key exists in URL but item not in current data
        // Keep in selectedKeys for display
        this.state.selectedKeys.add(key);
      }
    });

    this.cdr.markForCheck();
  }

  /**
   * Load data from API
   */
  private loadData(): void {
    const config = this.activeConfig!;
    this.state.loading = true;
    this.state.error = null;
    this.cdr.markForCheck();

    const params: PickerApiParams = {
      page: this.state.currentPage,
      size: this.state.pageSize,
      search: this.state.searchTerm || undefined,
      sortField: this.state.sortField,
      sortOrder: this.state.sortOrder
    };

    // Apply param mapper if provided
    const apiParams = config.api.paramMapper
      ? config.api.paramMapper(params)
      : params;

    config.api
      .fetchData(apiParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          const transformed = config.api.responseTransformer(response);

          this.state.data = transformed.results;
          this.state.totalCount = transformed.total;
          this.state.loading = false;
          this.state.dataLoaded = true;

          // Hydrate pending selections
          if (this.state.pendingHydration.length > 0) {
            this.hydrateSelections(this.state.pendingHydration);
            this.state.pendingHydration = [];
          }

          this.cdr.markForCheck();
        },
        error: error => {
          this.state.loading = false;
          this.state.error = error;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Handle row selection change
   */
  onRowSelectionChange(row: T, checked: boolean): void {
    const key = this.activeConfig!.row.keyGenerator(row);

    if (checked) {
      this.state.selectedKeys.add(key);
      this.state.selectedItems.push(row);
    } else {
      this.state.selectedKeys.delete(key);
      this.state.selectedItems = this.state.selectedItems.filter(
        item => this.activeConfig!.row.keyGenerator(item) !== key
      );
    }

    this.cdr.markForCheck();
    this.emitSelectionChange();
  }

  /**
   * Handle "select all" checkbox
   */
  onSelectAll(checked: boolean): void {
    if (checked) {
      // Add all visible rows to selection
      this.state.data.forEach(row => {
        const key = this.activeConfig!.row.keyGenerator(row);
        if (!this.state.selectedKeys.has(key)) {
          this.state.selectedKeys.add(key);
          this.state.selectedItems.push(row);
        }
      });
    } else {
      // Remove all visible rows from selection
      this.state.data.forEach(row => {
        const key = this.activeConfig!.row.keyGenerator(row);
        this.state.selectedKeys.delete(key);
      });

      // Update selectedItems
      this.state.selectedItems = this.state.selectedItems.filter(item => {
        const key = this.activeConfig!.row.keyGenerator(item);
        return this.state.selectedKeys.has(key);
      });
    }

    this.cdr.markForCheck();
    this.emitSelectionChange();
  }

  /**
   * Handle pagination change
   */
  onPageChange(event: any): void {
    this.state.currentPage = event.first / event.rows;
    this.state.pageSize = event.rows;
    this.loadData();
  }

  /**
   * Handle search input
   */
  onSearch(term: string): void {
    this.state.searchTerm = term;
    this.state.currentPage = 0; // Reset to first page
    this.loadData();
  }

  /**
   * Handle sort change
   */
  onSort(event: any): void {
    this.state.sortField = event.sortField;
    this.state.sortOrder = event.sortOrder;
    this.loadData();
  }

  /**
   * Check if row is selected
   */
  isRowSelected(row: T): boolean {
    const key = this.activeConfig!.row.keyGenerator(row);
    return this.state.selectedKeys.has(key);
  }

  /**
   * Check if all visible rows are selected
   */
  get allVisibleSelected(): boolean {
    if (this.state.data.length === 0) {
      return false;
    }

    return this.state.data.every(row => this.isRowSelected(row));
  }

  /**
   * Emit selection change event
   */
  private emitSelectionChange(): void {
    const config = this.activeConfig!;
    const urlValue = config.selection.serializer(this.state.selectedItems);

    const event: PickerSelectionEvent<T> = {
      pickerId: config.id,
      selections: this.state.selectedItems,
      selectedKeys: Array.from(this.state.selectedKeys),
      urlValue
    };

    this.selectionChange.emit(event);
  }

  /**
   * Apply selections (update URL)
   */
  applySelections(): void {
    const config = this.activeConfig!;
    const urlValue = config.selection.serializer(this.state.selectedItems);

    this.urlState.setParam(config.selection.urlParam, urlValue || null);
  }

  /**
   * Clear all selections
   */
  clearSelections(): void {
    this.state.selectedKeys.clear();
    this.state.selectedItems = [];
    this.cdr.markForCheck();
    this.emitSelectionChange();
  }

  /**
   * Convert field key to string for PrimeNG bindings
   *
   * PrimeNG expects string field names, but TypeScript's keyof T
   * can be string | number | symbol. This helper ensures proper type.
   */
  fieldToString(field: keyof T): string {
    return String(field);
  }
}
