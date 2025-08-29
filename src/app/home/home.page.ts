import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { JobDetailsComponent } from '../components/job-details/job-details.component';
import { AuthService } from '../services/auth.service';
import { JobService } from '../services/job.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  user: any = null;
  jobs: any[] = [];
  searchQuery: string = '';
  userLocation: string = 'Viña del Mar, Chile';

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private jobService: JobService
  ) {}

  ionViewWillEnter() {
    this.user = this.authService.getCurrentUser();
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