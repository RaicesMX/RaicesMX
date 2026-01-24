// publicar-producto.component.ts
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

  // API Backend
  API_URL = 'http://localhost:3000';

  // 🗺️ MapTiler API Key - REEMPLAZA CON LA TUYA
  MAPTILER_API_KEY = environment.maptilerApiKey; // 👈 Pega tu API key aquí

  // Estados de carga
  cargandoCodigoPostal = false;
  coloniasDisponibles: string[] = [];
  categoriasDisponibles: any[] = [];

  // Manejo de imágenes
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
  porcentajeComision = 0.1; // 10%

  constructor() {
    this.productoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      descripcion: [
        '',
        [Validators.required, Validators.minLength(50), Validators.maxLength(2000)],
      ],
      categoryId: ['', Validators.required],
      categoria: [''],
      precio: ['', [Validators.required, Validators.min(1)]],
      stock: ['', [Validators.required, Validators.min(1)]],
      unidad: ['', Validators.required],

      calle: ['', Validators.required],
      numeroExterior: ['', Validators.required],
      numeroInterior: [''],
      numero: [''],
      colonia: ['', Validators.required],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      municipio: [{ value: '', disabled: true }, Validators.required],
      ciudad: [{ value: '', disabled: true }],
      estado: [{ value: '', disabled: true }, Validators.required],
      referencia: [''],

      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
    });

    // Listener para código postal
    this.productoForm.get('codigoPostal')?.valueChanges.subscribe((cp) => {
      if (cp && /^[0-9]{5}$/.test(cp)) {
        this.buscarCodigoPostal(cp);
      }
    });

    // Sincronizar campos duplicados
    this.productoForm.get('numeroExterior')?.valueChanges.subscribe((val) => {
      this.productoForm.get('numero')?.setValue(val, { emitEvent: false });
    });

    this.productoForm.get('municipio')?.valueChanges.subscribe((val) => {
      this.productoForm.get('ciudad')?.setValue(val, { emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
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
        console.log('✅ Categorías cargadas:', this.categoriasDisponibles.length);
      }
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      alert('Error al cargar las categorías');
    }
  }

  /**
   * Inicializar mapa con MapLibre + MapTiler
   */
  inicializarMapa(): void {
    if (!this.mapaContainer) return;

    // ✅ Usar MapTiler para ver nombres de calles
    this.mapa = new maplibregl.Map({
      container: this.mapaContainer.nativeElement,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${this.MAPTILER_API_KEY}`,
      center: [-102.5528, 23.6345], // Centro de México
      zoom: 5,
    });

    // Controles de navegación
    this.mapa.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Evento de clic en el mapa
    this.mapa.on('click', (e) => {
      this.agregarMarcador(e.lngLat.lng, e.lngLat.lat);
      this.geocodificarInversa(e.lngLat.lat, e.lngLat.lng);
    });

    console.log('🗺️ Mapa inicializado con MapTiler');
  }

  /**
   * Agregar marcador en el mapa
   */
  agregarMarcador(lng: number, lat: number): void {
    if (!this.mapa) return;

    // Eliminar marcador anterior
    if (this.marcador) {
      this.marcador.remove();
    }

    // Crear nuevo marcador rojo
    this.marcador = new maplibregl.Marker({ color: '#e63946' })
      .setLngLat([lng, lat])
      .addTo(this.mapa);

    // Actualizar coordenadas en formulario
    this.productoForm.patchValue({ latitud: lat, longitud: lng });
    this.ubicacionSeleccionada = { lat, lng };
    this.mostrarMarcador = true;

    // Centrar mapa en el marcador
    this.mapa.flyTo({ center: [lng, lat], zoom: 14 });

    console.log(`📍 Marcador colocado en: ${lat}, ${lng}`);
  }

  /**
   * Buscar código postal (autocompleta formulario + mueve mapa)
   */
  async buscarCodigoPostal(cp: string): Promise<void> {
    // Limpiar y validar
    const cpLimpio = cp.replace(/\D/g, '').trim().substring(0, 5);

    if (cpLimpio.length !== 5) {
      console.warn('CP inválido:', cp);
      return;
    }

    this.cargandoCodigoPostal = true;

    try {
      const response: any = await this.http
        .get(`${this.API_URL}/geocoding/codigo-postal?cp=${cpLimpio}`)
        .toPromise();

      if (response.success) {
        const { estado, municipio, colonia, colonias, latitud, longitud } = response.data;

        // Actualizar formulario
        this.productoForm.patchValue({
          estado,
          municipio,
          ciudad: municipio,
          colonia,
          latitud,
          longitud,
        });

        this.coloniasDisponibles = colonias || [colonia];

        // ✅ ESTABLECER UBICACIÓN (crítico para habilitar el botón)
        this.ubicacionSeleccionada = { lat: latitud, lng: longitud };

        // 🗺️ Mover mapa y marcador a la ubicación
        if (this.mapa && latitud && longitud) {
          this.agregarMarcador(longitud, latitud);
        }

        console.log('✅ CP encontrado:', response.data);
        console.log('✅ Ubicación establecida:', this.ubicacionSeleccionada);
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('Código postal no encontrado');

      this.productoForm.patchValue({
        estado: '',
        municipio: '',
        ciudad: '',
        colonia: '',
      });
      this.coloniasDisponibles = [];
    } finally {
      this.cargandoCodigoPostal = false;
    }
  }

  /**
   * Geocodificación inversa (cuando haces clic en el mapa)
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
          ciudad: response.data.municipio,
          colonia: response.data.colonia || '',
        });

        console.log('📍 Dirección obtenida:', response.data);
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
    }
  }

  /**
   * Seleccionar ubicación manual (para compatibilidad con HTML viejo)
   */
  seleccionarUbicacionManual(event: MouseEvent): void {
    console.log('Usa el mapa interactivo con clic directo');
  }

  /**
   * Obtener URL del mapa estático (para HTML viejo)
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
    if (this.productoForm.invalid || this.archivosImagenes.length === 0) {
      alert('Por favor completa todos los campos y sube al menos una imagen');
      this.markFormGroupTouched(this.productoForm);
      return;
    }

    if (!this.ubicacionSeleccionada) {
      alert('Por favor selecciona una ubicación en el mapa');
      return;
    }

    const formData = new FormData();

    // Obtener valores (incluyendo disabled)
    const productoData = {
      titulo: this.productoForm.get('titulo')?.value,
      descripcion: this.productoForm.get('descripcion')?.value,
      categoryId: this.productoForm.get('categoryId')?.value || this.obtenerCategoryId(),
      precio: parseFloat(this.productoForm.get('precio')?.value),
      stock: parseInt(this.productoForm.get('stock')?.value),
      unidad: this.productoForm.get('unidad')?.value,
      calle: this.productoForm.get('calle')?.value,
      numeroExterior:
        this.productoForm.get('numeroExterior')?.value || this.productoForm.get('numero')?.value,
      numeroInterior: this.productoForm.get('numeroInterior')?.value || '',
      colonia: this.productoForm.get('colonia')?.value,
      codigoPostal: this.productoForm.get('codigoPostal')?.value,
      municipio: this.productoForm.get('municipio')?.value,
      estado: this.productoForm.get('estado')?.value,
      referencia: this.productoForm.get('referencia')?.value || '',
      latitud: parseFloat(this.productoForm.get('latitud')?.value),
      longitud: parseFloat(this.productoForm.get('longitud')?.value),
    };

    // Agregar datos al FormData
    Object.keys(productoData).forEach((key) => {
      formData.append(key, (productoData as any)[key]);
    });

    // Agregar imágenes
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
      console.error('❌ Error:', error);
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
