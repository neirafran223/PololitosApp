import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  user = {
    name: 'Juan Pérez',
    username: '@juan.perez',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg'
  };

  constructor() { }

  ngOnInit() {
  }

  logout() {
    console.log('Cerrando sesión...');
    
  }
}