import { NgModule, ErrorHandler, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrimengModule } from './primeng.module';
import { FrameworkModule } from '../framework/framework.module';
import { GlobalErrorHandler } from '../framework/services/global-error.handler';
import { DOMAIN_CONFIG } from '../framework/services/domain-config-registry.service';
import { createAutomobileDomainConfig } from '../domain-config/automobile';
import { DiscoverComponent } from './features/discover/discover.component';
import { AutomobileComponent } from './features/automobile/automobile.component';
import { SharedPopoutModule } from './shared-popout.module';

/**
 * Root Application Module (AppModule) - MINIMAL AUTOMOBILES BUILD
 *
 * Central configuration and bootstrapping module for the Generic-Prime Angular application.
 * Focused on automobile discovery with pop-out support.
 *
 * Responsibilities:
 * - Declares feature and root components (4 total)
 * - Imports Angular core modules (BrowserModule, HttpClientModule, FormsModule)
 * - Imports PrimeNG UI component library
 * - Configures global error handling via GlobalErrorHandler
 * - Registers automobile domain configuration
 * - Sets up application-wide services (MessageService)
 * - Bootstraps AppComponent as the root component
 *
 * Feature Components Declared:
 * - Root: AppComponent
 * - Domain: AutomobileComponent
 * - Discovery: DiscoverComponent, PanelPopoutComponent
 *
 * @class AppModule
 * @see AppComponent - Root component
 * @see FrameworkModule - Core framework services and components
 * @see PrimengModule - UI component library configuration
 * @see GlobalErrorHandler - Global error handling service
 */
@NgModule({
  declarations: [
    AppComponent,
    DiscoverComponent,
    AutomobileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    DragDropModule,
    AppRoutingModule,
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
  bootstrap: [AppComponent]
})
export class AppModule { }
