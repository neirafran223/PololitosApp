import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private jobs: any[] = [
    {
      title: 'Se necesita jardinero para casa en Reñaca',
      category: 'Jardinería',
      description: 'Mantención de jardín, corte de pasto, poda y limpieza.',
      location: 'Reñaca, Viña del Mar',
      price: '$35.000',
    },
    {
      title: 'Clases particulares de matemáticas (online)',
      category: 'Educación',
      description: 'Busco profesor para reforzar contenidos de cálculo universitario.',
      location: 'Remoto',
      price: '$15.000/hr',
    }
  ];

  constructor() { }

  
  getJobs() {
    return [...this.jobs];
  }

  
  createJob(newJob: any) {
    this.jobs.unshift(newJob); 
    console.log('Trabajo añadido. Lista actual:', this.jobs);
  }
}