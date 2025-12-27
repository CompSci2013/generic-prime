import { NgModule } from '@angular/core';

// PrimeNG Modules - Centralized UI Component Library
// This facade provides a single import point for all PrimeNG dependencies.
// To swap a component, modify this file only.

// Data Display
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';

// Input Controls
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { AutoCompleteModule } from 'primeng/autocomplete';

// Navigation
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToolbarModule } from 'primeng/toolbar';

// Containers
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';

// Feedback
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Controls
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ChipModule } from 'primeng/chip';

/**
 * UI Kit Module - Framework Layer Facade for PrimeNG
 *
 * This module provides a centralized import point for all UI components.
 * It encapsulates the PrimeNG dependency, allowing for:
 *
 * 1. **Centralized Inventory**: Single file lists all UI components in use
 * 2. **Standardization**: All modules import UiKitModule, not individual PrimeNG modules
 * 3. **Layer Integrity**: Framework (L1) owns the UI abstraction, not App (L0)
 * 4. **Migration Path**: To swap a component, modify only this file and its consumers
 *
 * @see ARCHITECTURE-AUDIT-REMEDIATION-3.md for design rationale
 */
const UI_MODULES = [
  // Data Display
  TableModule,
  SkeletonModule,

  // Input Controls
  MultiSelectModule,
  InputTextModule,
  InputNumberModule,
  DropdownModule,
  CheckboxModule,
  AutoCompleteModule,

  // Navigation
  TieredMenuModule,
  ToolbarModule,

  // Containers
  PanelModule,
  DialogModule,

  // Feedback
  ToastModule,
  TooltipModule,
  MessageModule,
  ProgressSpinnerModule,

  // Controls
  ButtonModule,
  RippleModule,
  ChipModule
];

@NgModule({
  imports: [...UI_MODULES],
  exports: [...UI_MODULES]
})
export class UiKitModule {}
