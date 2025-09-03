import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegisterPageRoutingModule } from './register-routing.module';
import { RegisterPage } from './register.page';
import { LucideAngularModule, User, Mail, Lock, AtSign, Hash } from 'lucide-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({ User, Mail, Lock, AtSign, Hash })
  ],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}