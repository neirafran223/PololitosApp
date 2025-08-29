import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  register() {
    if (this.authService.register('Test User', 'test@test.com', '123456')) {
      this.router.navigate(['/tabs/tab1']);
    } else {
      console.error('Error en el registro');
    }
  }
}