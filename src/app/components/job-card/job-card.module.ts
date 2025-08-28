import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { JobCardComponent } from './job-card.component';
import { LucideAngularModule, MapPin } from 'lucide-angular';

@NgModule({
  declarations: [JobCardComponent],
  imports: [
    CommonModule,
    IonicModule,
    LucideAngularModule.pick({ MapPin })
  ],
  exports: [JobCardComponent]
})
export class JobCardComponentModule {}