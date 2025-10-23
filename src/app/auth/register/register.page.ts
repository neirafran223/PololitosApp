import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

// --- Validadores personalizados (no cambian) ---
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordsMismatch: true };
  }
  return null;
}

export function rutValidator(control: AbstractControl): ValidationErrors | null {
  const rut = control.value;
  if (!rut) return null;
  const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (rutLimpio.length < 2) return { invalidRut: true };
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  const rutNumero = parseInt(cuerpo, 10); // Validación de rango
  if (isNaN(rutNumero)) {
    return { invalidRut: true };
  }
  if (rutNumero < 1000000 || rutNumero > 25000000) {
    return { invalidRange: true };
  } // Fin validación rango
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = (dvEsperado === 11) ? '0' : (dvEsperado === 10) ? 'K' : dvEsperado.toString();
  return dvCalculado !== dv ? { invalidRut: true } : null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false, // Se mantiene tu configuración
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  
  // Se eliminan 'segmentValue' y 'ionViewWillEnter'

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private navCtrl: NavController,
    private toastController: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      rut: ['', [Validators.required, rutValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: passwordsMatchValidator }); 
  }

  // --- FUNCIÓN AÑADIDA PARA FORMATEAR EL RUT EN TIEMPO REAL ---
  onRutInput(event: any) {
    const rutControl = this.registerForm.get('rut');
    if (!rutControl) return;

    let value = event.target.value;
    if (!value) return;

    let rut = value.replace(/[^0-9kK]/g, '');

    if (rut.length > 1) {
      let body = rut.slice(0, -1);
      const dv = rut.slice(-1).toUpperCase();
      body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      rutControl.setValue(`${body}-${dv}`, { emitEvent: false });
    }
  }

  async register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();

    try {
      const success = await this.authService.register(this.registerForm.value);
      if (success) {
        this.navCtrl.navigateRoot('/tabs/tab1', { animated: true, animationDirection: 'forward' });
        this.presentToast('¡Registro exitoso!', 'success');
      }
      // Se elimina el 'else' y se confía en el 'catch'
    } catch (error: any) {
      // Manejo de errores mejorado
      this.presentToast(error.message, 'danger');
    }
    finally {
      loading.dismiss();
    }
  }
  
  shouldShowError(control: AbstractControl | null): boolean {
    if (!control) return false;
    return control.invalid && (control.dirty || control.touched);
  }
  
  togglePasswordVisibility(input: any, icon: any) {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.name = isPassword ? 'eye-off-outline' : 'eye-outline';
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, duration: 3000, position: 'bottom', color });
    await toast.present();
  }
}