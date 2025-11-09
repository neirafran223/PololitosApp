import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { JobFiltersComponent } from './job-filters.component';
import { LucideAngularModule, X, Tag, DollarSign, MapPin, Check } from 'lucide-angular';

@NgModule({
  declarations: [JobFiltersComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    LucideAngularModule.pick({ X, Tag, DollarSign, MapPin, Check })
  ],
  exports: [JobFiltersComponent]
})
export class JobFiltersComponentModule {}

