import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Interface para los productos favoritos
interface ProductoFavorito {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  artesano: string;
  region: string;
  rating: number;
  reviews: number;
  stock: number;
  oferta: boolean;
  descuento?: number;
  nuevo: boolean;
  fechaAgregado: Date;
}

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './favoritos.html',
  styleUrls: ['./favoritos.scss']
})
export class FavoritosComponent {
  // Lista de productos favoritos
  productosFavoritos: ProductoFavorito[] = [
    {
      id: 1,
      nombre: 'Alebrije Dragón Multicolor',
      descripcion: 'Dragón fantástico tallado en madera y pintado a mano con técnicas tradicionales',
      precio: 850.00,
      imagen: 'assets/images/Alebrije Dragon Especial2.png',
      categoria: 'Alebrijes',
      artesano: 'Taller Donají',
      region: 'Oaxaca',
      rating: 4.9,
      reviews: 47,
      stock: 3,
      oferta: true,
      descuento: 15,
      nuevo: true,
      fechaAgregado: new Date('2024-01-15')
    },
    {
      id: 2,
      nombre: 'Textil Huichol con Chaquira',
      descripcion: 'Manta ceremonial con diseños espirituales en chaquira de colores vibrantes',
      precio: 450.00,
      imagen: 'assets/images/Textil Huichol con Chaquira.jfif',
      categoria: 'Textiles',
      artesano: 'Comunidad Wixárica',
      region: 'Jalisco',
      rating: 4.7,
      reviews: 23,
      stock: 8,
      oferta: false,
      nuevo: false,
      fechaAgregado: new Date('2024-01-10')
    },
    {
      id: 3,
      nombre: 'Jarrón Talavera Azul',
      descripcion: 'Jarrón decorativo con auténtica técnica de Talavera poblana',
      precio: 320.00,
      imagen: 'assets/images/Jarrón Talavera Azul.jpg',
      categoria: 'Cerámica',
      artesano: 'Alfareros de Puebla',
      region: 'Puebla',
      rating: 4.8,
      reviews: 34,
      stock: 0,
      oferta: false,
      nuevo: true,
      fechaAgregado: new Date('2024-01-18')
    },
    {
      id: 4,
      nombre: 'Collar de Plata Taxqueña',
      descripcion: 'Joyería fina en plata con detalles tradicionales de Taxco',
      precio: 680.00,
      imagen: 'assets/images/Collar de Plata Taxqueña.jpeg',
      categoria: 'Platería',
      artesano: 'Plateros de Taxco',
      region: 'Guerrero',
      rating: 4.6,
      reviews: 18,
      stock: 5,
      oferta: true,
      descuento: 20,
      nuevo: false,
      fechaAgregado: new Date('2024-01-12')
    },
    {
      id: 5,
      nombre: 'Vaso Barro Negro Oaxaqueño',
      descripcion: 'Vaso utilitario en barro negro con acabado metálico natural',
      precio: 180.00,
      imagen: 'assets/images/Vaso Barro Negro Oaxaqueño.png',
      categoria: 'Barro Negro',
      artesano: 'Alfareros de San Bartolo',
      region: 'Oaxaca',
      rating: 4.5,
      reviews: 29,
      stock: 12,
      oferta: false,
      nuevo: false,
      fechaAgregado: new Date('2024-01-08')
    }
  ];

  // Productos filtrados
  productosFiltrados: ProductoFavorito[] = [...this.productosFavoritos];

  // Filtros
  filtroCategoria: string = '';
  ordenSeleccionado: string = 'reciente';

  // Productos recomendados
  productosRecomendados: ProductoFavorito[] = [
    {
      id: 6,
      nombre: 'Rebozo de Seda Michoacano',
      descripcion: 'Rebozo tradicional tejido en seda natural con tintes orgánicos',
      precio: 520.00,
      imagen: 'assets/images/Rebozo de Seda Michoacano.jfif',
      categoria: 'Textiles',
      artesano: 'Tejedoras de Michoacán',
      region: 'Michoacán',
      rating: 4.8,
      reviews: 31,
      stock: 6,
      oferta: false,
      nuevo: true,
      fechaAgregado: new Date('2024-01-20')
    },
    {
      id: 7,
      nombre: 'Máscara de Madera Tallada',
      descripcion: 'Máscara ceremonial tallada en madera de copal con pigmentos naturales',
      precio: 290.00,
      imagen: 'assets/images/Máscara de Madera Tallada.jfif',
      categoria: 'Madera',
      artesano: 'Taller Tradicional',
      region: 'México',
      rating: 4.4,
      reviews: 15,
      stock: 4,
      oferta: true,
      descuento: 10,
      nuevo: false,
      fechaAgregado: new Date('2024-01-16')
    }
  ];

  // 🟦 Obtener categorías únicas para el filtro
  get categoriasUnicas(): string[] {
    return [...new Set(this.productosFavoritos.map(p => p.categoria))];
  }

  // 🟦 Verificar si hay filtros activos
  get filtroActivo(): boolean {
    return this.filtroCategoria !== '';
  }

  // 🟦 Obtener total de categorías en favoritos
  obtenerTotalCategorias(): number {
    return this.categoriasUnicas.length;
  }

  // 🟦 Calcular valor total de los favoritos
  calcularValorTotal(): number {
    return this.productosFavoritos.reduce((total, producto) => {
      const precio = producto.oferta ? this.calcularPrecioOferta(producto) : producto.precio;
      return total + precio;
    }, 0);
  }

