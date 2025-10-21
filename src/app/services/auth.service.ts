import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatabaseService, UserRecord } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api'; // ajusta si corresponde

  constructor(
    private navCtrl: NavController,
    private database: DatabaseService,
    private http: HttpClient
  ) { }

  // API DRF
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  verifyResetToken(email: string, token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify-reset-token`, { email, token });
  }

  resetPassword(email: string, token: string, password: string, password_confirmation: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
      email,
      token,
      password,
      password_confirmation
    });
  }

  // AUTH LOCAL (SQLite)
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
