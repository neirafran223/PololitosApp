import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  standalone:false,
})
export class EditProfileComponent implements OnInit {
  @Input() user: any; 
  userForm!: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      firstName: [this.user?.firstName || '', Validators.required],
      lastName: [this.user?.lastName || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]]
    });
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save() {
    if (this.userForm.valid) {
      this.modalCtrl.dismiss(this.userForm.value, 'save');
    }
  }
}