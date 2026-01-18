import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-publicar-producto',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    FormsModule
  ],
  templateUrl: './publicar-producto.html',
  styleUrls: ['./publicar-producto.scss']
})
export class PublicarProducto implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  @ViewChild('mapaContainer') mapaContainer!: ElementRef;

  productoForm: FormGroup;
  
  // Usando las categorías de tu marketplace
  categorias: string[] = [
    'Artesanías Mexicanas',
    'Textiles y Bordados',
    'Cerámica y Barro',
    'Joyería Tradicional',
    'Muebles Típicos',
    'Dulces Mexicanos',
    'Bebidas Tradicionales',
    'Instrumentos Musicales',
    'Ropa Tradicional',
    'Decoración Mexicana',
    'Otros Productos'
  ];

  // Estados de México para ubicación
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
    'Zacatecas'
  ];

  // Para manejo de imágenes
  imagenesPrevisualizacion: string[] = [];
  archivosImagenes: File[] = [];

  // Variables para el sistema de envíos
  costoEnvioLocal = 50;
  paqueteriaSeleccionada = 'estafeta';
  pesoProducto = 1.0;

  dimensiones = {
    largo: 20,
    ancho: 15,
    alto: 10
  };

  // Variables para cálculo de envío nacional
  costoBaseEnvio = 80;
  costoPorPeso = 0;
  costoSeguro = 20;

  // Variables para el mapa y ubicación
  ubicacionSeleccionada: { lat: number; lng: number } | null = null;
  mostrarMarcador = false;
  marcadorPosicion = { x: 0, y: 0 };
  mapaCoordenadas = {
    lat: 19.4326,
    lng: -99.1332,
    zoom: 12
  };

  // Variables para modal de comisión
  mostrarModalComision = false;
  
  // Porcentaje de comisión (10%)
  porcentajeComision = 0.10;

  constructor() {
    this.productoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(2000)]],
      categoria: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(1)]],
      stock: ['', [Validators.required, Validators.min(1)]],
      envioDisponible: [true],
      envioNacional: [false],
      estado: ['', Validators.required],
      ciudad: ['', Validators.required],
      colonia: ['', Validators.required],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      contacto: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      latitud: [''],
      longitud: ['']
    });
  }

  ngOnInit(): void {
    // Si el navegador soporta geolocalización, obtener ubicación actual
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.ubicacionSeleccionada = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.mapaCoordenadas.lat = position.coords.latitude;
          this.mapaCoordenadas.lng = position.coords.longitude;
          this.actualizarCoordenadasFormulario();
        },
        (error) => {
          console.log('Error obteniendo geolocalización:', error);
          // Usar coordenadas por defecto (CDMX)
          this.ubicacionSeleccionada = { lat: 19.4326, lng: -99.1332 };
          this.actualizarCoordenadasFormulario();
        }
      );
    } else {
      // Coordenadas por defecto (CDMX)
      this.ubicacionSeleccionada = { lat: 19.4326, lng: -99.1332 };
      this.actualizarCoordenadasFormulario();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files) {
      for (const file of Array.from(files)) {
        if (this.archivosImagenes.length >= 5) {
          alert('Máximo 5 imágenes permitidas');
          break;
        }
        
        // Validar tipo de archivo
        if (!file.type.match('image.*')) {
          alert('Solo se permiten imágenes (JPG, PNG, etc.)');
          continue;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('La imagen es muy grande. Máximo 5MB por imagen');
          continue;
        }

        this.archivosImagenes.push(file);
        
        // Crear previsualización
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.imagenesPrevisualizacion.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.imagenesPrevisualizacion.splice(index, 1);
    this.archivosImagenes.splice(index, 1);
  }

  // MÉTODOS PARA EL SISTEMA DE ENVÍOS

  seleccionarEnvioLocal(): void {
    this.productoForm.get('envioDisponible')?.setValue(true);
    this.productoForm.get('envioNacional')?.setValue(false);
  }

  seleccionarEnvioNacional(): void {
    this.productoForm.get('envioDisponible')?.setValue(true);
    this.productoForm.get('envioNacional')?.setValue(true);
  }

  calcularCostoEnvioLocal(): number {
    return this.costoEnvioLocal;
  }

  calcularCostoEnvioNacional(): number {
    // Cálculo basado en peso y paquetería
    this.costoPorPeso = this.pesoProducto * 25; // $25 por kg
    
    let costoPaqueteria = 0;
    switch (this.paqueteriaSeleccionada) {
      case 'dhl': costoPaqueteria = 30; break;
      case 'fedex': costoPaqueteria = 35; break;
      case 'correos': costoPaqueteria = 15; break;
      case 'paqueteexpress': costoPaqueteria = 20; break;
      default: costoPaqueteria = 25; // estafeta
    }
    
    return this.costoBaseEnvio + this.costoPorPeso + this.costoSeguro + costoPaqueteria;
  }

  calcularTiempoEntrega(): number {
    switch (this.paqueteriaSeleccionada) {
      case 'dhl': return 2;
      case 'fedex': return 3;
      case 'correos': return 7;
      case 'paqueteexpress': return 5;
      default: return 4; // estafeta
    }
  }

  // MÉTODOS PARA EL MAPA

  getMapaUrl(): string {
    // En producción usarías: https://maps.googleapis.com/maps/api/staticmap?center=...
    // Por ahora usamos un placeholder más realista
    if (this.ubicacionSeleccionada) {
      const lat = this.ubicacionSeleccionada.lat.toFixed(6);
      const lng = this.ubicacionSeleccionada.lng.toFixed(6);
      return `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=800&height=400&center=lonlat:${lng},${lat}&zoom=14&marker=lonlat:${lng},${lat};color:%23ff0000;size:medium&apiKey=demo`;
    }
    return 'https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=800&height=400&center=lonlat:-99.1332,19.4326&zoom=12&apiKey=demo';
  }

  seleccionarUbicacionManual(event: MouseEvent): void {
    if (!this.mapaContainer) return;
    
    const elemento = this.mapaContainer.nativeElement;
    const rect = elemento.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calcular coordenadas basadas en la posición del clic
    const lat = this.mapaCoordenadas.lat + ((y / rect.height) - 0.5) * 0.1;
    const lng = this.mapaCoordenadas.lng + ((x / rect.width) - 0.5) * 0.1;
    
    this.ubicacionSeleccionada = { lat, lng };
    this.actualizarCoordenadasFormulario();
    
    // Mostrar feedback visual
    this.mostrarMarcador = true;
    this.marcadorPosicion = { x, y };
  }

  centrarMapa(): void {
    if (this.ubicacionSeleccionada) {
      this.mapaCoordenadas.lat = this.ubicacionSeleccionada.lat;
      this.mapaCoordenadas.lng = this.ubicacionSeleccionada.lng;
    }
  }

  // MÉTODOS PARA MODAL DE COMISIÓN

  abrirModalComision(): void {
    this.mostrarModalComision = true;
  }

  cerrarModalComision(): void {
    this.mostrarModalComision = false;
  }

  // MÉTODOS EXISTENTES

  actualizarCoordenadasFormulario(): void {
    if (this.ubicacionSeleccionada) {
      this.productoForm.patchValue({
        latitud: this.ubicacionSeleccionada.lat,
        longitud: this.ubicacionSeleccionada.lng
      });
    }
  }

  usarUbicacionActual(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.ubicacionSeleccionada = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.mapaCoordenadas.lat = position.coords.latitude;
          this.mapaCoordenadas.lng = position.coords.longitude;
          this.actualizarCoordenadasFormulario();
          
          // Posicionar marcador en el centro
          this.mostrarMarcador = true;
          this.marcadorPosicion = { x: 400, y: 200 };
          
          alert('Ubicación actual establecida');
        },
        (error) => {
          alert('No se pudo obtener la ubicación actual. Error: ' + error.message);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  }

  onSubmit(): void {
    if (this.productoForm.valid && this.archivosImagenes.length > 0) {
      // Validar que se haya seleccionado ubicación en el mapa
      if (!this.ubicacionSeleccionada) {
        alert('Por favor, selecciona una ubicación en el mapa');
        return;
      }

      // Validar checkboxes de términos
      const terminosCheckbox = document.getElementById('terminos') as HTMLInputElement;
      const autenticidadCheckbox = document.getElementById('autenticidad') as HTMLInputElement;
      const responsabilidadCheckbox = document.getElementById('responsabilidad') as HTMLInputElement;

      if (!terminosCheckbox?.checked || !autenticidadCheckbox?.checked || !responsabilidadCheckbox?.checked) {
        alert('Debes aceptar todos los términos y condiciones');
        return;
      }

      // Aquí iría la lógica para enviar el formulario al backend
      const productoData = {
        ...this.productoForm.value,
        imagenes: this.archivosImagenes,
        fechaPublicacion: new Date().toISOString(),
        ubicacion: this.ubicacionSeleccionada,
        comision: this.calcularComision(),
        precioFinal: this.calcularPrecioTotal()
      };
      
      console.log('Producto listo para publicar:', productoData);
      
      // Simular publicación exitosa
      alert('¡Producto publicado exitosamente!');
      this.router.navigate(['/marketplace']);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched(this.productoForm);
      if (this.archivosImagenes.length === 0) {
        alert('Debes subir al menos una imagen del producto');
      }
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Método para formatear precio
  formatPrice(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, '');
    if (value) {
      value = parseFloat(value).toFixed(2);
      this.productoForm.get('precio')?.setValue(value, { emitEvent: false });
    }
  }

  // Método público para navegación
  navigateToMarketplace(): void {
    this.router.navigate(['/marketplace']);
  }

  // Calcular comisión (10% del precio)
  calcularComision(): number {
    const precio = this.productoForm.get('precio')?.value;
    if (precio) {
      return precio * this.porcentajeComision;
    }
    return 0;
  }

  // Precio total (precio - comisión)
  calcularPrecioTotal(): number {
    const precio = this.productoForm.get('precio')?.value;
    if (precio) {
      return parseFloat(precio) - this.calcularComision();
    }
    return 0;
  }

  // Método para formatear números
  formatNumber(value: number): string {
    return value.toFixed(2);
  }

  // Ejemplo de comisión para el modal
  getEjemploComision(): { precio: number; comision: number; ganancia: number } {
    return {
      precio: 250,
      comision: 250 * this.porcentajeComision,
      ganancia: 250 - (250 * this.porcentajeComision)
    };
  }
}