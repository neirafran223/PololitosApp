import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { UserRecord, DatabaseService } from '../../services/database.service';
import { Observable, of, from } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// Validador de teléfono chileno
export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const phone = control.value;
  if (!phone) return null;
  
  const phonePattern = /^[9]\d{8}$/; 
  return !phonePattern.test(phone) ? { invalidPhone: true } : null;
}

// Validador de nombre completo
export function fullNameValidator(control: AbstractControl): ValidationErrors | null {
  const fullName = control.value;
  if (!fullName) return null;
  
  // Debe tener al menos 2 palabras (nombre y apellido)
  const words = fullName.trim().split(/\s+/);
  if (words.length < 2) {
    return { minWords: { required: 2, actual: words.length } };
  }
  
  // Cada palabra debe tener al menos 2 caracteres
  const invalidWords = words.filter((word: string) => word.length < 2);
  if (invalidWords.length > 0) {
    return { minWordLength: true };
  }
  
  return null;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  standalone: false,
})
export class EditProfileComponent implements OnInit {
  @Input() user: UserRecord | null = null; 
  userForm!: FormGroup;
  isSaving = false;
  originalValues: any = {};

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private database: DatabaseService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    const initialValues = {
      fullName: this.user?.fullName || '',
      username: this.user?.username || '',
      phoneNumber: this.user?.phoneNumber || '',
      email: this.user?.email || ''
    };

    this.originalValues = { ...initialValues };

