import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { ChangePasswordComponent } from '../components/change-password/change-password.component';
import { UserRecord } from '../services/database.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {
  isDark = true;
  user: UserRecord | null = null;
  notificationsEnabled = true;
  emailNotifications = true;
  pushNotifications = true;
  appVersion = '1.0.0';

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.isDark = this.themeService.isDarkMode();
  }

  async ngOnInit() {
    await this.loadUser();
    await this.loadSettings();
  }

  async loadUser() {
    this.user = await this.authService.getCurrentUser();
  }

  async loadSettings() {
    // Cargar configuraciones guardadas (si las hay)
    // Por ahora usamos valores por defecto
  }

  async onThemeToggle() {
    this.themeService.toggleTheme();
    this.isDark = this.themeService.isDarkMode();
    await this.presentToast(
      `Modo ${this.isDark ? 'oscuro' : 'claro'} activado`,
      'success'
    );
  }

  async onNotificationsToggle() {
    await this.presentToast(
      `Notificaciones ${this.notificationsEnabled ? 'activadas' : 'desactivadas'}`,
      'success'
    );
  }

  async onEmailNotificationsToggle() {
    await this.presentToast(
      `Notificaciones por email ${this.emailNotifications ? 'activadas' : 'desactivadas'}`,
      'success'
    );
  }

  async onPushNotificationsToggle() {
    await this.presentToast(
      `Notificaciones push ${this.pushNotifications ? 'activadas' : 'desactivadas'}`,
      'success'
    );
  }

  async openChangePassword() {
    const modal = await this.modalController.create({
      component: ChangePasswordComponent,
      cssClass: 'change-password-modal'
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'success') {
      await this.presentToast('Contraseña actualizada correctamente', 'success');
    }
  }

  async openPrivacySettings() {
    const alert = await this.alertController.create({
      header: 'Privacidad y Seguridad',
      message: 'Configuración de privacidad disponible próximamente.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async openAbout() {
    const alert = await this.alertController.create({
      header: 'Acerca de Pololitos',
      message: `
        <p><strong>Versión:</strong> ${this.appVersion}</p>
        <p>Conecta con trabajos temporales en tu comunidad.</p>
        <p><strong>Desarrollado con:</strong> Ionic & Angular</p>
      `,
      buttons: ['OK']
    });
    await alert.present();
  }

  async openHelp() {
    const alert = await this.alertController.create({
      header: 'Ayuda y Soporte',
      message: `
        <p><strong>¿Necesitas ayuda?</strong></p>
        <p>• Revisa nuestras preguntas frecuentes</p>
        <p>• Contacta con soporte: soporte@pololitos.com</p>
        <p>• Visita nuestro sitio web</p>
      `,
      buttons: ['OK']
    });
    await alert.present();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: () => {
            this.authService.logout();
          }
        }
      ]
    });

    await alert.present();
  }

  getInitials(fullName: string): string {
    if (!fullName) return '??';
    
    const names = fullName.trim().split(' ');
    if (names.length === 0) return '??';
    
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    const first = names[0].charAt(0).toUpperCase();
    const last = names[names.length - 1].charAt(0).toUpperCase();
    return first + last;
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}