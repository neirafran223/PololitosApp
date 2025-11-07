import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service'; // 1. Importa AuthService

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
  standalone: false,
})
export class NotFoundPage {

  constructor(
    private navCtrl: NavController,
    private authService: AuthService
  ) { }
  async goHome() {
    const isAuthenticated = await this.authService.checkAuthStatus();

    if (isAuthenticated) {
      this.navCtrl.navigateRoot('/tabs/tab1');
    } else {
      this.navCtrl.navigateRoot('/welcome');
    }
  }

}