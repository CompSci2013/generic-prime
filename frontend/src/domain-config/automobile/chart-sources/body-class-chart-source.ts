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
    highlights: any,
    _selectedValue: string | null,
    _containerWidth: number
  ): ChartData | null {
    if (!statistics || !statistics.bodyClassDistribution || statistics.bodyClassDistribution.length === 0) {
      return null;
    }

    // Check if we have highlight filters active (client-side highlighting)
    const hasHighlights = highlights && highlights.bodyClass;

    let traces: Plotly.Data[] = [];

    if (hasHighlights && statistics.byBodyClass) {
      // Client-side segmentation: compute highlighted vs other counts
      const entries = Object.entries(statistics.byBodyClass)
        .map(([name, value]) => {
          // Handle both simple numbers and {total, highlighted} objects
          const count = typeof value === 'object' ? value.total : value;
          return [name, count] as [string, number];
        })
        .sort((a, b) => b[1] - a[1]);

      const labels = entries.map(([name]) => name);
      const highlightedCounts = entries.map(([name, count]) =>
        name === highlights.bodyClass ? count : 0
      );
      const otherCounts = entries.map(([name, count]) =>
        name === highlights.bodyClass ? 0 : count
      );

      // Create stacked bar traces
      traces = [
        {
          type: 'bar',
          name: 'Other',
          x: labels,
          y: otherCounts,
          marker: { color: '#9CA3AF' },
          hovertemplate: '<b>%{x}</b><br>Other: %{y}<extra></extra>'
        },
        {
          type: 'bar',
          name: 'Highlighted',
          x: labels,
          y: highlightedCounts,
          marker: { color: '#3B82F6' },
          hovertemplate: '<b>%{x}</b><br>Highlighted: %{y}<extra></extra>'
        }
      ];
    } else {
      // No highlights: simple blue bars using bodyClassDistribution
      const distribution = statistics.bodyClassDistribution;
      const labels = distribution.map(b => b.name);
      const counts = distribution.map(b => b.count);

      traces = [{
        type: 'bar',
        x: labels,
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
        b: 100
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
    return 'Vehicles by Body Class';
  }

  /**
   * Handle chart click event
   */
  handleClick(event: any): string | null {
    if (event.points && event.points.length > 0) {
      return event.points[0].x; // Return body class name (x-axis value)
    }
    return null;
  }
}
