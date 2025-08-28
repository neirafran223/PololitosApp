import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { JobDetailsComponent } from '../components/job-details/job-details.component';
import { JobService } from '../services/job.service'; // 1. Importar el servicio

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  searchQuery: string = '';
  userLocation: string = 'Viña del Mar, Chile';
  jobs: any[] = [];

  // 2. Inyectar el servicio en el constructor
  constructor(
    private modalController: ModalController,
    private jobService: JobService 
  ) {}

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    // 3. Obtener los datos desde el servicio
    this.jobs = this.jobService.getJobs();
  }

  async openJobDetails(job: any) {
    const modal = await this.modalController.create({
      component: JobDetailsComponent,
      componentProps: { job: job },
      cssClass: 'job-details-modal'
    });
    return await modal.present();
  }
}