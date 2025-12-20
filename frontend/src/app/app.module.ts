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
import { PanelPopoutComponent } from './features/panel-popout/panel-popout.component';
import { ReportComponent } from './features/report/report.component';
import { HomeComponent } from './features/home/home.component';
import { AutomobileComponent } from './features/automobile/automobile.component';
import { AgricultureComponent } from './features/agriculture/agriculture.component';
import { PhysicsComponent } from './features/physics/physics.component';
import { PhysicsSyllabusComponent } from './features/physics/physics-syllabus.component';
import { PhysicsConceptGraphComponent } from './features/physics/physics-concept-graph.component';
import { KnowledgeGraphComponent } from './features/physics/knowledge-graph.component';
import { ClassicalMechanicsGraphComponent } from './features/physics/classical-mechanics-graph.component';
import { ChemistryComponent } from './features/chemistry/chemistry.component';
import { MathComponent } from './features/math/math.component';
import { DependencyGraphComponent } from './features/dependency-graph/dependency-graph.component';

/**
 * Root Application Module (AppModule)
 *
 * Central configuration and bootstrapping module for the Generic-Prime Angular application.
 * Aggregates all feature components, framework services, and third-party library modules.
 *
 * Responsibilities:
 * - Declares all feature and root components (15 total)
 * - Imports Angular core modules (BrowserModule, HttpClientModule, FormsModule)
 * - Imports PrimeNG UI component library
 * - Configures global error handling via GlobalErrorHandler
 * - Registers domain configuration providers for multi-domain data management
 * - Sets up application-wide services (MessageService)
 * - Bootstraps AppComponent as the root component
 *
 * Feature Components Declared:
 * - Navigation: HomeComponent, DependencyGraphComponent
 * - Domain Hubs: AutomobileComponent, AgricultureComponent, PhysicsComponent, ChemistryComponent, MathComponent
 * - Discovery: DiscoverComponent, PanelPopoutComponent
 * - Visualization: PhysicsConceptGraphComponent, KnowledgeGraphComponent, ClassicalMechanicsGraphComponent, PhysicsSyllabusComponent
 * - Reporting: ReportComponent
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
    PanelPopoutComponent,
    ReportComponent,
    HomeComponent,
    AutomobileComponent,
    AgricultureComponent,
    PhysicsComponent,
    PhysicsSyllabusComponent,
    PhysicsConceptGraphComponent,
    KnowledgeGraphComponent,
    ClassicalMechanicsGraphComponent,
    ChemistryComponent,
    MathComponent,
    DependencyGraphComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    DragDropModule,
    AppRoutingModule,
    PrimengModule,
    FrameworkModule
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
