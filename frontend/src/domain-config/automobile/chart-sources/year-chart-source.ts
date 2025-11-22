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
    highlights: any,
    selectedValue: string | null,
    containerWidth: number
  ): ChartData | null {
    if (!statistics || !statistics.yearDistribution || statistics.yearDistribution.length === 0) {
      return null;
    }

    // Sort by year
    const sortedData = [...statistics.yearDistribution].sort((a, b) => a.year - b.year);

    // Extract data
    const years = sortedData.map(y => y.year.toString());
    const counts = sortedData.map(y => y.count);

    // Create Plotly trace
    const trace: Plotly.Data = {
      type: 'scatter',
      mode: 'lines+markers',
      x: years,
      y: counts,
      line: {
        color: '#3B82F6',
        width: 2
      },
      marker: {
        size: 6,
        color: '#3B82F6'
      },
      fill: 'tozeroy',
      fillcolor: 'rgba(59, 130, 246, 0.1)',
      hovertemplate: '<b>Year %{x}</b><br>' +
                     'Vehicles: %{y}<br>' +
                     '<extra></extra>'
    };

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      title: {
        text: 'Vehicle Distribution Over Time',
        font: { size: 16 }
      },
      xaxis: {
        title: { text: 'Year' },
        gridcolor: '#E5E7EB',
        type: 'category' // Treat years as categories for even spacing
      },
      yaxis: {
        title: { text: 'Number of Vehicles' },
        gridcolor: '#E5E7EB',
        rangemode: 'tozero'
      },
      margin: {
        l: 60,
        r: 40,
        t: 60,
        b: 60
      },
      height: 350,
      plot_bgcolor: '#FFFFFF',
      paper_bgcolor: '#FFFFFF'
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
