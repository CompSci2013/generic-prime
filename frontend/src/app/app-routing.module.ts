import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscoverComponent } from './features/discover/discover.component';
import { PanelPopoutComponent } from './features/panel-popout/panel-popout.component';
import { ReportComponent } from './features/report/report.component';
import { HomeComponent } from './features/home/home.component';
import { AutomobileComponent } from './features/automobile/automobile.component';
import { AgricultureComponent } from './features/agriculture/agriculture.component';
import { PhysicsComponent } from './features/physics/physics.component';
import { PhysicsSyllabusComponent } from './features/physics/physics-syllabus.component';
import { PhysicsConceptGraphComponent } from './features/physics/physics-concept-graph.component';
import { ClassicalMechanicsGraphComponent } from './features/physics/classical-mechanics-graph.component';
import { ChemistryComponent } from './features/chemistry/chemistry.component';
import { MathComponent } from './features/math/math.component';
import { DependencyGraphComponent } from './features/dependency-graph/dependency-graph.component';

/**
 * Application Routing Configuration
 *
 * Defines all routes and navigation paths for the Generic-Prime application.
 * Implements a multi-domain architecture where each domain (automobile, agriculture,
 * physics, chemistry, math) has its own entry point and discovery interface.
 *
 * Route Structure:
 * - Root & Home: '', 'home' → HomeComponent (domain selector landing page)
 * - Automobile: 'automobiles' → AutomobileComponent, 'automobiles/discover' → DiscoverComponent
 * - Agriculture: 'agriculture' → AgricultureComponent
 * - Physics: 'physics' → PhysicsComponent
 *   - Sub-routes: 'physics/syllabus/:nodeId' → PhysicsSyllabusComponent
 *   - Visualization: 'physics/concept-graph', 'physics/classical-mechanics-graph'
 * - Chemistry: 'chemistry' → ChemistryComponent
 * - Math: 'math' → MathComponent
 * - Developer: 'dependencies' → DependencyGraphComponent (architecture visualization)
 * - Pop-out: 'panel/:gridId/:panelId/:type' → PanelPopoutComponent (window synchronization)
 * - Reporting: 'report' → ReportComponent (test results)
 *
 * @remarks
 * Route parameters:
 * - :nodeId - Physics syllabus node identifier (e.g., topic ID)
 * - :gridId - Grid identifier for discovery panels
 * - :panelId - Individual panel identifier within grid
 * - :type - Panel content type (results-table, charts, statistics)
 *
 * Navigation Strategy:
 * - Lazy loading not implemented; all routes load eagerly
 * - URL state synchronized via UrlStateService for filter persistence
 * - Pop-out windows maintain state via BroadcastChannel communication
 */
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'automobiles', component: AutomobileComponent },
  { path: 'automobiles/discover', component: DiscoverComponent },
  { path: 'agriculture', component: AgricultureComponent },
  { path: 'physics', component: PhysicsComponent },
  { path: 'physics/syllabus/:nodeId', component: PhysicsSyllabusComponent },
  { path: 'physics/concept-graph', component: PhysicsConceptGraphComponent },
  { path: 'physics/classical-mechanics-graph', component: ClassicalMechanicsGraphComponent },
  { path: 'chemistry', component: ChemistryComponent },
  { path: 'math', component: MathComponent },
  { path: 'dependencies', component: DependencyGraphComponent },
  { path: 'report', component: ReportComponent },
  { path: 'panel/:gridId/:panelId/:type', component: PanelPopoutComponent }
];

/**
 * Application Routing Module
 *
 * @class AppRoutingModule
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
