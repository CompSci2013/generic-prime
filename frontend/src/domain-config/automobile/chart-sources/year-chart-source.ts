/**
 * Year Chart Data Source
 *
 * Transforms vehicle statistics into Plotly.js line chart
 * showing vehicle distribution over time.
 *
 * Domain: Automobile
 */

import { ChartDataSource, ChartData } from '../../../framework/components/base-chart/base-chart.component';
import { VehicleStatistics } from '../models/automobile.statistics';

/**
 * Year distribution chart data source
 *
 * Creates a line chart showing vehicle count by year.
 */
export class YearChartDataSource extends ChartDataSource<VehicleStatistics> {
  /**
   * Transform statistics into Plotly chart data
   */
  transform(
    statistics: VehicleStatistics | null,
    _highlights: any,
    _selectedValue: string | null,
    _containerWidth: number
  ): ChartData | null {
    if (!statistics || !statistics.yearDistribution || statistics.yearDistribution.length === 0) {
      return null;
    }

    // Sort by year
    const sortedData = [...statistics.yearDistribution].sort((a, b) => a.year - b.year);

    // Extract data for vertical bars
    const years = sortedData.map(y => y.year.toString());
    const counts = sortedData.map(y => y.count);

    // Create bar trace (blue bars, no highlighting until API supports it)
    const trace: Plotly.Data = {
      type: 'bar',
      x: years,
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
        title: { text: '' },
        gridcolor: '#E5E7EB',
        type: 'category'
      },
      yaxis: {
        title: { text: '' },
        gridcolor: '#E5E7EB',
        rangemode: 'tozero'
      },
      margin: {
        l: 60,
        r: 40,
        t: 40,
        b: 60
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
    return 'Vehicles by Year';
  }

  /**
   * Handle chart click event
   */
  handleClick(event: any): string | null {
    if (event.points && event.points.length > 0) {
      return event.points[0].x; // Return year
    }
    return null;
  }
}
