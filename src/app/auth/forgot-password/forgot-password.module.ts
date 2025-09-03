import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ForgotPasswordPageRoutingModule } from './forgot-password-routing.module';
import { ForgotPasswordPage } from './forgot-password.page';
import { LucideAngularModule, Mail } from 'lucide-angular'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ForgotPasswordPageRoutingModule,
    LucideAngularModule.pick({ Mail })
  ],
  declarations: [ForgotPasswordPage]
})
export class ForgotPasswordPageModule {}