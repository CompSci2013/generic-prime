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
  InputNumberModule
];

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
