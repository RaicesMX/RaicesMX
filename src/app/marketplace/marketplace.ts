import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  precioOriginal?: number;
  imagen: string;
  categoria: string;
  nuevo?: boolean;
  oferta?: boolean;
  popular?: boolean;
}

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MarketplaceComponent implements OnInit {
  @ViewChild('productosSection') productosSection!: ElementRef;
  
  // TUS PRODUCTOS ORIGINALES CON MEJORAS
  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Jarrón de Talavera Poblana',
      precio: 850,
      precioOriginal: 1000,
      imagen: 'assets/images/Jarrón_Talavera.jpg',
      categoria: 'Cerámica',
      nuevo: true
    },
    {
      id: 2,
      nombre: 'Alebrije Artesanal',
      precio: 450,
      imagen: 'assets/images/Alebrigue_Artesanal.jpg',
      categoria: 'Madera',
      popular: true
    },
    {
      id: 3,
      nombre: 'Blusa Bordada Tradicional',
      precio: 380,
      imagen: 'assets/images/Blusa_Bordada.jpg',
      categoria: 'Textiles',
      oferta: true
    },
    {
      id: 4,
      nombre: 'Cerámica Talavera',
      precio: 220,
      imagen: 'assets/images/Ceramica_Talavera.jpg',
      categoria: 'Cerámica'
    },
    {
      id: 5,
      nombre: 'Máscara Huichol Artesanal',
      precio: 620,
      imagen: 'assets/images/Máscara_Huichol.jpg',
      categoria: 'Arte',
      popular: true
    },
    {
      id: 6,
      nombre: 'Plato Talavera Decorativo',
      precio: 180,
      precioOriginal: 220,
      imagen: 'assets/images/Plato_Talavera.jpg',
      categoria: 'Cerámica',
      oferta: true
    }
  ];

  // Estado del componente - SIN TIPOS EXPLÍCITOS CUANDO SE INFIEREN
  productosFiltrados: Producto[] = [];
  cargando = true; // boolean se infiere
  cartItems = 3; // number se infiere
  filtroActivo = ''; // string se infiere

  ngOnInit(): void {
    this.simularCarga();
    this.productosFiltrados = [...this.productos];
  }

  simularCarga(): void {
    this.cargando = true;
    setTimeout(() => {
      this.cargando = false;
    }, 1500);
  }

  // ========== FILTROS UTILES ==========
  
  filtrarDestacados(): void {
    this.filtroActivo = 'destacados';
    this.productosFiltrados = this.productos.filter(p => p.popular);
  }

  filtrarNovedades(): void {
    this.filtroActivo = 'nuevos';
    this.productosFiltrados = this.productos.filter(p => p.nuevo);
  }

  filtrarOfertas(): void {
    this.filtroActivo = 'ofertas';
    this.productosFiltrados = this.productos.filter(p => p.oferta || p.precioOriginal);
  }

  filtrarPorPrecio(): void {
    this.filtroActivo = 'precio';
    this.productosFiltrados = [...this.productos].sort((a, b) => a.precio - b.precio);
  }

  limpiarFiltros(): void {
    this.filtroActivo = '';
    this.productosFiltrados = [...this.productos];
  }

  // ========== FUNCIONALIDADES ==========
  
  scrollToProductos(): void {
    if (this.productosSection) {
      this.productosSection.nativeElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  agregarAlCarrito(producto: Producto): void {
    this.cartItems++;
    this.mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
  }

  // Corregido: usar tipo específico en lugar de 'any'
  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    // Usar imagen de placeholder si la original falla
    target.src = 'assets/images/placeholder-artesania.jpg';
    target.onerror = null;
  }

  // Corregido: usar tipo específico en lugar de 'any'
  onLogoError(event: Event): void {
    const target = event.target as HTMLImageElement;
    // Si el logo no carga, mostrar texto
    target.style.display = 'none';
    const container = target.parentElement;
    
    if (container) {
      const fallback = document.createElement('div');
      fallback.className = 'logo-fallback';
      fallback.innerHTML = `
        <div style="font-size: 3rem; color: #C99E10;">🏺</div>
        <div style="font-size: 1.5rem; color: white; font-weight: 700;">RaícesMX</div>
      `;
      container.appendChild(fallback);
    }
  }

  mostrarNotificacion(mensaje: string): void {
    const notification = document.createElement('div');
    notification.textContent = mensaje;
    
    // Usar colores directamente en lugar de variables no disponibles
    const colorPrimary = '#9D2235'; // Rojo mexicano
    const colorSecondary = '#C99E10'; // Dorado mexicano
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colorPrimary};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
      max-width: 300px;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Método para obtener productos en carrito (para futuro uso)
  get productosEnCarrito(): Producto[] {
    // En una implementación real, esto vendría de un servicio
    return [];
  }

  // Método para calcular total del carrito (para futuro uso)
  get totalCarrito(): number {
    return this.productosEnCarrito.reduce((total, p) => total + p.precio, 0);
  }
}