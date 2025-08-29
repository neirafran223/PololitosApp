import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: any = null;

  constructor(private router: Router) { }

  login(email: string, password: string): boolean {
    // Simulación: cualquier email y password son válidos por ahora
    if (email && password) {
      this.currentUser = { email: email, name: email.split('@')[0] };
      return true;
    }
    return false;
  }

  register(name: string, email: string, password: string): boolean {
    // Simulación: cualquier registro es exitoso
    if (name && email && password) {
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