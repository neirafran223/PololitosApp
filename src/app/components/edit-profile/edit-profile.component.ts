import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // Importación necesaria

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  standalone: false,
})
export class EditProfileComponent implements OnInit {
  @Input() user: any; 
  userForm!: FormGroup;
  currentPhoto: string | undefined; // <--- Variable necesaria para el HTML

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.currentPhoto = this.user?.photoUrl; // Cargar foto inicial

    this.userForm = this.fb.group({
      firstName: [this.user?.firstName || '', [Validators.required]],
      lastName: [this.user?.lastName || '', [Validators.required]],
      email: [this.user?.email || '', [Validators.required, Validators.email]]
    });
  }

  // <--- Esta es la función que te faltaba y causa el error
  async changePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      if (image.dataUrl) {
        this.currentPhoto = image.dataUrl;
      }
    } catch (error) {
      console.log('Cancelado por usuario o error:', error);
    }
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const fullName = `${formValue.firstName} ${formValue.lastName}`;

      // Preparamos el objeto con la foto nueva (si la hay)
      const dataToUpdate = {
        fullName: fullName,
        email: formValue.email,
        photoUrl: this.currentPhoto,
        firstName: formValue.firstName,
        lastName: formValue.lastName
      };

      this.modalCtrl.dismiss(dataToUpdate, 'confirm');
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}