    this.userForm = this.fb.group({
      fullName: [
        initialValues.fullName, 
        [
          Validators.required, 
          Validators.minLength(3),
          Validators.maxLength(100),
          fullNameValidator
        ]
      ],
      username: [
        initialValues.username, 
        [
          Validators.required, 
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9_]+$/)
        ],
        [this.usernameAsyncValidator()]
      ],
      phoneNumber: [
        initialValues.phoneNumber, 
        [
          Validators.required, 
          phoneValidator
        ]
      ],
      email: [
        initialValues.email, 
        [
          Validators.required, 
          Validators.email,
          Validators.maxLength(100)
        ],
        [this.emailAsyncValidator()]
      ]
    });
  }

  // Validador asíncrono para username
  private usernameAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.trim() === '' || control.value === this.originalValues.username) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(username => {
          if (!username || username.trim() === '') {
            return of(null);
          }
          return from(this.checkUsernameExists(username)).pipe(
            map(exists => {
              // Si existe y no es el usuario actual, es un error
              if (exists && username !== this.originalValues.username) {
                return { usernameTaken: true };
              }
              return null;
            }),
            catchError(() => of(null))
          );
        })
      );
    };
  }

  // Validador asíncrono para email
  private emailAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const emailValue = control.value?.toLowerCase().trim();
      const originalEmail = this.originalValues.email?.toLowerCase();
      
      if (!emailValue || emailValue === '' || emailValue === originalEmail) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email => {
          if (!email || email.trim() === '') {
            return of(null);
          }
          return from(this.checkEmailExists(email)).pipe(
            map(exists => {
              // Si existe y no es el email actual, es un error
              if (exists && email.toLowerCase() !== originalEmail) {
                return { emailTaken: true };
              }
              return null;
            }),
            catchError(() => of(null))
          );
        })
      );
    };
  }

  private async checkUsernameExists(username: string): Promise<boolean> {
    try {
      if (!username || username.trim() === '') {
        return false;
      }
      
      // Si es el mismo username del usuario actual, no hay conflicto
      if (username === this.originalValues.username) {
        return false;
      }
      
      // Verificar si el username existe en otro usuario
      const exists = await this.database.userExists('', username);
      
      // Si existe, verificar que no sea el usuario actual
      if (exists && this.user?.id) {
        // Obtener el usuario con ese username para verificar si es el mismo
        const userByUsername = await this.database.getUserByUsername(username);
        // Si existe un usuario con ese username y NO es el usuario actual, hay conflicto
        return !!(userByUsername && userByUsername.id !== this.user.id);
      }
      
      return exists;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  private async checkEmailExists(email: string): Promise<boolean> {
    try {
      if (!email || email.trim() === '') {
        return false;
      }
      
      const emailLower = email.toLowerCase().trim();
      const originalEmailLower = this.originalValues.email?.toLowerCase();
      
      // Si es el mismo email del usuario actual, no hay conflicto
      if (emailLower === originalEmailLower) {
        return false;
      }
      
      // Verificar si el email existe en otro usuario
      const exists = await this.database.findUserByEmail(email);
      
      // Si existe, verificar que no sea el usuario actual
      if (exists && this.user?.id) {
        const userByEmail = await this.database.getUserByEmail(email);
        // Si existe un usuario con ese email y NO es el usuario actual, hay conflicto
        return !!(userByEmail && userByEmail.id !== this.user.id);
      }
      
      return exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async save() {
    // Marcar todos los campos como touched para mostrar errores
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      const errorMessage = this.getFirstError();
      this.presentToast(errorMessage, 'danger');
      return;
    }

    // Verificar si hay cambios
    if (!this.hasChanges()) {
      this.presentToast('No hay cambios para guardar', 'warning');
      return;
    }

    // Verificar validaciones asíncronas pendientes
    const usernameControl = this.userForm.get('username');
    const emailControl = this.userForm.get('email');
    
    if (usernameControl?.pending || emailControl?.pending) {
      this.presentToast('Por favor espera mientras verificamos los datos...', 'warning');
      return;
    }

    this.isSaving = true;
    
    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();
    
    try {
      // Preparar datos para actualizar (sin incluir password)
      const formValue = this.userForm.value;
      const updateData = {
        fullName: formValue.fullName.trim(),
        username: formValue.username.trim(),
        phoneNumber: formValue.phoneNumber.trim(),
        email: formValue.email.trim().toLowerCase()
      };

      this.modalCtrl.dismiss(updateData, 'save');
      await loading.dismiss();
    } catch (error) {
      await loading.dismiss();
      this.presentToast('Error al guardar los cambios', 'danger');
      console.error('Error saving profile:', error);
    } finally {
      this.isSaving = false;
    }
  }

  hasChanges(): boolean {
    if (!this.userForm) return false;
    
    const formValue = this.userForm.value;
    return (
      formValue.fullName.trim() !== this.originalValues.fullName ||
      formValue.username.trim() !== this.originalValues.username ||
      formValue.phoneNumber.trim() !== this.originalValues.phoneNumber ||
      formValue.email.trim().toLowerCase() !== this.originalValues.email?.toLowerCase()
    );
  }

  private getFirstError(): string {
    const controls = this.userForm.controls;
    const fieldNames: { [key: string]: string } = {
      fullName: 'Nombre Completo',
      username: 'Nombre de Usuario',
      phoneNumber: 'Teléfono',
      email: 'Correo'
    };

    for (const name in controls) {
      const control = controls[name];
      if (control.invalid) {
        const errors = control.errors;
        if (!errors) continue;

        const fieldName = fieldNames[name] || name;

        if (errors['required']) {
          return `El campo "${fieldName}" es requerido.`;
        }
        if (errors['minlength']) {
          const required = errors['minlength'].requiredLength;
          return `El campo "${fieldName}" debe tener al menos ${required} caracteres.`;
        }
        if (errors['maxlength']) {
          const max = errors['maxlength'].requiredLength;
          return `El campo "${fieldName}" no puede tener más de ${max} caracteres.`;
        }
        if (errors['email']) {
          return 'El correo electrónico no tiene un formato válido.';
        }
        if (errors['pattern']) {
          return 'El nombre de usuario solo debe contener letras, números y guion bajo.';
        }
        if (errors['invalidPhone']) {
          return 'El teléfono debe tener 9 dígitos y comenzar con 9 (ej: 912345678).';
        }
        if (errors['minWords']) {
          return 'El nombre completo debe incluir al menos nombre y apellido.';
        }
        if (errors['minWordLength']) {
          return 'Cada palabra del nombre debe tener al menos 2 caracteres.';
        }
        if (errors['usernameTaken']) {
          return 'Este nombre de usuario ya está en uso.';
        }
        if (errors['emailTaken']) {
          return 'Este correo electrónico ya está registrado.';
        }
        if (errors['pending']) {
          return `Verificando "${fieldName}"...`;
        }
      }
    }

    return 'Por favor, completa el formulario correctamente.';
  }

  getFieldError(fieldName: string): string | null {
    const control = this.userForm.get(fieldName);
    if (!control || !control.invalid || !control.touched) {
      return null;
    }

    const errors = control.errors;
    if (!errors) return null;

    if (errors['required']) return 'Este campo es requerido';
    if (errors['minlength']) {
      const required = errors['minlength'].requiredLength;
      return `Mínimo ${required} caracteres`;
    }
    if (errors['maxlength']) {
      const max = errors['maxlength'].requiredLength;
      return `Máximo ${max} caracteres`;
    }
    if (errors['email']) return 'Formato de correo inválido';
    if (errors['pattern']) return 'Solo letras, números y guion bajo';
    if (errors['invalidPhone']) return '9 dígitos, comenzar con 9';
    if (errors['minWords']) return 'Incluir nombre y apellido';
    if (errors['minWordLength']) return 'Cada palabra mínimo 2 caracteres';
    if (errors['usernameTaken']) return 'Usuario ya existe';
    if (errors['emailTaken']) return 'Correo ya registrado';
    if (errors['pending']) return 'Verificando...';

    return 'Campo inválido';
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}