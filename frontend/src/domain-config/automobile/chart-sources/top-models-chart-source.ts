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

    // Check if we have segmented statistics from API (with total/highlighted counts)
    const hasSegmentedStats = statistics.modelsByManufacturer &&
      Object.values(statistics.modelsByManufacturer).some(models =>
        typeof models === 'object' && Object.values(models).some(v =>
          typeof v === 'object' && 'total' in v
        )
      );

    let traces: any[] = [];

    if (hasSegmentedStats && statistics.modelsByManufacturer) {
      // Use API's segmented statistics with {total, highlighted}
      const modelEntries: Array<[string, any]> = [];

      Object.entries(statistics.modelsByManufacturer).forEach(([manufacturer, models]) => {
        Object.entries(models).forEach(([modelName, stats]) => {
          modelEntries.push([`${manufacturer} ${modelName}`, stats]);
        });
      });

      // Sort by total count descending and take top 20
      const sorted = modelEntries
        .sort((a, b) => ((b[1] as any).total || 0) - ((a[1] as any).total || 0))
        .slice(0, 20);

      const modelLabels = sorted.map(([label]) => label);
      const highlightedCounts = sorted.map(([, stats]: [string, any]) => stats.highlighted || 0);
      const otherCounts = sorted.map(([, stats]: [string, any]) =>
        (stats.total || 0) - (stats.highlighted || 0)
      );

      // Create stacked bar traces
      traces = [
        {
          type: 'bar',
          name: 'Other',
          x: modelLabels,
          y: otherCounts,
          marker: { color: '#9CA3AF' },
          hovertemplate: '<b>%{x}</b><br>Other: %{y}<extra></extra>'
        },
        {
          type: 'bar',
          name: 'Highlighted',
          x: modelLabels,
          y: highlightedCounts,
          marker: { color: '#3B82F6' },
          hovertemplate: '<b>%{x}</b><br>Highlighted: %{y}<extra></extra>'
        }
      ];
    } else {
      // Fallback: simple blue bars using topModels
      const topModels = statistics.topModels.slice(0, 20);
      const modelLabels = topModels.map(m => `${m.manufacturer} ${m.name}`);
      const counts = topModels.map(m => m.instanceCount);

      traces = [{
        type: 'bar',
        x: modelLabels,
        y: counts,
        marker: { color: '#3B82F6' },
        hovertemplate: '<b>%{x}</b><br>Count: %{y}<br><extra></extra>'
      }];
    }

    // Create layout
    const layout: Partial<any> = {
      barmode: hasSegmentedStats ? 'stack' : undefined,
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
      showlegend: hasSegmentedStats
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
    return 'Top Models by VIN Count';
  }

  /**
   * Handle chart click event
   *
   * Supports both single-click and box selection.
   * For box selection, returns comma-separated list of unique models.
   */
  handleClick(event: any): string | null {
    if (event.points && event.points.length > 0) {
      // Extract all model names from selected points
      const models = event.points.map((point: any) => point.x as string);

      // Remove duplicates (box selection may select both stacked bars)
      const uniqueModels = [...new Set(models)];

      // Return comma-separated list (or single value)
      return uniqueModels.join(',');
    }
    return null;
  }
}
