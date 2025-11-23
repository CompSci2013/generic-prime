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
    _selectedValue: string | null,
    _containerWidth: number
  ): ChartData | null {
    if (!statistics || !statistics.yearDistribution || statistics.yearDistribution.length === 0) {
      return null;
    }

    // Check if we have highlight filters active (client-side highlighting)
    const hasHighlights = highlights && (highlights.yearMin !== undefined || highlights.yearMax !== undefined);

    let traces: Plotly.Data[] = [];

    if (hasHighlights && statistics.byYearRange) {
      // Client-side segmentation: compute highlighted vs other counts based on year range
      const yearMin = highlights.yearMin ?? -Infinity;
      const yearMax = highlights.yearMax ?? Infinity;

      const entries = Object.entries(statistics.byYearRange)
        .map(([year, value]) => {
          // Handle both simple numbers and {total, highlighted} objects
          const count = typeof value === 'object' ? value.total : value;
          return [parseInt(year, 10), count] as [number, number];
        })
        .sort((a, b) => a[0] - b[0]); // Sort by year ascending

      const years = entries.map(([year]) => year.toString());
      const highlightedCounts = entries.map(([year, count]) =>
        year >= yearMin && year <= yearMax ? count : 0
      );
      const otherCounts = entries.map(([year, count]) =>
        year >= yearMin && year <= yearMax ? 0 : count
      );

      // Create stacked bar traces
      traces = [
        {
          type: 'bar',
          name: 'Other',
          x: years,
          y: otherCounts,
          marker: { color: '#9CA3AF' },
          hovertemplate: '<b>%{x}</b><br>Other: %{y}<extra></extra>'
        },
        {
          type: 'bar',
          name: 'Highlighted',
          x: years,
          y: highlightedCounts,
          marker: { color: '#3B82F6' },
          hovertemplate: '<b>%{x}</b><br>Highlighted: %{y}<extra></extra>'
        }
      ];
    } else {
      // No highlights: simple blue bars using yearDistribution
      const sortedData = [...statistics.yearDistribution].sort((a, b) => a.year - b.year);
      const years = sortedData.map(y => y.year.toString());
      const counts = sortedData.map(y => y.count);

      traces = [{
        type: 'bar',
        x: years,
        y: counts,
        marker: { color: '#3B82F6' },
        hovertemplate: '<b>%{x}</b><br>Count: %{y}<br><extra></extra>'
      }];
    }

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      barmode: hasHighlights ? 'stack' : undefined,
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
