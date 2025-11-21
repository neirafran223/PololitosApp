import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatabaseService, UserRecord } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Recuerda cambiar 127.0.0.1 por la IP de tu PC si pruebas en un dispositivo físico (ej: 192.168.x.x)
  private apiUrl = 'http://127.0.0.1:8000/api'; 

  constructor(
    private navCtrl: NavController,
    private database: DatabaseService,
    private http: HttpClient
  ) { }

  // ==========================================
  // API DRF (Django Rest Framework)
  // ==========================================

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

  /**
   * Cambia la contraseña en el servidor remoto (Django) y sincroniza la BD local.
   * Se utiliza desde el componente ChangePasswordComponent.
   */
  async changePasswordAPI(oldPassword: string, newPassword: string): Promise<boolean> {
    const currentUser = await this.database.getCurrentUser();
    
    if (!currentUser) {
      return false;
    }

    // Si tu backend requiere Token en el header, agrégalo aquí.
    // Por ahora enviamos un POST simple asumiendo autenticación por sesión o que el body es suficiente.
    return new Promise((resolve) => {
      this.http.post(`${this.apiUrl}/change-password/`, { 
        // Ajusta estos nombres de campos según lo que espere tu serializer de Django
        // Usualmente es 'old_password' y 'new_password'
        old_password: oldPassword,
        new_password: newPassword,
        // Si tu API necesita identificar al usuario por email/id en el body:
        user_id: currentUser.id 
      }).subscribe({
        next: async () => {
          // Éxito en el servidor -> Actualizamos la base de datos local SQLite
          if (currentUser.email) {
            await this.updatePassword(currentUser.email, newPassword);
          }
          resolve(true);
        },
        error: (error) => {
          console.error('Error al cambiar contraseña en API:', error);
          resolve(false);
        }
      });
    });
  }

  // ==========================================
  // AUTH LOCAL (SQLite / Storage)
  // ==========================================

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

  // Actualiza la contraseña SOLO en la base de datos local
  async updatePassword(email: string, newPassword: string): Promise<boolean> {
    const success = await this.database.updatePassword(email, newPassword);

    if (success) {
      const current = await this.database.getCurrentUser();
      // Si el usuario logueado es el mismo al que se le cambió la pass, actualizamos la sesión
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