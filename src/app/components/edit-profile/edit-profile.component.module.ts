import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditProfileComponent } from './edit-profile.component';
import { LucideAngularModule, User, Mail } from 'lucide-angular';

@NgModule({
  declarations: [EditProfileComponent],
  imports: [
    CommonModule,
    IonicModule, // <-- Le da acceso a los componentes ion-*
    FormsModule,
    ReactiveFormsModule, // <-- Permite usar [formGroup]
    LucideAngularModule.pick({ User, Mail }) // <-- Le da acceso a los iconos
  ],
  exports: [EditProfileComponent] // <-- Permite que otras páginas lo usen
})
export class EditProfileComponentModule {}