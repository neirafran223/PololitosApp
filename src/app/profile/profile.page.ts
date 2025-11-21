import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { EditProfileComponent } from '../components/edit-profile/edit-profile.component';
import { UserRecord } from '../services/database.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage {
  user: UserRecord | null = null;

  constructor(
    private authService: AuthService,
    private modalController: ModalController
  ) {}

  async ionViewWillEnter() {
    await this.loadUser();
  }

  async loadUser() {
    this.user = await this.authService.getCurrentUser();
  }

  // Este método debe estar DENTRO de la clase
  getInitials(fullName: string): string {
    if (!fullName) return '??';
    
    // Usamos regex \s+ para manejar múltiples espacios correctamente
    const names = fullName.trim().split(/\s+/);
    if (names.length === 0 || names[0] === '') return '??';
    
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    const first = names[0].charAt(0).toUpperCase();
    const last = names[names.length - 1].charAt(0).toUpperCase();
    return first + last;
  }

  // Este método también debe estar DENTRO de la clase
  async openEditModal() {
    if (!this.user) return;

    const modal = await this.modalController.create({
      component: EditProfileComponent,
      componentProps: {
        user: this.user 
      },
      cssClass: 'edit-profile-modal'
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'confirm' && data) { // Cambiado 'save' por 'confirm' para coincidir con el componente
      // Actualizamos el usuario localmente sin necesidad de recargar todo si la data es completa
      this.user = data; 
      // Opcionalmente recargamos para asegurar sincronía
      await this.loadUser();
    }
  }

  async logout() {
    await this.authService.logout();
  }
}