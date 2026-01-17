import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicarProducto } from './publicar-producto';

describe('PublicarProducto', () => {
  let component: PublicarProducto;
  let fixture: ComponentFixture<PublicarProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicarProducto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicarProducto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
