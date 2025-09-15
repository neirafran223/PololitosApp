import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false,
})
export class SplashPage {

  constructor(
    private navCtrl: NavController,
    private authService: AuthService
  ) { }
  
  ionViewDidEnter() {
    // Duración del video en milisegundos
    setTimeout(async () => {
      const isAuthenticated = await this.authService.checkAuthStatus();
      if (isAuthenticated) {
        this.navCtrl.navigateRoot('/tabs/home', { animated: true });
      } else {
        this.navCtrl.navigateRoot('/login', { animated: true });
      }
    }, 3000); // Ajusta este tiempo a la duración de tu video
  }
}