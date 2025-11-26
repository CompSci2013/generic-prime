/**
 * Automobile Domain - Picker Configurations
 *
 * Defines picker components for selecting related data.
 * Pickers are searchable tables with multi-select capabilities.
 *
 * Domain: Automobile Discovery
 */

import { PickerConfig } from '../../../framework/models/picker-config.interface';
import { Injector } from '@angular/core';
import { ApiService } from '../../../framework/services';
import { environment } from '../../../environments/environment';

/**
 * Manufacturer/Model row data type
 *
 * Represents a manufacturer-model combination with count
 */
export interface ManufacturerModelRow {
  manufacturer: string;
  model: string;
  count: number;
}

/**
 * Create Manufacturer-Model Picker Configuration
 *
 * Factory function that creates picker config with injected dependencies.
 * Allows selection of manufacturer-model combinations for filtering.
 *
 * @param apiService - Injected API service
 * @returns Configured picker
 */
export function createManufacturerModelPickerConfig(
  apiService: ApiService
): PickerConfig<ManufacturerModelRow> {
  return {
    id: 'manufacturer-model-picker',
    displayName: 'Select Manufacturer & Model',

    // Column definitions (PrimeNGColumn format)
    columns: [
      {
        field: 'manufacturer',
        header: 'Manufacturer',
        sortable: true,
        filterable: true,
        width: '40%'
      },
      {
        field: 'model',
        header: 'Model',
        sortable: true,
        filterable: true,
        width: '40%'
      },
      {
        field: 'count',
        header: 'Count',
        sortable: true,
        filterable: false,
        width: '20%'
      }
    ],

    // API configuration
    api: {
      fetchData: (params) => {
        const endpoint = `${environment.apiBaseUrl}/manufacturer-model-combinations`;
        return apiService.get<ManufacturerModelRow>(endpoint, {
          params: {
            page: params.page + 1, // API uses 1-indexed pages
            size: params.size,
            search: params.search,
            sortBy: params.sortField,
            // Only send sortOrder when sortField is defined
            sortOrder: params.sortField ? (params.sortOrder === 1 ? 'asc' : 'desc') : undefined
          }
        });
      },

      responseTransformer: (response) => {
        // API returns nested structure: { data: [{ manufacturer, count, models: [...] }] }
        // Need to flatten to: { results: [{ manufacturer, model, count }] }
        const flatResults: ManufacturerModelRow[] = [];

        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((manufacturerGroup: any) => {
            const manufacturer = manufacturerGroup.manufacturer;

            if (manufacturerGroup.models && Array.isArray(manufacturerGroup.models)) {
              manufacturerGroup.models.forEach((modelItem: any) => {
                flatResults.push({
                  manufacturer: manufacturer,
                  model: modelItem.model,
                  count: modelItem.count
                });
              });
            }
          });
        }

        // Use API-provided total if available, otherwise fall back to flattened count
        // Note: API total represents manufacturer-model combinations, not manufacturer groups
        const total = response.total ?? response.totalRecords ?? flatResults.length;

        return {
          results: flatResults,
          total: total
        };
      }
    },

    // Row key configuration
    row: {
      keyGenerator: (row) => `${row.manufacturer}:${row.model}`,
      keyParser: (key) => {
        const [manufacturer, model] = key.split(':');
        return { manufacturer, model } as Partial<ManufacturerModelRow>;
      }
    },

    // Selection configuration
    selection: {
      mode: 'multiple',
      urlParam: 'modelCombos',

      // Serialize selected items to URL
      serializer: (items) => {
        if (!items || items.length === 0) return '';
        return items.map(item => `${item.manufacturer}:${item.model}`).join(',');
      },

      // Deserialize URL to partial items (for hydration)
      deserializer: (urlValue) => {
        if (!urlValue) return [];
        return urlValue.split(',').map(combo => {
          const [manufacturer, model] = combo.split(':');
          return { manufacturer, model } as Partial<ManufacturerModelRow>;
        });
      },

      // Optional: Custom key generator (defaults to row.keyGenerator)
      keyGenerator: (item) => `${item.manufacturer}:${item.model}`
    },

    // Pagination configuration
    // Note: API paginates by manufacturer groups, but we display flattened manufacturer-model rows.
    // The total count represents manufacturer groups, not individual models.
    // This is a known limitation - would need API changes for true model-level pagination.
    pagination: {
      mode: 'server',
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },

    // Search configuration
    showSearch: true,
    searchPlaceholder: 'Search manufacturer or model...'
  };
}

/**
 * Register all automobile picker configurations
 *
 * @param injector - Angular injector for dependency resolution
 * @returns Array of picker configurations
 */
export function createAutomobilePickerConfigs(injector: Injector): PickerConfig<any>[] {
  const apiService = injector.get(ApiService);

  return [
    createManufacturerModelPickerConfig(apiService)
    // Add more pickers here as needed
  ];
}

/**
 * Static export for backwards compatibility
 * Populated dynamically by domain config factory
 */
export const AUTOMOBILE_PICKER_CONFIGS: PickerConfig<any>[] = [];
