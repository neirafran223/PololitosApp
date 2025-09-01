import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  segmentValue = 'login';

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private toastController: ToastController
  ) { }

  async login(credentialInput: any, passwordInput: any) {
    const credential = credentialInput.value;
    const password = passwordInput.value;

    if (!credential || !password) {
      this.presentToast('Por favor, completa todos los campos.', 'danger');
      return;
    }

    const success = await this.authService.login(credential, password);

    if (success) {
      this.navCtrl.navigateRoot('/tabs/tab1', { animated: true, animationDirection: 'forward' });
    } else {
      this.presentToast('Las credenciales son incorrectas.', 'danger');
    }
  }

  /**
   * Cambia la visibilidad del campo de contraseña y el ícono correspondiente.
   * @param input El elemento del campo de contraseña.
   * @param icon El elemento del ícono del ojo.
   */
  togglePasswordVisibility(input: any, icon: any) {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.name = isPassword ? 'eye-off-outline' : 'eye-outline';
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
}