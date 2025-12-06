/**
 * Statistics Panel Component
 *
 * Domain-agnostic container for rendering statistical charts.
 * Displays multiple charts based on domain configuration.
 *
 * Framework Component
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ChartConfig, DomainConfig } from '../../models/domain-config.interface';
import { PopOutMessageType } from '../../models/popout.interface';
import { PopOutContextService } from '../../services/popout-context.service';
import { ResourceManagementService } from '../../services/resource-management.service';
import { UrlStateService } from '../../services/url-state.service';
import { ChartDataSource } from '../base-chart/base-chart.component';

/**
 * Statistics Panel Component
 *
 * Renders statistical charts for a domain.
 * Uses BaseChartComponent for each chart.
 * Self-contained - creates its own ResourceManagementService instance.
 *
 * @example
 * ```html
 * <app-statistics-panel
 *   [domainConfig]="domainConfig">
 * </app-statistics-panel>
 * ```
 */
@Component({
  selector: 'app-statistics-panel',
  templateUrl: './statistics-panel.component.html',
  styleUrls: ['./statistics-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsPanelComponent implements OnInit, OnDestroy {
  /** Environment configuration for conditional test-id rendering */
  readonly environment = environment;

  /**
   * Domain configuration
   */
  @Input() domainConfig!: DomainConfig<any, any, any>;

  /**
   * Visible charts (filtered by visibility flag)
   */
  visibleCharts: Array<{
    config: ChartConfig;
    dataSource: ChartDataSource;
  }> = [];

  /**
   * Panel collapsed state
   */
  panelCollapsed = false;

  /**
   * Statistics data (from resource service)
   */
  statistics: any | null = null;

  /**
   * Highlight filters (from resource service)
   */
  highlights: any = {};

  // Observable for statistics
  statistics$!: Observable<any | undefined>;

  /**
   * Destroy subject for cleanup
   */
  private destroy$ = new Subject<void>();

  constructor(
    private resourceService: ResourceManagementService<any, any, any>,
    private route: ActivatedRoute,
    private urlState: UrlStateService,
    private cdr: ChangeDetectorRef,
    private popOutContext: PopOutContextService
  ) {}

  ngOnInit(): void {
    if (!this.domainConfig) {
      console.error('StatisticsPanelComponent: domainConfig is required');
      return;
    }

    // Subscribe to statistics stream
    this.statistics$ = this.resourceService.statistics$;
    this.statistics$
      .pipe(takeUntil(this.destroy$))
      .subscribe(statistics => {
        this.statistics = statistics || null;
        this.cdr.markForCheck();
      });

    // Subscribe to URL params to extract highlights (h_* parameters)
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.highlights = this.extractHighlightsFromParams(params);
        this.cdr.markForCheck();
      });

    // Filter visible charts and map to data sources
    this.visibleCharts = (this.domainConfig.charts || [])
      .filter(chart => chart.visible !== false)
      .map(chart => ({
        config: chart,
        dataSource: this.getDataSource(chart.dataSourceId)
      }))
      .filter(item => item.dataSource !== null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get data source by ID from domain config
   */
  private getDataSource(dataSourceId: string): ChartDataSource {
    if (!this.domainConfig.chartDataSources) {
      console.warn(`No chartDataSources map in domain config`);
      return null as any;
    }

    const dataSource = this.domainConfig.chartDataSources[dataSourceId];
    if (!dataSource) {
      console.warn(`No data source found for ID: ${dataSourceId}`);
      return null as any;
    }

    return dataSource;
  }

  /**
   * Extract highlight parameters from URL (h_* parameters)
   */
  private extractHighlightsFromParams(params: Params): any {
    const highlights: any = {};

    // Extract all h_* parameters
    Object.keys(params).forEach(key => {
      if (key.startsWith('h_')) {
        const filterKey = key.substring(2); // Remove 'h_' prefix
        highlights[filterKey] = params[key];
      }
    });

    return highlights;
  }

  /**
   * Handle chart click event
   */
  onChartClick(event: { value: string; isHighlightMode: boolean }, chartId: string): void {
    if (event.isHighlightMode) {
      // Highlight mode: Add h_* URL parameter based on chart type
      const newParams: Record<string, any> = {};

      // Handle range selections (value contains min|max)
      if (chartId === 'year-distribution' && event.value.includes('|')) {
        const [min, max] = event.value.split('|');
        newParams['h_yearMin'] = min;
        newParams['h_yearMax'] = max;
      } else {
        // Single value or other chart types
        const paramName = this.getHighlightParamName(chartId);
        if (paramName) {
          newParams[paramName] = event.value;
        }
      }

      // Use UrlStateService instead of router.navigate() directly
      // This ensures URL-First architecture compliance
      console.log('[StatisticsPanel] Setting highlight params:', newParams);
      this.urlState.setParams(newParams);

      // If we're in a pop-out window, broadcast the URL change to main window
      if (this.popOutContext.isInPopOut()) {
        console.log('[StatisticsPanel] Broadcasting URL params change to main window:', newParams);
        this.popOutContext.sendMessage({
          type: PopOutMessageType.URL_PARAMS_CHANGED,
          payload: { params: newParams },
          timestamp: Date.now()
        });
      }
    } else {
      // Normal mode: Add filter URL parameter (non-highlight)
      const newParams: Record<string, any> = {};

      // Handle range selections (value contains min|max)
      if (chartId === 'year-distribution' && event.value.includes('|')) {
        const [min, max] = event.value.split('|');
        newParams['yearMin'] = min;
        newParams['yearMax'] = max;
      } else {
        // Single value or other chart types
        const paramName = this.getFilterParamName(chartId);
        if (paramName) {
          newParams[paramName] = event.value;
        }
      }

      // Use UrlStateService to update filter parameters
      console.log('[StatisticsPanel] Setting filter params:', newParams);
      this.urlState.setParams(newParams);

      // If we're in a pop-out window, broadcast the URL change to main window
      if (this.popOutContext.isInPopOut()) {
        console.log('[StatisticsPanel] Broadcasting filter params change to main window:', newParams);
        this.popOutContext.sendMessage({
          type: PopOutMessageType.URL_PARAMS_CHANGED,
          payload: { params: newParams },
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Map chart ID to highlight URL parameter name
   */
  private getHighlightParamName(chartId: string): string | null {
    const mapping: Record<string, string> = {
      'manufacturer-distribution': 'h_manufacturer',
      'top-models': 'h_modelCombos',
      'body-class-distribution': 'h_bodyClass'
      // year-distribution handled separately (uses h_yearMin and h_yearMax)
    };

    return mapping[chartId] || null;
  }

  /**
   * Map chart ID to filter URL parameter name (non-highlight)
   */
  private getFilterParamName(chartId: string): string | null {
    const mapping: Record<string, string> = {
      'manufacturer-distribution': 'manufacturer',
      'top-models': 'modelCombos',
      'body-class-distribution': 'bodyClass'
      // year-distribution handled separately (uses yearMin and yearMax)
    };

    return mapping[chartId] || null;
  }

  /**
   * Track by function for ngFor
   */
  trackByChartId(index: number, item: { config: ChartConfig }): string {
    return item.config.id;
  }
}
