import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Oferta {
  id: number;
  nombre: string;
  descripcion: string;
  descripcionCorta: string;
  precio: number;
  descuento: number;
  imagen: string;
  categoria: string;
  artesano: string;
  region: string;
  rating: number;
  stock: number;
  vendidos: number;
  destacada: boolean;
  exclusivo: boolean;
  enFavoritos: boolean;
  fechaInicio: Date;
  fechaFin: Date;
  tiempoRestante?: {
    dias: number;
    horas: number;
    minutos: number;
  };
  imagenCargada?: boolean;
}

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ofertas.html',
  styleUrls: ['./ofertas.scss']
})
export class OfertasComponent implements OnInit {
  @ViewChild('ofertasSection') ofertasSection!: ElementRef;
  
  // Estado del componente
  ofertas: Oferta[] = [];
  ofertasFiltradas: Oferta[] = [];
  cargando = true;
  itemsCarrito = 3;
  
  // Filtros simplificados
  filtroRapido = 'todas';
  filtroCategoria = '';
  filtroDescuento = '';
  ordenSeleccionado = 'descuento';
  mostrarFiltrosAvanzados = false;
  
  // Categorías disponibles
  categoriasUnicas: string[] = [];
  
  // Para header
  esMovil = false;
  menuMovilAbierto = false;

  ngOnInit(): void {
    this.inicializarComponente();
    this.esMovil = window.innerWidth <= 992;
  }

  private inicializarComponente(): void {
    this.cargarOfertas();
    
    // Carga rápida para desarrollo
    setTimeout(() => {
      this.cargando = false;
    }, 300);
  }

  private cargarOfertas(): void {
    // Ofertas con imágenes
    this.ofertas = [
      {
        id: 1,
        nombre: 'Alebrije Dragón Especial',
        descripcion: 'Dragón fantástico tallado en madera con detalles en oro 24k',
        descripcionCorta: 'Dragón tallado con detalles dorados exclusivos',
        precio: 1200.00,
        descuento: 35,
        imagen: 'assets/images/Alebrije Dragon Especial.png',
        categoria: 'Alebrijes',
        artesano: 'Taller Donají',
        region: 'Oaxaca',
        rating: 4.9,
        stock: 3,
        vendidos: 12,
        destacada: true,
        exclusivo: true,
        enFavoritos: true,
        fechaInicio: new Date('2024-01-20'),
        fechaFin: new Date('2024-01-27')
      },
      {
        id: 2,
        nombre: 'Textil Huichol Premium',
        descripcion: 'Manta ceremonial con chaquira y estambre de la más alta calidad',
        descripcionCorta: 'Manta ceremonial premium con materiales exclusivos',
        precio: 680.00,
        descuento: 25,
        imagen: 'assets/images/Textil Huichol Premium.jfif',
        categoria: 'Textiles',
        artesano: 'Comunidad Wixárica',
        region: 'Jalisco',
        rating: 4.8,
        stock: 8,
        vendidos: 25,
        destacada: false,
        exclusivo: false,
        enFavoritos: false,
        fechaInicio: new Date('2024-01-18'),
        fechaFin: new Date('2024-01-25')
      },
      {
        id: 3,
        nombre: 'Colección Talavera Navideña',
        descripcion: 'Set de 6 piezas de Talavera con motivos navideños tradicionales',
        descripcionCorta: 'Set navideño de Talavera poblana',
        precio: 450.00,
        descuento: 40,
        imagen: 'assets/images/Coleccion Talavera Navideña.jpg',
        categoria: 'Cerámica',
        artesano: 'Alfareros de Puebla',
        region: 'Puebla',
        rating: 4.7,
        stock: 15,
        vendidos: 8,
        destacada: false,
        exclusivo: true,
        enFavoritos: false,
        fechaInicio: new Date('2024-01-15'),
        fechaFin: new Date('2024-01-22')
      },
      {
        id: 4,
        nombre: 'Joyería de Plata 50% OFF',
        descripcion: 'Colección completa de joyería en plata con descuento especial',
        descripcionCorta: 'Joyería en plata con 50% de descuento',
        precio: 320.00,
        descuento: 50,
        imagen: 'assets/images/Joyeria de Plata.jfif',
        categoria: 'Platería',
        artesano: 'Plateros de Taxco',
        region: 'Guerrero',
        rating: 4.6,
        stock: 0,
        vendidos: 42,
        destacada: false,
        exclusivo: false,
        enFavoritos: true,
        fechaInicio: new Date('2024-01-10'),
        fechaFin: new Date('2024-01-20')
      },
      {
        id: 5,
        nombre: 'Barro Negro Artesanal',
        descripcion: 'Colección utilitaria en barro negro con técnicas ancestrales',
        descripcionCorta: 'Utensilios en barro negro tradicional',
        precio: 180.00,
        descuento: 30,
        imagen: 'assets/images/Barro Negro.jfif',
        categoria: 'Barro Negro',
        artesano: 'Alfareros de San Bartolo',
        region: 'Oaxaca',
        rating: 4.5,
        stock: 5,
        vendidos: 18,
        destacada: false,
        exclusivo: false,
        enFavoritos: false,
        fechaInicio: new Date('2024-01-22'),
        fechaFin: new Date('2024-01-29')
      }
    ];
    
    this.ofertasFiltradas = [...this.ofertas];
    this.categoriasUnicas = [...new Set(this.ofertas.map(o => o.categoria))];
    this.actualizarTiemposRestantes();
  }

