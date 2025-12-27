/**
 * Statistics Panel Component - Angular 17 Signals Architecture
 *
 * Domain-agnostic container for rendering statistical charts.
 * Uses Angular Signals for reactive state management.
 *
 * Framework Component
 */

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  Signal
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { ChartConfig, DomainConfig } from '../../models/domain-config.interface';
import { PopOutMessageType } from '../../models/popout.interface';
import { PopOutContextService } from '../../services/popout-context.service';
import { ResourceManagementService } from '../../services/resource-management.service';
import { UrlStateService } from '../../services/url-state.service';
import { ChartDataSource, BaseChartComponent } from '../base-chart/base-chart.component';

import { SharedModule } from 'primeng/api';
import { PanelModule } from 'primeng/panel';

/**
 * Statistics Panel Component
 *
 * Renders statistical charts for a domain.
 * Uses BaseChartComponent for each chart.
 *
 * **Angular 17 Patterns**:
 * - `inject()` for dependency injection
 * - Direct Signal access from ResourceManagementService
 * - `DestroyRef` + `takeUntilDestroyed()` for cleanup
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PanelModule, SharedModule, BaseChartComponent]
})
export class StatisticsPanelComponent implements OnInit {

  // ============================================================================
  // Dependency Injection (Angular 17 inject() pattern)
  // ============================================================================
  private readonly resourceService = inject<ResourceManagementService<any, any, any>>(ResourceManagementService);
  private readonly urlState = inject(UrlStateService);
  private readonly popOutContext = inject(PopOutContextService);

  // ============================================================================
  // Configuration
  // ============================================================================

  readonly environment = environment;

  @Input() domainConfig!: DomainConfig<any, any, any>;

  // ============================================================================
  // Signal-Based State (Direct from ResourceManagementService)
  // ============================================================================

  get statistics(): Signal<any | undefined> {
    return this.resourceService.statistics;
  }

  get highlights(): Signal<any> {
    return this.resourceService.highlights;
  }

  // ============================================================================
  // Component-Local State
  // ============================================================================

  visibleCharts: Array<{
    config: ChartConfig;
    dataSource: ChartDataSource;
  }> = [];

  panelCollapsed = false;

  // ============================================================================
  // Lifecycle
  // ============================================================================

  ngOnInit(): void {
    if (!this.domainConfig) {
      console.error('StatisticsPanelComponent: domainConfig is required');
      return;
    }

    // Filter visible charts and map to data sources
    this.visibleCharts = (this.domainConfig.charts || [])
      .filter(chart => chart.visible !== false)
      .map(chart => ({
        config: chart,
        dataSource: this.getDataSource(chart.dataSourceId)
      }))
      .filter(item => item.dataSource !== null);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private getDataSource(dataSourceId: string): ChartDataSource {
    if (!this.domainConfig.chartDataSources) {
      return null as any;
    }

    const dataSource = this.domainConfig.chartDataSources[dataSourceId];
    if (!dataSource) {
      return null as any;
    }

    return dataSource;
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

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

      // Only update URL in main window (not in pop-out)
      if (this.popOutContext.isInPopOut()) {
        this.popOutContext.sendMessage({
          type: PopOutMessageType.URL_PARAMS_CHANGED,
          payload: { params: newParams },
          timestamp: Date.now()
        });
      } else {
        this.urlState.setParams(newParams);
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

      // Only update URL in main window (not in pop-out)
      if (this.popOutContext.isInPopOut()) {
        this.popOutContext.sendMessage({
          type: PopOutMessageType.URL_PARAMS_CHANGED,
          payload: { params: newParams },
          timestamp: Date.now()
        });
      } else {
        this.urlState.setParams(newParams);
      }
    }
  }

  private getHighlightParamName(chartId: string): string | null {
    const mapping: Record<string, string> = {
      'manufacturer-distribution': 'h_manufacturer',
      'top-models': 'h_modelCombos',
      'body-class-distribution': 'h_bodyClass'
    };

    return mapping[chartId] || null;
  }

  private getFilterParamName(chartId: string): string | null {
    const mapping: Record<string, string> = {
      'manufacturer-distribution': 'manufacturer',
      'top-models': 'modelCombos',
      'body-class-distribution': 'bodyClass'
    };

    return mapping[chartId] || null;
  }

  trackByChartId(index: number, item: { config: ChartConfig }): string {
    return item.config.id;
  }
}
