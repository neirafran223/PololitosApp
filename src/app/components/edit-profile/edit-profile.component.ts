import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { UserRecord } from '../../services/database.service'; //

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  standalone: false,
})
export class EditProfileComponent implements OnInit {
  @Input() user!: UserRecord; // Recibe el usuario actual
  editForm!: FormGroup;
  isLoading = false;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Inicializamos el formulario con los datos actuales del usuario
    this.editForm = this.fb.group({
      fullName: [this.user?.fullName || '', [Validators.required, Validators.minLength(3)]],
      username: [this.user?.username || '', [Validators.required, Validators.minLength(3)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      phoneNumber: [this.user?.phoneNumber || '', [Validators.required, Validators.pattern('^[0-9+]{8,15}$')]],
    });
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  async save() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const updatedData = this.editForm.value;

    try {
      // Llamamos al servicio para actualizar (SQLite/Storage)
      const result = await this.authService.updateUser(updatedData); //

      if (result) {
        await this.presentToast('Perfil actualizado correctamente');
        // Cerramos el modal y enviamos los datos nuevos al padre
        this.modalController.dismiss(result, 'confirm');
      } else {
        await this.presentToast('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      await this.presentToast('Ocurrió un error inesperado');
    } finally {
      this.isLoading = false;
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'dark' // O el color que prefieras
    });
    await toast.present();
  }
}