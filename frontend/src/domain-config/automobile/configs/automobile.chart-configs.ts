/**
 * Automobile Domain - Chart Configurations
 *
 * Defines chart visualizations for automobile statistics.
 * Charts display aggregated data and distributions.
 *
 * Domain: Automobile Discovery
 */

import { ChartConfig } from '../../../framework/models/domain-config.interface';

/**
 * Automobile chart configurations
 *
 * Array of chart definitions for the statistics panel.
 * Each chart visualizes a different aspect of the vehicle data.
 *
 * @example
 * ```typescript
 * <div class="statistics-panel">
 *   <app-chart
 *     *ngFor="let chart of AUTOMOBILE_CHART_CONFIGS"
 *     [config]="chart"
 *     [data]="chartData[chart.dataSourceId]">
 *   </app-chart>
 * </div>
 * ```
 */
export const AUTOMOBILE_CHART_CONFIGS: ChartConfig[] = [
  /**
   * Manufacturer distribution (bar chart)
   */
  {
    id: 'manufacturer-distribution',
    title: 'Vehicles by Manufacturer',
    type: 'bar',
    dataSourceId: 'manufacturer-stats',
    height: 400,
    width: '100%',
    visible: true,
    collapsible: true,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y', // Horizontal bars
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Top 10 Manufacturers by Vehicle Count'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.x || 0;
              const percentage = context.raw.percentage || 0;
              return `${label}: ${value} vehicles (${percentage.toFixed(1)}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of Vehicles'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Manufacturer'
          }
        }
      }
    }
  },

  /**
   * Body class distribution (pie chart)
   */
  {
    id: 'body-class-distribution',
    title: 'Vehicles by Body Class',
    type: 'pie',
    dataSourceId: 'body-class-stats',
    height: 350,
    width: '100%',
    visible: true,
    collapsible: true,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right'
        },
        title: {
          display: true,
          text: 'Distribution by Body Class'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const percentage = context.raw.percentage || 0;
              return `${label}: ${value} vehicles (${percentage.toFixed(1)}%)`;
            }
          }
        }
      }
    }
  },

  /**
   * Year distribution (line chart)
   */
  {
    id: 'year-distribution',
    title: 'Vehicles by Year',
    type: 'line',
    dataSourceId: 'year-stats',
    height: 350,
    width: '100%',
    visible: true,
    collapsible: true,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Vehicle Distribution Over Time'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Number of Vehicles'
          },
          beginAtZero: true
        }
      }
    }
  },

  /**
   * Top models (bar chart)
   */
  {
    id: 'top-models',
    title: 'Top Models by Instance Count',
    type: 'bar',
    dataSourceId: 'top-models-stats',
    height: 400,
    width: '100%',
    visible: true,
    collapsible: true,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y', // Horizontal bars
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Top 10 Models by VIN Count'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.x || 0;
              const percentage = context.raw.percentage || 0;
              return `${value.toLocaleString()} VINs (${percentage.toFixed(1)}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of VIN Instances'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Model'
          }
        }
      }
    }
  },

  /**
   * Instance count histogram
   */
  {
    id: 'instance-count-histogram',
    title: 'VIN Count Distribution',
    type: 'histogram',
    dataSourceId: 'instance-count-distribution',
    height: 350,
    width: '100%',
    visible: false, // Hidden by default (advanced visualization)
    collapsible: true,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Distribution of VIN Counts'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'VIN Count Range'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Number of Vehicles'
          },
          beginAtZero: true
        }
      }
    }
  }
];

/**
 * Chart visibility presets
 *
 * Predefined chart visibility configurations
 */
export const AUTOMOBILE_CHART_PRESETS = {
  /**
   * Default charts (most useful)
   */
  default: [
    'manufacturer-distribution',
    'body-class-distribution',
    'year-distribution'
  ],

  /**
   * All charts visible
   */
  all: AUTOMOBILE_CHART_CONFIGS.map((chart) => chart.id),

  /**
   * Distribution-focused
   */
  distributions: [
    'manufacturer-distribution',
    'body-class-distribution',
    'instance-count-histogram'
  ],

  /**
   * Top performers
   */
  top: ['manufacturer-distribution', 'top-models'],

  /**
   * Time-based analysis
   */
  temporal: ['year-distribution']
};

/**
 * Chart color schemes
 *
 * Consistent color palettes for charts
 */
export const AUTOMOBILE_CHART_COLORS = {
  /**
   * Primary color scheme (for bar/line charts)
   */
  primary: [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1' // Indigo
  ],

  /**
   * Body class colors (semantic)
   */
  bodyClass: {
    Sedan: '#3B82F6',
    SUV: '#10B981',
    Truck: '#F59E0B',
    Coupe: '#EF4444',
    Wagon: '#8B5CF6',
    Van: '#EC4899',
    Minivan: '#06B6D4',
    Convertible: '#84CC16',
    Hatchback: '#F97316'
  },

  /**
   * Gradient colors (for heatmaps)
   */
  gradient: {
    low: '#DBEAFE',
    medium: '#60A5FA',
    high: '#1E40AF'
  }
};

/**
 * Chart data transformers
 *
 * Functions to transform statistics data into chart-ready format
 */
export const AUTOMOBILE_CHART_TRANSFORMERS = {
  /**
   * Transform manufacturer stats to chart data
   */
  manufacturerStats: (stats: any[]) => {
    const labels = stats.map((s) => s.name);
    const data = stats.map((s) => s.count);
    const backgroundColors = AUTOMOBILE_CHART_COLORS.primary.slice(
      0,
      stats.length
    );

    return {
      labels,
      datasets: [
        {
          label: 'Vehicles',
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }
      ]
    };
  },

  /**
   * Transform body class stats to chart data
   */
  bodyClassStats: (stats: any[]) => {
    const labels = stats.map((s) => s.name);
    const data = stats.map((s) => s.count);
    const backgroundColors = stats.map(
      (s) =>
        AUTOMOBILE_CHART_COLORS.bodyClass[
          s.name as keyof typeof AUTOMOBILE_CHART_COLORS.bodyClass
        ] || AUTOMOBILE_CHART_COLORS.primary[0]
    );

    return {
      labels,
      datasets: [
        {
          label: 'Vehicles',
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }
      ]
    };
  },

  /**
   * Transform year stats to chart data
   */
  yearStats: (stats: any[]) => {
    const sortedStats = [...stats].sort((a, b) => a.year - b.year);
    const labels = sortedStats.map((s) => String(s.year));
    const data = sortedStats.map((s) => s.count);

    return {
      labels,
      datasets: [
        {
          label: 'Vehicles',
          data,
          borderColor: AUTOMOBILE_CHART_COLORS.primary[0],
          backgroundColor: `${AUTOMOBILE_CHART_COLORS.primary[0]}33`, // 20% opacity
          tension: 0.1,
          fill: true
        }
      ]
    };
  },

  /**
   * Transform top models stats to chart data
   */
  topModelsStats: (stats: any[]) => {
    const labels = stats.map((s) => `${s.manufacturer} ${s.name}`);
    const data = stats.map((s) => s.instanceCount);
    const backgroundColors = AUTOMOBILE_CHART_COLORS.primary.slice(
      0,
      stats.length
    );

    return {
      labels,
      datasets: [
        {
          label: 'VIN Instances',
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }
      ]
    };
  }
};
