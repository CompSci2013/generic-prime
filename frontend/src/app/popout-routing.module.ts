/**
 * Pop-Out Routing Module
 *
 * Minimal routing configuration for pop-out windows.
 * Contains ONLY the panel pop-out route.
 * Pop-out windows should only ever navigate to /panel/:gridId/:panelId/:type
 *
 * @see PanelPopoutComponent
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelPopoutComponent } from './features/panel-popout/panel-popout.component';

const routes: Routes = [
  { path: 'panel/:gridId/:panelId/:type', component: PanelPopoutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class PopoutRoutingModule { }
