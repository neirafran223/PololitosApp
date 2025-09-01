import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { EditProfileComponent } from '../components/edit-profile/edit-profile.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage {
  user: any;

  constructor(
    private authService: AuthService,
    private modalController: ModalController
  ) {}

  ionViewWillEnter() {
    this.user = this.authService.getCurrentUser();
  }

  getInitials(firstName: string, lastName: string): string {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  }

  async openEditModal() {
    const modal = await this.modalController.create({
      component: EditProfileComponent,
      componentProps: {
        user: this.user // Pasamos los datos del usuario actual al modal
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'save' && data) {
      // Si el modal se cerró con 'save', actualizamos el usuario
      this.user = await this.authService.updateUser(data);
    }
  }
  
  logout() {
    this.authService.logout();
  }
}