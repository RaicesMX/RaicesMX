// src/app/marketplace/marketplace.component.ts - ACTUALIZADO
import { Component, OnInit, ViewChild, ElementRef, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ProductsService, Product, ProductsResponse } from '../service/products.service';
import { CartService } from '../service/cart.service';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class MarketplaceComponent implements OnInit {
  @ViewChild('productosSection') productosSection!: ElementRef;

  private authService = inject(AuthService);
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);

  // Productos
  productos: Product[] = [];
  productosFiltrados: Product[] = [];

  // Paginación
  paginaActual = 1;
  productosPorPagina = 12;
  totalProductos = 0;
  totalPaginas = 0;

  // Estados
  cargando = true;
  filtroActivo = '';
  mostrarCTAVendedor = true;
  usuarioAutenticado = false;
  cartItems = 0; // Cambiado a 0 inicialmente
  Math = Math;

  // Filtros
  filtrosActivos = {
    categoryId: undefined as number | undefined,
    estado: undefined as string | undefined,
    minPrecio: undefined as number | undefined,
    maxPrecio: undefined as number | undefined,
    search: '',
    ordenar: 'recientes' as 'recientes' | 'precio_asc' | 'precio_desc' | 'mas_vendidos',
  };

  ngOnInit(): void {
    console.log('🚀 Marketplace iniciado');
    this.cargarProductos();
    this.verificarEstadoVendedor();
    this.cargarContadorCarrito(); // ← NUEVO
  }

  // ==================== NUEVO: Cargar contador del carrito ====================
  cargarContadorCarrito(): void {
    if (this.authService.isAuthenticated()) {
      this.cartService.cartItemsCountObservable.subscribe({
        next: (count) => {
          this.cartItems = count;
          console.log('🛒 Items en carrito:', count);
        },
        error: (error) => {
          console.error('❌ Error al cargar contador:', error);
        },
      });

      // Cargar el contador inicial
      this.cartService.getCartItemsCount().subscribe();
    }
  }

  cargarProductos(): void {
    console.log('📦 Iniciando carga de productos...');
    this.cargando = true;
    this.cdr.detectChanges();

    const params: any = {
      page: this.paginaActual,
      limit: this.productosPorPagina,
      ordenar: this.filtrosActivos.ordenar,
    };

    if (this.filtrosActivos.categoryId) params.categoryId = this.filtrosActivos.categoryId;
    if (this.filtrosActivos.estado) params.estado = this.filtrosActivos.estado;
    if (this.filtrosActivos.minPrecio) params.minPrecio = this.filtrosActivos.minPrecio;
    if (this.filtrosActivos.maxPrecio) params.maxPrecio = this.filtrosActivos.maxPrecio;
    if (this.filtrosActivos.search) params.search = this.filtrosActivos.search;

    console.log('🔍 Parámetros:', params);

    this.productsService.getProducts(params).subscribe({
      next: (response: ProductsResponse) => {
        console.log('✅ Respuesta recibida:', response);

        this.productos = response.products || [];
        this.productosFiltrados = response.products || [];
        this.totalProductos = response.total || 0;
        this.totalPaginas = Math.ceil((response.total || 0) / this.productosPorPagina);

        console.log(`✅ ${this.productosFiltrados.length} productos cargados`);

        setTimeout(() => {
          this.cargando = false;
          this.cdr.detectChanges();
          console.log('🎉 Productos mostrados después de 2 segundos');
        }, 2000);
      },
      error: (error) => {
        console.error('❌ ERROR:', error);
        this.cargando = false;
        this.productos = [];
        this.productosFiltrados = [];
        this.totalProductos = 0;
        this.totalPaginas = 0;
        this.cdr.detectChanges();
        this.mostrarNotificacion('Error al cargar productos');
      },
    });
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;

    console.log(`📄 Navegando a página ${pagina}`);
    this.paginaActual = pagina;
    this.cargarProductos();
    this.scrollToProductos();
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.irAPagina(this.paginaActual - 1);
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.irAPagina(this.paginaActual + 1);
    }
  }

  get paginasVisibles(): (number | string)[] {
    const paginas: (number | string)[] = [];
    const maxVisible = 5;

    if (this.totalPaginas <= maxVisible + 2) {
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push(1);

      let inicio = Math.max(2, this.paginaActual - 1);
      let fin = Math.min(this.totalPaginas - 1, this.paginaActual + 1);

      if (inicio > 2) {
        paginas.push('...');
      }

      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }

      if (fin < this.totalPaginas - 1) {
        paginas.push('...');
      }

      paginas.push(this.totalPaginas);
    }

    return paginas;
  }

  filtrarDestacados(): void {
    console.log('🔥 Filtro: Destacados');
    this.filtroActivo = 'destacados';
    this.filtrosActivos.ordenar = 'mas_vendidos';
    this.paginaActual = 1;
    this.cargarProductos();
  }

  filtrarNovedades(): void {
    console.log('✨ Filtro: Novedades');
    this.filtroActivo = 'nuevos';
    this.filtrosActivos.ordenar = 'recientes';
    this.paginaActual = 1;
    this.cargarProductos();
  }

  filtrarOfertas(): void {
    console.log('💰 Filtro: Ofertas');
    this.filtroActivo = 'ofertas';
    this.filtrosActivos.ordenar = 'precio_desc';
    this.paginaActual = 1;
    this.cargarProductos();
  }

  filtrarPorPrecio(): void {
    console.log('💵 Filtro: Por precio');
    this.filtroActivo = 'precio';
    this.filtrosActivos.ordenar = 'precio_asc';
    this.paginaActual = 1;
    this.cargarProductos();
  }

  limpiarFiltros(): void {
    console.log('🔄 Limpiando filtros');
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

  getImagenProducto(producto: Product): string {
    if (producto.images && producto.images.length > 0) {
      const imagenPrincipal = producto.images.sort((a, b) => a.orden - b.orden)[0];
      return imagenPrincipal.imageUrl;
    }
    return 'assets/images/placeholder-artesania.jpg';
  }

  esProductoNuevo(producto: Product): boolean {
    const fechaCreacion = new Date(producto.createdAt);
    const ahora = new Date();
    const diferenciaDias = Math.floor(
      (ahora.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diferenciaDias <= 7;
  }

  esProductoPopular(producto: Product): boolean {
    return producto.ventas >= 10;
  }

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

  scrollToProductos(): void {
    if (this.productosSection) {
      this.productosSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // ==================== ACTUALIZADO: Agregar al carrito con backend ====================
  agregarAlCarrito(producto: Product): void {
    if (!this.authService.isAuthenticated()) {
      this.mostrarNotificacion('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    if (producto.stock === 0) {
      this.mostrarNotificacion('Producto sin stock disponible');
      return;
    }

    console.log('🛒 Agregando al carrito:', producto.titulo);

    this.cartService.addToCart(producto.id, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.mostrarNotificacion(`"${producto.titulo}" agregado al carrito`);
          console.log('✅ Producto agregado:', response);
        }
      },
      error: (error) => {
        console.error('❌ Error al agregar al carrito:', error);
        const mensaje = error.error?.message || 'Error al agregar el producto al carrito';
        this.mostrarNotificacion(mensaje);
      },
    });
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.warn('⚠️ Error cargando imagen:', target.src);
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

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #9D2235;
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
