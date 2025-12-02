import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth-guard'; // 1. CORRECCIÓN: Importamos la clase con mayúscula
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // 2. Creamos los Mocks para las dependencias del Guard
    const authSpy = jasmine.createSpyObj('AuthService', ['checkAuthStatus']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard, // Proveemos la clase AuthGuard
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    });

    // 3. Inyectamos el Guard y las dependencias simuladas
    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('Debería crearse correctamente', () => {
    expect(guard).toBeTruthy();
  });

  // Prueba adicional: Verificar si permite el paso cuando está logueado
  it('Debería permitir la navegación (return true) si el usuario está autenticado', async () => {
    // Simulamos que el servicio dice "Sí, está logueado"
    authServiceSpy.checkAuthStatus.and.returnValue(Promise.resolve(true));

    const canActivate = await guard.canActivate();
    
    expect(canActivate).toBeTrue();
  });

  // Prueba adicional: Verificar si bloquea el paso cuando NO está logueado
  it('Debería bloquear la navegación y redirigir al login si NO está autenticado', async () => {
    // Simulamos que el servicio dice "No, no hay usuario"
    authServiceSpy.checkAuthStatus.and.returnValue(Promise.resolve(false));

    const canActivate = await guard.canActivate();
    
    expect(canActivate).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']); // Verifica la redirección
  });
});