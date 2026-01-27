// view-product.component.ts - VERSIÓN FINAL CON ChangeDetectorRef
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductsService, Product } from '../service/products.service';

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './view-product.html',
  styleUrl: './view-product.scss',
})
export class ViewProductComponent implements OnInit, OnDestroy {
  id!: number;
  cantidad: number = 1;
  calificacionUsuario: number = 0;
  hoverCalificacion: number = 0;

  // Galería mejorada
  indiceActual: number = 0;
  imagenPrincipal: string = '';
  imagenZoomed: boolean = false;

  itemsCarrito: number = 3;
  imagenesCargadas: boolean = false;
  private isBrowser: boolean;

  // Control de carga
  cargando: boolean = true;
  productoNoEncontrado: boolean = false;

  // Producto de la API
  producto: Product | null = null;

  // Productos relacionados de la API
  productosRelacionados: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef, // 👈 INYECTAR ChangeDetectorRef
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Obtener ID del producto desde la URL
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('📦 Cargando producto con ID:', this.id);

    // Cargar producto desde la API
    this.cargarProducto(this.id);

    // Escuchar cambios en la ruta para recargar al navegar entre productos
    this.route.params.subscribe((params) => {
      const nuevoId = Number(params['id']);
      if (nuevoId !== this.id) {
        this.id = nuevoId;
        this.cargarProducto(this.id);
        window.scrollTo(0, 0); // Scroll al inicio
      }
    });
  }

  // ==========================================
  // 🔹 Cargar producto desde la API
  // ==========================================
  cargarProducto(id: number): void {
    this.cargando = true;
    this.productoNoEncontrado = false;
    this.cdr.detectChanges(); // 👈 Forzar actualización

    this.productsService.getProductById(id).subscribe({
      next: (response) => {
        console.log('✅ Producto recibido:', response);

        this.producto = response.product;

        // Inicializar galería
        if (this.producto.images && this.producto.images.length > 0) {
          this.imagenPrincipal = this.producto.images[0].imageUrl;
          this.indiceActual = 0;
        } else {
          this.imagenPrincipal = 'assets/images/placeholder-artesania.jpg';
        }

        this.imagenesCargadas = true;

        // ✅ SOLUCIÓN: setTimeout + detectChanges
        setTimeout(() => {
          this.cargando = false;
          this.cdr.detectChanges();
          console.log('🎉 Producto mostrado, cargando =', this.cargando);
        }, 100);

        // Cargar productos relacionados de la misma categoría
        this.cargarProductosRelacionados(this.producto.category.id, this.producto.id);
      },
      error: (error) => {
        console.error('❌ Error cargando producto:', error);

        setTimeout(() => {
          this.cargando = false;

          if (error.status === 404) {
            this.productoNoEncontrado = true;
          } else {
            alert('Error al cargar el producto. Por favor, intenta de nuevo.');
            this.router.navigate(['/marketplace']);
          }

          this.cdr.detectChanges();
        }, 100);
      },
    });
  }

  // ==========================================
  // 🔹 Cargar productos relacionados
  // ==========================================
  cargarProductosRelacionados(categoryId: number, currentProductId: number): void {
    this.productsService.getProductsByCategory(categoryId, 1).subscribe({
      next: (response) => {
        // Filtrar el producto actual y tomar solo 5
        this.productosRelacionados = response.products
          .filter((p) => p.id !== currentProductId)
          .slice(0, 5);

        console.log('✅ Productos relacionados:', this.productosRelacionados.length);
        this.cdr.detectChanges(); // 👈 Forzar actualización
      },
      error: (error) => {
        console.error('❌ Error cargando productos relacionados:', error);
        this.productosRelacionados = [];
        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // 🔹 Obtener imagen del producto
  // ==========================================
  getImagenProducto(producto: Product): string {
    if (producto.images && producto.images.length > 0) {
      return producto.images[0].imageUrl;
    }
    return 'assets/images/placeholder-artesania.jpg';
  }

  // ==========================================
  // === GALERÍA MEJORADA ===
  // ==========================================
  cambiarImagenDirecta(indice: number) {
    if (!this.producto || !this.producto.images) return;

    this.indiceActual = indice;
    this.imagenPrincipal = this.producto.images[indice].imageUrl;
  }

  anteriorImagen(event: Event) {
    event.stopPropagation();

    if (!this.producto || !this.producto.images) return;

    const total = this.producto.images.length;
    this.indiceActual = (this.indiceActual - 1 + total) % total;
    this.imagenPrincipal = this.producto.images[this.indiceActual].imageUrl;
  }

  siguienteImagen(event: Event) {
    event.stopPropagation();

    if (!this.producto || !this.producto.images) return;

    const total = this.producto.images.length;
    this.indiceActual = (this.indiceActual + 1) % total;
    this.imagenPrincipal = this.producto.images[this.indiceActual].imageUrl;
  }

  abrirZoom() {
    this.imagenZoomed = true;
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  cerrarZoom(event?: Event) {
    if (event) event.stopPropagation();
    this.imagenZoomed = false;
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  // ==========================================
  // === OTROS MÉTODOS ===
  // ==========================================
  calificar(rating: number) {
    this.calificacionUsuario = rating;
    console.log(`Calificación dada: ${rating} estrellas`);
    // TODO: Enviar calificación al backend
  }

  compartir() {
    if (!this.producto) return;

    if (navigator.share) {
      navigator
        .share({
          title: this.producto.titulo,
          text: this.producto.descripcion,
          url: window.location.href,
        })
        .then(() => console.log('Compartido exitosamente'))
        .catch((error) => console.log('Error al compartir', error));
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  }

  aumentar() {
    if (!this.producto) return;

    if (this.cantidad < this.producto.stock) {
      this.cantidad++;
    }
  }

  disminuir() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  comprarAhora() {
    if (!this.producto) return;

    alert(`Redirigiendo a checkout con ${this.cantidad} unidades de ${this.producto.titulo}`);
    // TODO: Implementar checkout real
  }

  agregarAlCarrito() {
    if (!this.producto) return;

    this.itemsCarrito += this.cantidad;
    alert(`✅ Agregado al carrito: ${this.cantidad} x ${this.producto.titulo}`);
    // TODO: Implementar carrito real
  }

  verProducto(id: number) {
    this.router.navigate(['/producto', id]);
  }

  onImageLoad() {
    this.imagenesCargadas = true;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (this.isBrowser && event.key === 'Escape' && this.imagenZoomed) {
      this.cerrarZoom();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  esPaginaActiva(ruta: string): boolean {
    if (typeof window !== 'undefined') {
      return window.location.pathname === ruta;
    }
    return false;
  }
}
