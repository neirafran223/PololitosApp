import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';

// Validador para verificar que la nueva contraseña sea diferente a la actual
export function differentPasswordValidator(currentPassword: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !currentPassword) return null;
    if (control.value === currentPassword) {
      return { samePassword: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: false,
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm!: FormGroup;
  isChanging = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private database: DatabaseService
  ) {}

  ngOnInit() {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  // Validador para verificar que las contraseñas coincidan
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async save() {
    if (this.changePasswordForm.invalid) {
      Object.keys(this.changePasswordForm.controls).forEach(key => {
        this.changePasswordForm.get(key)?.markAsTouched();
      });
      const errorMessage = this.getFirstError();
      this.presentToast(errorMessage, 'danger');
      return;
    }

    this.isChanging = true;

    const loading = await this.loadingController.create({
      message: 'Cambiando contraseña...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const formValue = this.changePasswordForm.value;
      const user = await this.authService.getCurrentUser();

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar que la contraseña actual sea correcta
      const userWithPassword = await this.database.findUserForLogin(user.email, formValue.currentPassword);
      if (!userWithPassword) {
        await loading.dismiss();
        this.presentToast('La contraseña actual es incorrecta', 'danger');
        this.isChanging = false;
        return;
      }

      // Actualizar la contraseña
      const success = await this.authService.updatePassword(user.email, formValue.newPassword);
      
      await loading.dismiss();

      if (success) {
        this.modalCtrl.dismiss(null, 'success');
        this.presentToast('Contraseña actualizada correctamente', 'success');
      } else {
        this.presentToast('Error al actualizar la contraseña', 'danger');
      }
    } catch (error) {
      await loading.dismiss();
      this.presentToast('Error al cambiar la contraseña', 'danger');
      console.error('Error changing password:', error);
    } finally {
      this.isChanging = false;
    }
  }

  private getFirstError(): string {
    const controls = this.changePasswordForm.controls;
    const fieldNames: { [key: string]: string } = {
      currentPassword: 'Contraseña Actual',
      newPassword: 'Nueva Contraseña',
      confirmPassword: 'Confirmar Contraseña'
    };

    for (const name in controls) {
      const control = controls[name];
      if (control.invalid) {
        const errors = control.errors;
        if (!errors) continue;

        const fieldName = fieldNames[name] || name;

        if (errors['required']) {
          return `El campo "${fieldName}" es requerido.`;
        }
        if (errors['minlength']) {
          return `La nueva contraseña debe tener al menos 6 caracteres.`;
        }
      }
    }

    if (this.changePasswordForm.hasError('passwordsMismatch')) {
      return 'Las contraseñas no coinciden.';
    }

    return 'Por favor, completa el formulario correctamente.';
  }

  getFieldError(fieldName: string): string | null {
    const control = this.changePasswordForm.get(fieldName);
    if (!control || !control.invalid || !control.touched) {
      return null;
    }

    const errors = control.errors;
    if (!errors) return null;

    if (errors['required']) return 'Este campo es requerido';
    if (errors['minlength']) {
      const required = errors['minlength'].requiredLength;
      return `Mínimo ${required} caracteres`;
    }

    return 'Campo inválido';
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}

