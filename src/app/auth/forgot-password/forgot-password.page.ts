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
  generatedCode = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService 
  ) { }

  async sendCode() {
    const userExists = await this.authService.findUserByEmail(this.email);
    if (userExists) {
      this.generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
      this.presentAlert('Código Enviado', `Para esta simulación, tu código es: ${this.generatedCode}`);
      this.currentStep = 'enterCode';
    } else {
      this.presentToast('El correo ingresado no fue encontrado.', 'danger');
    }
  }

  verifyCode() {
    if (this.verificationCode === this.generatedCode) {
      this.presentToast('Código verificado correctamente.', 'success');
      this.currentStep = 'enterPassword';
    } else {
      this.presentToast('El código ingresado es incorrecto.', 'danger');
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
    const success = await this.authService.updatePassword(this.email, this.newPassword);
    if (success) {
      this.presentToast('Contraseña actualizada con éxito.', 'success');
      this.router.navigate(['/login']);
    } else {
      this.presentToast('Ocurrió un error al actualizar la contraseña.', 'danger');
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