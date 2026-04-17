import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { HOME_ROUTE } from './home.route';
import { HomeComponent } from './home.component';
// DashboardComponent est un standalone component et ne doit pas être déclaré ici
// Il sera importé directement dans HomeComponent si nécessaire.

@NgModule({
  imports: [SharedModule, RouterModule.forChild([HOME_ROUTE])],
  declarations: [HomeComponent],
})
export class ProtaskkillaaaHomeModule {}
