import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscoverComponent } from './features/discover/discover.component';
import { PanelPopoutComponent } from './features/panel-popout/panel-popout.component';
import { ReportComponent } from './features/report/report.component';

const routes: Routes = [
  { path: '', redirectTo: '/discover', pathMatch: 'full' },
  { path: 'discover', component: DiscoverComponent },
  { path: 'report', component: ReportComponent },
  { path: 'panel/:gridId/:panelId/:type', component: PanelPopoutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
