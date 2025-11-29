import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DomainConfig } from '../../models/domain-config.interface';
import {
  FilterDefinition,
  FilterOption
} from '../../models/filter-definition.interface';
import { ApiService } from '../../services/api.service';
import { ResourceManagementService } from '../../services/resource-management.service';
import { UrlStateService } from '../../services/url-state.service';

/**
 * Active filter representation
 */
interface ActiveFilter {
  definition: FilterDefinition;
  values: (string | number)[];
  urlValue: string;
}

/**
 * Query Control Component
 *
 * Provides a manual filter management interface allowing users to:
 * - Select filterable fields from a dropdown
 * - Add filters via modal dialogs (multiselect or range)
 * - View active filters as chips
 * - Edit or remove existing filters
 * - Sync all state with URL parameters
 *
 * This component is DOMAIN-AGNOSTIC and works with any domain configuration.
 * All filter definitions come from DomainConfig.filters.
 *
 * Architecture:
 * - PrimeNG-First: Uses PrimeNG Dialog, Dropdown, Checkbox directly
 * - URL-First: All state changes via UrlStateService
 * - OnPush: Requires manual change detection via ChangeDetectorRef
 *
 * @example
 * ```html
 * <app-query-control [domainConfig]="domainConfig"></app-query-control>
 * ```
 */