  // ========== FILTROS SIMPLIFICADOS ==========
  
  aplicarFiltroRapido(tipo: string): void {
    this.filtroRapido = tipo;
    
    switch (tipo) {
      case 'destacadas':
        this.ofertasFiltradas = this.ofertas.filter(oferta => oferta.destacada);
        break;
      case 'exclusivas':
        this.ofertasFiltradas = this.ofertas.filter(oferta => oferta.exclusivo);
        break;
      case 'agotadas':
        this.ofertasFiltradas = this.ofertas.filter(oferta => oferta.stock === 0);
        break;
      case 'disponibles':
        this.ofertasFiltradas = this.ofertas.filter(oferta => oferta.stock > 0);
        break;
      default:
        this.ofertasFiltradas = [...this.ofertas];
    }
    
    this.ordenarOfertas();
  }

  filtrarOfertas(): void {
    let resultados = [...this.ofertas];

    // Filtrar por categoría
    if (this.filtroCategoria) {
      resultados = resultados.filter(o => o.categoria === this.filtroCategoria);
    }

    // Filtrar por descuento mínimo
    if (this.filtroDescuento) {
      const minDescuento = parseInt(this.filtroDescuento);
      resultados = resultados.filter(o => o.descuento >= minDescuento);
    }

    this.ofertasFiltradas = resultados;
    this.ordenarOfertas();
  }

  ordenarOfertas(): void {
    switch (this.ordenSeleccionado) {
      case 'descuento':
        this.ofertasFiltradas.sort((a, b) => b.descuento - a.descuento);
        break;
      case 'precio':
        this.ofertasFiltradas.sort((a, b) => {
          const precioA = this.calcularPrecioOferta(a);
          const precioB = this.calcularPrecioOferta(b);
          return precioA - precioB;
        });
        break;
      case 'nuevo':
        this.ofertasFiltradas.sort((a, b) => 
          new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
        );
        break;
      case 'popular':
        this.ofertasFiltradas.sort((a, b) => b.vendidos - a.vendidos);
        break;
    }
  }

  limpiarFiltros(): void {
    this.filtroRapido = 'todas';
    this.filtroCategoria = '';
    this.filtroDescuento = '';
    this.ordenSeleccionado = 'descuento';
    this.mostrarFiltrosAvanzados = false;
    this.ofertasFiltradas = [...this.ofertas];
    this.ordenarOfertas();
  }

  get filtroActivo(): boolean {
    return this.filtroCategoria !== '' || 
           this.filtroRapido !== 'todas' ||
           this.filtroDescuento !== '' ||
           this.ordenSeleccionado !== 'descuento';
  }

  // ========== UTILIDADES ==========
  
  obtenerTotalOfertas(): number {
    return this.ofertas.length;
  }

  obtenerOfertasActivas(): number {
    return this.ofertas.filter(o => o.stock > 0).length;
  }

  calcularAhorroTotal(): number {
    return this.ofertas.reduce((total, oferta) => {
      return total + (oferta.precio * (oferta.descuento / 100));
    }, 0);
  }

  calcularPrecioOferta(oferta: Oferta): number {
    return oferta.precio * (1 - oferta.descuento / 100);
  }

  calcularAhorro(oferta: Oferta): number {
    return oferta.precio - this.calcularPrecioOferta(oferta);
  }

