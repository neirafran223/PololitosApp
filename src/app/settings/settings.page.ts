import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service'; // 1. Importar ThemeService

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage {
  isDark = true;

  // 2. Inyectar los servicios
  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    // 3. Sincronizar el estado del interruptor con el servicio
    this.isDark = this.themeService.isDarkMode();
  }

  // 4. Método que se llama al cambiar el interruptor
  onThemeToggle() {
    this.themeService.toggleTheme();
    this.isDark = this.themeService.isDarkMode();
  }

  logout() {
    this.authService.logout();
  }
}