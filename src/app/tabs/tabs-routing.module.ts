import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    // CAMBIO CRÍTICO: La ruta principal ahora es vacía (''),
    // porque el enrutador principal ya se encargó del segmento '/tabs'.
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tab1', // Esta es la primera pestaña (Home)
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'tab2', // Esta es la segunda (Messages)
        loadChildren: () => import('../messages/messages.module').then(m => m.MessagesPageModule)
      },
      {
        path: 'tab3', // PostJob
        loadChildren: () => import('../post-job/post-job.module').then(m => m.PostJobPageModule)
      },
      {
        path: 'tab4', // Profile
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'tab5', // Settings
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        // CAMBIO CRÍTICO: La redirección ahora es a 'tab1' directamente.
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}