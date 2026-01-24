// publicar-producto.component.ts - VERSIÓN FINAL LIMPIA
import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as maplibregl from 'maplibre-gl';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-publicar-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './publicar-producto.html',
  styleUrls: ['./publicar-producto.scss'],
})
export class PublicarProducto implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);

  @ViewChild('mapaContainer') mapaContainer!: ElementRef;

  productoForm: FormGroup;
  mapa: maplibregl.Map | null = null;
  marcador: maplibregl.Marker | null = null;

  // Configuración
  API_URL = 'http://localhost:3000';
  MAPTILER_API_KEY = environment.maptilerApiKey;

  // Estados de carga
  cargandoCodigoPostal = false;
  coloniasDisponibles: string[] = [];
  categoriasDisponibles: any[] = [];

  // Imágenes
  imagenesPrevisualizacion: string[] = [];
  archivosImagenes: File[] = [];

  // Estados de México
  estadosMexico: string[] = [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Ciudad de México',
    'Coahuila',
    'Colima',
    'Durango',
    'Estado de México',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas',
  ];

  categorias: string[] = [];
  ubicacionSeleccionada: { lat: number; lng: number } | null = null;
  mostrarMarcador = false;
  marcadorPosicion = { x: 0, y: 0 };

  // Modal de comisión
  mostrarModalComision = false;
  porcentajeComision = 0.1;

  // Validación de términos
  terminosAceptados = false;
  autenticidadAceptada = false;
  responsabilidadAceptada = false;

  constructor() {
    this.productoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      descripcion: [
        '',
        [Validators.required, Validators.minLength(50), Validators.maxLength(2000)],
      ],
      categoryId: [''],
      categoria: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(1)]],
      stock: ['', [Validators.required, Validators.min(1)]],
      unidad: ['', Validators.required],

      calle: ['', Validators.required],
      numeroExterior: ['', Validators.required],
      numeroInterior: [''],
      colonia: ['', Validators.required],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      municipio: ['', Validators.required],
      estado: ['', Validators.required],
      referencia: [''],

      latitud: [''],
      longitud: [''],
    });

    // Listener para código postal
    this.productoForm.get('codigoPostal')?.valueChanges.subscribe((cp) => {
      if (cp && /^[0-9]{5}$/.test(cp)) {
        this.buscarCodigoPostal(cp);
      }
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  /**
   * Getter para validar si se puede publicar
   */
  get puedePublicar(): boolean {
    return (
      this.productoForm.valid &&
      this.archivosImagenes.length > 0 &&
      (this.ubicacionSeleccionada !== null ||
        (this.productoForm.get('latitud')?.value && this.productoForm.get('longitud')?.value)) &&
      this.terminosAceptados &&
      this.autenticidadAceptada &&
      this.responsabilidadAceptada
    );
  }

  /**
   * Event handlers para checkboxes
   */
  onTerminosChange(event: Event): void {
    this.terminosAceptados = (event.target as HTMLInputElement).checked;
  }

  onAutenticidadChange(event: Event): void {
    this.autenticidadAceptada = (event.target as HTMLInputElement).checked;
  }

  onResponsabilidadChange(event: Event): void {
    this.responsabilidadAceptada = (event.target as HTMLInputElement).checked;
  }

  /**
   * Cargar categorías desde el backend
   */
  async cargarCategorias(): Promise<void> {
    try {
      const response: any = await this.http.get(`${this.API_URL}/products/categories`).toPromise();

      if (response.success) {
        this.categoriasDisponibles = response.categories;
        this.categorias = response.categories.map((c: any) => c.nombre);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      alert('Error al cargar las categorías');
    }
  }

  /**
   * Inicializar mapa con MapLibre + MapTiler
   */
  inicializarMapa(): void {
    if (!this.mapaContainer) return;

    this.mapa = new maplibregl.Map({
      container: this.mapaContainer.nativeElement,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${this.MAPTILER_API_KEY}`,
      center: [-102.5528, 23.6345],
      zoom: 5,
    });

    this.mapa.addControl(new maplibregl.NavigationControl(), 'top-right');

    this.mapa.on('click', (e) => {
      this.agregarMarcador(e.lngLat.lng, e.lngLat.lat);
      this.geocodificarInversa(e.lngLat.lat, e.lngLat.lng);
    });
  }

  /**
   * Agregar marcador en el mapa
   */
  agregarMarcador(lng: number, lat: number): void {
    if (!this.mapa) return;

    if (this.marcador) {
      this.marcador.remove();
    }

    this.marcador = new maplibregl.Marker({ color: '#e63946' })
      .setLngLat([lng, lat])
      .addTo(this.mapa);

    this.productoForm.patchValue({ latitud: lat, longitud: lng });
    this.ubicacionSeleccionada = { lat, lng };
    this.mostrarMarcador = true;

    this.mapa.flyTo({ center: [lng, lat], zoom: 14 });
  }

  /**
   * Buscar código postal y autocompletar datos
   */
  async buscarCodigoPostal(cp: string): Promise<void> {
    const cpLimpio = cp.replace(/\D/g, '').trim().substring(0, 5);

    if (cpLimpio.length !== 5) return;

    this.cargandoCodigoPostal = true;

    try {
      const response: any = await this.http
        .get(`${this.API_URL}/geocoding/codigo-postal?cp=${cpLimpio}`)
        .toPromise();

      if (response.success) {
        const { estado, municipio, colonia, colonias, latitud, longitud } = response.data;

        this.productoForm.patchValue({
          estado,
          municipio,
          colonia,
          latitud,
          longitud,
        });

        this.coloniasDisponibles = colonias || [colonia];
        this.ubicacionSeleccionada = { lat: latitud, lng: longitud };

        if (this.mapa && latitud && longitud) {
          this.agregarMarcador(longitud, latitud);
        }
      }
    } catch (error: any) {
      console.error('Error buscando CP:', error);
      alert('Código postal no encontrado');
    } finally {
      this.cargandoCodigoPostal = false;
    }
  }

  /**
   * Geocodificación inversa (clic en mapa)
   */
  async geocodificarInversa(lat: number, lng: number): Promise<void> {
    try {
      const response: any = await this.http
        .get(`${this.API_URL}/geocoding/reverse?lat=${lat}&lng=${lng}`)
        .toPromise();

      if (response.success) {
        this.productoForm.patchValue({
          estado: response.data.estado,
          municipio: response.data.municipio,
          colonia: response.data.colonia || '',
        });
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
    }
  }

  /**
   * Compatibilidad con HTML antiguo
   */
  seleccionarUbicacionManual(event: MouseEvent): void {
    // Método legacy, ahora se usa el clic directo en el mapa
  }

  /**
   * Obtener URL del mapa estático
   */
  getMapaUrl(): string {
    if (this.ubicacionSeleccionada) {
      const { lat, lng } = this.ubicacionSeleccionada;
      return `https://api.maptiler.com/maps/streets-v2/static/${lng},${lat},14/600x400.png?key=${this.MAPTILER_API_KEY}&markers=${lng},${lat},red`;
    }
    return `https://api.maptiler.com/maps/streets-v2/static/-99.1332,19.4326,5/600x400.png?key=${this.MAPTILER_API_KEY}`;
  }

  /**
   * Manejo de imágenes
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (const file of Array.from(input.files)) {
      if (this.archivosImagenes.length >= 5) {
        alert('Máximo 5 imágenes');
        break;
      }

      if (!file.type.match('image.*')) {
        alert('Solo imágenes');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Máx 5MB por imagen');
        continue;
      }

      this.archivosImagenes.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenesPrevisualizacion.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    this.imagenesPrevisualizacion.splice(index, 1);
    this.archivosImagenes.splice(index, 1);
  }

  /**
   * Modal de comisión
   */
  abrirModalComision(): void {
    this.mostrarModalComision = true;
  }

  cerrarModalComision(): void {
    this.mostrarModalComision = false;
  }

  calcularComision(): number {
    const precio = parseFloat(this.productoForm.get('precio')?.value || 0);
    return precio * this.porcentajeComision;
  }

  calcularPrecioTotal(): number {
    const precio = parseFloat(this.productoForm.get('precio')?.value || 0);
    return precio - this.calcularComision();
  }

  formatNumber(value: number): string {
    return value.toFixed(2);
  }

  getEjemploComision(): { precio: number; comision: number; ganancia: number } {
    return {
      precio: 250,
      comision: 250 * this.porcentajeComision,
      ganancia: 250 - 250 * this.porcentajeComision,
    };
  }

  formatPrice(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, '');
    if (value) {
      value = parseFloat(value).toFixed(2);
      this.productoForm.get('precio')?.setValue(value, { emitEvent: false });
    }
  }

  /**
   * Enviar formulario al backend
   */
  async onSubmit(): Promise<void> {
    if (!this.puedePublicar) {
      alert('Por favor completa todos los campos obligatorios');
      this.markFormGroupTouched(this.productoForm);
      return;
    }

    const formData = new FormData();

    const productoData = {
      titulo: this.productoForm.get('titulo')?.value,
      descripcion: this.productoForm.get('descripcion')?.value,
      categoryId: this.obtenerCategoryId(),
      precio: parseFloat(this.productoForm.get('precio')?.value),
      stock: parseInt(this.productoForm.get('stock')?.value),
      unidad: this.productoForm.get('unidad')?.value,
      calle: this.productoForm.get('calle')?.value,
      numeroExterior: this.productoForm.get('numeroExterior')?.value,
      numeroInterior: this.productoForm.get('numeroInterior')?.value || '',
      colonia: this.productoForm.get('colonia')?.value,
      codigoPostal: this.productoForm.get('codigoPostal')?.value,
      municipio: this.productoForm.get('municipio')?.value,
      estado: this.productoForm.get('estado')?.value,
      referencia: this.productoForm.get('referencia')?.value || '',
      latitud: parseFloat(
        this.productoForm.get('latitud')?.value || this.ubicacionSeleccionada?.lat,
      ),
      longitud: parseFloat(
        this.productoForm.get('longitud')?.value || this.ubicacionSeleccionada?.lng,
      ),
    };

    Object.keys(productoData).forEach((key) => {
      formData.append(key, (productoData as any)[key]);
    });

    this.archivosImagenes.forEach((file) => {
      formData.append('imagenes', file);
    });

    try {
      const response: any = await this.http.post(`${this.API_URL}/products`, formData).toPromise();

      if (response.success) {
        alert('✅ ¡Producto publicado exitosamente!');
        this.router.navigate(['/marketplace']);
      }
    } catch (error: any) {
      console.error('Error al publicar:', error);
      alert('Error al publicar: ' + (error.error?.message || error.message));
    }
  }

  private obtenerCategoryId(): number {
    const nombreCategoria = this.productoForm.get('categoria')?.value;
    const categoria = this.categoriasDisponibles.find((c) => c.nombre === nombreCategoria);
    return categoria?.id || 1;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  navigateToMarketplace(): void {
    this.router.navigate(['/marketplace']);
  }
}
