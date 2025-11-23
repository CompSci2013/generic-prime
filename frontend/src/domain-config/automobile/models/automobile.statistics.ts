/**
 * Automobile Domain - Statistics Model
 *
 * Defines aggregated statistics for automobile vehicle data.
 * Used in statistics panel and charts.
 *
 * Domain: Automobile Discovery
 */

/**
 * Vehicle statistics
 *
 * Aggregated statistics across all filtered vehicles.
 * Provides high-level metrics and distributions for analysis.
 *
 * @example
 * ```typescript
 * const stats: VehicleStatistics = {
 *   totalVehicles: 1247,
 *   totalInstances: 45623,
 *   manufacturerCount: 23,
 *   modelCount: 412,
 *   yearRange: { min: 2010, max: 2024 },
 *   averageInstancesPerVehicle: 36.6,
 *   topManufacturers: [
 *     { name: 'Toyota', count: 234, percentage: 18.8 },
 *     { name: 'Honda', count: 187, percentage: 15.0 }
 *   ]
 * };
 * ```
 */
export class VehicleStatistics {
  /**
   * Total number of unique vehicle configurations
   * Count of distinct manufacturer+model+year+bodyclass combinations
   *
   * @example 1247
   */
  totalVehicles!: number;

  /**
   * Total number of VIN instances across all vehicles
   * Sum of all instance_count values
   *
   * @example 45623
   */
  totalInstances!: number;

  /**
   * Number of unique manufacturers
   *
   * @example 23
   */
  manufacturerCount!: number;

  /**
   * Number of unique models
   *
   * @example 412
   */
  modelCount!: number;

  /**
   * Number of unique body classes
   *
   * @example 8
   */
  bodyClassCount?: number;

  /**
   * Year range
   * Minimum and maximum years in the dataset
   */
  yearRange!: {
    /**
     * Oldest vehicle year
     * @example 2010
     */
    min: number;

    /**
     * Newest vehicle year
     * @example 2024
     */
    max: number;
  };

  /**
   * Average number of VIN instances per vehicle configuration
   * totalInstances / totalVehicles
   *
   * @example 36.6
   */
  averageInstancesPerVehicle!: number;

  /**
   * Median number of VIN instances per vehicle configuration
   *
   * @example 28
   */
  medianInstancesPerVehicle?: number;

  /**
   * Top manufacturers by vehicle count
   * Sorted by count descending
   */
  topManufacturers?: ManufacturerStat[];

  /**
   * Top models by instance count
   * Sorted by instance count descending
   */
  topModels?: ModelStat[];

  /**
   * Distribution by body class
   */
  bodyClassDistribution?: BodyClassStat[];

  /**
   * Distribution by year
   * Vehicle counts per year
   */
  yearDistribution?: YearStat[];

  /**
   * Distribution by manufacturer
   * Complete list of all manufacturers with counts
   */
  manufacturerDistribution?: ManufacturerStat[];

  /**
   * Raw segmented statistics from API
   * Preserves {total, highlighted} structure for chart highlighting
   */
  byManufacturer?: Record<string, {total: number, highlighted: number}>;
  byBodyClass?: Record<string, {total: number, highlighted: number}>;
  byYearRange?: Record<string, {total: number, highlighted: number}>;
  modelsByManufacturer?: Record<string, Record<string, {total: number, highlighted: number}>>;

