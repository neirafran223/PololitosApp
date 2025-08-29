import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {

  constructor(
    private authService: AuthService,
    private router: Router,
    private navCtrl: NavController
  ) { }

  login(email: any, password: any) {
    if (this.authService.login(email, password)) {
      // Requisito d) Implementar animaciones
      this.navCtrl.navigateRoot('/tabs/home', { animated: true, animationDirection: 'forward' });
    } else {
      console.error('Credenciales incorrectas');
    }
  }
}