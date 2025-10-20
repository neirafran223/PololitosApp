import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { PasswordResetService } from '../../services/password-reset.service';

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
  generatedCode = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService,
    private passwordResetService: PasswordResetService
  ) { }

  async sendCode() {
    if (!this.email) {
      this.presentToast('Debes ingresar un correo electrónico.', 'danger');
      return;
    }

    const userExists = await this.authService.findUserByEmail(this.email);
    if (!userExists) {
      this.presentToast('El correo ingresado no fue encontrado.', 'danger');
      return;
    }

    try {
      const response = await this.passwordResetService.requestReset(this.email);
      this.generatedCode = response.code ?? '';
      await this.presentAlert('Código Enviado', `Para esta simulación, tu código es: ${this.generatedCode}`);
      this.currentStep = 'enterCode';
    } catch (error) {
      console.error('Error requesting password reset code', error);
      this.presentToast('No pudimos enviar el código. Intenta nuevamente más tarde.', 'danger');
    }
  }

  async verifyCode() {
    if (!this.verificationCode) {
      this.presentToast('Debes ingresar el código recibido.', 'danger');
      return;
    }

    try {
      await this.passwordResetService.verifyCode(this.email, this.verificationCode);
      this.presentToast('Código verificado correctamente.', 'success');
      this.currentStep = 'enterPassword';
    } catch (error: any) {
      const message = error?.error?.message ?? 'El código ingresado es incorrecto o ha expirado.';
      this.presentToast(message, 'danger');
    }
  }

  async updatePassword() {
    if (this.newPassword.length < 6) {
      this.presentToast('La contraseña debe tener al menos 6 caracteres.', 'danger');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.presentToast('Las contraseñas no coinciden.', 'danger');
      return;
    }
    try {
      await this.passwordResetService.confirmReset(this.email, this.verificationCode);
      const success = await this.authService.updatePassword(this.email, this.newPassword);
      if (success) {
        this.presentToast('Contraseña actualizada con éxito.', 'success');
        this.router.navigate(['/login']);
      } else {
        this.presentToast('Ocurrió un error al actualizar la contraseña.', 'danger');
      }
    } catch (error: any) {
      const message = error?.error?.message ?? 'No pudimos confirmar el restablecimiento de la contraseña.';
      this.presentToast(message, 'danger');
    }
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