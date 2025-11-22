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
    selectedValue: string | null,
    containerWidth: number
  ): ChartData | null {
    if (!statistics || !statistics.bodyClassDistribution || statistics.bodyClassDistribution.length === 0) {
      return null;
    }

    const distribution = statistics.bodyClassDistribution;

    // Extract data
    const labels = distribution.map(b => b.name);
    const values = distribution.map(b => b.count);
    const percentages = distribution.map(b => b.percentage);

    // Assign colors
    const colors = labels.map(label =>
      this.BODY_CLASS_COLORS[label] || '#94A3B8'
    );

    // Create Plotly trace
    const trace: Plotly.Data = {
      type: 'pie',
      labels: labels,
      values: values,
      marker: {
        colors: colors
      },
      textinfo: 'label+percent',
      hovertemplate: '<b>%{label}</b><br>' +
                     'Vehicles: %{value}<br>' +
                     'Percentage: %{percent}<br>' +
                     '<extra></extra>'
    };

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      title: {
        text: 'Distribution by Body Class',
        font: { size: 16 }
      },
      height: 350,
      showlegend: true,
      legend: {
        orientation: 'v',
        x: 1,
        y: 0.5
      },
      margin: {
        l: 20,
        r: 150,
        t: 60,
        b: 20
      },
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
