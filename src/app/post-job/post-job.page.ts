import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { JobService } from '../services/job.service';
import { CurrencyPipe } from '@angular/common'; // 1. Importa CurrencyPipe

@Component({
  selector: 'app-post-job',
  templateUrl: './post-job.page.html',
  styleUrls: ['./post-job.page.scss'],
  standalone:false,
})
export class PostJobPage implements OnInit {
  postJobForm!: FormGroup;
  categories = ['Jardinería', 'Gasfitería', 'Electricidad', 'Aseo', 'Clases', 'Otro'];

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private jobService: JobService,
    private toastController: ToastController,
    private currencyPipe: CurrencyPipe // 2. Inyéctalo en el constructor
  ) { }

  ngOnInit() {
    this.postJobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      category: [null, [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      // Se eliminó el Validators.pattern para el precio
      price: ['', [Validators.required]],
      location: ['', [Validators.required]]
    });
  }

  // 3. Añade la función para formatear el precio
  formatPrice() {
    const priceControl = this.postJobForm.get('price');
    if (priceControl && priceControl.value) {
      const rawValue = priceControl.value.toString().replace(/\$|\./g, '');
      const numberValue = parseFloat(rawValue);

      if (isNaN(numberValue)) return;

      const formattedValue = this.currencyPipe.transform(
        numberValue, 'CLP', 'symbol', '1.0-0'
      );
      
      if (formattedValue) {
        priceControl.setValue(formattedValue, { emitEvent: false });
      }
    }
  }

  onSubmit() {
    if (this.postJobForm.invalid) {
      this.postJobForm.markAllAsTouched();
      return;
    }
    
    // 4. Modifica onSubmit para des-formatear el precio antes de enviar
    const formValue = this.postJobForm.getRawValue();
    const priceAsNumber = parseFloat(formValue.price.toString().replace(/\$|\./g, ''));

    const jobData = {
      ...formValue,
      price: priceAsNumber
    };

    console.log('Datos del trabajo a enviar:', jobData);
    this.jobService.createJob(jobData);

    this.presentToast('¡Trabajo publicado con éxito!');
 
    this.postJobForm.reset();
    
    setTimeout(() => {
      this.closePage();
    }, 1500); 
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
}