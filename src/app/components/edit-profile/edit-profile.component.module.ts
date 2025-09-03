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
    IonicModule, 
    FormsModule,
    ReactiveFormsModule, 
    LucideAngularModule.pick({ User, Mail }) 
  ],
  exports: [EditProfileComponent] 
})
export class EditProfileComponentModule {}