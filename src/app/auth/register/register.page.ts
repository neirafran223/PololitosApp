import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';


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
  if (!rut) {
    return null;
  }
  
  const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (rutLimpio.length < 2) {
    return { invalidRut: true };
  }

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    if (multiplo < 7) {
      multiplo++;
    } else {
      multiplo = 2;
    }
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = (dvEsperado === 11) ? '0' : (dvEsperado === 10) ? 'K' : dvEsperado.toString();

  if (dvCalculado !== dv) {
    return { invalidRut: true };
  }
  
  return null;
}


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  segmentValue = 'register';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private navCtrl: NavController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      rut: ['', [Validators.required, rutValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: passwordsMatchValidator }); // <-- Añadimos el validador de contraseñas al grupo
  }

  async register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { firstName, email, password } = this.registerForm.value;
    const success = await this.authService.register(this.registerForm.value);

    if (success) {
      this.navCtrl.navigateRoot('/tabs/tab1', { animated: true, animationDirection: 'forward' });
    } else {
      this.presentToast('Este correo o nombre de usuario ya está en uso.', 'danger');
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