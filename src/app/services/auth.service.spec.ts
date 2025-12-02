import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from './database.service';
import { NavController } from '@ionic/angular';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  
  // Mocks para dependencias locales
  let databaseSpy: jasmine.SpyObj<DatabaseService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;

  beforeEach(() => {
    // Crear espías
    const dbSpy = jasmine.createSpyObj('DatabaseService', ['findUserForLogin', 'setCurrentUser', 'getCurrentUser']);
    const navSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule // Importante para simular peticiones HTTP
      ],
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: dbSpy },
        { provide: NavController, useValue: navSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    databaseSpy = TestBed.inject(DatabaseService) as jasmine.SpyObj<DatabaseService>;
    navCtrlSpy = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
  });

  afterEach(() => {
    // Verifica que no queden peticiones HTTP pendientes
    httpMock.verify();
  });

  it('Debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  // --- PRUEBA 1: Lógica Local (Login) ---
  it('Debería retornar true y guardar sesión si las credenciales son correctas', async () => {
    // Escenario: La base de datos encuentra un usuario
    const mockUser = { id: 1, email: 'test@pololitos.cl', password: '123' };
    // Configuramos el espía para que devuelva este usuario cuando lo llamen
    databaseSpy.findUserForLogin.and.returnValue(Promise.resolve(mockUser as any)); 

    // Acción
    const result = await service.login('test@pololitos.cl', '123');

    // Verificación
    expect(result).toBeTrue(); // El login debe ser exitoso
    expect(databaseSpy.setCurrentUser).toHaveBeenCalledWith(mockUser as any); // Debe guardar sesión
  });

  it('Debería retornar false si las credenciales son incorrectas', async () => {
    // Escenario: La base de datos NO encuentra usuario (retorna null)
    databaseSpy.findUserForLogin.and.returnValue(Promise.resolve(null));

    // Acción
    const result = await service.login('error@mail.com', 'malaclave');

    // Verificación
    expect(result).toBeFalse();
    expect(databaseSpy.setCurrentUser).not.toHaveBeenCalled(); // No debe guardar sesión
  });

  // --- PRUEBA 2: Petición HTTP (Forgot Password) ---
  it('Debería enviar una petición POST para recuperar contraseña', () => {
    const dummyEmail = 'juan@pololitos.cl';
    const mockResponse = { message: 'Correo enviado' };

    // Acción: Llamamos al método que hace la petición HTTP
    service.forgotPassword(dummyEmail).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    // Intercepción: Esperamos que se haga UNA llamada a esta URL exacta
    const req = httpMock.expectOne('http://127.0.0.1:8000/api/forgot-password');
    
    // Verificación: Debe ser método POST
    expect(req.request.method).toBe('POST');
    
    // Verificación: El cuerpo de la petición debe contener el email
    expect(req.request.body).toEqual({ email: dummyEmail });

    // Simulación: "Flush" envía la respuesta simulada al servicio
    req.flush(mockResponse);
  });
});