import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiKitModule } from './ui-kit/ui-kit.module';

// Components
import { BasePickerComponent } from './components/base-picker/base-picker.component';
import { ResultsTableComponent } from './components/results-table/results-table.component';
import { BasicResultsTableComponent } from './components/basic-results-table/basic-results-table.component';
import { QueryControlComponent } from './components/query-control/query-control.component';
import { QueryPanelComponent } from './components/query-panel/query-panel.component';
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
    imports: [
        CommonModule,
        FormsModule,
        UiKitModule,
        BasePickerComponent,
        ResultsTableComponent,
        BasicResultsTableComponent,
        QueryControlComponent,
        QueryPanelComponent,
        BaseChartComponent,
        StatisticsPanelComponent
    ],
    exports: [
        BasePickerComponent,
        ResultsTableComponent,
        BasicResultsTableComponent,
        QueryControlComponent,
        QueryPanelComponent,
        BaseChartComponent,
        StatisticsPanelComponent,
        // Re-export common modules for convenience
        CommonModule,
        FormsModule,
        UiKitModule
    ]
})
export class FrameworkModule { }
