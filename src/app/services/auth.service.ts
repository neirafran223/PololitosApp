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

  
  async init() {
    await this.storage.create();
    this.currentUser = await this.storage.get('currentUser');
    this.storageInitialized = true;
  }

  
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

  
  async register(userData: any): Promise<boolean> {
    const users = await this.storage.get('users') || [];
    const userExists = users.find((u: any) => u.email === userData.email || u.username === userData.username);

    if (userExists) {
      return false; 
    }

    users.push(userData);
    await this.storage.set('users', users);

    this.currentUser = userData;
    await this.storage.set('currentUser', this.currentUser);
    return true;
  }

  
  async logout() {
    this.currentUser = null;
    await this.storage.remove('currentUser');
    this.router.navigate(['/login']);
  }

  
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
  
  
  async findUserByEmail(email: string): Promise<boolean> {
    const users = await this.storage.get('users') || [];
    return users.some((u: any) => u.email === email);
  }

  
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

  
  getCurrentUser() {
    return this.currentUser;
  }

  
  async checkAuthStatus(): Promise<boolean> {
    if (!this.storageInitialized) {
      await this.init();
    }
    return this.currentUser !== null;
  }
}