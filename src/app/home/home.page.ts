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
    const modal = await this.modalController.create({
      component: JobFiltersComponent,
      componentProps: {
        currentFilters: { ...this.activeFilters },
        availableCategories: this.getAvailableCategories()
      },
      cssClass: 'job-filters-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
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

    // Aplicar búsqueda
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    }

    // Aplicar filtro de categorías
    if (this.activeFilters.categories.length > 0) {
      jobs = jobs.filter(job => 
        this.activeFilters.categories.includes(job.category)
      );
    }

    // Aplicar filtro de precio mínimo
    if (this.activeFilters.minPrice !== null) {
      jobs = jobs.filter(job => job.price >= this.activeFilters.minPrice!);
    }

    // Aplicar filtro de precio máximo
    if (this.activeFilters.maxPrice !== null) {
      jobs = jobs.filter(job => job.price <= this.activeFilters.maxPrice!);
    }

    // Aplicar filtro de ubicación
    if (this.activeFilters.location && this.activeFilters.location.trim() !== '') {
      const locationQuery = this.activeFilters.location.toLowerCase().trim();
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(locationQuery)
      );
    }

    this.filteredJobs = jobs;
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