import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { JobDetailsComponent } from './job-details.component';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('JobDetailsComponent', () => {
  let component: JobDetailsComponent;
  let fixture: ComponentFixture<JobDetailsComponent>;

  beforeEach(waitForAsync(() => {
    // Mocks de servicios
    const dbSpy = jasmine.createSpyObj('DatabaseService', ['getUserById']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);

    TestBed.configureTestingModule({
      declarations: [ JobDetailsComponent ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: DatabaseService, useValue: dbSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: ToastController, useValue: toastSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // Ignorar iconos
    }).compileComponents();

    fixture = TestBed.createComponent(JobDetailsComponent);
    component = fixture.componentInstance;
    
    // Simulamos un trabajo de entrada
    component.job = { 
      title: 'Test Job', 
      location: 'Test', 
      price: 1000, 
      description: 'Desc', 
      category: 'Test', 
      startDateTime: '2024-01-01' 
    };
    
    fixture.detectChanges();
  }));

  it('Debería crear el componente', () => {
    expect(component).toBeTruthy();
  });
});