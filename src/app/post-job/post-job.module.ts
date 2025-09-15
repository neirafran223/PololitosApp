import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importamos ReactiveFormsModule
import { IonicModule } from '@ionic/angular';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { PostJobPageRoutingModule } from './post-job-routing.module';
import { PostJobPage } from './post-job.page';

import { LucideAngularModule, X, Type, List, PenSquare, DollarSign, MapPin } from 'lucide-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PostJobPageRoutingModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({ X, Type, List, PenSquare, DollarSign, MapPin })
  ],
  declarations: [PostJobPage],
  providers: [CurrencyPipe]
})
export class PostJobPageModule {}