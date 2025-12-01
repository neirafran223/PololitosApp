import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatabaseService, UserRecord } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private navCtrl: NavController,
    private database: DatabaseService,
    private http: HttpClient
  ) { }

  // --- API EXTERNA (Para recuperación de contraseña) ---
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  verifyResetToken(email: string, token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify-reset-token`, { email, token });
  }

  resetPassword(email: string, token: string, password: string, password_confirmation: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
      email, token, password, password_confirmation
    });
  }

  // --- AUTENTICACIÓN LOCAL (SQLite / Storage) ---

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
    // Extraemos confirmPassword para no enviarlo a la BD
    const { confirmPassword, ...payload } = userData;
    
    // Verificamos duplicados
    const exists = await this.database.userExists(payload.email, payload.username);
    if (exists) {
      return false; // Usuario ya existe
    }

    const record = await this.database.createUser(payload);
    if (!record) {
      return false;
    }

    // Login automático tras registro
    await this.database.setCurrentUser(record);
    return true;
  }

  async logout() {
    await this.database.clearCurrentUser();
    this.navCtrl.navigateRoot('/login');
  }

  // SEGURIDAD: Actualización controlada
  async updateUser(updatedData: any): Promise<any> {
    // 1. Obtener el usuario actual desde la sesión segura
    const currentUser = await this.database.getCurrentUser();
    
    if (!currentUser?.id) {
      console.error('No hay sesión activa para actualizar.');
      return null;
    }

    try {
      // 2. Forzar el ID del usuario actual. 
      // Ignoramos cualquier ID que venga en 'updatedData' para evitar IDOR (Insecure Direct Object Reference).
      const secureUpdatePayload = {
        ...updatedData,
        id: currentUser.id 
      };

      // 3. Ejecutar actualización en BD
      const updated: UserRecord | null = await this.database.updateUser(secureUpdatePayload);

      // 4. Si fue exitoso, actualizamos la sesión en memoria
      if (updated) {
        await this.database.setCurrentUser(updated);
      }

      return updated;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      // Aquí podrías manejar errores específicos como "Email ya existe" (UNIQUE constraint)
      throw error; 
    }
  }

  async findUserByEmail(email: string): Promise<boolean> {
    return this.database.findUserByEmail(email);
  }

  async updatePassword(email: string, newPassword: string): Promise<boolean> {
    const success = await this.database.updatePassword(email, newPassword);

    if (success) {
      // Si el usuario cambiado es el actual, refrescamos la sesión
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