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

  register(name: string, email: string, password: string): boolean {
    if (name && email && password) {
      this.currentUser = { email: email, name: name };
      return true;
    }
    return false;
  }
  
  // --- MÉTODO CLAVE PARA CERRAR SESIÓN ---
  logout() {
    this.currentUser = null; // Borra la información del usuario
    this.router.navigate(['/login']); // Redirige a la página de login
  }

  getCurrentUser() {
    return this.currentUser;
  }
  
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}