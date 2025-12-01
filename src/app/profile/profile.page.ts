import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { EditProfileComponent } from '../components/edit-profile/edit-profile.component';
import { DatabaseService, UserRecord } from '../services/database.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage {
  // Objeto 'user' extendido para la vista (incluye firstName y lastName)
  user: any = null;

  constructor(
    private dbService: DatabaseService,
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  async ionViewWillEnter() {
    await this.loadUserData();
  }

  // Carga y transforma los datos de la BD para la vista
  async loadUserData() {
    const dbUser = await this.dbService.getCurrentUser();

    if (dbUser) {
      // LÓGICA CLAVE: Separar fullName en firstName y lastName para que tu HTML no falle
      const nameParts = dbUser.fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      this.user = {
        ...dbUser,
        firstName: firstName,
        lastName: lastName
      };
    }
  }

  getInitials(firstName: string, lastName: string): string {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    // Si no tiene apellido, usamos la segunda letra del nombre o nada
    return (first + last) || 'U'; 
  }

  async openEditModal() {
    if (!this.user) return;

    const modal = await this.modalController.create({
      component: EditProfileComponent,
      componentProps: {
        // Pasamos una copia para no modificar la vista hasta guardar
        user: { ...this.user } 
      },
      cssClass: 'edit-profile-modal' // Clase opcional para estilos del modal
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    // Si el usuario guardó los cambios en el modal
    if (role === 'confirm' && data) {
      await this.saveProfileChanges(data);
    }
  }

  async saveProfileChanges(updatedData: any) {
    try {
      const userToUpdate = {
        ...this.user,
        ...updatedData
      };

      // 2. Guardar en SQLite/Storage
      await this.dbService.updateUser(userToUpdate);
      
      // 3. Actualizar la sesión actual
      await this.dbService.setCurrentUser(userToUpdate);

      // 4. Refrescar la vista
      await this.loadUserData();
      this.presentToast('Perfil actualizado correctamente');

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      this.presentToast('Error al guardar los cambios');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'dark' // Estilo elegante
    });
    toast.present();
  }
}