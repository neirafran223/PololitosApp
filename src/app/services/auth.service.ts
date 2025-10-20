import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DatabaseService, UserRecord } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private navCtrl: NavController,
    private database: DatabaseService
    ) { }
  
  /**
   * Revisa directamente la memoria persistente para ver si hay un usuario logueado.
   * Este es el método que usará nuestro AuthGuard.
   */
  async checkAuthStatus(): Promise<boolean> {
    const user = await this.database.getCurrentUser();
    return !!user;
  }

  async login(credential: string, password: string): Promise<boolean> {
    const user = await this.database.findUserForLogin(credential, password);
    if (user) {
      await this.database.setCurrentUser(user);
      return true;
    }
    return false;
  }

  async register(userData: any): Promise<boolean> {
    const { confirmPassword, ...payload } = userData;
    const exists = await this.database.userExists(payload.email, payload.username);

    if (exists) {
      return false;
    }

    const record = await this.database.createUser(payload);
    if (!record) {
      return false;
    }

    await this.database.setCurrentUser(record);
    return true;
  }

  async logout() {
    await this.database.clearCurrentUser();
    this.navCtrl.navigateRoot('/login');
  }

  async updateUser(updatedData: any): Promise<any> {
    const currentUser = await this.database.getCurrentUser();
    if (!currentUser?.id) {
      return null;
    }

    const updated: UserRecord | null = await this.database.updateUser({ ...updatedData, id: currentUser.id });
    if (updated) {
      await this.database.setCurrentUser(updated);
    }

    return updated;
  }

  async findUserByEmail(email: string): Promise<boolean> {
    return this.database.findUserByEmail(email);
  }

  async updatePassword(email: string, newPassword: string): Promise<boolean> {
    const success = await this.database.updatePassword(email, newPassword);

    if (success) {
      const current = await this.database.getCurrentUser();
      if (current && current.email.toLowerCase() === email.toLowerCase()) {
        const refreshed = await this.database.getUserByEmail(email);
        if (refreshed) {
          await this.database.setCurrentUser(refreshed);
        }
      }
    }

    return success;
  }

  async getCurrentUser() {
    return this.database.getCurrentUser();
  }
}
