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
 *           Used internally to map filter changes to state updates. Example: "manufacturer"
 *
 * @property {string} label - Display label for the filter field shown in the Query Control component.
 *           Example: "Manufacturer", "Model", "Year Range"
 *
 * @property {('multiselect'|'range'|'text'|'date')} type - Filter type determines the UI component rendered:
 *           - `'multiselect'`: Multi-select dropdown with search (uses FilterOption[])
 *           - `'range'`: Min/max numeric or date range picker
 *           - `'text'`: Text input with optional pattern validation
 *           - `'date'`: Date picker component
 *
 * @property {string} [optionsEndpoint] - Optional API endpoint URL for fetching multiselect filter options.
 *           Server returns array of FilterOption with value, label, and optional count.
 *           Example: "/agg/manufacturers" endpoint returns { values: [...FilterOption[]] }
 *
 * @property {Function} [optionsTransformer] - Optional transformer function to convert API response to FilterOption[].
 *           Signature: `(response: any) => FilterOption[]`
 *           Applied after fetching from optionsEndpoint to normalize the response format.
 *
 * @property {(string|{min:string, max:string})} urlParams - URL parameter name(s) for state synchronization.
 *           - String for single parameter: "manufacturer" (URL: ?manufacturer=value)
 *           - Object for range filters: { min: "yearMin", max: "yearMax" } (URL: ?yearMin=1990&yearMax=2020)
 *
 * @property {string} [searchPlaceholder] - Optional placeholder text displayed in the search box.
 *           Example: "Search manufacturer..." or "Type to filter..."
 *
 * @property {string} [dialogSubtitle] - Optional subtitle text shown in the filter dialog/modal.
 *           Provides additional context or instructions for the user.
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
  field: keyof T;
  label: string;
  type: 'multiselect' | 'range' | 'text' | 'date';
  optionsEndpoint?: string;
  optionsTransformer?: (response: any) => FilterOption[];
  urlParams: string | { min: string; max: string };
  searchPlaceholder?: string;
  dialogSubtitle?: string;
}

/**
 * Option for multiselect filters
 *
 * @interface FilterOption
 *
 * @property {(string|number)} value - The actual value for this option. Used as the data value when selected.
 *           Examples: "Toyota", "2020", "5000"
 *
 * @property {string} label - Display text shown to the user in the multiselect dropdown.
 *           Examples: "Toyota (45)", "Year 2020", "Price $5000-$10000"
 *
 * @property {number} [count] - Optional count of items matching this option value.
 *           Used for display purposes (e.g., "Toyota (45 vehicles)"). Useful for aggregation results.
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
  value: string | number;
  label: string;
  count?: number;
}
