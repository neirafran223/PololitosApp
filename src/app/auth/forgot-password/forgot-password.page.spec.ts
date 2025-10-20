import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { ForgotPasswordPage } from './forgot-password.page';
import { AuthService } from '../../services/auth.service';
import { PasswordResetService } from '../../services/password-reset.service';

class MockAuthService {
  findUserByEmail = jasmine.createSpy('findUserByEmail').and.returnValue(Promise.resolve(true));
  updatePassword = jasmine.createSpy('updatePassword').and.returnValue(Promise.resolve(true));
}

class MockPasswordResetService {
  requestReset = jasmine.createSpy('requestReset').and.returnValue(Promise.resolve({ code: '123456' }));
  verifyCode = jasmine.createSpy('verifyCode').and.returnValue(Promise.resolve({ message: 'ok' }));
  confirmReset = jasmine.createSpy('confirmReset').and.returnValue(Promise.resolve({ message: 'ok' }));
}

describe('ForgotPasswordPage', () => {
  let component: ForgotPasswordPage;
  let fixture: ComponentFixture<ForgotPasswordPage>;

  beforeEach(async () => {
    const toast = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) };
    const alert = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) };

    await TestBed.configureTestingModule({
      declarations: [ForgotPasswordPage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ToastController, useValue: { create: jasmine.createSpy('create').and.returnValue(Promise.resolve(toast)) } },
        { provide: AlertController, useValue: { create: jasmine.createSpy('create').and.returnValue(Promise.resolve(alert)) } },
        { provide: AuthService, useClass: MockAuthService },
        { provide: PasswordResetService, useClass: MockPasswordResetService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
