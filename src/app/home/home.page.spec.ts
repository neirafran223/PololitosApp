import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { HomePage } from './home.page';
import { AuthService } from '../services/auth.service';
import { JobService } from '../services/job.service'; // Asegúrate que este sea el servicio que usa tu home
import { DatabaseService } from '../services/database.service'; // Si tu home usa DatabaseService directamente, mockéalo también
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(waitForAsync(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    // Mock del JobService o DatabaseService (según cual uses en el constructor del home)
    const jobSpy = jasmine.createSpyObj('JobService', ['getJobs']); 
    const dbSpy = jasmine.createSpyObj('DatabaseService', ['getJobs']); 
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);

    TestBed.configureTestingModule({
      declarations: [ HomePage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authSpy },
        // Provee el mock que corresponda según tu constructor en home.page.ts
        { provide: JobService, useValue: jobSpy }, 
        { provide: DatabaseService, useValue: dbSpy }, 
        { provide: ModalController, useValue: modalSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Debería crear el HomePage', () => {
    expect(component).toBeTruthy();
  });
});