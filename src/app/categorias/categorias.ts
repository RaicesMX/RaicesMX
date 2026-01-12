import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  descripcionCorta: string;
  imagen: string;
  totalProductos: number;
  artesanos: number;
  region: string;
  rating: number;
  popular: boolean;
  tags: string[];
  fechaCreacion?: Date;
  imagenCargada?: boolean;
}

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './categorias.html', // ← Mantener este nombre
  styleUrls: ['./categorias.scss'] // ← Mantener este nombre
})
export class CategoriasComponent implements OnInit {
  @ViewChild('categoriasSection') categoriasSection!: ElementRef;
  
  // Estado del componente
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  cargando = true;
  itemsCarrito = 3;
  
  // Filtros simplificados (sin búsqueda - ya está en header)
  filtroRapido = 'todos';
  filtroRegion = '';
  ordenSeleccionado = 'nombre';
  mostrarFiltrosAvanzados = false;
  filtroRating = 0;
  
  // Regiones disponibles
  regiones: string[] = ['Oaxaca', 'Puebla', 'Jalisco', 'Guerrero', 'Michoacán', 'Nayarit'];
  
  // Para header móvil (si usas el mismo header)
  esMovil = false;
  menuAbierto = false;
  menuMovilAbierto = false;

  ngOnInit(): void {
    this.inicializarComponente();
    this.esMovil = window.innerWidth <= 992;
  }

  private inicializarComponente(): void {
    this.cargarCategorias();
    
    // Carga rápida para desarrollo (reducido a 300ms)
    setTimeout(() => {
      this.cargando = false;
    }, 300);
  }

  private cargarCategorias(): void {
    // Categorías con imágenes corregidas
    this.categorias = [
      {
        id: 1,
        nombre: 'Alebrijes',
        descripcion: 'Coloridas figuras fantásticas talladas en madera, originarias de Oaxaca',
        descripcionCorta: 'Figuras fantásticas de madera pintada a mano',
        imagen: 'assets/images/Alebrijes.jpg',
        totalProductos: 45,
        artesanos: 12,
        region: 'Oaxaca',
        rating: 4.8,
        popular: true,
        tags: ['Madera', 'Pintura', 'Fantástico'],
        fechaCreacion: new Date('2024-01-15')
      },
      {
        id: 2,
        nombre: 'Textiles Huicholes',
        descripcion: 'Tejidos tradicionales con diseños ancestrales y símbolos espirituales',
        descripcionCorta: 'Tejidos con diseños ancestrales y espirituales',
        imagen: 'assets/images/Textiles Huichole.jpg',
        totalProductos: 32,
        artesanos: 8,
        region: 'Jalisco',
        rating: 4.7,
        popular: true,
        tags: ['Tejido', 'Bordado', 'Espiritual'],
        fechaCreacion: new Date('2024-02-20')
      },
      {
        id: 3,
        nombre: 'Cerámica de Talavera',
        descripcion: 'Alfarería vidriada con diseños en azul cobalto sobre fondo blanco',
        descripcionCorta: 'Alfarería vidriada con diseños en azul cobalto',
        imagen: 'assets/images/Ceramica_Talavera.jpg',
        totalProductos: 28,
        artesanos: 6,
        region: 'Puebla',
        rating: 4.9,
        popular: false,
        tags: ['Barro', 'Vidriado', 'Tradicional'],
        fechaCreacion: new Date('2023-12-10')
      },
      {
        id: 4,
        nombre: 'Platería Taxqueña',
        descripcion: 'Joyería y objetos decorativos en plata con técnicas ancestrales',
        descripcionCorta: 'Joyería y objetos decorativos en plata',
        imagen: 'assets/images/Plateria Taxqueña.jfif',
        totalProductos: 23,
        artesanos: 5,
        region: 'Guerrero',
        rating: 4.6,
        popular: false,
        tags: ['Plata', 'Joyería', 'Lujo'],
        fechaCreacion: new Date('2024-01-08')
      },
      {
        id: 5,
        nombre: 'Barro Negro',
        descripcion: 'Alfarería sin esmaltar con acabado negro metálico natural',
        descripcionCorta: 'Alfarería con acabado negro metálico natural',
        imagen: 'assets/images/Barro Negro.jfif',
        totalProductos: 19,
        artesanos: 4,
        region: 'Oaxaca',
        rating: 4.5,
        popular: true,
        tags: ['Barro', 'Natural', 'Utilitario'],
        fechaCreacion: new Date('2024-03-01')
      },
      {
        id: 6,
        nombre: 'Rebozo Mexicano',
        descripcion: 'Mantas tradicionales tejidas en telar de cintura con diversos diseños',
        descripcionCorta: 'Mantas tradicionales tejidas en telar de cintura',
        imagen: 'assets/images/Rebozo mexicano.jfif',
        totalProductos: 37,
        artesanos: 9,
        region: 'Michoacán',
        rating: 4.7,
        popular: false,
        tags: ['Textil', 'Vestimenta', 'Tradicional'],
        fechaCreacion: new Date('2023-11-15')
      },
      {
        id: 7,
        nombre: 'Arte Huichol',
        descripcion: 'Cuadros y objetos decorativos con chaquira y estambre',
        descripcionCorta: 'Arte con chaquira y estambre de colores vibrantes',
        imagen: 'assets/images/Arte Huichol.jfif',
        totalProductos: 41,
        artesanos: 11,
        region: 'Nayarit',
        rating: 4.8,
        popular: true,
        tags: ['Chaquira', 'Colorido', 'Espiritual'],
        fechaCreacion: new Date('2024-02-28')
      },
      {
        id: 8,
        nombre: 'Cobre Martillado',
        descripcion: 'Objetos decorativos y utilitarios en cobre trabajado a mano',
        descripcionCorta: 'Objetos en cobre trabajado artesanalmente',
        imagen: 'assets/images/Cobre Martillado.jfif',
        totalProductos: 15,
        artesanos: 3,
        region: 'Michoacán',
        rating: 4.4,
        popular: false,
        tags: ['Cobre', 'Martillado', 'Decorativo'],
        fechaCreacion: new Date('2023-10-20')
      }
    ];
    
    this.categoriasFiltradas = [...this.categorias];
  }

