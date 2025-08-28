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

  // 2. Inyectar ToastController en el constructor
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

  // 3. Nuevo método para mostrar el mensaje de confirmación (Toast)
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

  // 4. Lógica de envío actualizada
  onSubmit() {
    if (this.postJobForm.invalid) {
      this.postJobForm.markAllAsTouched();
      return;
    }
    
    // Guardamos el trabajo en el servicio
    this.jobService.createJob(this.postJobForm.value);

    // Mostramos el mensaje de éxito
    this.presentToast('¡Trabajo publicado con éxito!');

    // Limpiamos el formulario
    this.postJobForm.reset();

    // Esperamos un momento antes de volver al inicio para que el usuario vea el mensaje
    setTimeout(() => {
      this.closePage();
    }, 1500); // 1.5 segundos de espera
  }
}