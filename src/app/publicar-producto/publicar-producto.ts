import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-publicar-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './publicar-producto.html',
  styleUrls: ['./publicar-producto.scss']
})
export class PublicarProducto implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

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

  // Coordenadas del mapa
  ubicacionSeleccionada: { lat: number; lng: number } | null = null;
  mostrarMapa = false;

  // Para el mapa simulado
  celdaSeleccionada: { row: number; col: number } | null = null;

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

  // Método para manejar clic en el mapa
  onMapClick(event: MouseEvent): void {
    // Para un mapa real, aquí procesarías las coordenadas del click
    console.log('Map click:', event);
  }

  // Actualizar coordenadas en el formulario
  actualizarCoordenadasFormulario(): void {
    if (this.ubicacionSeleccionada) {
      this.productoForm.patchValue({
        latitud: this.ubicacionSeleccionada.lat,
        longitud: this.ubicacionSeleccionada.lng
      });
    }
  }

  // Método para usar ubicación actual
  usarUbicacionActual(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.ubicacionSeleccionada = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.actualizarCoordenadasFormulario();
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

  // Mostrar/ocultar mapa
  toggleMapa(): void {
    this.mostrarMapa = !this.mostrarMapa;
  }

  // Métodos para el mapa simulado
  esCeldaSeleccionada(row: number, col: number): boolean {
    if (!this.celdaSeleccionada) return false;
    return this.celdaSeleccionada.row === row && this.celdaSeleccionada.col === col;
  }

  seleccionarEnMapa(row: number, col: number): void {
    // Simular selección de ubicación en mapa
    const lat = 19.4326 + (row - 2) * 0.01;
    const lng = -99.1332 + (col - 2) * 0.01;
    
    this.ubicacionSeleccionada = { lat, lng };
    this.celdaSeleccionada = { row, col };
    this.actualizarCoordenadasFormulario();
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
        ubicacion: this.ubicacionSeleccionada
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

  // Calcular comisión (ejemplo: 5% del precio)
  calcularComision(): number {
    const precio = this.productoForm.get('precio')?.value;
    if (precio) {
      return precio * 0.05;
    }
    return 0;
  }

  // Precio total (precio + comisión)
  calcularPrecioTotal(): number {
    const precio = this.productoForm.get('precio')?.value;
    if (precio) {
      return parseFloat(precio) + this.calcularComision();
    }
    return 0;
  }

  // Método para formatear números
  formatNumber(value: number): string {
    return value.toFixed(2);
  }
}