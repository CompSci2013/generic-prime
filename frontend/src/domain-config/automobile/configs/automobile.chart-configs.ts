/**
 * Automobile Domain - Chart Configurations (Plotly.js)
 *
 * Defines chart visualizations for automobile statistics using Plotly.js.
 * Charts display aggregated data and distributions.
 *
 * Domain: Automobile Discovery
 */

import { ChartConfig } from '../../../framework/models/domain-config.interface';

/**
 * Automobile chart configurations
 *
 * Array of chart definitions for the statistics panel.
 * Each chart visualizes a different aspect of the vehicle data.
 *
 * NOTE: These configs work with Plotly.js via BaseChartComponent.
 * Data transformation is handled by chart data sources in chart-sources/ directory.
 *
 * @example
 * ```typescript
 * <app-statistics-panel [chartConfigs]="AUTOMOBILE_CHART_CONFIGS">
 * </app-statistics-panel>
 * ```
 */
export const AUTOMOBILE_CHART_CONFIGS: ChartConfig[] = [
  /**
   * Manufacturer distribution (horizontal bar chart)
   */
  {
    id: 'manufacturer-distribution',
    title: 'Vehicles by Manufacturer',
    type: 'bar',
    dataSourceId: 'manufacturer',
    height: 400,
    width: '100%',
    visible: true,
    collapsible: true
  },

  /**
   * Top models by VIN count (horizontal bar chart)
   */
  {
    id: 'top-models',
    title: 'Top Models by VIN Count',
    type: 'bar',
    dataSourceId: 'top-models',
    height: 400,
    width: '100%',
    visible: true,
    collapsible: true
  },

  /**
   * Body class distribution (pie chart)
   */
  {
    id: 'body-class-distribution',
    title: 'Vehicles by Body Class',
    type: 'pie',
    dataSourceId: 'body-class',
    height: 350,
    width: '100%',
    visible: true,
    collapsible: true
  },

  /**
   * Year distribution (line chart)
   */
  {
    id: 'year-distribution',
    title: 'Vehicles by Year',
    type: 'line',
    dataSourceId: 'year',
    height: 350,
    width: '100%',
    visible: true,
    collapsible: true
  }
];
