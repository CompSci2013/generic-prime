/**
 * Pop-Out Application Module (PopoutAppModule)
 *
 * Minimal module for pop-out windows.
 * Contains ONLY what's needed for panel components:
 * - Routing module for /panel/* routes
 * - PanelPopoutComponent and child panel components
 * - Framework services and components
 * - Domain configuration
 *
 * Does NOT include:
 * - AppComponent (no header/nav)
 * - Navigation/menu configuration
 * - Application-level features
 *
 * @class PopoutAppModule
 * @see PopoutAppComponent - Minimal root component (just router-outlet)
 */

import { NgModule, ErrorHandler, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { PopoutRoutingModule } from './popout-routing.module';
import { PopoutAppComponent } from './popout-app.component';
import { PrimengModule } from './primeng.module';
import { FrameworkModule } from '../framework/framework.module';
import { GlobalErrorHandler } from '../framework/services/global-error.handler';
import { DOMAIN_CONFIG } from '../framework/services/domain-config-registry.service';
import { createAutomobileDomainConfig } from '../domain-config/automobile';
import { SharedPopoutModule } from './shared-popout.module';

@NgModule({
  declarations: [
    PopoutAppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    DragDropModule,
    PopoutRoutingModule,
    PrimengModule,
    FrameworkModule,
    SharedPopoutModule
  ],
  providers: [
    MessageService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: DOMAIN_CONFIG,
      useFactory: createAutomobileDomainConfig,
      deps: [Injector]
    }
  ],
  bootstrap: [PopoutAppComponent]
})
export class PopoutAppModule { }