  /**
   * Constructor with partial data
   */
  constructor(partial?: Partial<VehicleStatistics>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  /**
   * Create VehicleStatistics from API response
   *
   * Handles two formats:
   * 1. Segmented statistics from /vehicles/details (byManufacturer, modelsByManufacturer, etc.)
   * 2. Array-based statistics (top_manufacturers, top_models, etc.)
   *
   * @param data - Raw API response data
   * @returns VehicleStatistics instance
   */
  static fromApiResponse(data: any): VehicleStatistics {
    // Check if this is the segmented statistics format from /vehicles/details
    if (data.byManufacturer || data.modelsByManufacturer || data.byBodyClass || data.byYearRange) {
      return VehicleStatistics.fromSegmentedStats(data);
    }

    // Otherwise use the array-based format
    return new VehicleStatistics({
      totalVehicles: Number(data.total_vehicles || data.totalVehicles || 0),
      totalInstances: Number(data.total_instances || data.totalInstances || 0),
      manufacturerCount: Number(data.manufacturer_count || data.manufacturerCount || 0),
      modelCount: Number(data.model_count || data.modelCount || 0),
      bodyClassCount: data.body_class_count || data.bodyClassCount,
      yearRange: {
        min: Number(data.year_range?.min || data.yearRange?.min || 0),
        max: Number(data.year_range?.max || data.yearRange?.max || 0)
      },
      averageInstancesPerVehicle: Number(
        data.average_instances_per_vehicle ||
        data.averageInstancesPerVehicle ||
        0
      ),
      medianInstancesPerVehicle: data.median_instances_per_vehicle ||
        data.medianInstancesPerVehicle,
      topManufacturers: data.top_manufacturers?.map((m: any) =>
        ManufacturerStat.fromApiResponse(m)
      ) || data.topManufacturers?.map((m: any) =>
        ManufacturerStat.fromApiResponse(m)
      ),
      topModels: data.top_models?.map((m: any) =>
        ModelStat.fromApiResponse(m)
      ) || data.topModels?.map((m: any) =>
        ModelStat.fromApiResponse(m)
      ),
      bodyClassDistribution: data.body_class_distribution?.map((b: any) =>
        BodyClassStat.fromApiResponse(b)
      ) || data.bodyClassDistribution?.map((b: any) =>
        BodyClassStat.fromApiResponse(b)
      ),
      yearDistribution: data.year_distribution?.map((y: any) =>
        YearStat.fromApiResponse(y)
      ) || data.yearDistribution?.map((y: any) =>
        YearStat.fromApiResponse(y)
      ),
      manufacturerDistribution: data.manufacturer_distribution?.map((m: any) =>
        ManufacturerStat.fromApiResponse(m)
      ) || data.manufacturerDistribution?.map((m: any) =>
        ManufacturerStat.fromApiResponse(m)
      )
    });
  }

  /**
   * Create VehicleStatistics from segmented API statistics
   *
   * Transforms the /vehicles/details statistics format:
   * { byManufacturer: { Ford: { total, highlighted } }, ... }
   *
   * @param data - Segmented statistics data
   * @returns VehicleStatistics instance
   */
  private static fromSegmentedStats(data: any): VehicleStatistics {
    // Transform API's segmented statistics structure to arrays
    const topManufacturers = VehicleStatistics.transformByManufacturer(data.byManufacturer);
    const topModels = VehicleStatistics.transformModelsByManufacturer(data.modelsByManufacturer);
    const bodyClassDistribution = VehicleStatistics.transformByBodyClass(data.byBodyClass);
    const yearDistribution = VehicleStatistics.transformByYearRange(data.byYearRange);

    // Calculate totals
    const totalVehicles = data.totalCount || 0;
    const manufacturerCount = topManufacturers?.length || 0;
    const modelCount = topModels?.length || 0;
    const bodyClassCount = bodyClassDistribution?.length || 0;

    // Calculate year range from yearDistribution
    const years = yearDistribution?.map(y => y.year) || [];
    const yearRange = years.length > 0
      ? { min: Math.min(...years), max: Math.max(...years) }
      : { min: 0, max: 0 };

    return new VehicleStatistics({
      totalVehicles,
      totalInstances: totalVehicles,
      manufacturerCount,
      modelCount,
      bodyClassCount,
      yearRange,
      averageInstancesPerVehicle: 0,
      topManufacturers,
      topModels,
      bodyClassDistribution,
      yearDistribution,
      manufacturerDistribution: topManufacturers,
      // Preserve raw segmented statistics for chart highlighting
      byManufacturer: data.byManufacturer,
      byBodyClass: data.byBodyClass,
      byYearRange: data.byYearRange,
      modelsByManufacturer: data.modelsByManufacturer
    });
  }

  /**
   * Transform API's byManufacturer object to ManufacturerStat array
   */
  private static transformByManufacturer(byManufacturer: Record<string, any> | undefined): ManufacturerStat[] | undefined {
    if (!byManufacturer) return undefined;

    const stats = Object.entries(byManufacturer).map(([name, countOrStats]) => {
      // Handle both formats: simple number or {total, highlighted}
      const count = typeof countOrStats === 'object' ? (countOrStats.total || 0) : (countOrStats || 0);

      return new ManufacturerStat({
        name,
        count,
        instanceCount: count,
        percentage: 0,
        modelCount: 0
      });
    });

    // Sort by count descending
    stats.sort((a, b) => b.count - a.count);

    // Calculate percentages
    const totalCount = stats.reduce((sum, s) => sum + s.count, 0);
    stats.forEach(s => {
      s.percentage = totalCount > 0 ? (s.count / totalCount) * 100 : 0;
    });

    return stats.slice(0, 20);
  }

  /**
   * Transform API's modelsByManufacturer object to ModelStat array
   */
  private static transformModelsByManufacturer(modelsByManufacturer: Record<string, Record<string, any>> | undefined): ModelStat[] | undefined {
    if (!modelsByManufacturer) return undefined;

    const stats: ModelStat[] = [];
    let totalCount = 0;

    Object.entries(modelsByManufacturer).forEach(([manufacturer, models]) => {
      Object.entries(models).forEach(([modelName, countOrStats]) => {
        // Handle both formats: simple number or {total, highlighted}
        const instanceCount = typeof countOrStats === 'object' ? (countOrStats.total || 0) : (countOrStats || 0);
        totalCount += instanceCount;
        stats.push(new ModelStat({
          name: modelName,
          manufacturer,
          count: 1,
          instanceCount,
          percentage: 0
        }));
      });
    });

    // Sort by instance count descending
    stats.sort((a, b) => b.instanceCount - a.instanceCount);

    // Calculate percentages
    stats.forEach(s => {
      s.percentage = totalCount > 0 ? (s.instanceCount / totalCount) * 100 : 0;
    });

    return stats.slice(0, 20);
  }

  /**
   * Transform API's byBodyClass object to BodyClassStat array
   */
  private static transformByBodyClass(byBodyClass: Record<string, any> | undefined): BodyClassStat[] | undefined {
    if (!byBodyClass) return undefined;

    const stats = Object.entries(byBodyClass).map(([name, countOrStats]) => {
      // Handle both formats: simple number or {total, highlighted}
      const count = typeof countOrStats === 'object' ? (countOrStats.total || 0) : (countOrStats || 0);

      return new BodyClassStat({
        name,
        count,
        instanceCount: count,
        percentage: 0
      });
    });

    // Calculate percentages
    const totalCount = stats.reduce((sum, s) => sum + s.count, 0);
    stats.forEach(s => {
      s.percentage = totalCount > 0 ? (s.count / totalCount) * 100 : 0;
    });

    // Sort by count descending
    stats.sort((a, b) => b.count - a.count);

    return stats;
  }

  /**
   * Transform API's byYearRange object to YearStat array
   */
  private static transformByYearRange(byYearRange: Record<string, any> | undefined): YearStat[] | undefined {
    if (!byYearRange) return undefined;

    const stats = Object.entries(byYearRange).map(([yearStr, countOrStats]) => {
      // Handle both formats: simple number or {total, highlighted}
      const count = typeof countOrStats === 'object' ? (countOrStats.total || 0) : (countOrStats || 0);

      return new YearStat({
        year: parseInt(yearStr, 10),
        count,
        instanceCount: count,
        percentage: 0
      });
    });

    // Calculate percentages
    const totalCount = stats.reduce((sum, s) => sum + s.count, 0);
    stats.forEach(s => {
      s.percentage = totalCount > 0 ? (s.count / totalCount) * 100 : 0;
    });

    // Sort by year ascending
    stats.sort((a, b) => a.year - b.year);

    return stats;
  }

  /**
   * Get year span (number of years covered)
   *
   * @returns Number of years from min to max
   */
  getYearSpan(): number {
    return this.yearRange.max - this.yearRange.min + 1;
  }

  /**
   * Get average vehicles per manufacturer
   *
   * @returns Average count
   */
  getAverageVehiclesPerManufacturer(): number {
    return this.manufacturerCount > 0
      ? this.totalVehicles / this.manufacturerCount
      : 0;
  }

  /**
   * Get average models per manufacturer
   *
   * @returns Average count
   */
  getAverageModelsPerManufacturer(): number {
    return this.manufacturerCount > 0
      ? this.modelCount / this.manufacturerCount
      : 0;
  }
}

/**
 * Manufacturer statistic
 *
 * Aggregated data for a single manufacturer
 */
export class ManufacturerStat {
  /**
   * Manufacturer name
   * @example 'Toyota'
   */
  name!: string;

