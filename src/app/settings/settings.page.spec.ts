import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { SettingsPage } from './settings.page';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(waitForAsync(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    // CORRECCIÓN: Agregamos 'isDarkMode' a la lista de métodos espiados
    const themeSpy = jasmine.createSpyObj('ThemeService', ['setTheme', 'isDarkMode']);
    const navSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);

    // Simulamos que isDarkMode devuelve false por defecto
    themeSpy.isDarkMode.and.returnValue(false); 

    TestBed.configureTestingModule({
      declarations: [ SettingsPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ThemeService, useValue: themeSpy }, 
        { provide: NavController, useValue: navSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});