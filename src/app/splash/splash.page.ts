import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false,
})
export class SplashPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    private authService: AuthService
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    // Duración del video en milisegundos (ajusta según la duración real de tu video)
    setTimeout(async () => {
      const isAuthenticated = await this.authService.checkAuthStatus();
      if (isAuthenticated) {
        this.navCtrl.navigateRoot('/tabs/home', { animated: true, animationDirection: 'forward' });
      } else {
        this.navCtrl.navigateRoot('/login', { animated: true, animationDirection: 'forward' });
      }
    }, 3000); // <-- Ejemplo: 3 segundos
  }
}