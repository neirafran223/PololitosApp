import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ProfilePage } from './profile.page';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service'; // Si se usa en el componente
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;

  beforeEach(waitForAsync(() => {
    // Mocks
    const dbSpy = jasmine.createSpyObj('DatabaseService', ['getCurrentUser', 'updateUser', 'setCurrentUser']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']); 
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);

    TestBed.configureTestingModule({
      declarations: [ ProfilePage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: DatabaseService, useValue: dbSpy },
        // Agregamos AuthService por si acaso, aunque el error mencionaba DatabaseService -> Storage
        { provide: AuthService, useValue: authSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: ToastController, useValue: toastSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});