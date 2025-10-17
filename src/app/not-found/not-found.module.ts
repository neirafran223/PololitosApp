import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NotFoundPageRoutingModule } from './not-found-routing.module';
import { NotFoundPage } from './not-found.page';

// 1. Importa el módulo de Lucide y los íconos que necesitas
import { LucideAngularModule, AlertTriangle, Home } from 'lucide-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotFoundPageRoutingModule,
    // 2. Añade el módulo a los imports de esta página
    LucideAngularModule.pick({ AlertTriangle, Home })
  ],
  declarations: [NotFoundPage]
})
export class NotFoundPageModule {}