import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false,
})
export class ForgotPasswordPage {
  currentStep: 'enterEmail' | 'enterCode' | 'enterPassword' = 'enterEmail';
  email = '';
  verificationCode = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService 
  ) { }

  // PASO 1: Enviar código por correo (backend)
  async sendCode() {
    if (!this.email || !/^\S+@\S+\.\S+$/.test(this.email)) {
      this.presentToast('Ingresa un correo válido.', 'danger');
      return;
    }
    this.authService.forgotPassword(this.email).subscribe({
      next: async () => {
        await this.presentAlert('Código Enviado', 'Te enviamos un código de verificación a tu correo.');
        this.currentStep = 'enterCode';
      },
      error: async (err) => {
        const msg = err?.error?.detail || 'No fue posible enviar el código.';
        this.presentToast(msg, 'danger');
      }
    });
  }

  // PASO 2: Verificar código con backend
  verifyCode() {
    if (!this.verificationCode || this.verificationCode.length !== 4) {
      this.presentToast('Ingresa el código de 4 dígitos.', 'danger');
      return;
    }
    this.authService.verifyResetToken(this.email, this.verificationCode).subscribe({
      next: async () => {
        await this.presentToast('Código verificado correctamente.', 'success');
        this.currentStep = 'enterPassword';
      },
      error: async (err) => {
        const msg = err?.error?.detail || 'El código ingresado es incorrecto o expiró.';
        this.presentToast(msg, 'danger');
      }
    });
  }

  // PASO 3: Resetear en backend y sincronizar SQLite
  async updatePassword() {
    if (this.newPassword.length < 8) {
      this.presentToast('La contraseña debe tener al menos 8 caracteres.', 'danger');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.presentToast('Las contraseñas no coinciden.', 'danger');
      return;
    }

    this.authService.resetPassword(
      this.email,
      this.verificationCode,
      this.newPassword,
      this.confirmPassword
    ).subscribe({
      next: async () => {
        const okLocal = await this.authService.updatePassword(this.email, this.newPassword);
        if (okLocal) {
          this.presentToast('Contraseña actualizada con éxito.', 'success');
        } else {
          this.presentToast('Se actualizó en el servidor, pero falló la actualización local.', 'warning');
        }
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        const msg = err?.error?.detail || 'No se pudo actualizar la contraseña.';
        this.presentToast(msg, 'danger');
      }
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, duration: 3000, position: 'bottom', color });
    await toast.present();
  }
  
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}
