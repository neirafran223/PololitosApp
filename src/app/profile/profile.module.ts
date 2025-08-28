import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';
import { ProfilePage } from './profile.page';
import { LucideAngularModule, Edit, LayoutList, Heart, LogOut } from 'lucide-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    LucideAngularModule.pick({ Edit, LayoutList, Heart, LogOut })
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}