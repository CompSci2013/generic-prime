/**
 * Automobile Domain - Filter Definitions
 *
 * Defines query control filters for the automobile discovery interface.
 * These are UI filters that users can interact with to refine their search.
 *
 * Domain: Automobile Discovery
 */

import { FilterDefinition } from '../../../framework/models/domain-config.interface';

/**
 * Automobile filter definitions
 *
 * Array of filter controls for the query panel.
 * Users can combine these filters to search for specific vehicles.
 *
 * @example
 * ```typescript
 * <div class="filter-panel">
 *   <app-filter-control
 *     *ngFor="let filter of AUTOMOBILE_FILTER_DEFINITIONS"
 *     [definition]="filter"
 *     [(value)]="filterValues[filter.id]">
 *   </app-filter-control>
 * </div>
 * ```
 */
export const AUTOMOBILE_FILTER_DEFINITIONS: FilterDefinition[] = [
  /**
   * Manufacturer filter
   */
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    type: 'text',
    placeholder: 'Enter manufacturer name...',
    operators: ['contains', 'equals', 'startsWith'],
    defaultOperator: 'contains',
    validation: {
      minLength: 1,
      maxLength: 100
    }
  },

  /**
   * Model filter
   */
  {
    id: 'model',
    label: 'Model',
    type: 'text',
    placeholder: 'Enter model name...',
    operators: ['contains', 'equals', 'startsWith'],
    defaultOperator: 'contains',
    validation: {
      minLength: 1,
      maxLength: 100
    }
  },

  /**
   * Year range filter
   *
   * Uses format.number.useGrouping: false to prevent thousand separators
   * (displays "1980" instead of "1,980")
   */
  {
    id: 'yearRange',
    label: 'Year Range',
    type: 'range',
    min: 1900,
    max: new Date().getFullYear() + 1, // Include next year for upcoming models
    step: 1,
    format: {
      number: {
        useGrouping: false, // No commas in years
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }
    }
  },

  /**
   * Body class filter
   *
   * Uses caseSensitive: false and transform: 'titlecase' to handle
   * user input like "coupe", "COUPE", or "Coupe" consistently
   */
  {
    id: 'bodyClass',
    label: 'Body Class',
    type: 'select',
    placeholder: 'Select body class...',
    format: {
      caseSensitive: false, // Match "Coupe", "coupe", "COUPE" equally
      transform: 'titlecase' // Normalize to "Coupe" format
    },
    options: [
      { value: 'Sedan', label: 'Sedan' },
      { value: 'SUV', label: 'SUV' },
      { value: 'Truck', label: 'Truck' },
      { value: 'Coupe', label: 'Coupe' },
      { value: 'Wagon', label: 'Wagon' },
      { value: 'Van', label: 'Van' },
      { value: 'Minivan', label: 'Minivan' },
      { value: 'Convertible', label: 'Convertible' },
      { value: 'Hatchback', label: 'Hatchback' }
    ]
  },

  /**
   * Instance count range filter
   *
   * Uses format.number.useGrouping: true to show thousand separators
   * (displays "1,000" instead of "1000")
   */
  {
    id: 'instanceCountRange',
    label: 'VIN Count Range',
    type: 'range',
    min: 0,
    max: 10000,
    step: 1,
    format: {
      number: {
        useGrouping: true, // Show commas for VIN counts
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }
    }
  },

  /**
   * Global search filter
   */
  {
    id: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search manufacturer, model, or body class...',
    operators: ['contains'],
    defaultOperator: 'contains',
    validation: {
      minLength: 1,
      maxLength: 200
    }
  }
];

/**
 * Quick filter presets
 *
 * Predefined filter combinations for common searches
 */
export const AUTOMOBILE_QUICK_FILTERS = {
  /**
   * Recent vehicles (last 5 years)
   */
  recent: {
    label: 'Recent Vehicles',
    filters: {
      yearMin: new Date().getFullYear() - 5,
      yearMax: new Date().getFullYear()
    }
  },

  /**
   * Popular vehicles (high instance count)
   */
  popular: {
    label: 'Popular Vehicles',
    filters: {
      instanceCountMin: 100
    }
  },

  /**
   * Classic vehicles (pre-2000)
   */
  classic: {
    label: 'Classic Vehicles',
    filters: {
      yearMax: 2000
    }
  },

  /**
   * SUVs only
   */
  suvs: {
    label: 'SUVs',
    filters: {
      bodyClass: 'SUV'
    }
  },

  /**
   * Trucks only
   */
  trucks: {
    label: 'Trucks',
    filters: {
      bodyClass: 'Truck'
    }
  },

  /**
   * Sedans only
   */
  sedans: {
    label: 'Sedans',
    filters: {
      bodyClass: 'Sedan'
    }
  }
};

/**
 * Filter groups
 *
 * Organize filters into logical groups for better UX
 */
export const AUTOMOBILE_FILTER_GROUPS = {
  /**
   * Vehicle identification filters
   */
  identification: {
    label: 'Vehicle Identification',
    filters: ['manufacturer', 'model', 'bodyClass']
  },

  /**
   * Time-based filters
   */
  temporal: {
    label: 'Year',
    filters: ['yearRange']
  },

  /**
   * Quantity filters
   */
  quantity: {
    label: 'VIN Count',
    filters: ['instanceCountRange']
  },

  /**
   * General search
   */
  general: {
    label: 'General Search',
    filters: ['search']
  }
};

/**
 * Filter validation rules
 *
 * Additional validation beyond basic type validation
 */
export const AUTOMOBILE_FILTER_VALIDATION = {
  /**
   * Validate year range
   */
  yearRange: (min: number, max: number): boolean => {
    if (min && max && min > max) {
      return false; // Min cannot be greater than max
    }
    const currentYear = new Date().getFullYear();
    if (min && (min < 1900 || min > currentYear + 1)) {
      return false; // Year out of valid range
    }
    if (max && (max < 1900 || max > currentYear + 1)) {
      return false; // Year out of valid range
    }
    return true;
  },

  /**
   * Validate instance count range
   */
  instanceCountRange: (min: number, max: number): boolean => {
    if (min && max && min > max) {
      return false; // Min cannot be greater than max
    }
    if (min && min < 0) {
      return false; // Cannot be negative
    }
    if (max && max < 0) {
      return false; // Cannot be negative
    }
    return true;
  }
};
