import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { JobDetailsComponent } from './job-details.component';
import { LucideAngularModule, X, MapPin, Send } from 'lucide-angular';

@NgModule({
  declarations: [JobDetailsComponent],
  imports: [
    CommonModule,
    IonicModule,
    LucideAngularModule.pick({ X, MapPin, Send })
  ],
  exports: [JobDetailsComponent]
})
export class JobDetailsComponentModule {}