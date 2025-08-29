import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { JobCardComponentModule } from '../components/job-card/job-card.module';
import { JobDetailsComponentModule } from '../components/job-details/job-details.module';
import { LucideAngularModule, MapPin, Bell, SlidersHorizontal } from 'lucide-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    JobCardComponentModule,
    JobDetailsComponentModule,
    LucideAngularModule.pick({ MapPin, Bell, SlidersHorizontal })
  ],
  declarations: [HomePage]
})
export class HomePageModule {}