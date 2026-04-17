import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { HOME_ROUTE } from './home.route';
import { HomeComponent } from './home.component';
// Remplacer l'importation du module par l'importation directe du composant standalone
import { DashboardComponent } from 'app/entities/task/task-dashboard/dashboard.component'; // Supposons que c'est un composant standalone

@NgModule({
  imports: [SharedModule, RouterModule.forChild([HOME_ROUTE]), DashboardComponent], // Ajouter DashboardComponent directement comme standalone
  declarations: [HomeComponent],
})
export class HomeModule {}