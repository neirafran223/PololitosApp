import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WelcomePageRoutingModule } from './welcome-routing.module';
import { WelcomePage } from './welcome.page';

import { LucideAngularModule, Briefcase } from 'lucide-angular'; // Asegúrate de tener esta importación

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WelcomePageRoutingModule,
    LucideAngularModule.pick({ Briefcase }) // Y que se use aquí
  ],
  declarations: [WelcomePage]
})
export class WelcomePageModule {}