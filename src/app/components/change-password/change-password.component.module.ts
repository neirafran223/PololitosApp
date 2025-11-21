import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password.component';
import { LucideAngularModule, Lock, Key, CheckCircle, X } from 'lucide-angular';

@NgModule({
  declarations: [ChangePasswordComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({ Lock, Key, CheckCircle, X })
  ],
  exports: [ChangePasswordComponent]
})
export class ChangePasswordComponentModule {}