  // ========== FILTROS SIMPLIFICADOS ==========
  
  aplicarFiltroRapido(tipo: string): void {
    this.filtroRapido = tipo;
    
    switch (tipo) {
      case 'populares':
        this.categoriasFiltradas = this.categorias.filter(cat => cat.popular);
        break;
      case 'nuevos':
        const unMesAtras = new Date();
        unMesAtras.setMonth(unMesAtras.getMonth() - 1);
        this.categoriasFiltradas = this.categorias.filter(cat => 
          cat.fechaCreacion && cat.fechaCreacion > unMesAtras
        );
        break;
      default:
        this.categoriasFiltradas = [...this.categorias];
    }
    
    this.ordenarCategorias();
  }

  filtrarCategorias(): void {
    let resultados = [...this.categorias];

    // Filtrar por región
    if (this.filtroRegion) {
      resultados = resultados.filter(cat => cat.region === this.filtroRegion);
    }

    // Filtrar por rating mínimo
    if (this.filtroRating > 0) {
      resultados = resultados.filter(cat => cat.rating >= this.filtroRating);
    }

    this.categoriasFiltradas = resultados;
    this.ordenarCategorias();
  }

  ordenarCategorias(): void {
    switch (this.ordenSeleccionado) {
      case 'nombre':
        this.categoriasFiltradas.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'popularidad':
        this.categoriasFiltradas.sort((a, b) => b.rating - a.rating);
        break;
      case 'productos':
        this.categoriasFiltradas.sort((a, b) => b.totalProductos - a.totalProductos);
        break;
      case 'nuevos':
        this.categoriasFiltradas.sort((a, b) => {
          const fechaA = a.fechaCreacion || new Date(0);
          const fechaB = b.fechaCreacion || new Date(0);
          return fechaB.getTime() - fechaA.getTime();
        });
        break;
    }
  }