  obtenerTiempoRestanteGeneral(): string {
    const ofertaMasProxima = this.ofertas.reduce((masProxima, oferta) => {
      const tiempoActual = this.calcularHorasRestantes(oferta);
      const tiempoMasProxima = masProxima ? this.calcularHorasRestantes(masProxima) : Infinity;
      return tiempoActual < tiempoMasProxima && tiempoActual > 0 ? oferta : masProxima;
    }, null as Oferta | null);

    if (!ofertaMasProxima) return '00:00';

    const tiempo = this.calcularTiempoRestante(ofertaMasProxima.fechaFin);
    return `${tiempo.dias}d ${tiempo.horas}h`;
  }

  // Agrega esta función en la sección de UTILIDADES (después de calcularHorasRestantes)

// 🟦 Calcular progreso del tiempo
calcularProgresoTiempo(oferta: Oferta): number {
  const inicio = new Date(oferta.fechaInicio).getTime();
  const fin = new Date(oferta.fechaFin).getTime();
  const ahora = new Date().getTime();
  
  const total = fin - inicio;
  const transcurrido = ahora - inicio;
  
  return Math.min(100, Math.max(0, (transcurrido / total) * 100));
}

// También puedes agregar esto si quieres usar el progreso de ventas:
// 🟦 Calcular progreso de ventas
calcularProgresoVentas(oferta: Oferta): number {
  const maxVentas = 50; // Límite para mostrar progreso
  return Math.min(100, (oferta.vendidos / maxVentas) * 100);
}

  // 🟦 Actualizar tiempos restantes
  actualizarTiemposRestantes(): void {
    this.ofertas.forEach(oferta => {
      oferta.tiempoRestante = this.calcularTiempoRestante(oferta.fechaFin);
    });
  }

  // 🟦 Calcular tiempo restante
  calcularTiempoRestante(fechaFin: Date): { dias: number, horas: number, minutos: number } {
    const ahora = new Date();
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - ahora.getTime();
    
    if (diff <= 0) {
      return { dias: 0, horas: 0, minutos: 0 };
    }
    
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { dias, horas, minutos };
  }

  // 🟦 Calcular horas restantes
  calcularHorasRestantes(oferta: Oferta): number {
    const tiempo = this.calcularTiempoRestante(oferta.fechaFin);
    return tiempo.dias * 24 + tiempo.horas;
  }

  // 🟦 Oferta destacada
  get ofertaDestacada(): Oferta | null {
    return this.ofertas.find(o => o.destacada) || null;
  }

  // ========== ACCIONES ==========
  
  verOferta(oferta: Oferta): void {
    console.log('Viendo oferta:', oferta.nombre);
    this.mostrarNotificacion(`Ver detalles de: ${oferta.nombre}`);
  }

  toggleFavorito(oferta: Oferta): void {
    oferta.enFavoritos = !oferta.enFavoritos;
    const accion = oferta.enFavoritos ? 'agregado a' : 'removido de';
    this.mostrarNotificacion(`${oferta.nombre} ${accion} favoritos`);
  }

  agregarAlCarrito(oferta: Oferta): void {
    if (oferta.stock === 0) {
      this.mostrarNotificacion('⚠️ Esta oferta está agotada');
      return;
    }

    this.itemsCarrito++;
    this.mostrarNotificacion(`🛒 "${oferta.nombre}" agregado al carrito`);
  }

  comprarAhora(oferta: Oferta): void {
    if (oferta.stock === 0) {
      this.mostrarNotificacion('⚠️ Esta oferta está agotada');
      return;
    }

    this.mostrarNotificacion(`⚡ Redirigiendo a compra de: ${oferta.nombre}`);
  }

  scrollToOfertas(): void {
    if (this.ofertasSection) {
      this.ofertasSection.nativeElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // ========== MANEJO DE IMÁGENES ==========
  
  onImgError(event: Event, oferta: Oferta): void {
    const target = event.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzYzNjM2MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9mZXJ0YTwvdGV4dD48L3N2Zz4=';
    target.onerror = null;
    oferta.imagenCargada = false;
  }

  onImgLoad(oferta: Oferta): void {
    oferta.imagenCargada = true;
  }

  mostrarNotificacion(mensaje: string): void {
    const notification = document.createElement('div');
    notification.textContent = mensaje;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #7A1A2C;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 9999;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
      max-width: 300px;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // ========== HEADER MÓVIL ==========
  
  @HostListener('window:resize')
  onResize(): void {
    this.esMovil = window.innerWidth <= 992;
    if (!this.esMovil) this.menuMovilAbierto = false;
  }

  toggleMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }
}