import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimengModule } from '../app/primeng.module';

// Components
import { BasePickerComponent } from './components/base-picker/base-picker.component';
import { ResultsTableComponent } from './components/results-table/results-table.component';
import { QueryControlComponent } from './components/query-control/query-control.component';
import { BaseChartComponent } from './components/base-chart/base-chart.component';
import { StatisticsPanelComponent } from './components/statistics-panel/statistics-panel.component';

/**
 * Framework Module
 *
 * Provides reusable framework components, services, and models.
 * This module should be imported by feature modules that need framework functionality.
 *
 * @example
 * ```typescript
 * @NgModule({
 *   imports: [
 *     CommonModule,
 *     FrameworkModule
 *   ]
 * })
 * export class FeatureModule { }
 * ```
 */
@NgModule({
  declarations: [
    BasePickerComponent,
    ResultsTableComponent,
    QueryControlComponent,
    BaseChartComponent,
    StatisticsPanelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PrimengModule
  ],
  exports: [
    BasePickerComponent,
    ResultsTableComponent,
    QueryControlComponent,
    BaseChartComponent,
    StatisticsPanelComponent,
    // Re-export common modules for convenience
    CommonModule,
    FormsModule,
    PrimengModule
  ]
})
export class FrameworkModule { }
