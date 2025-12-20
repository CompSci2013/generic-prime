/**
 * Filter Definition Interface
 *
 * Defines the structure for filterable fields in the Query Control component.
 * This is domain-agnostic and works with any domain configuration.
 */

/**
 * Defines a filterable field in the domain
 *
 * @interface FilterDefinition
 * @template T - The filter model type that contains these fields
 *
 * @property {keyof T} field - Unique field identifier matching a property in the filter model (T).
 *
 * @property {string} label - Display label for the filter field shown in the Query Control component.
 *
 * @property {('multiselect'|'range'|'text'|'date')} type - Filter type determines the UI component rendered.
 *
 * @property {string} [optionsEndpoint] - Optional API endpoint URL for fetching multiselect filter options.
 *
 * @property {Function} [optionsTransformer] - Optional transformer function to convert API response to FilterOption[].
 *
 * @property {(string|{min:string, max:string})} urlParams - URL parameter name(s) for state synchronization.
 *
 * @property {string} [searchPlaceholder] - Optional placeholder text displayed in the search box.
 *
 * @property {string} [dialogSubtitle] - Optional subtitle text shown in the filter dialog/modal.
 *
 * @remarks
 * **Usage in Domain Config**:
 * FilterDefinition is used in DomainConfig.filters array to define all available filters for a domain.
 * Each filter is rendered by QueryControlComponent with appropriate UI based on the type.
 *
 * **Example**:
 * ```typescript
 * const manufacturerFilter: FilterDefinition<AutoSearchFilters> = {
 *   field: 'manufacturer',
 *   label: 'Manufacturer',
 *   type: 'multiselect',
 *   optionsEndpoint: '/agg/manufacturers',
 *   urlParams: 'manufacturer',
 *   searchPlaceholder: 'Search manufacturers...'
 * };
 * ```
 */
export interface FilterDefinition<T = any> {
  /**
   * Unique field identifier matching a property in the filter model
   */
  field: keyof T;

  /**
   * Display label for the filter field shown in the Query Control component
   */
  label: string;

  /**
   * Filter type determines the UI component rendered
   */
  type: 'multiselect' | 'range' | 'text' | 'date';

  /**
   * Optional API endpoint URL for fetching multiselect filter options
   */
  optionsEndpoint?: string;

  /**
   * Optional transformer function to convert API response to FilterOption[]
   */
  optionsTransformer?: (response: any) => FilterOption[];

  /**
   * URL parameter name(s) for state synchronization
   */
  urlParams: string | { min: string; max: string };

  /**
   * Optional placeholder text displayed in the search box
   */
  searchPlaceholder?: string;

  /**
   * Optional subtitle text shown in the filter dialog/modal
   */
  dialogSubtitle?: string;
}

/**
 * Option for multiselect filters
 *
 * @interface FilterOption
 *
 * @property {(string|number)} value - The actual value for this option. Used as the data value when selected.
 *
 * @property {string} label - Display text shown to the user in the multiselect dropdown.
 *
 * @property {number} [count] - Optional count of items matching this option value.
 *
 * @remarks
 * **Usage**:
 * FilterOption arrays are returned from API endpoints specified in FilterDefinition.optionsEndpoint
 * and rendered as options in multiselect dropdown filters by the QueryControlComponent.
 *
 * **Example Response**:
 * ```typescript
 * // API endpoint returns aggregation of field values with counts
 * {
 *   field: "manufacturer",
 *   values: [
 *     { value: "Toyota", label: "Toyota", count: 150 },
 *     { value: "Honda", label: "Honda", count: 120 },
 *     { value: "BMW", label: "BMW", count: 89 }
 *   ]
 * }
 * ```
 */
export interface FilterOption {
  /**
   * The actual value for this option. Used as the data value when selected
   */
  value: string | number;

  /**
   * Display text shown to the user in the multiselect dropdown
   */
  label: string;

  /**
   * Optional count of items matching this option value
   */
  count?: number;
}
