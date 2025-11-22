/**
 * Body Class Chart Data Source
 *
 * Transforms vehicle statistics into Plotly.js pie chart
 * showing distribution by body class.
 *
 * Domain: Automobile
 */

import { ChartDataSource, ChartData } from '../../../framework/components/base-chart/base-chart.component';
import { VehicleStatistics } from '../models/automobile.statistics';

/**
 * Body class distribution chart data source
 *
 * Creates a pie chart showing vehicle distribution by body class.
 */
export class BodyClassChartDataSource extends ChartDataSource<VehicleStatistics> {
  /**
   * Color scheme for body classes
   */
  private readonly BODY_CLASS_COLORS: Record<string, string> = {
    'Sedan': '#3B82F6',
    'SUV': '#10B981',
    'Truck': '#F59E0B',
    'Pickup': '#F59E0B',
    'Coupe': '#EF4444',
    'Wagon': '#8B5CF6',
    'Van': '#EC4899',
    'Minivan': '#06B6D4',
    'Convertible': '#84CC16',
    'Hatchback': '#F97316'
  };

  /**
   * Transform statistics into Plotly chart data
   */
  transform(
    statistics: VehicleStatistics | null,
    _highlights: any,
    _selectedValue: string | null,
    _containerWidth: number
  ): ChartData | null {
    if (!statistics || !statistics.bodyClassDistribution || statistics.bodyClassDistribution.length === 0) {
      return null;
    }

    const distribution = statistics.bodyClassDistribution;

    // Extract data for vertical bars
    const labels = distribution.map(b => b.name);
    const counts = distribution.map(b => b.count);

    // Create bar trace (blue bars, no highlighting until API supports it)
    const trace: Plotly.Data = {
      type: 'bar',
      x: labels,
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
        b: 100
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
    return 'Vehicles by Body Class';
  }

  /**
   * Handle chart click event
   */
  handleClick(event: any): string | null {
    if (event.points && event.points.length > 0) {
      return event.points[0].label; // Return body class name
    }
    return null;
  }
}
