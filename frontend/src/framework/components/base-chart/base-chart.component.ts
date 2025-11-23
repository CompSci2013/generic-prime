/**
 * Base Chart Component
 *
 * Generic Plotly.js chart container with data source pattern.
 * Domain-agnostic component that renders charts based on ChartDataSource transformations.
 *
 * Framework Component
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { Subject } from 'rxjs';

// Type-safe import of Plotly
const Plotly = require('plotly.js-dist-min');

// Define minimal Plotly types we need
interface PlotlyHTMLElement extends HTMLElement {
  on(event: string, callback: (data: any) => void): void;
  data?: any[];
  layout?: any;
}

/**
 * Chart data structure for Plotly.js
 */
export interface ChartData {
  /**
   * Plotly data traces
   */
  traces: any[];

  /**
   * Plotly layout configuration
   */
  layout: Partial<any>;

  /**
   * Optional click event data
   */
  clickData?: any;
}

/**
 * Abstract chart data source
 *
 * Transforms domain statistics into Plotly-ready chart data.
 * Implemented by domain-specific chart sources.
 *
 * @template TStatistics - Domain-specific statistics type
 */
export abstract class ChartDataSource<TStatistics = any> {
  /**
   * Transform statistics into chart data
   *
   * @param statistics - Domain statistics
   * @param highlights - Highlight filters (optional)
   * @param selectedValue - Currently selected value (optional)
   * @param containerWidth - Container width for responsive sizing
   * @returns Chart data or null if no data available
   */
  abstract transform(
    statistics: TStatistics | null,
    highlights: any,
    selectedValue: string | null,
    containerWidth: number
  ): ChartData | null;

  /**
   * Get chart title
   */
  abstract getTitle(): string;

  /**
   * Handle chart click event
   *
   * @param event - Plotly click event
   * @returns Clicked value or null
   */
  abstract handleClick(event: any): string | null;
}

/**
 * Base Chart Component
 *
 * Reusable Plotly.js chart container.
 * Works with any ChartDataSource implementation.
 *
 * @example
 * ```html
 * <app-base-chart
 *   [dataSource]="manufacturerChartSource"
 *   [statistics]="statistics$ | async"
 *   [highlights]="highlights"
 *   [selectedValue]="selectedManufacturer"
 *   (chartClick)="onChartClick($event)">
 * </app-base-chart>
 * ```
 */
@Component({
  selector: 'app-base-chart',
  templateUrl: './base-chart.component.html',
  styleUrls: ['./base-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseChartComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Chart container element
   */
  @ViewChild('chartContainer', { static: false })
  chartContainer!: ElementRef<HTMLDivElement>;

  /**
   * Chart data source (required)
   */
  @Input() dataSource!: ChartDataSource;

  /**
   * Statistics data
   */
  @Input() statistics: any | null = null;

  /**
   * Highlight filters
   */
  @Input() highlights: any = {};

  /**
   * Selected value for highlighting
   */
  @Input() selectedValue: string | null = null;

  /**
   * Chart click event
   */
  @Output() chartClick = new EventEmitter<{
    value: string;
    isHighlightMode: boolean;
  }>();

  /**
   * Highlight mode active flag
   */
  isHighlightModeActive = false;

  /**
   * Chart title
   */
  chartTitle = '';

  /**
   * Destroy subject for cleanup
   */
  private destroy$ = new Subject<void>();

  /**
   * Plotly chart element
   */
  private plotlyElement: PlotlyHTMLElement | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (!this.dataSource) {
      console.error('BaseChartComponent: dataSource is required');
    }
    this.chartTitle = this.dataSource?.getTitle() || 'Chart';
  }

  ngAfterViewInit(): void {
    // Render chart after view is initialized
    this.renderChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up Plotly chart
    if (this.plotlyElement) {
      Plotly.purge(this.plotlyElement);
    }
  }

  /**
   * Detect changes (called when inputs change)
   */
  ngOnChanges(): void {
    if (this.plotlyElement) {
      this.renderChart();
    }
  }

  /**
   * Handle window resize
   */
  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.plotlyElement) {
      Plotly.Plots.resize(this.plotlyElement);

      // Extra resize with delay for pop-out windows
      setTimeout(() => {
        if (this.plotlyElement) {
          Plotly.Plots.resize(this.plotlyElement);
        }
      }, 100);
    }
  }

  /**
   * Handle 'h' key down (enable highlight mode)
   */
  @HostListener('document:keydown.h')
  onHighlightKeyDown(): void {
    this.isHighlightModeActive = true;
    this.cdr.markForCheck();
  }

  /**
   * Handle 'h' key up (disable highlight mode)
   */
  @HostListener('document:keyup.h')
  onHighlightKeyUp(): void {
    this.isHighlightModeActive = false;
    this.cdr.markForCheck();
  }

  /**
   * Render Plotly chart
   */
  private renderChart(): void {
    if (!this.chartContainer || !this.dataSource) {
      return;
    }

    const element = this.chartContainer.nativeElement;
    const containerWidth = element.clientWidth;

    // Transform data using data source
    const chartData = this.dataSource.transform(
      this.statistics,
      this.highlights,
      this.selectedValue,
      containerWidth
    );

    if (!chartData) {
      // No data - clear chart
      if (this.plotlyElement) {
        Plotly.purge(this.plotlyElement);
        this.plotlyElement = null;
      }
      return;
    }

    // Plotly configuration
    const config: Partial<any> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d']
    };

    // Render or update chart
    if (this.plotlyElement) {
      // Update existing chart
      Plotly.react(this.plotlyElement, chartData.traces, chartData.layout, config);
    } else {
      // Create new chart
      Plotly.newPlot(element, chartData.traces, chartData.layout, config).then((gd: PlotlyHTMLElement) => {
        this.plotlyElement = gd;

        // Attach click handler
        gd.on('plotly_click', (data: any) => {
          const clickedValue = this.dataSource.handleClick(data);
          if (clickedValue) {
            this.chartClick.emit({
              value: clickedValue,
              isHighlightMode: this.isHighlightModeActive
            });
          }
        });

        // Attach selection handler (box select, lasso)
        gd.on('plotly_selected', (data: any) => {
          if (data && data.points && data.points.length > 0) {
            // Extract all selected values (x or y depending on chart orientation)
            const selectedValues = data.points.map((p: any) => p.x || p.y);

            // For ranges (multiple consecutive values), extract min and max
            let rangeValue: string;
            if (selectedValues.length > 1) {
              // Assume numeric or sortable values for range
              const sorted = selectedValues.sort((a: any, b: any) => {
                // Try numeric sort first
                const aNum = parseFloat(a);
                const bNum = parseFloat(b);
                if (!isNaN(aNum) && !isNaN(bNum)) {
                  return aNum - bNum;
                }
                // Fall back to string sort
                return String(a).localeCompare(String(b));
              });

              // Emit as min|max for range
              rangeValue = `${sorted[0]}|${sorted[sorted.length - 1]}`;
            } else {
              // Single value selection
              rangeValue = selectedValues[0];
            }

            // Emit selection (parent will handle converting to h_* params)
            this.chartClick.emit({
              value: rangeValue,
              isHighlightMode: this.isHighlightModeActive
            });
          }
        });
      });
    }
  }
}
