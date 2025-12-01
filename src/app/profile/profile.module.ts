import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { ProfilePage } from './profile.page';
import { EditProfileComponentModule } from '../components/edit-profile/edit-profile.component.module';
import { LucideAngularModule, Pencil, Star, Award, CalendarDays } from 'lucide-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    EditProfileComponentModule, // Importante para que funcione el modal
    LucideAngularModule.pick({ Pencil, Star, Award, CalendarDays })
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}