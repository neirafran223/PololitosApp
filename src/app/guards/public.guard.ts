import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private navCtrl: NavController
  ) {}

  async canActivate(): Promise<boolean> {
    const isAuthenticated = await this.authService.checkAuthStatus();
    
    if (isAuthenticated) {
      // El usuario SÍ está logueado, redirige al home (tabs).
      this.navCtrl.navigateRoot('/tabs/tab1');
      return false; 
    } else {
      // El usuario NO está logueado, puede ver la página (welcome/login).
      return true;
    }
  }
}