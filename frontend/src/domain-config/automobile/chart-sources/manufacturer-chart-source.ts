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
    _selectedValue: string | null,
    _containerWidth: number
  ): ChartData | null {
    if (!statistics || !statistics.topManufacturers || statistics.topManufacturers.length === 0) {
      return null;
    }

    // Check if we have highlight filters active (client-side highlighting)
    const hasHighlights = highlights && highlights.manufacturer;

    let traces: Plotly.Data[] = [];

    if (hasHighlights && statistics.byManufacturer) {
      // Client-side segmentation: compute highlighted vs other counts
      const entries = Object.entries(statistics.byManufacturer)
        .map(([name, value]) => {
          // Handle both simple numbers and {total, highlighted} objects
          const count = typeof value === 'object' ? value.total : value;
          return [name, count] as [string, number];
        })
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

      const manufacturers = entries.map(([name]) => name);
      const highlightedCounts = entries.map(([name, count]) =>
        name === highlights.manufacturer ? count : 0
      );
      const otherCounts = entries.map(([name, count]) =>
        name === highlights.manufacturer ? 0 : count
      );

      // Create stacked bar traces
      traces = [
        {
          type: 'bar',
          name: 'Other',
          x: manufacturers,
          y: otherCounts,
          marker: { color: '#9CA3AF' }, // Gray
          hovertemplate: '<b>%{x}</b><br>Other: %{y}<extra></extra>'
        },
        {
          type: 'bar',
          name: 'Highlighted',
          x: manufacturers,
          y: highlightedCounts,
          marker: { color: '#3B82F6' }, // Blue
          hovertemplate: '<b>%{x}</b><br>Highlighted: %{y}<extra></extra>'
        }
      ];
    } else {
      // No highlights: simple blue bars using topManufacturers
      const topManufacturers = statistics.topManufacturers.slice(0, 20);
      const manufacturers = topManufacturers.map(m => m.name);
      const counts = topManufacturers.map(m => m.count);

      traces = [{
        type: 'bar',
        x: manufacturers,
        y: counts,
        marker: { color: '#3B82F6' },
        hovertemplate: '<b>%{x}</b><br>Count: %{y}<br><extra></extra>'
      }];
    }

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      barmode: hasHighlights ? 'stack' : undefined,
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
      showlegend: hasHighlights
    };

    return {
      traces: traces,
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
      return event.points[0].x; // Return manufacturer name (x-axis value)
    }
    return null;
  }
}
