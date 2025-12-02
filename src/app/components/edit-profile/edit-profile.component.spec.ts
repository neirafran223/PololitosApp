import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms'; // <--- Importante para formularios
import { EditProfileComponent } from './edit-profile.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // <--- Importante para iconos

describe('EditProfileComponent', () => {
  let component: EditProfileComponent;
  let fixture: ComponentFixture<EditProfileComponent>;

  beforeEach(waitForAsync(() => {
    // Mock del ModalController
    const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [ EditProfileComponent ],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule // <--- Necesario para [formGroup]
      ],
      providers: [
        { provide: ModalController, useValue: modalSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // <--- Ignora etiquetas desconocidas como lucide-icon
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfileComponent);
    component = fixture.componentInstance;
    
    // Simulamos un usuario de entrada para que el formulario se inicie bien
    component.user = { firstName: 'Test', lastName: 'User', email: 'test@test.com' };
    
    fixture.detectChanges();
  }));

  it('Debería crear el componente', () => {
    expect(component).toBeTruthy();
  });
});