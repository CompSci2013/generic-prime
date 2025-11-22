/**
 * Statistics Panel Component
 *
 * Domain-agnostic container for rendering statistical charts.
 * Displays multiple charts based on domain configuration.
 *
 * Framework Component
 */

import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject
} from '@angular/core';
import { Observable } from 'rxjs';
import { ChartConfig, DomainConfig } from '../../models/domain-config.interface';
import { ChartDataSource } from '../base-chart/base-chart.component';
import { ResourceManagementService, RESOURCE_MANAGEMENT_SERVICE } from '../../services/resource-management.service';

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

  // Observable for statistics
  statistics$!: Observable<any | undefined>;

  constructor(
    @Inject(RESOURCE_MANAGEMENT_SERVICE)
    private resourceService: ResourceManagementService<any, any, any>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.domainConfig) {
      console.error('StatisticsPanelComponent: domainConfig is required');
      return;
    }

    // Subscribe to statistics stream (service injected via constructor)
    this.statistics$ = this.resourceService.statistics$;
    this.statistics$.subscribe(statistics => {
      this.statistics = statistics || null;
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
    if (this.resourceService) {
      this.resourceService.destroy();
    }
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
   * Handle chart click event
   */
  onChartClick(event: { value: string; isHighlightMode: boolean }): void {
    console.log('Chart clicked:', event);
    // TODO: Implement chart click handling (add filters or highlights)
    // This will be wired up when we integrate with the state management
  }

  /**
   * Track by function for ngFor
   */
  trackByChartId(index: number, item: { config: ChartConfig }): string {
    return item.config.id;
  }
}
