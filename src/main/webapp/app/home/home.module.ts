import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { HOME_ROUTE } from './home.route';
import { HomeComponent } from './home.component';
// Remplacer l'importation du module par l'importation directe du composant standalone
import { DashboardComponent } from 'app/home/dashboard/dashboard.component'; // Correction du chemin d'importation selon le diagnostic

@NgModule({
  imports: [SharedModule, RouterModule.forChild([HOME_ROUTE]), DashboardComponent], // Ajouter DashboardComponent directement comme standalone
  declarations: [HomeComponent],
})
export class HomeModule {}