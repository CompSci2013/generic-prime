/**
 * Automobile Domain Configuration
 *
 * Complete domain configuration combining all models, adapters, and UI configs
 * from milestones D1-D4.
 */

import { Injector } from '@angular/core';
import { DomainConfig } from '../../framework/models';
import { ApiService } from '../../framework/services';
import { environment } from '../../environments/environment';
import {
  AutoSearchFilters,
  VehicleResult,
  VehicleStatistics
} from './models';
import {
  AutomobileApiAdapter,
  AutomobileUrlMapper,
  AutomobileCacheKeyBuilder
} from './adapters';
import {
  AUTOMOBILE_TABLE_CONFIG,
  AUTOMOBILE_FILTER_DEFINITIONS,
  AUTOMOBILE_QUERY_CONTROL_FILTERS,
  AUTOMOBILE_HIGHLIGHT_FILTERS,
  AUTOMOBILE_CHART_CONFIGS,
  AUTOMOBILE_PICKER_CONFIGS
} from './configs';
import {
  ManufacturerChartDataSource,
  TopModelsChartDataSource,
  BodyClassChartDataSource,
  YearChartDataSource
} from './chart-sources';
import { Provider } from '@angular/core';
import { DOMAIN_CONFIG } from '../../framework/services';

/**
 * Factory function to create Automobile Domain Configuration
 *
 * This factory creates the domain configuration with properly injected dependencies.
 * Must be called with Angular's Injector to resolve service dependencies.
 *
 * @param injector - Angular injector for resolving dependencies
 * @returns Complete automobile domain configuration
 *
 * @example
 * // In app module
 * providers: [
 *   {
 *     provide: DOMAIN_CONFIG,
 *     useFactory: createAutomobileDomainConfig,
 *     deps: [Injector]
 *   }
 * ]
 */
export function createAutomobileDomainConfig(injector: Injector): DomainConfig<
  AutoSearchFilters,
  VehicleResult,
  VehicleStatistics
> {
  const apiService = injector.get(ApiService);
  const apiBaseUrl = environment.apiBaseUrl;

  return {
    // ==================== Identity ====================
    domainName: 'automobile',
    domainLabel: 'Automobile Discovery',
    apiBaseUrl: apiBaseUrl,

    // ==================== Type Models ====================
    filterModel: AutoSearchFilters,
    dataModel: VehicleResult,
    statisticsModel: VehicleStatistics,

    // ==================== Adapters ====================
    apiAdapter: new AutomobileApiAdapter(apiService, apiBaseUrl),
    urlMapper: new AutomobileUrlMapper(),
    cacheKeyBuilder: new AutomobileCacheKeyBuilder(),

  // ==================== UI Configuration ====================
  tableConfig: AUTOMOBILE_TABLE_CONFIG,
  pickers: AUTOMOBILE_PICKER_CONFIGS,
  filters: AUTOMOBILE_FILTER_DEFINITIONS,
  queryControlFilters: AUTOMOBILE_QUERY_CONTROL_FILTERS,
  highlightFilters: AUTOMOBILE_HIGHLIGHT_FILTERS,
  charts: AUTOMOBILE_CHART_CONFIGS,
  chartDataSources: {
    'manufacturer': new ManufacturerChartDataSource(),
    'top-models': new TopModelsChartDataSource(),
    'body-class': new BodyClassChartDataSource(),
    'year': new YearChartDataSource()
  },

  // ==================== Feature Flags ====================
  features: {
    // Required features
    highlights: true,
    popOuts: true,
    rowExpansion: true,

    // Optional features
    statistics: true,
    export: true,
    columnManagement: true,
    statePersistence: true
  },

    // ==================== Metadata ====================
    metadata: {
      version: '1.0.0',
      description: 'Automobile vehicle discovery and analysis',
      author: 'Generic Discovery Framework Team',
      createdAt: '2025-11-20',
      updatedAt: '2025-11-20'
    }
  };
}

export const DOMAIN_PROVIDER: Provider = {
  provide: DOMAIN_CONFIG,
  useFactory: createAutomobileDomainConfig,
  deps: [Injector],
};
