/**
 * Shared Pop-Out Module
 *
 * Contains components and modules shared between main app and pop-out app.
 * Prevents duplicate declarations of PanelPopoutComponent.
 *
 * @class SharedPopoutModule
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimengModule } from './primeng.module';
import { FrameworkModule } from '../framework/framework.module';
import { PanelPopoutComponent } from './features/panel-popout/panel-popout.component';

@NgModule({
  declarations: [
    PanelPopoutComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PrimengModule,
    FrameworkModule
  ],
  exports: [
    PanelPopoutComponent
  ]
})
export class SharedPopoutModule { }
