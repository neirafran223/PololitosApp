import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegisterPageRoutingModule } from './register-routing.module';
import { RegisterPage } from './register.page';

// 1. IMPORTA 'Phone' AQUÍ
import { LucideAngularModule, User, Mail, Lock, AtSign, Hash, Phone } from 'lucide-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    LucideAngularModule.pick({ User, Mail, Lock, AtSign, Hash, Phone })
  ],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}