import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importamos ReactiveFormsModule
import { IonicModule } from '@ionic/angular';

import { PostJobPageRoutingModule } from './post-job-routing.module';
import { PostJobPage } from './post-job.page';

import { LucideAngularModule, X, Type, List, PenSquare, DollarSign, MapPin } from 'lucide-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PostJobPageRoutingModule,
    ReactiveFormsModule, // <-- Se añade para los formularios reactivos
    LucideAngularModule.pick({ X, Type, List, PenSquare, DollarSign, MapPin })
  ],
  declarations: [PostJobPage]
})
export class PostJobPageModule {}