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
    highlights: any,
    selectedValue: string | null,
    containerWidth: number
  ): ChartData | null {
    if (!statistics || !statistics.topModels || statistics.topModels.length === 0) {
      return null;
    }

    // Get top 10 models
    const topModels = statistics.topModels.slice(0, 10);

    // Extract data (reverse for bottom-to-top display)
    const modelLabels = topModels.map(m => `${m.manufacturer} ${m.name}`).reverse();
    const instanceCounts = topModels.map(m => m.instanceCount).reverse();
    const percentages = topModels.map(m => m.percentage).reverse();

    // Create bar colors (highlight selected)
    const colors = modelLabels.map(label =>
      label === selectedValue ? '#EF4444' : '#10B981'
    );

    // Create Plotly trace
    const trace: any = {
      type: 'bar',
      x: instanceCounts,
      y: modelLabels,
      orientation: 'h',
      marker: {
        color: colors
      },
      text: percentages.map(p => `${p.toFixed(1)}%`),
      textposition: 'outside',
      hovertemplate: '<b>%{y}</b><br>' +
                     'VIN Instances: %{x}<br>' +
                     'Percentage: %{text}<br>' +
                     '<extra></extra>'
    };

    // Create layout
    const layout: Partial<any> = {
      title: {
        text: 'Top 10 Models by VIN Count',
        font: { size: 16 }
      },
      xaxis: {
        title: 'Number of VIN Instances',
        gridcolor: '#E5E7EB'
      },
      yaxis: {
        title: '',
        automargin: true
      },
      margin: {
        l: 150,
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
