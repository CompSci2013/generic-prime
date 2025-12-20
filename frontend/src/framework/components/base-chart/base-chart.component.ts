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
   * Error state for error boundary
   */
  hasError = false;

  /**
   * Error message for display
   */
  errorMessage = '';

  /**
   * Destroy subject for cleanup
   */
  private destroy$ = new Subject<void>();

  /**
   * Plotly chart element
   */
  private plotlyElement: PlotlyHTMLElement | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * Angular lifecycle hook - Component initialization
   *
   * Called once when the component is created. Validates that required inputs
   * are provided and initializes chart title from data source.
   *
   * @lifecycle
   * Executes: After constructor, before ngAfterViewInit
   * Change Detection: Safe to trigger
   * DOM Access: Not yet available
   *
   * @remarks
   * **Validation**:
   * - Logs error to console if dataSource is not provided
   * - BaseChartComponent requires a ChartDataSource instance
   *
   * **Initialization**:
   * - Sets chartTitle from dataSource.getTitle()
   * - Falls back to 'Chart' if dataSource is not available
   */
  ngOnInit(): void {
    if (!this.dataSource) {
      console.error('BaseChartComponent: dataSource is required');
    }
    this.chartTitle = this.dataSource?.getTitle() || 'Chart';
  }

  /**
   * Angular lifecycle hook - View initialization completion
   *
   * Called once after the component's view and child views are initialized.
   * This is where the Plotly chart is first rendered into the DOM.
   *
   * @lifecycle
   * Executes: After ngOnInit, after DOM is fully rendered
   * Change Detection: Can be triggered
   * DOM Access: ViewChild references now available
   *
   * @remarks
   * **Why Plotly is initialized here**:
   * - ViewChild chartContainer is now available
   * - DOM element is rendered and in the document
   * - Container dimensions (clientWidth) are determined
   * - Plotly needs actual DOM element and dimensions
   */
  ngAfterViewInit(): void {
    // Render chart after view is initialized
    this.renderChart();
  }

  /**
   * Angular lifecycle hook - Component destruction cleanup
   *
   * Called once when the component is destroyed. Cleans up Plotly chart
   * and completes RxJS subjects to prevent memory leaks.
   *
   * @lifecycle
   * Executes: When component is removed from DOM
   * Change Detection: No longer triggered
   *
   * @remarks
   * **Cleanup Tasks**:
   * 1. Signal destroy$ subject to all subscribers
   * 2. Complete destroy$ subject (no more emissions)
   * 3. Purge Plotly chart from DOM (if it exists)
   *
   * **Memory Leak Prevention**:
   * - Destroy$ subject stops RxJS subscriptions
   * - Plotly.purge() removes canvas and frees memory
   * - Without cleanup, multiple chart instances would accumulate
   *
   * @see destroy$ - RxJS subject used for cleanup
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up Plotly chart
    if (this.plotlyElement) {
      Plotly.purge(this.plotlyElement);
    }
  }

  /**
   * Angular lifecycle hook - Input change detection
   *
   * Called when any @Input property changes. If a Plotly chart is already
   * rendered, the chart is updated with the new data.
   *
   * @lifecycle
   * Executes: When any @Input property changes (after ngOnInit)
   * Timing: Before change detection runs
   *
   * @remarks
   * **Triggered by changes to**:
   * - @Input() statistics - New statistics data
   * - @Input() highlights - Updated highlight filters
   * - @Input() selectedValue - Different selection
   *
   * **Behavior**:
   * - Only rerenders if Plotly chart is already initialized
   * - Skips render during initial component setup
   * - Called even if multiple inputs change at once
   *
   * @see statistics - Statistics data input
   * @see highlights - Highlight filters input
   * @see selectedValue - Selected value input
   */
  ngOnChanges(): void {
    if (this.plotlyElement) {
      this.renderChart();
    }
  }

  /**
   * Handle window resize events
   *
   * HostListener for window:resize events that keeps Plotly chart
   * responsive to container dimension changes.
   *
   * @private (HostListener)
   * @remarks
   * **Why resize is needed**:
   * - When browser window resizes, Plotly must recalculate dimensions
   * - Without resize, chart may appear stretched or clipped
   *
   * **Double resize for pop-out windows**:
   * - First resize() call updates Plotly's internal state
   * - setTimeout with 100ms delay for browser rendering
   * - Second resize() call applies final dimensions
   * - Needed for pop-out/docking window scenarios
   *
   * @see onWindowResize - The implementation
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
   * Render Plotly chart with error boundary
   */
  private renderChart(): void {
    if (!this.chartContainer || !this.dataSource) {
      return;
    }

    try {
      // Clear any previous error state
      this.hasError = false;
      this.errorMessage = '';

      const element = this.chartContainer.nativeElement;
      const containerWidth = element.clientWidth;

      // Transform data using data source (can throw on malformed data)
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
        Plotly.newPlot(element, chartData.traces, chartData.layout, config)
          .then((gd: PlotlyHTMLElement) => {
            this.plotlyElement = gd;
            this.attachEventHandlers(gd);
          })
          .catch((err: Error) => {
            this.handleRenderError(err, 'Failed to create chart');
          });
      }
    } catch (err) {
      this.handleRenderError(err as Error, 'Chart rendering failed');
    }
  }

  /**
   * Attach Plotly event handlers
   */
  private attachEventHandlers(gd: PlotlyHTMLElement): void {
    // Attach click handler
    gd.on('plotly_click', (data: any) => {
      try {
        const clickedValue = this.dataSource.handleClick(data);
        if (clickedValue) {
          this.chartClick.emit({
            value: clickedValue,
            isHighlightMode: this.isHighlightModeActive
          });
        }
      } catch (err) {
        console.error('[BaseChart] Click handler error:', err);
      }
    });

    // Attach selection handler (box select, lasso)
    gd.on('plotly_selected', (data: any) => {
      try {
        // Delegate to chart-specific handleClick() method
        // This ensures consistent formatting (comma-separated for most charts, pipe for year ranges)
        const selectedValue = this.dataSource.handleClick(data);
        if (selectedValue) {
          this.chartClick.emit({
            value: selectedValue,
            isHighlightMode: this.isHighlightModeActive
          });
        }
      } catch (err) {
        console.error('[BaseChart] Selection handler error:', err);
      }
    });
  }

  /**
   * Handle render errors with user-friendly fallback
   */
  private handleRenderError(err: Error, context: string): void {
    console.error(`[BaseChart] ${context}:`, err);
    this.hasError = true;
    this.errorMessage = `${context}: ${err.message || 'Unknown error'}`;
    this.cdr.markForCheck();

    // Clean up any partial chart state
    if (this.plotlyElement) {
      try {
        Plotly.purge(this.plotlyElement);
      } catch {
        // Ignore purge errors
      }
      this.plotlyElement = null;
    }
  }

  /**
   * Retry rendering the chart (called from template)
   */
  retryRender(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.cdr.markForCheck();

    // Attempt to re-render
    setTimeout(() => this.renderChart(), 0);
  }
}
