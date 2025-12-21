import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscoverComponent } from './features/discover/discover.component';
import { PanelPopoutComponent } from './features/panel-popout/panel-popout.component';
import { AutomobileComponent } from './features/automobile/automobile.component';

/**
 * Application Routing Configuration - MINIMAL AUTOMOBILES BUILD
 *
 * Minimal routing configuration focused exclusively on the automobile discovery feature.
 * This build strips out all other domains (physics, agriculture, chemistry, math) and
 * testing infrastructure (e2e, compodoc) to focus on perfecting pop-out state management.
 *
 * Route Structure:
 * - Root: '' → AutomobileComponent (direct to automobile discovery)
 * - Automobile Discovery: 'automobiles/discover' → DiscoverComponent (main interface with panels)
 * - Pop-out Windows: 'panel/:gridId/:panelId/:type' → PanelPopoutComponent (state sync via BroadcastChannel)
 *
 * @remarks
 * Route parameters:
 * - :gridId - Grid identifier for discovery panels
 * - :panelId - Individual panel identifier within grid (query-control, statistics-panel, results-table)
 * - :type - Panel content type
 *
 * Architecture:
 * - URL state synchronized via UrlStateService for filter persistence
 * - Pop-out windows maintain state via BroadcastChannel communication
 * - ResourceManagementService handles state sync with zone-aware observable emissions
 */
const routes: Routes = [
  { path: '', component: AutomobileComponent },
  { path: 'automobiles', component: AutomobileComponent },
  { path: 'automobiles/discover', component: DiscoverComponent },
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
