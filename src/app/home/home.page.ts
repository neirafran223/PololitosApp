import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { JobDetailsComponent } from '../components/job-details/job-details.component';
import { AuthService } from '../services/auth.service';
import { JobService } from '../services/job.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  user: any = null;
  jobs: any[] = [];
  searchQuery: string = '';
  userLocation: string = 'Buscando ubicación...';

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private jobService: JobService
  ) {}

  async ionViewWillEnter() {
    this.user = await this.authService.getCurrentUser();
    this.jobs = await this.jobService.getJobs();
    this.locateUser();
  }

  async locateUser() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      
      if (coordinates) {
        this.getAddressFromCoords(coordinates.coords.latitude, coordinates.coords.longitude);
      }
    } catch (error) {
      console.error('Error al obtener la ubicación', error);
      this.userLocation = 'Ubicación no disponible';
    }
  }

  async getAddressFromCoords(lat: number, lng: number) {
    // IMPORTANTE: Reemplaza 'TU_CLAVE_DE_API' con la clave de Google Maps que ya tienes
    const apiKey = 'AIzaSyDZDMA7XvUIue6gguEEwrPkV78BBa3wE68'; 
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        
        // --- CORRECCIÓN APLICADA AQUÍ ---
        const locality = addressComponents.find((c: any) => c.types.includes('locality'))?.long_name;
        const adminArea = addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name;
        
        if (locality && adminArea) {
          this.userLocation = `${locality}, ${adminArea}`;
        } else {
          this.userLocation = data.results[0].formatted_address; 
        }
      } else {
        this.userLocation = 'Dirección no encontrada';
      }
    } catch (error) {
      console.error('Error al llamar a la API de Geocodificación', error);
      this.userLocation = 'Error de conexión';
    }
  }

  async openJobDetails(job: any) {
    const modal = await this.modalController.create({
      component: JobDetailsComponent,
      componentProps: { job: job },
      cssClass: 'job-details-modal'
    });
    return await modal.present();
  }
}