  limpiarFiltros(): void {
    this.filtroRapido = 'todos';
    this.filtroRegion = '';
    this.filtroRating = 0;
    this.ordenSeleccionado = 'nombre';
    this.mostrarFiltrosAvanzados = false;
    this.categoriasFiltradas = [...this.categorias];
    this.ordenarCategorias();
  }

  get filtroActivo(): boolean {
    return this.filtroRegion !== '' || 
           this.filtroRapido !== 'todos' ||
           this.filtroRating > 0 ||
           this.ordenSeleccionado !== 'nombre';
  }

  // ========== UTILIDADES ==========
  
  obtenerTotalProductos(): number {
    return this.categorias.reduce((total, cat) => total + cat.totalProductos, 0);
  }

  obtenerTotalArtesanos(): number {
    return this.categorias.reduce((total, cat) => total + cat.artesanos, 0);
  }

  esCategoriaNueva(categoria: Categoria): boolean {
    if (!categoria.fechaCreacion) return false;
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);
    return categoria.fechaCreacion > unMesAtras;
  }

  getTagColor(tag: string): string {
    const tagColors: { [key: string]: string } = {
      'Madera': 'rgba(139, 69, 19, 0.1)',
      'Pintura': 'rgba(255, 99, 132, 0.1)',
      'Fantástico': 'rgba(147, 51, 234, 0.1)',
      'Tejido': 'rgba(59, 130, 246, 0.1)',
      'Bordado': 'rgba(236, 72, 153, 0.1)',
      'Espiritual': 'rgba(234, 179, 8, 0.1)',
      'Barro': 'rgba(120, 53, 15, 0.1)',
      'Vidriado': 'rgba(6, 182, 212, 0.1)',
      'Tradicional': 'rgba(22, 163, 74, 0.1)',
      'Plata': 'rgba(107, 114, 128, 0.1)',
      'Joyería': 'rgba(192, 132, 252, 0.1)',
      'Lujo': 'rgba(245, 158, 11, 0.1)',
      'Natural': 'rgba(34, 197, 94, 0.1)',
      'Utilitario': 'rgba(59, 130, 246, 0.1)',
      'Textil': 'rgba(249, 115, 22, 0.1)',
      'Vestimenta': 'rgba(168, 85, 247, 0.1)',
      'Chaquira': 'rgba(239, 68, 68, 0.1)',
      'Colorido': 'rgba(219, 39, 119, 0.1)',
      'Cobre': 'rgba(180, 83, 9, 0.1)',
      'Martillado': 'rgba(113, 113, 122, 0.1)',
      'Decorativo': 'rgba(16, 185, 129, 0.1)'
    };
    
    return tagColors[tag] || 'rgba(156, 163, 175, 0.1)';
  }

  verCategoria(categoria: Categoria): void {
    console.log('Navegando a categoría:', categoria.nombre);
    this.mostrarNotificacion(`Explorando ${categoria.nombre}`);
  }

  scrollToCategorias(): void {
    if (this.categoriasSection) {
      this.categoriasSection.nativeElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // ========== MANEJO DE IMÁGENES ==========
  
  onImgError(event: Event, categoria: Categoria): void {
    const target = event.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzYzNjM2MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFydGVzYW7DrWE8L3RleHQ+PC9zdmc+';
    target.onerror = null;
    categoria.imagenCargada = false;
  }

  onImgLoad(categoria: Categoria): void {
    categoria.imagenCargada = true;
  }

  mostrarNotificacion(mensaje: string): void {
    const notification = document.createElement('div');
    notification.textContent = mensaje;
    
    const colorPrimary = '#7A1A2C';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colorPrimary};
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

  cerrarSesion(): void {
    if (confirm('¿Cerrar sesión?')) {
      this.mostrarNotificacion('Sesión cerrada exitosamente');
    }
  }
}