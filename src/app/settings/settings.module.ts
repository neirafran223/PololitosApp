import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';
import { SettingsPage } from './settings.page';
import { LucideAngularModule, Moon, Shield, Bell, LogOut } from 'lucide-angular';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsPageRoutingModule,
    LucideAngularModule.pick({ Moon, Shield, Bell, LogOut })
  ],
  declarations: [SettingsPage]
})
export class SettingsPageModule {}