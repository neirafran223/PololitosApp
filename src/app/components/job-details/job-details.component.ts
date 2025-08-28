import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss'],
  standalone: false,
})
export class JobDetailsComponent {
  @Input() job: any;
  constructor(private modalController: ModalController) { }
  dismissModal() { this.modalController.dismiss(); }
  contact() { this.modalController.dismiss(); }
}