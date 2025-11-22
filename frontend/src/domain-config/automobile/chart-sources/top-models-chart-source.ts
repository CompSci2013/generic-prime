/**
 * Top Models Chart Data Source
 *
 * Transforms vehicle statistics into Plotly.js horizontal bar chart
 * showing top models by VIN instance count.
 *
 * Domain: Automobile
 */

import { ChartDataSource, ChartData } from '../../../framework/components/base-chart/base-chart.component';
import { VehicleStatistics } from '../models/automobile.statistics';

/**
 * Top models chart data source
 *
 * Creates a horizontal bar chart of top models by VIN instance count.
 */
export class TopModelsChartDataSource extends ChartDataSource<VehicleStatistics> {
  /**
   * Transform statistics into Plotly chart data
   */
  transform(
    statistics: VehicleStatistics | null,
    _highlights: any,
    _selectedValue: string | null,
    _containerWidth: number
  ): ChartData | null {
    if (!statistics || !statistics.topModels || statistics.topModels.length === 0) {
      return null;
    }

    // Get top models (sorted by count descending)
    const topModels = statistics.topModels.slice(0, 20);

    // Extract data for vertical bars
    const modelLabels = topModels.map(m => `${m.manufacturer} ${m.name}`);
    const counts = topModels.map(m => m.instanceCount);

    // Create bar trace (blue bars, no highlighting until API supports it)
    const trace: any = {
      type: 'bar',
      x: modelLabels,
      y: counts,
      marker: {
        color: '#3B82F6' // Blue
      },
      hovertemplate: '<b>%{x}</b><br>' +
                     'Count: %{y}<br>' +
                     '<extra></extra>'
    };

    // Create layout
    const layout: Partial<any> = {
      xaxis: {
        tickangle: -45,
        automargin: true
      },
      yaxis: {
        title: '',
        gridcolor: '#E5E7EB'
      },
      margin: {
        l: 60,
        r: 40,
        t: 40,
        b: 140
      },
      height: 400,
      plot_bgcolor: '#FFFFFF',
      paper_bgcolor: '#FFFFFF',
      showlegend: false
    };

    return {
      traces: [trace],
      layout: layout
    };
  }

  /**
   * Get chart title
   */
  getTitle(): string {
    return 'Top Models by VIN Count';
  }

  /**
   * Handle chart click event
   */
  handleClick(event: any): string | null {
    if (event.points && event.points.length > 0) {
      return event.points[0].y; // Return full model name (Manufacturer Model)
    }
    return null;
  }
}
