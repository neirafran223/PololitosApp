import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PostJobPageRoutingModule } from './post-job-routing.module';
import { PostJobPage } from './post-job.page';
import { LucideAngularModule, X, Type, List, PenSquare, DollarSign, MapPin, Calendar } from 'lucide-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PostJobPageRoutingModule,
    LucideAngularModule.pick({ X, Type, List, PenSquare, DollarSign, MapPin, Calendar })
  ],
  declarations: [PostJobPage],
  providers: [CurrencyPipe]
})
export class PostJobPageModule {}