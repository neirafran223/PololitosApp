import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  
  constructor(
    private authService: AuthService,
    private navCtrl: NavController
  ) { }

  login(email: any, password: any) {
    if (this.authService.login(email, password)) {
      this.navCtrl.navigateRoot('/tabs/tab1', { animated: true, animationDirection: 'forward' });
    } else {
      // Aquí puedes agregar una alerta de error
      console.error('Credenciales incorrectas');
    }
  }
}