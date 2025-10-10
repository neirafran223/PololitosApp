import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { JobDetailsComponent } from './job-details.component'; // Importa el componente
import { LucideAngularModule, X, MapPin, Calendar, Send } from 'lucide-angular';

@NgModule({
  imports: [ 
    CommonModule, 
    FormsModule, 
    IonicModule,
    LucideAngularModule.pick({ X, MapPin, Calendar, Send })
  ],
  declarations: [JobDetailsComponent], // Lo declara
  exports: [JobDetailsComponent]      // Lo exporta para que otros módulos puedan usarlo
})
export class JobDetailsComponentModule {}