import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: any = null;

  constructor(private router: Router) { }

  login(email: string, password: string): boolean {
    if (email && password) {
      this.currentUser = { email: email, name: email.split('@')[0] };
      return true;
    }
    return false;
  }

  // 👇 MÉTODO AÑADIDO PARA SOLUCIONAR EL ERROR 👇
  register(name: string, email: string, password: string): boolean {
    if (name && email && password) {
      // Simula el registro y el inicio de sesión automático
      this.currentUser = { email: email, name: name };
      return true;
    }
    return false;
  }
  
  logout() {
    this.currentUser = null;
    this.router.navigate(['/login']);
  }

  getCurrentUser() {
    return this.currentUser;
  }
  
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}