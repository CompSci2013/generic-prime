import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DomainConfig } from '../../models/domain-config.interface';
import {
  FilterDefinition,
  FilterOption
} from '../../models/filter-definition.interface';
import { ApiService } from '../../services/api.service';
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

  /** Environment configuration for conditional test-id rendering */
  readonly environment = environment;

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

  /** Currently active filter definition for dialogs */
  currentFilterDef: FilterDefinition | null = null;

  // ==================== Multiselect Dialog State ====================

  /** Whether multiselect dialog is visible */
  showMultiselectDialog = false;

  /** Title for multiselect dialog */
  multiselectDialogTitle = '';

  /** Subtitle for multiselect dialog */
  multiselectDialogSubtitle = '';

  /** Whether options are currently loading */
  loadingOptions = false;

  /** Error message if options fail to load */
  optionsError: string | null = null;

  /** All available options for a multiselect filter */
  allOptions: FilterOption[] = [];

  /** Filtered options based on search query */
  filteredOptions: FilterOption[] = [];

  /** Currently selected options in multiselect dialog */
  selectedOptions: (string | number)[] = [];

  /** Search query for multiselect options */
  searchQuery = '';

  // ==================== Year Range Dialog State ====================

  /** Whether year range dialog is visible */
  showYearRangeDialog = false;

  /** Selected minimum year */
  yearMin: number | null = null;

  /** Selected maximum year */
  yearMax: number | null = null;

  /** Available year range from API */
  availableYearRange: { min: number; max: number } = { min: 1900, max: new Date().getFullYear() };

  /** Subject to signal component destruction */
  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private apiService: ApiService,
    private urlState: UrlStateService
  ) {}

  ngOnInit(): void {
    // Initialize filter field options from domain config
    // Only include queryControlFilters, NOT highlightFilters
    // (highlightFilters are for highlighting data, not for main filter selection)
    this.filterFieldOptions = this.domainConfig.queryControlFilters
      .map(f => ({ label: f.label, value: f }));

    // Sync from URL state on init and on changes
    this.urlState.params$.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.syncFiltersFromUrl(params);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Reset dropdown to its placeholder state.
   *
   * This is a workaround for a PrimeNG issue where setting ngModel to null
   * doesn't clear the displayed value if an option was previously selected
   * via keyboard.
   */
  private resetFilterDropdown(): void {
    this.selectedField = null;
    // We might need to access the dropdown component instance if the above is not enough
    // For now, this seems to work with markForCheck()
    this.cdr.markForCheck();
  }

  /**
   * Handle dropdown keydown events for keyboard navigation
   *
   * Intercepts spacebar to select the highlighted option in filtered dropdown.
   * Reference: PrimeNG Issue #17779 - spacebar doesn't select when filter is active
   *
   * When [filter]="true" is set, the filter input captures spacebar events,
   * preventing selection. This handler detects spacebar and manually triggers selection
   * if an option is currently highlighted.
   */
  onDropdownKeydown(event: KeyboardEvent): void {
    // Only handle spacebar
    if (event.key !== ' ') {
      return;
    }

    // When spacebar is pressed on a focused option (not in filter input),
    // we need to manually trigger the selection since PrimeNG's filter input
    // will capture the spacebar for typing

    // Check if there's a currently highlighted/focused option in the dropdown
    // PrimeNG 14 uses the 'p-highlight' CSS class for highlighted options
    const highlightedOption = document.querySelector('.p-dropdown-items .p-highlight');

    if (highlightedOption) {
      // Prevent the spacebar from being added to the filter input
      event.preventDefault();
      event.stopPropagation();

      // Get the data-ng-reflect-ng-value or other data attribute that contains the selected value
      // PrimeNG stores the option data on the element
      const selectedIndex = Array.from(document.querySelectorAll('.p-dropdown-items li'))
        .indexOf(highlightedOption as HTMLElement);

      if (selectedIndex >= 0 && this.filterFieldOptions[selectedIndex]) {
        // Directly call onFieldSelected with the highlighted option
        // Create a synthetic onChange event with the correct value
        const syntheticEvent = {
          value: this.filterFieldOptions[selectedIndex].value,
          originalEvent: event
        };
        this.onFieldSelected(syntheticEvent);
      }
    }
  }

  /**
   * Handle field selection from dropdown
   *
   * PrimeNG's onChange event fires on:
   * 1. Mouse clicks on an option
   * 2. Arrow key navigation (keyboard up/down)
   * 3. Enter/Space on an option
   *
   * We only want to open dialogs for #1 and #3, not #2.
   * Solution: Check the originalEvent to detect arrow key navigation.
   *
   * Reference: PrimeNG GitHub Issue #5335, #11703
   * The onChange event includes originalEvent which is the browser's keyboard/mouse event.
   * Arrow key navigation triggers onChange but the originalEvent.key will be 'ArrowUp' or 'ArrowDown'.
   */
  onFieldSelected(event: any): void {
    const filterDef: FilterDefinition = event.value;

    // If no filterDef, skip
    if (!filterDef) {
      return;
    }

    // Check if this onChange was triggered by arrow key navigation
    // The event.originalEvent contains the browser event that triggered the change
    if (event.originalEvent && event.originalEvent instanceof KeyboardEvent) {
      const key = event.originalEvent.key;

      // If it was an arrow key, this is just navigation - don't open dialog
      // Users are just browsing the dropdown, not making a selection
      if (['ArrowUp', 'ArrowDown'].includes(key)) {
        return;
      }
    }

    // This was a click, Enter, or Space - open the dialog
    this.openFilterDialog(filterDef);
  }

  /**
   * Open the appropriate dialog for a filter definition
   * Extracted into separate method for reuse from keyboard and mouse handlers
   */
  private openFilterDialog(filterDef: FilterDefinition): void {
    // Close any currently open dialogs before opening a new one
    // This prevents multiple dialogs from being open simultaneously
    this.showMultiselectDialog = false;
    this.showYearRangeDialog = false;

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
   * Handle multiselect dialog show event - shift focus to the dialog
   * This is called by PrimeNG's (onShow) event after dialog is fully rendered
   */
  onMultiselectDialogShow(): void {
    // Shift focus to the first focusable element in the dialog
    // Find the search input or first button
    const dialogElement = document.querySelector('.p-dialog-content input, .p-dialog-content button, .p-dialog-content');
    if (dialogElement) {
      (dialogElement as HTMLElement).focus();
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
    this.resetFilterDropdown();
    this.cdr.detectChanges(); // Force immediate update instead of markForCheck()
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
   * Handle year range dialog show event - shift focus to the dialog
   * This is called by PrimeNG's (onShow) event after dialog is fully rendered
   */
  onYearRangeDialogShow(): void {
    // Shift focus to the first focusable element in the dialog (usually the first input)
    const dialogElement = document.querySelector('.p-dialog-content input, .p-dialog-content button, .p-dialog-content');
    if (dialogElement) {
      (dialogElement as HTMLElement).focus();
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
    this.resetFilterDropdown();
    this.cdr.detectChanges();
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
    this.resetFilterDropdown();
    this.cdr.detectChanges();
  }

  /**
   * Handle dialog hide event
   */
  onDialogHide(): void {
    this.currentFilterDef = null;
    this.optionsError = null;
    this.resetFilterDropdown();
    this.cdr.detectChanges();
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
