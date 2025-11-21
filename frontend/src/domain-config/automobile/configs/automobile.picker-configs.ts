/**
 * Automobile Domain - Picker Configurations
 *
 * Defines picker components for selecting related data.
 * Pickers are modal dialogs with searchable tables for multi-select.
 *
 * Domain: Automobile Discovery
 */

import { PickerConfig } from '../../../framework/models/picker-config.interface';

/**
 * Automobile picker configurations
 *
 * Array of picker definitions for selecting related entities.
 * Currently empty - add pickers as needed for the application.
 *
 * Example picker types:
 * - Manufacturer picker (select from list of manufacturers)
 * - Body class picker (select from list of body classes)
 * - Year picker (select from available years)
 *
 * @example
 * ```typescript
 * // Example manufacturer picker configuration
 * {
 *   id: 'manufacturer-picker',
 *   displayName: 'Select Manufacturer',
 *   columns: [
 *     {
 *       field: 'name',
 *       header: 'Manufacturer',
 *       sortable: true,
 *       filterable: true,
 *       width: '200px'
 *     },
 *     {
 *       field: 'vehicle_count',
 *       header: 'Vehicle Count',
 *       sortable: true,
 *       width: '150px'
 *     }
 *   ],
 *   api: {
 *     endpoint: '/manufacturers',
 *     method: 'GET',
 *     dataKey: 'results'
 *   },
 *   row: {
 *     dataKey: 'name',
 *     displayTemplate: '{{name}} ({{vehicle_count}} vehicles)'
 *   },
 *   selection: {
 *     mode: 'multiple',
 *     showSelectedCount: true,
 *     maxSelections: 10
 *   },
 *   pagination: {
 *     enabled: true,
 *     rows: 10,
 *     rowsPerPageOptions: [10, 20, 50]
 *   }
 * }
 * ```
 */
export const AUTOMOBILE_PICKER_CONFIGS: PickerConfig<any>[] = [
  // TODO: Add picker configurations as needed
  // Examples:
  // - manufacturerPicker
  // - bodyClassPicker
  // - yearPicker
];

/**
 * Manufacturer picker configuration (placeholder)
 *
 * Uncomment and implement when manufacturer picker is needed
 */
/*
export const MANUFACTURER_PICKER_CONFIG: PickerConfig<any> = {
  id: 'manufacturer-picker',
  displayName: 'Select Manufacturer',
  columns: [
    {
      field: 'name',
      header: 'Manufacturer',
      sortable: true,
      filterable: true,
      width: '200px'
    },
    {
      field: 'vehicle_count',
      header: 'Vehicles',
      sortable: true,
      width: '100px'
    },
    {
      field: 'instance_count',
      header: 'VINs',
      sortable: true,
      width: '100px'
    }
  ],
  api: {
    endpoint: '/manufacturers',
    method: 'GET',
    dataKey: 'results'
  },
  row: {
    dataKey: 'name',
    displayTemplate: '{{name}}'
  },
  selection: {
    mode: 'multiple',
    showSelectedCount: true,
    maxSelections: 10
  },
  pagination: {
    enabled: true,
    rows: 10,
    rowsPerPageOptions: [10, 20, 50]
  }
};
*/

/**
 * Body class picker configuration (placeholder)
 *
 * Uncomment and implement when body class picker is needed
 */
/*
export const BODY_CLASS_PICKER_CONFIG: PickerConfig<any> = {
  id: 'body-class-picker',
  displayName: 'Select Body Class',
  columns: [
    {
      field: 'name',
      header: 'Body Class',
      sortable: true,
      filterable: true,
      width: '150px'
    },
    {
      field: 'vehicle_count',
      header: 'Vehicles',
      sortable: true,
      width: '100px'
    }
  ],
  api: {
    endpoint: '/body-classes',
    method: 'GET',
    dataKey: 'results'
  },
  row: {
    dataKey: 'name',
    displayTemplate: '{{name}}'
  },
  selection: {
    mode: 'multiple',
    showSelectedCount: true,
    maxSelections: 5
  },
  pagination: {
    enabled: false
  }
};
*/

/**
 * Picker helper functions
 */
export const AUTOMOBILE_PICKER_HELPERS = {
  /**
   * Get picker by ID
   */
  getPickerById: (id: string): PickerConfig<any> | undefined => {
    return AUTOMOBILE_PICKER_CONFIGS.find((picker) => picker.id === id);
  },

  /**
   * Get all picker IDs
   */
  getAllPickerIds: (): string[] => {
    return AUTOMOBILE_PICKER_CONFIGS.map((picker) => picker.id);
  }
};
