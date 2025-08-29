import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Método para registrarse
  register() {
    // Si el formulario es inválido, no hace nada
    if (this.registerForm.invalid) {
      // Marca todos los campos como "tocados" para mostrar los errores
      this.registerForm.markAllAsTouched();
      return;
    }
    
    // Obtiene los valores del formulario
    const { name, email, password } = this.registerForm.value;

    if (this.authService.register(name, email, password)) {
      this.navCtrl.navigateRoot('/tabs/tab1', { animated: true, animationDirection: 'forward' });
    } else {
      console.error('Error en el registro');
    }
  }

  // Función para verificar si un campo tiene errores y debe mostrarlos
  shouldShowError(control: AbstractControl | null): boolean {
    if (!control) {
      return false;
    }
    return control.invalid && (control.dirty || control.touched);
  }
}