import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendedorFormulario } from './vendedor-formulario';

describe('VendedorFormulario', () => {
  let component: VendedorFormulario;
  let fixture: ComponentFixture<VendedorFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendedorFormulario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendedorFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
