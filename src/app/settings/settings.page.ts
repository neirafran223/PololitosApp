import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service'; 

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage {
  isDark = true;

  
  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    
    this.isDark = this.themeService.isDarkMode();
  }

  
  onThemeToggle() {
    this.themeService.toggleTheme();
    this.isDark = this.themeService.isDarkMode();
  }

  logout() {
    this.authService.logout();
  }
}