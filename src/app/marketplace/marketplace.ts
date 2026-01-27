// src/app/marketplace/marketplace.component.ts
import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ProductsService } from '../service/products.service'; // 👈 IMPORTAR

// ✨ NUEVA INTERFAZ basada en tu backend
interface ProductoAPI {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  stock: number;
  unidad: string;
  estado: string;
  municipio: string;
  vistas: number;
  ventas: number;
  createdAt: string;
  images: Array<{
    id: number;
    imageUrl: string; // 👈 Cambio de "url" a "imageUrl"
    publicId: string;
    orden: number;
  }>;
  category: {
    id: number;
    nombre: string;
    icono: string;
  };
  seller: {
    id: number;
    fullName: string;
    email: string;
  };
}

// Interfaz para la respuesta paginada del backend
interface ProductosResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  products: ProductoAPI[];
}

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class MarketplaceComponent implements OnInit {
  @ViewChild('productosSection') productosSection!: ElementRef;
  Math = Math; // ✅ Permite usar Math en el template

  private authService = inject(AuthService);
  private productsService = inject(ProductsService); // 👈 INYECTAR SERVICIO

  // ========== PRODUCTOS DE LA API ==========
  productos: ProductoAPI[] = [];
  productosFiltrados: ProductoAPI[] = [];

  // ========== PAGINACIÓN ==========
  paginaActual = 1;
  productosPorPagina = 12; // Coincide con el default del backend
  totalProductos = 0;
  totalPaginas = 0;

  // ========== ESTADOS ==========
  cargando = true;
  filtroActivo = '';
  mostrarCTAVendedor = true;
  usuarioAutenticado = false;
  cartItems = 3;

  // ========== FILTROS AVANZADOS ==========
  filtrosActivos = {
    categoryId: undefined as number | undefined,
    estado: undefined as string | undefined,
    minPrecio: undefined as number | undefined,
    maxPrecio: undefined as number | undefined,
    search: '',
    ordenar: 'recientes' as 'recientes' | 'precio_asc' | 'precio_desc' | 'mas_vendidos',
  };

  // ========== LIFECYCLE HOOKS ==========
  ngOnInit(): void {
    this.cargarProductos();
    this.verificarEstadoVendedor();
  }

  // ========== CARGAR PRODUCTOS DESDE API ==========
  /**
   * Carga productos desde el backend con paginación
   */
  cargarProductos(): void {
    this.cargando = true;

    // Construir parámetros de consulta
    const params: any = {
      page: this.paginaActual,
      limit: this.productosPorPagina,
      ordenar: this.filtrosActivos.ordenar,
    };

    // Agregar filtros opcionales solo si tienen valor
    if (this.filtrosActivos.categoryId) {
      params.categoryId = this.filtrosActivos.categoryId;
    }
    if (this.filtrosActivos.estado) {
      params.estado = this.filtrosActivos.estado;
    }
    if (this.filtrosActivos.minPrecio) {
      params.minPrecio = this.filtrosActivos.minPrecio;
    }
    if (this.filtrosActivos.maxPrecio) {
      params.maxPrecio = this.filtrosActivos.maxPrecio;
    }
    if (this.filtrosActivos.search) {
      params.search = this.filtrosActivos.search;
    }

    this.productsService.getProducts(params).subscribe({
      next: (response: ProductosResponse) => {
        this.productos = response.products;
        this.productosFiltrados = response.products;
        this.totalProductos = response.total;
        this.totalPaginas = Math.ceil(response.total / this.productosPorPagina);
        this.cargando = false;

        console.log(
          `✅ ${response.count} productos cargados (Página ${response.page}/${this.totalPaginas})`,
        );
      },
      error: (error) => {
        console.error('❌ Error al cargar productos:', error);
        this.cargando = false;
        this.mostrarNotificacion('Error al cargar productos. Intenta de nuevo.');
      },
    });
  }

  // ========== PAGINACIÓN ==========
  /**
   * Cambia a una página específica
   */
  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;

    this.paginaActual = pagina;
    this.cargarProductos();
    this.scrollToProductos();
  }

  /**
   * Página anterior
   */
  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.irAPagina(this.paginaActual - 1);
    }
  }

  /**
   * Página siguiente
   */
  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.irAPagina(this.paginaActual + 1);
    }
  }

  /**
   * Genera array de números de página para mostrar
   * Ejemplo: [1, 2, 3, '...', 10] o [1, '...', 5, 6, 7, '...', 10]
   */
  get paginasVisibles(): (number | string)[] {
    const paginas: (number | string)[] = [];
    const maxVisible = 5; // Máximo de botones de página visibles

    if (this.totalPaginas <= maxVisible + 2) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      paginas.push(1);

      // Calcular rango alrededor de la página actual
      let inicio = Math.max(2, this.paginaActual - 1);
      let fin = Math.min(this.totalPaginas - 1, this.paginaActual + 1);

      // Agregar '...' si es necesario
      if (inicio > 2) {
        paginas.push('...');
      }

      // Agregar páginas centrales
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }

      // Agregar '...' si es necesario
      if (fin < this.totalPaginas - 1) {
        paginas.push('...');
      }

      // Siempre mostrar la última página
      paginas.push(this.totalPaginas);
    }

    return paginas;
  }

  // ========== FILTROS RÁPIDOS ==========
  filtrarDestacados(): void {
    this.filtroActivo = 'destacados';
    this.filtrosActivos.ordenar = 'mas_vendidos';
    this.paginaActual = 1; // Reset a página 1
    this.cargarProductos();
  }

  filtrarNovedades(): void {
    this.filtroActivo = 'nuevos';
    this.filtrosActivos.ordenar = 'recientes';
    this.paginaActual = 1;
    this.cargarProductos();
  }

  filtrarOfertas(): void {
    this.filtroActivo = 'ofertas';
    // Aquí podrías agregar lógica para filtrar por descuentos
    // Por ahora ordenamos por precio descendente
    this.filtrosActivos.ordenar = 'precio_desc';
    this.paginaActual = 1;
    this.cargarProductos();
  }

  filtrarPorPrecio(): void {
    this.filtroActivo = 'precio';
    this.filtrosActivos.ordenar = 'precio_asc';
    this.paginaActual = 1;
    this.cargarProductos();
  }

  limpiarFiltros(): void {
    this.filtroActivo = '';
    this.filtrosActivos = {
      categoryId: undefined,
      estado: undefined,
      minPrecio: undefined,
      maxPrecio: undefined,
      search: '',
      ordenar: 'recientes',
    };
    this.paginaActual = 1;
    this.cargarProductos();
  }

  // ========== UTILIDADES PARA PRODUCTOS ==========
  /**
   * Obtiene la imagen principal del producto
   */
  getImagenProducto(producto: ProductoAPI): string {
    if (producto.images && producto.images.length > 0) {
      // Ordenar por 'orden' y tomar la primera
      const imagenPrincipal = producto.images.sort((a, b) => a.orden - b.orden)[0];
      return imagenPrincipal.imageUrl; // 👈 Usar imageUrl en lugar de url
    }
    return 'assets/images/placeholder-artesania.jpg';
  }

  /**
   * Verifica si un producto es nuevo (creado en los últimos 7 días)
   */
  esProductoNuevo(producto: ProductoAPI): boolean {
    const fechaCreacion = new Date(producto.createdAt);
    const ahora = new Date();
    const diferenciaDias = Math.floor(
      (ahora.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diferenciaDias <= 7;
  }

  /**
   * Verifica si un producto es popular (más de 10 ventas)
   */
  esProductoPopular(producto: ProductoAPI): boolean {
    return producto.ventas >= 10;
  }

  // ========== VENDEDOR CTA ==========
  verificarEstadoVendedor(): void {
    if (!this.authService.isAuthenticated()) {
      this.mostrarCTAVendedor = true;
      this.usuarioAutenticado = false;
      return;
    }

    this.usuarioAutenticado = true;

    this.authService.hasSellerRequest().subscribe({
      next: (tieneSolicitud) => {
        this.mostrarCTAVendedor = !tieneSolicitud;
      },
      error: (error) => {
        console.error('❌ Error al verificar solicitud:', error);
        this.mostrarCTAVendedor = true;
      },
    });
  }

  // ========== FUNCIONALIDADES ==========
  scrollToProductos(): void {
    if (this.productosSection) {
      this.productosSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  agregarAlCarrito(producto: ProductoAPI): void {
    this.cartItems++;
    this.mostrarNotificacion(`"${producto.titulo}" agregado al carrito`);
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/placeholder-artesania.jpg';
    target.onerror = null;
  }

  onLogoError(event: Event): void {
    const target = event.target as HTMLImageElement;
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

    const colorPrimary = '#9D2235';

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
}
