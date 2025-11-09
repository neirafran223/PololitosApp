import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';
import { SettingsPage } from './settings.page';
import { ChangePasswordComponentModule } from '../components/change-password/change-password.component.module';
import { LucideAngularModule, Moon, Sun, Shield, Bell, BellRing, Mail, Smartphone, Key, ShieldCheck, HelpCircle, Info, LogOut, Palette, ChevronRight } from 'lucide-angular';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsPageRoutingModule,
    ChangePasswordComponentModule,
    LucideAngularModule.pick({ Moon, Sun, Shield, Bell, BellRing, Mail, Smartphone, Key, ShieldCheck, HelpCircle, Info, LogOut, Palette, ChevronRight })
  ],
  declarations: [SettingsPage]
})
export class SettingsPageModule {}