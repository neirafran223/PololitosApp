import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { toastBounceInAnimation } from '../../animations/nav-animations';

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
    private toastController: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ionViewWillEnter() {
    this.segmentValue = 'login';
  }

  async login(credentialInput: any, passwordInput: any) {
    const credential = credentialInput.value;
    const password = passwordInput.value;

    if (!credential || !password) {
      this.presentToast('Por favor, completa todos los campos.', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      spinner: 'crescent', // Mantenemos el tipo de spinner
      cssClass: 'custom-loading'
      // Se ha eliminado la línea: message: 'Iniciando sesión...'
    });
    await loading.present();

    try {
      const success = await this.authService.login(credential, password);
      if (success) {
        this.navCtrl.navigateRoot('/tabs/tab1', { animated: true });
      } else {
        this.presentToast('Las credenciales son incorrectas.', 'danger');
      }
    } finally {
      loading.dismiss();
    }
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
      position: 'bottom',
      color,
      enterAnimation: toastBounceInAnimation
    });
    await toast.present();
  }
}