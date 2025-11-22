/**
 * Manufacturer Chart Data Source
 *
 * Transforms vehicle statistics into Plotly.js horizontal bar chart
 * showing vehicle count by manufacturer.
 *
 * Domain: Automobile
 */

import { ChartDataSource, ChartData } from '../../../framework/components/base-chart/base-chart.component';
import { VehicleStatistics } from '../models/automobile.statistics';

/**
 * Manufacturer distribution chart data source
 *
 * Creates a horizontal bar chart of top manufacturers by vehicle count.
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

    // Get top 10 manufacturers
    const topManufacturers = statistics.topManufacturers.slice(0, 10);

    // Extract data (reverse for bottom-to-top display)
    const manufacturers = topManufacturers.map(m => m.name).reverse();
    const counts = topManufacturers.map(m => m.count).reverse();
    const percentages = topManufacturers.map(m => m.percentage).reverse();

    // Create bar colors (highlight selected)
    const colors = manufacturers.map(manufacturer =>
      manufacturer === selectedValue ? '#EF4444' : '#3B82F6'
    );

    // Create Plotly trace
    const trace: Plotly.Data = {
      type: 'bar',
      x: counts,
      y: manufacturers,
      orientation: 'h',
      marker: {
        color: colors
      },
      text: percentages.map(p => `${p.toFixed(1)}%`),
      textposition: 'outside',
      hovertemplate: '<b>%{y}</b><br>' +
                     'Vehicles: %{x}<br>' +
                     'Percentage: %{text}<br>' +
                     '<extra></extra>'
    };

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      title: {
        text: 'Top 10 Manufacturers by Vehicle Count',
        font: { size: 16 }
      },
      xaxis: {
        title: { text: 'Number of Vehicles' },
        gridcolor: '#E5E7EB'
      },
      yaxis: {
        title: { text: '' },
        automargin: true
      },
      margin: {
        l: 120,
        r: 40,
        t: 60,
        b: 60
      },
      height: 400,
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