  /**
   * Number of vehicle configurations
   * @example 234
   */
  count!: number;

  /**
   * Total VIN instances for this manufacturer
   * @example 8456
   */
  instanceCount?: number;

  /**
   * Percentage of total vehicles
   * @example 18.8
   */
  percentage!: number;

  /**
   * Number of unique models for this manufacturer
   * @example 42
   */
  modelCount?: number;

  constructor(partial?: Partial<ManufacturerStat>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  static fromApiResponse(data: any): ManufacturerStat {
    return new ManufacturerStat({
      name: data.name || data.manufacturer,
      count: Number(data.count || data.vehicle_count || 0),
      instanceCount: data.instance_count || data.instanceCount,
      percentage: Number(data.percentage || 0),
      modelCount: data.model_count || data.modelCount
    });
  }
}

/**
 * Model statistic
 *
 * Aggregated data for a single model (across all manufacturers/years)
 */
export class ModelStat {
  /**
   * Model name
   * @example 'Camry'
   */
  name!: string;

  /**
   * Manufacturer name
   * @example 'Toyota'
   */
  manufacturer!: string;

  /**
   * Number of vehicle configurations for this model
   * @example 15
   */
  count!: number;

  /**
   * Total VIN instances for this model
   * @example 3456
   */
  instanceCount!: number;

