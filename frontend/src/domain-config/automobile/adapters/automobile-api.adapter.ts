/**
 * Automobile Domain - API Adapter
 *
 * Implements the IApiAdapter interface for fetching automobile vehicle data.
 * Handles API calls, response transformation, and error handling.
 *
 * Domain: Automobile Discovery
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiAdapter, ApiAdapterResponse } from '../../../framework/models/resource-management.interface';
import { ApiService, ApiResponse } from '../../../framework/services/api.service';
import { AutoSearchFilters } from '../models/automobile.filters';
import { VehicleResult } from '../models/automobile.data';
import { VehicleStatistics } from '../models/automobile.statistics';

/**
 * Automobile API adapter
 *
 * Fetches vehicle data from the automobile discovery API.
 * Transforms API responses into domain models.
 *
 * @example
 * ```typescript
 * const adapter = new AutomobileApiAdapter(apiService);
 * const filters = new AutoSearchFilters({ manufacturer: 'Toyota' });
 *
 * adapter.fetchData(filters).subscribe(response => {
 *   console.log('Vehicles:', response.results);
 *   console.log('Total:', response.total);
 *   console.log('Statistics:', response.statistics);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AutomobileApiAdapter
  implements IApiAdapter<AutoSearchFilters, VehicleResult, VehicleStatistics>
{
  /**
   * API endpoint for vehicle search
   */
  private readonly VEHICLES_ENDPOINT = '/vehicles';

  /**
   * API endpoint for statistics
   */
  private readonly STATISTICS_ENDPOINT = '/statistics';

  constructor(private apiService: ApiService) {}

  /**
   * Fetch vehicle data from API
   *
   * @param filters - Search filters
   * @returns Observable of vehicle results with statistics
   */
  fetchData(
    filters: AutoSearchFilters
  ): Observable<ApiAdapterResponse<VehicleResult, VehicleStatistics>> {
    // Convert filters to API parameters
    const params = this.filtersToApiParams(filters);

    // Fetch vehicle data
    return this.apiService
      .get<VehicleResult>(this.VEHICLES_ENDPOINT, params)
      .pipe(
        map((apiResponse: ApiResponse<VehicleResult>) => {
          // Transform API response to adapter response
          return {
            results: apiResponse.results.map((item) =>
              VehicleResult.fromApiResponse(item)
            ),
            total: apiResponse.total,
            statistics: apiResponse.statistics
              ? VehicleStatistics.fromApiResponse(apiResponse.statistics)
              : undefined
          };
        })
      );
  }

  /**
   * Fetch statistics only (without vehicle data)
   *
   * Separate method for fetching just statistics when needed.
   * Useful for refreshing statistics panel without reloading table data.
   *
   * @param filters - Search filters
   * @returns Observable of statistics
   */
  fetchStatistics(
    filters: AutoSearchFilters
  ): Observable<VehicleStatistics> {
    const params = this.filtersToApiParams(filters);

    return this.apiService
      .get<VehicleStatistics>(this.STATISTICS_ENDPOINT, params)
      .pipe(
        map((response: any) => {
          // API might return statistics directly or wrapped
          const statsData = response.statistics || response;
          return VehicleStatistics.fromApiResponse(statsData);
        })
      );
  }

  /**
   * Convert filter object to API query parameters
   *
   * Maps domain filter fields to API parameter names.
   * Removes undefined/null values.
   *
   * @param filters - Domain filters
   * @returns API query parameters
   */
  private filtersToApiParams(
    filters: AutoSearchFilters
  ): Record<string, any> {
    const params: Record<string, any> = {};

    // Search filters
    if (filters.manufacturer) {
      params['manufacturer'] = filters.manufacturer;
    }

    if (filters.model) {
      params['model'] = filters.model;
    }

    if (filters.yearMin !== undefined && filters.yearMin !== null) {
      params['year_min'] = filters.yearMin;
    }

    if (filters.yearMax !== undefined && filters.yearMax !== null) {
      params['year_max'] = filters.yearMax;
    }

    if (filters.bodyClass) {
      params['body_class'] = filters.bodyClass;
    }

    if (filters.instanceCountMin !== undefined && filters.instanceCountMin !== null) {
      params['instance_count_min'] = filters.instanceCountMin;
    }

    if (filters.instanceCountMax !== undefined && filters.instanceCountMax !== null) {
      params['instance_count_max'] = filters.instanceCountMax;
    }

    if (filters.search) {
      params['search'] = filters.search;
    }

    // Pagination
    if (filters.page !== undefined && filters.page !== null) {
      params['page'] = filters.page;
    }

    if (filters.size !== undefined && filters.size !== null) {
      params['size'] = filters.size;
    }

    // Sorting
    if (filters.sort) {
      params['sort'] = filters.sort;
    }

    if (filters.sortDirection) {
      params['sort_direction'] = filters.sortDirection;
    }

    return params;
  }

  /**
   * Get API base URL from environment or config
   *
   * This would typically come from the domain configuration,
   * but can be overridden here for testing or development.
   *
   * @returns API base URL
   */
  getApiBaseUrl(): string {
    // This will be configured in the domain config
    // For now, return placeholder
    return 'http://auto-discovery.minilab/api/v1';
  }
}
