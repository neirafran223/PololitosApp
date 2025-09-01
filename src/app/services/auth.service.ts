import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: any = null;
  private storageInitialized = false;

  constructor(private router: Router, private storage: Storage) {
    this.init();
  }

  /**
   * Inicializa el storage y carga la sesión del usuario si existe.
   */
  async init() {
    await this.storage.create();
    this.currentUser = await this.storage.get('currentUser');
    this.storageInitialized = true;
  }

  /**
   * Inicia sesión con correo o nombre de usuario y contraseña.
   */
  async login(credential: string, password: string): Promise<boolean> {
    const users = await this.storage.get('users') || [];
    const user = users.find((u: any) =>
      (u.email.toLowerCase() === credential.toLowerCase() || u.username.toLowerCase() === credential.toLowerCase())
      && u.password === password
    );

    if (user) {
      this.currentUser = user;
      await this.storage.set('currentUser', this.currentUser);
      return true;
    }
    return false;
  }

  /**
   * Registra un nuevo usuario en la base de datos local.
   */
  async register(userData: any): Promise<boolean> {
    const users = await this.storage.get('users') || [];
    const userExists = users.find((u: any) => u.email === userData.email || u.username === userData.username);

    if (userExists) {
      return false; // El correo o nombre de usuario ya existe
    }

    users.push(userData);
    await this.storage.set('users', users);

    this.currentUser = userData;
    await this.storage.set('currentUser', this.currentUser);
    return true;
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  async logout() {
    this.currentUser = null;
    await this.storage.remove('currentUser');
    this.router.navigate(['/login']);
  }

  /**
   * Actualiza los datos del perfil del usuario actual.
   */
  async updateUser(updatedData: any): Promise<any> {
    if (!this.currentUser) return null;

    this.currentUser = { ...this.currentUser, ...updatedData };
    await this.storage.set('currentUser', this.currentUser);

    const users = await this.storage.get('users') || [];
    const userIndex = users.findIndex((u: any) => u.email === this.currentUser.email);

    if (userIndex > -1) {
      users[userIndex] = this.currentUser;
      await this.storage.set('users', users);
    }

    return this.currentUser;
  }
  
  /**
   * Busca si un usuario existe por su correo (para el flujo de restablecer contraseña).
   */
  async findUserByEmail(email: string): Promise<boolean> {
    const users = await this.storage.get('users') || [];
    return users.some((u: any) => u.email === email);
  }

  /**
   * Actualiza la contraseña de un usuario específico por su correo.
   */
  async updatePassword(email: string, newPassword: string): Promise<boolean> {
    const users = await this.storage.get('users') || [];
    const userIndex = users.findIndex((u: any) => u.email === email);

    if (userIndex > -1) {
      users[userIndex].password = newPassword;
      await this.storage.set('users', users);
      return true;
    }
    return false;
  }

  /**
   * Devuelve la información del usuario que tiene la sesión activa.
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Verifica el estado de autenticación (usado por el AuthGuard).
   */
  async checkAuthStatus(): Promise<boolean> {
    if (!this.storageInitialized) {
      await this.init();
    }
    return this.currentUser !== null;
  }
}