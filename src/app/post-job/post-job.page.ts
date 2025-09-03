import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular'; // 1. Importar ToastController
import { JobService } from '../services/job.service';

@Component({
  selector: 'app-post-job',
  templateUrl: './post-job.page.html',
  styleUrls: ['./post-job.page.scss'],
  standalone: false,
})
export class PostJobPage implements OnInit {
  postJobForm!: FormGroup;
  categories = ['Jardinería', 'Gasfitería', 'Electricidad', 'Aseo', 'Clases', 'Otro'];


  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private jobService: JobService,
    private toastController: ToastController 
  ) { }

  ngOnInit() {
    this.postJobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      category: [null, [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.pattern(/^[0-9.,$]+$/)]],
      location: ['', [Validators.required]]
    });
  }
  
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500, 
      position: 'bottom',
      color: 'success', 
    });
    await toast.present();
  }

  closePage() {
    this.navCtrl.navigateRoot('/tabs/tab1', { animated: true, animationDirection: 'back' });
  }
  
  onSubmit() {
    if (this.postJobForm.invalid) {
      this.postJobForm.markAllAsTouched();
      return;
    }
        
    this.jobService.createJob(this.postJobForm.value);

    this.presentToast('¡Trabajo publicado con éxito!');
 
    this.postJobForm.reset();
    
    setTimeout(() => {
      this.closePage();
    }, 1500); 
  }
}