import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController, Platform } from '@ionic/angular';
import { JobService } from '../services/job.service';
import { CurrencyPipe } from '@angular/common';
import { DatePicker } from '@capacitor-community/date-picker';

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
    private toastController: ToastController,
    private currencyPipe: CurrencyPipe,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.postJobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      category: [null, [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      startDateTime: [null, [Validators.required]],
      endDateTime: [null, [Validators.required]],
      price: ['', [Validators.required]],
      location: ['', [Validators.required]]
    });
  }

  async openDatePicker(type: 'start' | 'end') {
    const result = await DatePicker.present({
      mode: 'dateAndTime',
      theme: 'dark',
      // Se eliminó la línea 'androidTheme' que causaba el error
      min: (type === 'end' && this.postJobForm.get('startDateTime')?.value) 
            ? this.postJobForm.get('startDateTime')?.value 
            : new Date().toISOString(),
    });

    if (result.value) {
      const controlName = type === 'start' ? 'startDateTime' : 'endDateTime';
      this.postJobForm.get(controlName)?.patchValue(result.value);
    }
  }

  onPriceInput(event: any) {
    const priceControl = this.postJobForm.get('price');
    if (!priceControl) return;
    let value = event.target.value;
    if (!value) return;
    const rawValue = value.toString().replace(/[^0-9]/g, '');
    const numberValue = parseFloat(rawValue);
    if (isNaN(numberValue)) { priceControl.setValue('', { emitEvent: false }); return; };
    const formattedValue = this.currencyPipe.transform(numberValue, 'CLP', 'symbol', '1.0-0');
    if (formattedValue) { priceControl.setValue(formattedValue, { emitEvent: false }); }
  }

  async onSubmit() {
    if (this.postJobForm.invalid) { this.postJobForm.markAllAsTouched(); return; }
    const formValue = this.postJobForm.getRawValue();
    let priceAsNumber = 0;
    if (formValue.price && typeof formValue.price === 'string') {
      const cleanedValue = formValue.price.replace(/[^0-9]/g, '');
      if (cleanedValue) { priceAsNumber = parseInt(cleanedValue, 10); }
    }
    const jobData = { ...formValue, price: priceAsNumber };
    await this.jobService.createJob(jobData);
    this.presentToast('¡Trabajo publicado con éxito!');
    this.postJobForm.reset();
    setTimeout(() => { this.closePage(); }, 1500); 
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message, duration: 1500, position: 'bottom', color: 'success',
    });
    await toast.present();
  }

  closePage() {
    this.navCtrl.back();
  }
}