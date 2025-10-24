import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

// --- VALIDADOR DE CONTRASEÑAS (Sin cambios) ---
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordsMismatch: true };
  }
  return null;
}

// --- NUEVO VALIDADOR DE TELÉFONO ---
export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const phone = control.value;
  if (!phone) return null; // No valida si está vacío
  
  // Formato chileno: 9 dígitos, empieza con 9
  const phonePattern = /^[9]\d{8}$/; 
  
  return !phonePattern.test(phone) ? { invalidPhone: true } : null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private navCtrl: NavController,
    private toastController: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    // --- FORMULARIO MODIFICADO ---
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      phoneNumber: ['', [Validators.required, phoneValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: passwordsMatchValidator }); 
  }

  // --- onRutInput() ELIMINADO ---

  // --- FUNCIÓN REGISTER (MODIFICADA) ---
  async register() {
    if (this.registerForm.invalid) {
      // 1. Busca el primer error y lo muestra en el toast
      const errorMessage = this.findFirstError();
      this.presentToast(errorMessage, 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();

    try {
      // 2. Intenta registrar (el catch atrapará errores de "usuario ya existe")
      const success = await this.authService.register(this.registerForm.value);
      if (success) {
        this.navCtrl.navigateRoot('/tabs/tab1', { animated: true, animationDirection: 'forward' });
        this.presentToast('¡Registro exitoso!', 'success');
      }
    } catch (error: any) {
      // Muestra errores de la base de datos (ej. "usuario ya existe")
      this.presentToast(error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }
  
  // --- shouldShowError() ELIMINADO ---

  // --- NUEVA FUNCIÓN: Busca el primer error de validación ---
  private findFirstError(): string {
    const controls = this.registerForm.controls;

    // Mapeo de nombres de control a nombres legibles
    const fieldNames: { [key: string]: string } = {
      fullName: 'Nombre Completo',
      username: 'Nombre de Usuario',
      phoneNumber: 'Teléfono',
      email: 'Correo',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña'
    };

    for (const name in controls) {
      if (controls[name].invalid) {
        const errors = controls[name].errors;
        if (!errors) continue;

        const fieldName = fieldNames[name] || name;

        if (errors['required']) {
          return `El campo "${fieldName}" es requerido.`;
        }
        if (errors['minlength']) {
          return `El campo "${fieldName}" es demasiado corto.`;
        }
        if (errors['email']) {
          return 'El correo electrónico no tiene un formato válido.';
        }
        if (errors['pattern']) {
          return 'El nombre de usuario solo debe contener letras, números y guion bajo.';
        }
        if (errors['invalidPhone']) {
          return 'El teléfono debe tener 9 dígitos y comenzar con 9 (ej: 912345678).';
        }
      }
    }

    // Revisa errores a nivel de grupo (contraseñas)
    if (this.registerForm.hasError('passwordsMismatch')) {
      return 'Las contraseñas no coinciden.';
    }

    return 'Por favor, completa el formulario correctamente.';
  }
  
  togglePasswordVisibility(input: any, icon: any) {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.name = isPassword ? 'eye-off-outline' : 'eye-outline';
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({ 
      message, 
      duration: 3000, 
      position: 'bottom', // El toast aparece al final de la pantalla
      color 
    });
    await toast.present();
  }
}