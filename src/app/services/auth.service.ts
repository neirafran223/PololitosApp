import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _storage: Storage | null = null;
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  constructor(
    private storage: Storage,
    private navCtrl: NavController
    ) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
  }
  
  private async ensureStorageReady() {
    if (!this._storage) {
      await this.init();
    }
  }
  
  /**
   * Revisa directamente la memoria persistente para ver si hay un usuario logueado.
   * Este es el método que usará nuestro AuthGuard.
   */
  async checkAuthStatus(): Promise<boolean> {
    await this.ensureStorageReady();
    const user = await this._storage!.get(this.CURRENT_USER_KEY);
    return !!user;
  }

  async login(credential: string, password: string): Promise<boolean> {
    await this.ensureStorageReady();
    const users = await this._storage!.get(this.USERS_KEY) || [];
    const user = users.find((u: any) =>
      (u.email.toLowerCase() === credential.toLowerCase() || u.username.toLowerCase() === credential.toLowerCase())
      && u.password === password
    );

    if (user) {
      await this._storage!.set(this.CURRENT_USER_KEY, user);
      return true;
    }
    return false;
  }

  async register(userData: any): Promise<boolean> {
    await this.ensureStorageReady();
    const users = await this._storage!.get(this.USERS_KEY) || [];
    const userExists = users.find((u: any) => u.email === userData.email || u.username === userData.username);

    if (userExists) {
      return false; 
    }

    users.push(userData);
    await this._storage!.set(this.USERS_KEY, users);
    await this._storage!.set(this.CURRENT_USER_KEY, userData);
    return true;
  }

  async logout() {
    await this.ensureStorageReady();
    await this._storage!.remove(this.CURRENT_USER_KEY);
    this.navCtrl.navigateRoot('/login');
  }

  async updateUser(updatedData: any): Promise<any> {
    await this.ensureStorageReady();
    let currentUser = await this._storage!.get(this.CURRENT_USER_KEY);
    if (!currentUser) return null;

    currentUser = { ...currentUser, ...updatedData };
    await this._storage!.set(this.CURRENT_USER_KEY, currentUser);

    const users = await this._storage!.get(this.USERS_KEY) || [];
    const userIndex = users.findIndex((u: any) => u.email === currentUser.email);

    if (userIndex > -1) {
      users[userIndex] = currentUser;
      await this._storage!.set(this.USERS_KEY, users);
    }
    return currentUser;
  }

  async findUserByEmail(email: string): Promise<boolean> {
    await this.ensureStorageReady();
    const users = await this._storage!.get(this.USERS_KEY) || [];
    return users.some((u: any) => u.email === email);
  }

  async updatePassword(email: string, newPassword: string): Promise<boolean> {
    await this.ensureStorageReady();
    const users = await this._storage!.get(this.USERS_KEY) || [];
    const userIndex = users.findIndex((u: any) => u.email === email);

    if (userIndex > -1) {
      users[userIndex].password = newPassword;
      await this._storage!.set(this.USERS_KEY, users);
      return true;
    }
    return false;
  }

  async getCurrentUser() {
    await this.ensureStorageReady();
    return this._storage!.get(this.CURRENT_USER_KEY);
  }
}