@Component({
  selector: 'app-query-control',
  templateUrl: './query-control.component.html',
  styleUrls: ['./query-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryControlComponent<TFilters = any, TData = any, TStatistics = any>
  implements OnInit, OnDestroy {

  /** Domain configuration with filter definitions */
  @Input() domainConfig!: DomainConfig<TFilters, TData, TStatistics>;

  /** Emits when URL parameters should be updated */
  @Output() urlParamsChange = new EventEmitter<{ [key: string]: any }>();

  /** Emits when all filters should be cleared (parent should call urlState.clearParams()) */
  @Output() clearAllFilters = new EventEmitter<void>();

  // ==================== Dropdown State ====================

  /** Filter field options for dropdown */
  filterFieldOptions: { label: string; value: FilterDefinition }[] = [];

  /** Currently selected field (temporary selection) */
  selectedField: FilterDefinition | null = null;

  /** Whether we're currently editing a highlight filter (vs regular filter) */
  isHighlightFilter = false;

  // ==================== Active Filters ====================

  /** List of currently active filters */
  activeFilters: ActiveFilter[] = [];

  /** List of currently active highlight filters */
  activeHighlights: ActiveFilter[] = [];

  // ==================== Dialog State ====================

  /** Whether multiselect dialog is visible */
  showMultiselectDialog = false;

  /** Whether year range dialog is visible */
  showYearRangeDialog = false;

  /** Current filter definition being edited */
  currentFilterDef: FilterDefinition | null = null;

  /** Dialog title for multiselect */
  multiselectDialogTitle = '';

  /** Dialog subtitle for multiselect */
  multiselectDialogSubtitle = '';

  // ==================== Multiselect Dialog Data ====================

  /** Whether options are being loaded */
  loadingOptions = false;

  /** Error message if options failed to load */
  optionsError: string | null = null;

  /** All available options from API */
  allOptions: FilterOption[] = [];

  /** Filtered options based on search */
  filteredOptions: FilterOption[] = [];

  /** Currently selected option values */
  selectedOptions: (string | number)[] = [];

  /** Search query for filtering options */
  searchQuery = '';

  // ==================== Year Range Dialog Data ====================

  /** Minimum year value */
  yearMin: number | null = null;

  /** Maximum year value */
  yearMax: number | null = null;

  /** Available year range from API */
  availableYearRange: { min: number; max: number } = { min: 1900, max: 2025 };

  // ==================== Lifecycle ====================

  private destroy$ = new Subject<void>();

  constructor(
    private urlState: UrlStateService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    @Optional() private resourceService?: ResourceManagementService<any, any, any>
  ) {}

  ngOnInit(): void {
    // Build filter field dropdown options from domain config (regular filters only)
    // Highlight filters are NOT included in dropdown - they're added via chart interactions
    this.filterFieldOptions = this.domainConfig.queryControlFilters.map(f => ({
      label: f.label,
      value: f
    }));

    console.log('QueryControl: Filter field options:', this.filterFieldOptions);

    // Subscribe to filter changes for chip synchronization
    //
    // Architecture: Works in both main window and pop-out
    // - Main window: URL → ResourceManagementService.filters$ → chip sync
    // - Pop-out: BroadcastChannel → ResourceManagementService.filters$ → chip sync
    // - Single subscription works for both cases!
    if (this.resourceService) {
      // Use ResourceManagementService.filters$ (works in pop-outs)
      this.resourceService.filters$
        .pipe(takeUntil(this.destroy$))
        .subscribe(filters => {
          // Convert filters object to params format for syncFiltersFromUrl
          // (syncFiltersFromUrl expects params format, filters$ provides filter object)
          const params = { ...filters };
          this.syncFiltersFromUrl(params);
          this.cdr.markForCheck();
        });
    } else {
      // Fallback: watch URL params directly (legacy mode)
      this.urlState.params$
        .pipe(takeUntil(this.destroy$))
        .subscribe(params => {
          this.syncFiltersFromUrl(params);
          this.cdr.markForCheck();
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== Field Selection ====================

  /**
   * User selected a field from dropdown
   */
  onFieldSelected(event: any): void {
    console.log('QueryControl: Field selected:', event);
    const filterDef: FilterDefinition = event.value;
    console.log('QueryControl: Filter definition:', filterDef);
    this.currentFilterDef = filterDef;

    // Determine if this is a highlight filter by checking if urlParams starts with 'h_'
    this.isHighlightFilter = this.isHighlightFilterDef(filterDef);

    if (filterDef.type === 'multiselect') {
      this.openMultiselectDialog(filterDef);
    } else if (filterDef.type === 'range') {
      this.openYearRangeDialog(filterDef);
    }

    // Reset dropdown selection
    this.selectedField = null;
    this.cdr.markForCheck();
  }

  /**
   * Check if a filter definition is a highlight filter
   */
  private isHighlightFilterDef(filterDef: FilterDefinition): boolean {
    if (typeof filterDef.urlParams === 'string') {
      return filterDef.urlParams.startsWith('h_');
    } else if (typeof filterDef.urlParams === 'object') {
      // For range filters, check if min param starts with 'h_'
      return filterDef.urlParams.min?.startsWith('h_') || false;
    }
    return false;
  }

  // ==================== Multiselect Dialog ====================

  /**
   * Open multiselect dialog and load options
   */
  private openMultiselectDialog(filterDef: FilterDefinition): void {
    this.multiselectDialogTitle = `Select ${filterDef.label}`;
    this.multiselectDialogSubtitle = filterDef.dialogSubtitle ||
      `Select one or more ${filterDef.label.toLowerCase()} values to filter results.`;
    this.searchQuery = '';
    this.selectedOptions = [];
    this.loadingOptions = true;
    this.optionsError = null;
    this.showMultiselectDialog = true;
    this.cdr.markForCheck();

    // Check if editing existing filter (check both regular filters and highlights)
    const filterList = this.isHighlightFilter ? this.activeHighlights : this.activeFilters;
    const existingFilter = filterList.find(f => f.definition.field === filterDef.field);
    if (existingFilter) {
      this.selectedOptions = [...existingFilter.values];
    }

    // Load options from API
    if (filterDef.optionsEndpoint) {
      this.apiService.get(filterDef.optionsEndpoint).subscribe({
        next: (response) => {
          this.allOptions = filterDef.optionsTransformer?.(response) || [];
          this.filteredOptions = [...this.allOptions];
          this.loadingOptions = false;
          this.optionsError = null;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load filter options:', error);
          this.loadingOptions = false;
          this.optionsError = 'Failed to load options. Please try again.';
          this.cdr.markForCheck();
        }
      });
    }
  }

  /**
   * Search options in multiselect dialog
   */
  onSearchChange(query: string): void {
    const lowerQuery = query.toLowerCase();
    this.filteredOptions = this.allOptions.filter(opt =>
      opt.label.toLowerCase().includes(lowerQuery)
    );
    this.cdr.markForCheck();
  }

  /**
   * Retry loading options after error
   */
  retryLoadOptions(): void {
    if (this.currentFilterDef) {
      this.openMultiselectDialog(this.currentFilterDef);
    }
  }

  /**
   * Apply multiselect filter
   */
  applyFilter(): void {
    if (!this.currentFilterDef || this.selectedOptions.length === 0) {
      // Close dialog without applying if no selections
      this.cancelDialog();
      return;
    }

    // Update URL with new filter and reset pagination
    const paramName = this.currentFilterDef.urlParams as string;
    const paramValue = this.selectedOptions.join(',');

    this.urlParamsChange.emit({
      [paramName]: paramValue,
      page: 1 // Reset to first page when filter changes (1-indexed)
    });

    this.showMultiselectDialog = false;
    this.currentFilterDef = null;
    this.cdr.markForCheck();
  }

  // ==================== Year Range Dialog ====================

  /**
   * Open year range dialog
   */
  private openYearRangeDialog(filterDef: FilterDefinition): void {
    this.showYearRangeDialog = true;
    this.yearMin = null;
    this.yearMax = null;
    this.cdr.markForCheck();

    // Check if editing existing filter
    const params = this.urlState.getParams();
    const urlParamsConfig = filterDef.urlParams as { min: string; max: string };

    if (params[urlParamsConfig.min]) {
      this.yearMin = parseInt(params[urlParamsConfig.min], 10);
    }
    if (params[urlParamsConfig.max]) {
      this.yearMax = parseInt(params[urlParamsConfig.max], 10);
    }

    // Load available year range from API if endpoint provided
    if (filterDef.optionsEndpoint) {
      this.apiService.get(filterDef.optionsEndpoint).subscribe({
        next: (response: any) => {
          if (response && response.min && response.max) {
            this.availableYearRange = { min: response.min, max: response.max };
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load year range:', error);
          // Use defaults if API fails
          this.cdr.markForCheck();
        }
      });
    }
  }

  /**
   * Apply year range filter
   */
  applyYearRange(): void {
    if (!this.currentFilterDef) {
      return;
    }

    const urlParamsConfig = this.currentFilterDef.urlParams as { min: string; max: string };
    const params: any = {
      page: 1 // Reset to first page when year range changes (1-indexed)
    };

    if (this.yearMin !== null) {
      params[urlParamsConfig.min] = this.yearMin.toString();
    }
    if (this.yearMax !== null) {
      params[urlParamsConfig.max] = this.yearMax.toString();
    }

    // Emit URL params (page reset is always included)
    this.urlParamsChange.emit(params);

    this.showYearRangeDialog = false;
    this.currentFilterDef = null;
    this.cdr.markForCheck();
  }

  // ==================== Dialog Management ====================

  /**
   * Cancel dialog without applying changes
   */
  cancelDialog(): void {
    this.showMultiselectDialog = false;
    this.showYearRangeDialog = false;
    this.currentFilterDef = null;
    this.selectedOptions = [];
    this.searchQuery = '';
    this.yearMin = null;
    this.yearMax = null;
    this.optionsError = null;
    this.cdr.markForCheck();
  }

  /**
   * Handle dialog hide event
   */
  onDialogHide(): void {
    // Cleanup when dialog closes
    this.currentFilterDef = null;
    this.optionsError = null;
  }

  // ==================== Filter Chip Management ====================

  /**
   * Remove filter chip
   */
  removeFilter(filter: ActiveFilter): void {
    if (filter.definition.type === 'range') {
      // For range filters, clear both min and max params and reset pagination
      const urlParamsConfig = filter.definition.urlParams as { min: string; max: string };
      this.urlParamsChange.emit({
        [urlParamsConfig.min]: null,
        [urlParamsConfig.max]: null,
        page: 1 // Reset to first page when filter removed (1-indexed)
      } as any);
    } else {
      const paramName = filter.definition.urlParams as string;
      this.urlParamsChange.emit({
        [paramName]: null,
        page: 1 // Reset to first page when filter removed (1-indexed)
      } as any);
    }
  }

  /**
   * Edit existing filter
   */
  editFilter(filter: ActiveFilter): void {
    this.currentFilterDef = filter.definition;
    this.isHighlightFilter = false; // Regular filter

    if (filter.definition.type === 'multiselect') {
      this.openMultiselectDialog(filter.definition);
    } else if (filter.definition.type === 'range') {
      this.openYearRangeDialog(filter.definition);
    }
  }

  /**
   * Edit existing highlight filter
   */
  editHighlight(filter: ActiveFilter): void {
    this.currentFilterDef = filter.definition;
    this.isHighlightFilter = true; // Highlight filter

    if (filter.definition.type === 'multiselect') {
      this.openMultiselectDialog(filter.definition);
    } else if (filter.definition.type === 'range') {
      this.openYearRangeDialog(filter.definition);
    }
  }

  /**
   * Remove highlight filter chip
   */
  removeHighlight(filter: ActiveFilter): void {
    if (filter.definition.type === 'range') {
      // For range filters, clear both min and max params and reset pagination
      const urlParamsConfig = filter.definition.urlParams as { min: string; max: string };
      this.urlParamsChange.emit({
        [urlParamsConfig.min]: null,
        [urlParamsConfig.max]: null,
        page: 1 // Reset to first page when filter removed (1-indexed)
      } as any);
    } else {
      const paramName = filter.definition.urlParams as string;
      this.urlParamsChange.emit({
        [paramName]: null,
        page: 1 // Reset to first page when filter removed (1-indexed)
      } as any);
    }
  }

  /**
   * Clear all highlight filters
   */
  clearAllHighlights(): void {
    if (this.activeHighlights.length === 0) {
      return; // Nothing to clear
    }

    const params: any = { page: 1 }; // Reset to first page

    // Collect all highlight URL params to clear
    for (const highlight of this.activeHighlights) {
      if (highlight.definition.type === 'range') {
        const urlParamsConfig = highlight.definition.urlParams as { min: string; max: string };
        params[urlParamsConfig.min] = null;
        params[urlParamsConfig.max] = null;
      } else {
        const paramName = highlight.definition.urlParams as string;
        params[paramName] = null;
      }
    }

    this.urlParamsChange.emit(params);
  }

  /**
   * Clear all filters (both regular filters AND highlights)
   *
   * Emits clearAllFilters event - parent component handles by calling urlState.clearParams()
   */
  clearAll(): void {
    this.clearAllFilters.emit();
  }

  /**
   * Check if there are any active filters or highlights
   */
  hasActiveFiltersOrHighlights(): boolean {
    return this.activeFilters.length > 0 || this.activeHighlights.length > 0;
  }

  // ==================== URL Sync ====================

  /**
   * Sync active filters from URL params
   */
  private syncFiltersFromUrl(params: any): void {
    this.activeFilters = [];
    this.activeHighlights = [];

    // Sync regular filters
    for (const filterDef of this.domainConfig.queryControlFilters) {
      this.syncFilterFromUrl(params, filterDef, this.activeFilters);
    }

    // Sync highlight filters
    if (this.domainConfig.highlightFilters) {
      for (const filterDef of this.domainConfig.highlightFilters) {
        this.syncFilterFromUrl(params, filterDef, this.activeHighlights);
      }
    }
  }

  /**
   * Sync a single filter from URL params
   */
  private syncFilterFromUrl(params: any, filterDef: FilterDefinition, targetArray: ActiveFilter[]): void {
    if (filterDef.type === 'range') {
      // Handle range filters (yearMin, yearMax or h_yearMin, h_yearMax)
      const urlParamsConfig = filterDef.urlParams as { min: string; max: string };
      const minValue = params[urlParamsConfig.min];
      const maxValue = params[urlParamsConfig.max];

      if (minValue || maxValue) {
        const values: (string | number)[] = [];
        if (minValue) values.push(minValue);
        if (maxValue) values.push(maxValue);

        targetArray.push({
          definition: filterDef,
          values: values,
          urlValue: `${minValue || ''}-${maxValue || ''}`
        });
      }
    } else {
      // Handle multiselect/text filters
      const paramName = filterDef.urlParams as string;
      const paramValue = params[paramName];

      if (paramValue) {
        // Handle both string and array values (array can come from multiselect)
        const values = Array.isArray(paramValue)
          ? paramValue
          : paramValue.split(',');
        const urlValue = Array.isArray(paramValue)
          ? paramValue.join(',')
          : paramValue;
        targetArray.push({
          definition: filterDef,
          values: values,
          urlValue: urlValue
        });
      }
    }
  }

  // ==================== Display Helpers ====================

  /**
   * Get chip label for display
   */
  getChipLabel(filter: ActiveFilter): string {
    if (filter.definition.type === 'range') {
      const values = filter.values;
      if (values.length === 2) {
        return `${filter.definition.label}: ${values[0]} - ${values[1]}`;
      } else if (values.length === 1) {
        return `${filter.definition.label}: ${values[0]}`;
      }
      return `${filter.definition.label}`;
    }

    // For multiselect, truncate if too many values
    const displayValues = filter.values.slice(0, 3).join(', ');
    const remaining = filter.values.length - 3;
    return remaining > 0
      ? `${filter.definition.label}: ${displayValues}... +${remaining}`
      : `${filter.definition.label}: ${displayValues}`;
  }

  /**
   * Get chip tooltip
   */
  getChipTooltip(filter: ActiveFilter): string {
    return `${filter.definition.label}: ${filter.values.join(', ')} (Click to edit)`;
  }

  /**
   * Get selection summary for dialog footer
   */
  getSelectionSummary(): string {
    const summary = this.selectedOptions.slice(0, 3).join(', ');
    return this.selectedOptions.length > 3
      ? `${summary}...`
      : summary;
  }
}
