/**
 * Filter Definition Interface
 *
 * Defines the structure for filterable fields in the Query Control component.
 * This is domain-agnostic and works with any domain configuration.
 */

/**
 * Defines a filterable field in the domain
 */
export interface FilterDefinition<T = any> {
  /** Unique field identifier (matches filter model property) */
  field: keyof T;

  /** Display label for filter field */
  label: string;

  /** Filter type */
  type: 'multiselect' | 'range' | 'text' | 'date';

  /** API endpoint to fetch filter options (for multiselect) */
  optionsEndpoint?: string;

  /** Transform API response to option list */
  optionsTransformer?: (response: any) => FilterOption[];

  /** URL parameter name(s) */
  urlParams: string | { min: string; max: string };

  /** Placeholder text for search box */
  searchPlaceholder?: string;

  /** Subtitle text shown in dialog */
  dialogSubtitle?: string;
}

/**
 * Option for multiselect filters
 */
export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}
