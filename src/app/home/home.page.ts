import { Component, ViewChild } from '@angular/core';
import { ModalController, IonModal } from '@ionic/angular';
import { JobDetailsComponent } from '../components/job-details/job-details.component';
import { AuthService } from '../services/auth.service';
import { DatabaseService, JobRecord } from '../services/database.service'; // Usamos DatabaseService
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  @ViewChild('filterModal') filterModal!: IonModal;

  user: any = null;
  
  // Listas de datos
  allJobs: any[] = []; // Copia original para no perder datos al filtrar
  jobs: any[] = [];    // Lista que se muestra en pantalla
  
  // Variables de Filtro
  searchQuery: string = '';
  userLocation: string = 'Buscando ubicación...';
  
  // Estado de los filtros
  selectedCategory: string = 'Todos';
  priceRange: { lower: number; upper: number } = { lower: 0, upper: 1000000 };
  
  // Opciones para el filtro
  categories: string[] = ['Todos', 'Jardinería', 'Aseo', 'Educación', 'Tecnología', 'Mudanza', 'Construcción', 'Otros'];

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private dbService: DatabaseService // Cambiado a DatabaseService
  ) {}

  async ionViewWillEnter() {
    this.user = await this.authService.getCurrentUser();
    await this.loadJobs();
    this.locateUser();
  }

  async loadJobs() {
    // Obtenemos los trabajos de la base de datos
    const dbJobs = await this.dbService.getJobs();
    
    // Mapeamos para asegurar que tengan el formato correcto para la vista
    this.allJobs = dbJobs.map(job => ({
      ...job,
      // Si necesitas formatear algo específico, hazlo aquí
    }));
    
    // Inicialmente mostramos todo
    this.applyFilters();
  }

  // --- LÓGICA DE FILTRADO ---

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value;
    this.applyFilters();
  }

  // Se llama cuando cambia algo en el modal o buscador
  applyFilters() {
    this.jobs = this.allJobs.filter(job => {
      // 1. Filtro de Texto (Buscador)
      const query = this.searchQuery.toLowerCase();
      const matchesSearch = 
        (job.title && job.title.toLowerCase().includes(query)) || 
        (job.description && job.description.toLowerCase().includes(query));

      // 2. Filtro de Categoría
      const matchesCategory = this.selectedCategory === 'Todos' || job.category === this.selectedCategory;

      // 3. Filtro de Precio
      const matchesPrice = 
        (job.price >= this.priceRange.lower) && 
        (job.price <= this.priceRange.upper);

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }

  // Acciones del Modal
  resetFilters() {
    this.selectedCategory = 'Todos';
    this.priceRange = { lower: 0, upper: 1000000 };
    this.applyFilters();
    this.filterModal.dismiss();
  }

  closeFilterModal() {
    this.applyFilters(); // Aplicar al cerrar
    this.filterModal.dismiss();
  }

  // --- GEOLOCALIZACIÓN (Mantenida igual) ---
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
    const apiKey = 'AIzaSyDZDMA7XvUIue6gguEEwrPkV78BBa3wE68'; 
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
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
      console.error('Error API Geo', error);
      this.userLocation = 'Sin conexión';
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