import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; // 1. Importar AuthService

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  user: any;

  // 2. Inyectar AuthService en el constructor
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
  }

  // 3. Crear el método que llamará el botón
  logout() {
    this.authService.logout();
  }
}