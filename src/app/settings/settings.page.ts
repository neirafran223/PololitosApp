import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements OnInit {
  notificationsEnabled: boolean = true;
  darkMode: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  toggleDarkMode(event: any) {
    // Aquí iría la lógica para cambiar el tema de la app
    console.log('Modo oscuro:', event.detail.checked);
  }
}