import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { JobCardComponentModule } from '../components/job-card/job-card.module';
import { JobDetailsComponentModule } from '../components/job-details/job-details.module';
import { JobFiltersComponentModule } from '../components/job-filters/job-filters.component.module';
import { LucideAngularModule, MapPin, Bell, SlidersHorizontal, Search } from 'lucide-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    JobCardComponentModule,
    JobDetailsComponentModule,
    JobFiltersComponentModule,
    LucideAngularModule.pick({ MapPin, Bell, SlidersHorizontal, Search })
  ],
  declarations: [HomePage]
})
export class HomePageModule {}