  // 🟦 Calcular precio con descuento
  calcularPrecioOferta(producto: ProductoFavorito): number {
    if (!producto.oferta || !producto.descuento) return producto.precio;
    return producto.precio * (1 - producto.descuento / 100);
  }

  // 🟦 Calcular tiempo desde que se agregó
  calcularTiempo(fecha: Date): string {
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) return 'hoy';
    if (diffDias === 1) return 'ayer';
    if (diffDias < 7) return `hace ${diffDias} días`;
    if (diffDias < 30) return `hace ${Math.floor(diffDias / 7)} semanas`;
    return `hace ${Math.floor(diffDias / 30)} meses`;
  }

  // 🟦 Filtrar favoritos
  filtrarFavoritos(): void {
    let resultados = [...this.productosFavoritos];

    // Filtrar por categoría
    if (this.filtroCategoria) {
      resultados = resultados.filter(p => p.categoria === this.filtroCategoria);
    }

    this.productosFiltrados = resultados;
    this.ordenarFavoritos();
  }

  // 🟦 Ordenar favoritos
  ordenarFavoritos(): void {
    switch (this.ordenSeleccionado) {
      case 'reciente':
        this.productosFiltrados.sort((a, b) => 
          b.fechaAgregado.getTime() - a.fechaAgregado.getTime()
        );
        break;
      case 'antiguo':
        this.productosFiltrados.sort((a, b) => 
          a.fechaAgregado.getTime() - b.fechaAgregado.getTime()
        );
        break;
      case 'precio-asc':
        this.productosFiltrados.sort((a, b) => {
          const precioA = a.oferta ? this.calcularPrecioOferta(a) : a.precio;
          const precioB = b.oferta ? this.calcularPrecioOferta(b) : b.precio;
          return precioA - precioB;
        });
        break;
      case 'precio-desc':
        this.productosFiltrados.sort((a, b) => {
          const precioA = a.oferta ? this.calcularPrecioOferta(a) : a.precio;
          const precioB = b.oferta ? this.calcularPrecioOferta(b) : b.precio;
          return precioB - precioA;
        });
        break;
      case 'nombre':
        this.productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
    }
  }

  // 🟦 Quitar producto de favoritos
  quitarDeFavoritos(index: number): void {
    const producto = this.productosFiltrados[index];
    if (confirm(`¿Quitar "${producto.nombre}" de tus favoritos?`)) {
      this.productosFavoritos = this.productosFavoritos.filter(p => p.id !== producto.id);
      this.filtrarFavoritos();
    }
  }

  // 🟦 Agregar producto a favoritos
  agregarAFavoritos(producto: ProductoFavorito): void {
    if (!this.productosFavoritos.some(p => p.id === producto.id)) {
      this.productosFavoritos.push({
        ...producto,
        fechaAgregado: new Date()
      });
      this.filtrarFavoritos();
      alert(`"${producto.nombre}" agregado a favoritos`);
    } else {
      alert('Este producto ya está en tus favoritos');
    }
  }

  // 🟦 Agregar producto al carrito
  agregarAlCarrito(producto: ProductoFavorito): void {
    if (producto.stock === 0) {
      alert('Este producto está agotado');
      return;
    }
    
    // Aquí iría la lógica real para agregar al carrito
    console.log('Agregando al carrito:', producto);
    alert(`"${producto.nombre}" agregado al carrito`);
  }

  // 🟦 Mover todos los favoritos al carrito
  moverTodoAlCarrito(): void {
    const productosConStock = this.productosFavoritos.filter(p => p.stock > 0);
    
    if (productosConStock.length === 0) {
      alert('No hay productos con stock disponible');
      return;
    }

    if (confirm(`¿Mover ${productosConStock.length} productos al carrito?`)) {
      // Aquí iría la lógica real para mover al carrito
      console.log('Moviendo al carrito:', productosConStock);
      alert(`${productosConStock.length} productos movidos al carrito`);
    }
  }

  // 🟦 Comprar producto inmediatamente
  comprarAhora(producto: ProductoFavorito): void {
    if (producto.stock === 0) {
      alert('Este producto está agotado');
      return;
    }
    
    // Aquí iría la lógica real de compra inmediata
    console.log('Comprando ahora:', producto);
    alert(`Redirigiendo a compra de: ${producto.nombre}`);
  }

  // 🟦 Compartir producto
  compartirProducto(producto: ProductoFavorito): void {
    if (navigator.share) {
      navigator.share({
        title: producto.nombre,
        text: producto.descripcion,
        url: `${window.location.origin}/producto/${producto.id}`
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const url = `${window.location.origin}/producto/${producto.id}`;
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  }

  // 🟦 Ver detalles del producto
  verProducto(producto: ProductoFavorito): void {
    // Aquí iría la navegación a la página de detalles del producto
    console.log('Viendo producto:', producto);
    alert(`Navegando a: ${producto.nombre}`);
  }

  // 🟦 Limpiar todos los favoritos
  limpiarFavoritos(): void {
    if (this.productosFavoritos.length === 0) {
      alert('No hay favoritos para limpiar');
      return;
    }

    if (confirm('¿Estás seguro de que quieres limpiar todos tus favoritos?')) {
      this.productosFavoritos = [];
      this.productosFiltrados = [];
    }
  }
}