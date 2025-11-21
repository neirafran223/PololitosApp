import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { JobFilters } from '../../home/home.page';

@Component({
  selector: 'app-job-filters',
  templateUrl: './job-filters.component.html',
  styleUrls: ['./job-filters.component.scss'],
  standalone: false,
})
export class JobFiltersComponent implements OnInit{
  @Input() currentFilters: JobFilters = {
    categories: [],
    minPrice: null,
    maxPrice: null,
    location: ''
  };
  @Input() availableCategories: string[] = [];

  filters: JobFilters = {
    categories: [],
    minPrice: null,
    maxPrice: null,
    location: ''
  };

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    console.log('JobFiltersComponent inicializado');
    console.log('Categorías recibidas:', this.availableCategories);

    // Copia segura de los filtros recibidos
    if (this.currentFilters) {
      this.filters = {
        categories: [...(this.currentFilters.categories || [])],
        minPrice: this.currentFilters.minPrice,
        maxPrice: this.currentFilters.maxPrice,
        location: this.currentFilters.location || ''
      };
    }
  }

  toggleCategory(category: string) {
    const index = this.filters.categories.indexOf(category);
    if (index > -1) {
      this.filters.categories.splice(index, 1);
    } else {
      this.filters.categories.push(category);
    }
  }

  isCategorySelected(category: string): boolean {
    return this.filters.categories.includes(category);
  }

  clearFilters() {
    this.filters = {
      categories: [],
      minPrice: null,
      maxPrice: null,
      location: ''
    };
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  applyFilters() {
    // Enviamos los filtros de vuelta
    this.modalController.dismiss(this.filters, 'confirm'); // Usar rol 'confirm' es estándar
  }
}