  /**
   * Percentage of total instances
   * @example 7.6
   */
  percentage!: number;

  constructor(partial?: Partial<ModelStat>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  static fromApiResponse(data: any): ModelStat {
    return new ModelStat({
      name: data.name || data.model,
      manufacturer: data.manufacturer,
      count: Number(data.count || data.vehicle_count || 0),
      instanceCount: Number(data.instance_count || data.instanceCount || 0),
      percentage: Number(data.percentage || 0)
    });
  }

  /**
   * Get full model name
   * @returns Manufacturer + Model
   */
  getFullName(): string {
    return `${this.manufacturer} ${this.name}`;
  }
}

/**
 * Body class statistic
 *
 * Aggregated data for a single body class
 */
export class BodyClassStat {
  /**
   * Body class name
   * @example 'Sedan', 'SUV', 'Truck'
   */
  name!: string;

  /**
   * Number of vehicle configurations
   * @example 456
   */
  count!: number;

  /**
   * Total VIN instances for this body class
   * @example 16789
   */
  instanceCount?: number;

  /**
   * Percentage of total vehicles
   * @example 36.6
   */
  percentage!: number;

  constructor(partial?: Partial<BodyClassStat>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  static fromApiResponse(data: any): BodyClassStat {
    return new BodyClassStat({
      name: data.name || data.body_class || data.bodyClass,
      count: Number(data.count || data.vehicle_count || 0),
      instanceCount: data.instance_count || data.instanceCount,
      percentage: Number(data.percentage || 0)
    });
  }
}

/**
 * Year statistic
 *
 * Aggregated data for a single year
 */
export class YearStat {
  /**
   * Year
   * @example 2024
   */
  year!: number;

  /**
   * Number of vehicle configurations for this year
   * @example 89
   */
  count!: number;

  /**
   * Total VIN instances for this year
   * @example 3245
   */
  instanceCount?: number;

  /**
   * Percentage of total vehicles
   * @example 7.1
   */
  percentage!: number;

  constructor(partial?: Partial<YearStat>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  static fromApiResponse(data: any): YearStat {
    return new YearStat({
      year: Number(data.year),
      count: Number(data.count || data.vehicle_count || 0),
      instanceCount: data.instance_count || data.instanceCount,
      percentage: Number(data.percentage || 0)
    });
  }

  /**
   * Check if year is current year
   */
  isCurrentYear(): boolean {
    return this.year === new Date().getFullYear();
  }

  /**
   * Get age (years from now)
   */
  getAge(): number {
    return new Date().getFullYear() - this.year;
  }
}
