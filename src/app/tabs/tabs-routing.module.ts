import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tab1', 
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import("../message/message.module").then(m => m.MessagePageModule)
      },
      {
        path: 'tab3', 
        loadChildren: () => import('../post-job/post-job.module').then(m => m.PostJobPageModule)
      },
      {
        path: 'tab4', 
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'tab5', 
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full'
      },
      {
        path: '**', 
        loadChildren: () => import('../not-found/not-found-routing.module').then(m => m.NotFoundPageRoutingModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}