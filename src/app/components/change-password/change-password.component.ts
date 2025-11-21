// src/app/components/change-password/change-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: false
})
export class ChangePasswordComponent implements OnInit {
  passwordForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.checkPasswords });
  }

  // Validador personalizado para comparar contraseñas
  checkPasswords(group: FormGroup) {
    const pass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  async onSubmit() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    try {
      // Llamada a la API a través del servicio
      const success = await this.authService.changePasswordAPI(currentPassword, newPassword);

      if (success) {
        await this.presentToast('Contraseña actualizada exitosamente', 'success');
        this.modalController.dismiss();
      } else {
        await this.presentToast('Error: Verifica tu contraseña actual', 'danger');
      }
    } catch (error) {
      await this.presentToast('Error de conexión con el servidor', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  cancel() {
    this.modalController.dismiss();
  }

  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}