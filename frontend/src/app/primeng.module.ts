import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { ToolbarModule } from 'primeng/toolbar';
import { RippleModule } from 'primeng/ripple';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AutoCompleteModule } from 'primeng/autocomplete';

/**
 * Centralized PrimeNG UI Component Library Module
 *
 * Aggregates all PrimeNG component modules used throughout the Generic-Prime application.
 * This module pattern provides a single import point for all UI components, making
 * dependency management cleaner and allowing for easier module addition/removal.
 *
 * PrimeNG Components Included:
 * - Data Display: TableModule, SkeletonModule
 * - Input: MultiSelectModule, InputTextModule, InputNumberModule, DropdownModule, CheckboxModule
 * - Navigation: TieredMenuModule, ToolbarModule
 * - Containers: PanelModule, DialogModule
 * - Feedback: ToastModule, TooltipModule, MessageModule, ProgressSpinnerModule
 * - Controls: ButtonModule, RippleModule, ChipModule
 *
 * Usage:
 * Import PrimengModule in feature modules to access all PrimeNG components:
 * ```
 * @NgModule({
 *   imports: [CommonModule, PrimengModule]
 * })
 * export class MyFeatureModule { }
 * ```
 *
 * Component Details:
 * - TableModule: Advanced data grid with sorting, filtering, pagination
 * - MultiSelectModule: Multi-select dropdown for filter selection
 * - DialogModule: Modal dialogs for user interactions
 * - ToastModule: Toast notifications for user feedback
 * - ToolbarModule: Toolbar container for action buttons
 * - TieredMenuModule: Hierarchical menu with flyout submenus (used in navigation)
 * - ProgressSpinnerModule: Loading spinners for async operations
 * - TooltipModule: Hover tooltips for UI hints
 *
 * @class PrimengModule
 * @see https://www.primeng.org - PrimeNG official documentation
 */
const PRIMENG_MODULES = [
  TableModule,
  ButtonModule,
  MultiSelectModule,
  InputTextModule,
  DropdownModule,
  DialogModule,
  ToastModule,
  PanelModule,
  ToolbarModule,
  RippleModule,
  InputNumberModule,
  CheckboxModule,
  SkeletonModule,
  MessageModule,
  ChipModule,
  ProgressSpinnerModule,
  TooltipModule,
  TieredMenuModule,
  AutoCompleteModule
];

/**
 * PrimeNG Module
 *
 * Provides centralized export of all PrimeNG component modules.
 *
 * @module PrimengModule
 */
@NgModule({
  imports: [
    CommonModule,
    ...PRIMENG_MODULES
  ],
  exports: [
    ...PRIMENG_MODULES
  ]
})
export class PrimengModule { }
