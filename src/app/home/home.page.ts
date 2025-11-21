import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { JobDetailsComponent } from '../components/job-details/job-details.component';
import { AuthService } from '../services/auth.service';
import { JobService } from '../services/job.service';
import { Geolocation } from '@capacitor/geolocation';
import { JobRecord } from '../services/database.service';
import { JobFiltersComponent } from '../components/job-filters/job-filters.component';

export interface JobFilters {
  categories: string[];
  minPrice: number | null;
  maxPrice: number | null;
  location: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  // ... (tus variables existentes se mantienen igual) ...
  user: any = null;
  allJobs: JobRecord[] = [];
  filteredJobs: JobRecord[] = [];
  searchQuery: string = '';
  userLocation: string = 'Buscando ubicación...';
  
  activeFilters: JobFilters = {
    categories: [],
    minPrice: null,
    maxPrice: null,
    location: ''
  };
  hasActiveFilters = false;

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private jobService: JobService
  ) {}

  async ngOnInit() {
    await this.loadJobs();
  }

  async ionViewWillEnter() {
    this.user = await this.authService.getCurrentUser();
    await this.loadJobs();
    this.locateUser();
  }

  async loadJobs() {
    this.allJobs = await this.jobService.getJobs();
    // Inicializar filteredJobs con todos los trabajos si no hay filtros
    if (!this.searchQuery && !this.hasActiveFilters) {
      this.filteredJobs = [...this.allJobs];
    } else {
      this.applyFilters();
    }
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

  onSearchChange(event: any) {
    // El evento ionInput proporciona el valor en event.detail.value
    this.searchQuery = event.detail?.value || this.searchQuery;
    this.applyFilters();
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilters();
  }

  async openFilters() {
    // Verificación de seguridad: asegúrate de que hay categorías para mostrar
    const availableCats = this.getAvailableCategories();
    console.log('Abriendo filtros. Categorías disponibles:', availableCats);

    const modal = await this.modalController.create({
      component: JobFiltersComponent,
      componentProps: {
        currentFilters: JSON.parse(JSON.stringify(this.activeFilters)), // Copia profunda para evitar referencias
        availableCategories: availableCats
      },
      // Eliminamos la cssClass temporalmente por si está causando problemas de visibilidad
      // cssClass: 'job-filters-modal' 
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    // Verificamos el rol 'confirm' (o lo que uses en el componente)
    if (role === 'confirm' && data) {
      this.activeFilters = data;
      this.checkActiveFilters();
      this.applyFilters();
    }
  }

  clearFilters() {
    this.activeFilters = {
      categories: [],
      minPrice: null,
      maxPrice: null,
      location: ''
    };
    this.hasActiveFilters = false;
    this.applyFilters();
  }

  removeCategory(category: string) {
    this.activeFilters.categories = this.activeFilters.categories.filter(c => c !== category);
    this.checkActiveFilters();
    this.applyFilters();
  }

  clearPriceFilter() {
    this.activeFilters.minPrice = null;
    this.activeFilters.maxPrice = null;
    this.checkActiveFilters();
    this.applyFilters();
  }

  clearLocationFilter() {
    this.activeFilters.location = '';
    this.checkActiveFilters();
    this.applyFilters();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.activeFilters.categories.length > 0) count += this.activeFilters.categories.length;
    if (this.activeFilters.minPrice !== null || this.activeFilters.maxPrice !== null) count += 1;
    if (this.activeFilters.location && this.activeFilters.location.trim() !== '') count += 1;
    return count;
  }

  private checkActiveFilters() {
    this.hasActiveFilters = 
      (this.activeFilters.categories && this.activeFilters.categories.length > 0) ||
      (this.activeFilters.minPrice !== null && this.activeFilters.minPrice !== undefined) ||
      (this.activeFilters.maxPrice !== null && this.activeFilters.maxPrice !== undefined) ||
      !!(this.activeFilters.location && this.activeFilters.location.trim() !== '');
  }

  private getAvailableCategories(): string[] {
    const categories = new Set<string>();
    this.allJobs.forEach(job => {
      if (job.category) {
        categories.add(job.category);
      }
    });
    return Array.from(categories).sort();
  }

  private applyFilters() {
    let jobs = [...this.allJobs];

    // 1. Búsqueda de texto
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        (job.category && job.category.toLowerCase().includes(query)) || // Check null category
        (job.location && job.location.toLowerCase().includes(query))
      );
    }

    // 2. Categorías
    if (this.activeFilters.categories.length > 0) {
      jobs = jobs.filter(job => 
        job.category && this.activeFilters.categories.includes(job.category)
      );
    }

    // 3. Precio Mínimo (Manejo robusto de 0 y nulos)
    if (this.activeFilters.minPrice !== null && this.activeFilters.minPrice !== undefined && this.activeFilters.minPrice.toString() !== '') {
       const min = Number(this.activeFilters.minPrice);
       jobs = jobs.filter(job => job.price >= min);
    }

    // 4. Precio Máximo
    if (this.activeFilters.maxPrice !== null && this.activeFilters.maxPrice !== undefined && this.activeFilters.maxPrice.toString() !== '') {
       const max = Number(this.activeFilters.maxPrice);
       jobs = jobs.filter(job => job.price <= max);
    }

    // 5. Ubicación
    if (this.activeFilters.location && this.activeFilters.location.trim() !== '') {
      const locationQuery = this.activeFilters.location.toLowerCase().trim();
      jobs = jobs.filter(job => 
        job.location && job.location.toLowerCase().includes(locationQuery)
      );
    }

    this.filteredJobs = jobs;
    console.log(`Filtros aplicados. ${this.filteredJobs.length} trabajos encontrados.`);
  }

  async openJobDetails(job: JobRecord) {
    const modal = await this.modalController.create({
      component: JobDetailsComponent,
      componentProps: { job: job },
      cssClass: 'job-details-modal'
    });
    return await modal.present();
  }
}