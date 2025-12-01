import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditProfileComponent } from './edit-profile.component';
import { LucideAngularModule, User, Mail, Camera } from 'lucide-angular';

@NgModule({
  declarations: [EditProfileComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Necesario para formGroup
    IonicModule,
    LucideAngularModule.pick({ User, Mail, Camera }) // Iconos registrados
  ],
  exports: [EditProfileComponent]
})
export class EditProfileComponentModule {}