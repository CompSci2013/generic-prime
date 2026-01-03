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

  /**
   * Handle chart click events
   *
   * Delegates URL param generation to the chart's data source.
   * This keeps domain-specific mappings in the domain layer (data sources)
   * rather than in the framework layer (this component).
   */
  onChartClick(event: { value: string; isHighlightMode: boolean }, dataSource: ChartDataSource): void {
    // Delegate URL param generation to the data source
    const newParams = dataSource.toUrlParams(event.value, event.isHighlightMode);

    // Update URL (either directly or via pop-out message)
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

  trackByChartId(index: number, item: { config: ChartConfig }): string {
    return item.config.id;
  }
}
