/**
 * Manufacturer Chart Data Source
 *
 * Transforms vehicle statistics into Plotly.js vertical stacked bar chart
 * showing vehicle count by manufacturer with highlighted vs other.
 *
 * Domain: Automobile
 */

import { ChartDataSource, ChartData } from '../../../framework/components/base-chart/base-chart.component';
import { VehicleStatistics } from '../models/automobile.statistics';

/**
 * Manufacturer distribution chart data source
 *
 * Creates a vertical stacked bar chart of manufacturers by vehicle count.
 * Matches the visual style from the reference application.
 */
export class ManufacturerChartDataSource extends ChartDataSource<VehicleStatistics> {
  /**
   * Transform statistics into Plotly chart data
   */
  transform(
    statistics: VehicleStatistics | null,
    highlights: any,
    selectedValue: string | null,
    containerWidth: number
  ): ChartData | null {
    if (!statistics || !statistics.topManufacturers || statistics.topManufacturers.length === 0) {
      return null;
    }

    // Get top manufacturers (sorted by count descending)
    const topManufacturers = statistics.topManufacturers.slice(0, 20);

    // Extract data for vertical bars
    const manufacturers = topManufacturers.map(m => m.name);
    const counts = topManufacturers.map(m => m.count);

    // Create bar trace (blue bars, no highlighting until API supports it)
    const trace: Plotly.Data = {
      type: 'bar',
      x: manufacturers,
      y: counts,
      marker: {
        color: '#3B82F6' // Blue
      },
      hovertemplate: '<b>%{x}</b><br>' +
                     'Count: %{y}<br>' +
                     '<extra></extra>'
    };

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      xaxis: {
        tickangle: -45,
        automargin: true
      },
      yaxis: {
        title: { text: '' },
        gridcolor: '#E5E7EB'
      },
      margin: {
        l: 60,
        r: 40,
        t: 40,
        b: 120
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
    return 'Vehicles by Manufacturer';
  }

  /**
   * Handle chart click event
   */
  handleClick(event: any): string | null {
    if (event.points && event.points.length > 0) {
      return event.points[0].y; // Return manufacturer name
    }
    return null;
  }
}
