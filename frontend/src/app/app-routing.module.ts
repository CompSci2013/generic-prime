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
import { ChemistryComponent } from './features/chemistry/chemistry.component';
import { MathComponent } from './features/math/math.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'automobiles', component: AutomobileComponent },
  { path: 'automobiles/discover', component: DiscoverComponent },
  { path: 'agriculture', component: AgricultureComponent },
  { path: 'physics', component: PhysicsComponent },
  { path: 'physics/syllabus/:nodeId', component: PhysicsSyllabusComponent },
  { path: 'physics/concept-graph', component: PhysicsConceptGraphComponent },
  { path: 'chemistry', component: ChemistryComponent },
  { path: 'math', component: MathComponent },
  { path: 'report', component: ReportComponent },
  { path: 'panel/:gridId/:panelId/:type', component: PanelPopoutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
