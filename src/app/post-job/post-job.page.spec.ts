import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ToastController, LoadingController, NavController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common'; // 1. IMPORTAR CURRENCY PIPE
import { PostJobPage } from './post-job.page';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PostJobPage', () => {
  let component: PostJobPage;
  let fixture: ComponentFixture<PostJobPage>;

  beforeEach(waitForAsync(() => {
    // Mocks
    const dbSpy = jasmine.createSpyObj('DatabaseService', ['addJob']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
    const loadingSpy = jasmine.createSpyObj('LoadingController', ['create', 'dismiss']);
    const navSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'back']);

    TestBed.configureTestingModule({
      declarations: [ PostJobPage ],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ],
      providers: [
        CurrencyPipe, // 2. AGREGAR AQUI
        { provide: DatabaseService, useValue: dbSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastController, useValue: toastSpy },
        { provide: LoadingController, useValue: loadingSpy },
        { provide: NavController, useValue: navSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PostJobPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});