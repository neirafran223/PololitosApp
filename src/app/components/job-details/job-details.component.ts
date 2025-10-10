import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html', // Corregido para que coincida con el nombre de archivo
  styleUrls: ['./job-details.component.scss'],
  standalone: false,
})
export class JobDetailsComponent { // El nombre de la clase ahora es JobDetailsComponent
  @Input() job: any;

  constructor(private modalCtrl: ModalController) { }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  contact() {
    console.log('Contactando por el trabajo:', this.job);
  }
}