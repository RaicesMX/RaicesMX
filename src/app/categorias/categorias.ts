import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/components/header/header';

// Interface para las categorías
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
}

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.scss']
})
export class CategoriasComponent {
  // ← AQUÍ ESTÁ LA LÍNEA QUE FALTABA (para el badge del carrito)
  itemsCarrito: number = 3;   // Cambia este número cuando quieras: 0, 5, 12...

  // Lista completa de categorías
  // Lista completa de categorías CORREGIDA
categorias: Categoria[] = [
  {
    id: 1,
    nombre: 'Alebrijes',
    descripcion: 'Coloridas figuras fantásticas talladas en madera, originarias de Oaxaca',
    descripcionCorta: 'Figuras fantásticas de madera pintada a mano',
    // CORREGIR: Usar la ruta correcta según tus archivos
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
    // CORREGIR: Tienes "Textiles Huichole.jpg" (en singular)
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
    // Tienes varias imágenes de Talavera, elige una:
    imagen: 'assets/images/Ceramica_Talavera.jpg', // O 'assets/images/Jarrón_Talavera.jpg'
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
    // Tienes este archivo
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
    // Tienes este archivo
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
    // Tienes este archivo
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
    // Tienes este archivo (nota el espacio en el nombre)
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
    // Tienes este archivo
    imagen: 'assets/images/Cobre Martillado.jfif',
    totalProductos: 15,
    artesanos: 3,
    region: 'Michoacán',
    rating: 4.4,
    popular: false,
    tags: ['Cobre', 'Martillado', 'Decorativo'],
    fechaCreacion: new Date('2023-10-20')
  },
  {
      id: 8,
      nombre: 'Cobre Martillado',
      descripcion: 'Objetos decorativos y utilitarios en cobre trabajado a mano',
      descripcionCorta: 'Objetos en cobre trabajado artesanalmente',
      imagen: 'assets/images/Cobre Martillado1.jpg',
      totalProductos: 15,
      artesanos: 3,
      region: 'Michoacán',
      rating: 4.4,
      popular: false,
      tags: ['Cobre', 'Martillado', 'Decorativo'],
      fechaCreacion: new Date('2023-10-20')
    }
  ];

  // Categorías filtradas
  categoriasFiltradas: Categoria[] = [...this.categorias];

  // Filtros y estados
  terminoBusqueda: string = '';
  filtroRegion: string = '';
  filtroRapido: string = 'todos';
  filtroRating: number = 0;
  filtroArtesanos: string = '';
  ordenSeleccionado: string = 'nombre';
  mostrarFiltrosAvanzados: boolean = false;
  cargando: boolean = false;

  // Regiones disponibles
  regiones: string[] = ['Oaxaca', 'Puebla', 'Jalisco', 'Guerrero', 'Michoacán', 'Nayarit'];

  // Colores para tags
  tagColors: { [key: string]: string } = {
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

  // ──────── MÉTODOS (todo igual que tenías) ────────
  get categoriasPopulares(): Categoria[] {
    return this.categorias.filter(cat => cat.popular).slice(0, 3);
  }

  obtenerTotalProductos(): number {
    return this.categorias.reduce((total, cat) => total + cat.totalProductos, 0);
  }

  obtenerTotalArtesanos(): number {
    return this.categorias.reduce((total, cat) => total + cat.artesanos, 0);
  }

  get filtroActivo(): boolean {
    return this.terminoBusqueda !== '' || 
          this.filtroRegion !== '' || 
          this.filtroRapido !== 'todos' ||
          this.filtroRating > 0 ||
          this.filtroArtesanos !== '';
  }

  // 🟦 Aplicar filtro rápido
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

  // 🟦 Limpiar búsqueda específica
  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.filtrarCategorias();
  }

  // 🟦 Toggle filtros avanzados
  toggleFiltrosAvanzados(): void {
    this.mostrarFiltrosAvanzados = !this.mostrarFiltrosAvanzados;
  }

  // 🟦 Verificar si categoría es nueva
  esCategoriaNueva(categoria: Categoria): boolean {
    if (!categoria.fechaCreacion) return false;
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);
    return categoria.fechaCreacion > unMesAtras;
  }

  // 🟦 Obtener color para tag
  getTagColor(tag: string): string {
    return this.tagColors[tag] || 'rgba(156, 163, 175, 0.1)';
  }

  // 🟦 Filtrar categorías
  filtrarCategorias(): void {
    let resultados = [...this.categorias];

    // Filtrar por término de búsqueda
    if (this.terminoBusqueda) {
      resultados = resultados.filter(cat =>
        cat.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        cat.descripcion.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        cat.tags.some(tag => tag.toLowerCase().includes(this.terminoBusqueda.toLowerCase()))
      );
    }

    // Filtrar por región
    if (this.filtroRegion) {
      resultados = resultados.filter(cat => cat.region === this.filtroRegion);
    }

    // Filtrar por rating mínimo
    if (this.filtroRating > 0) {
      resultados = resultados.filter(cat => cat.rating >= this.filtroRating);
    }

    // Filtrar por cantidad de artesanos
    if (this.filtroArtesanos) {
      const minArtesanos = parseInt(this.filtroArtesanos);
      resultados = resultados.filter(cat => cat.artesanos >= minArtesanos);
    }

    this.categoriasFiltradas = resultados;
    this.ordenarCategorias();
  }

  // 🟦 Ordenar categorías
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

  // 🟦 Limpiar todos los filtros
  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroRegion = '';
    this.filtroRapido = 'todos';
    this.filtroRating = 0;
    this.filtroArtesanos = '';
    this.ordenSeleccionado = 'nombre';
    this.mostrarFiltrosAvanzados = false;
    this.categoriasFiltradas = [...this.categorias];
    this.ordenarCategorias();
  }

  // 🟦 Cargar más categorías (simulación)
  cargarMasCategorias(): void {
    this.cargando = true;
    
    // Simular carga de más categorías
    setTimeout(() => {
      // En una implementación real, aquí cargarías más datos del servidor
      this.cargando = false;
      alert('Funcionalidad de carga implementada - En desarrollo');
    }, 1500);
  }

  // 🟦 Ver categoría (navegar a productos de esa categoría)
  verCategoria(categoria: Categoria): void {
    // Aquí iría la navegación a la página de productos de esa categoría
    console.log('Navegando a categoría:', categoria.nombre);
    alert(`Navegando a productos de: ${categoria.nombre}`);
    
    // Ejemplo de navegación (descomentar cuando tengas la ruta)
    // this.router.navigate(['/productos'], { queryParams: { categoria: categoria.id } });
  }
    // === HEADER GLOBAL 2025 (igual que en las otras páginas) ===
  esMovil = false;
  menuAbierto = false;
  menuMovilAbierto = false;

  usuario = {
    nombre: 'Juan Pérez Rodríguez',
    email: 'juan.perez@email.com',
    foto: null
  };

  ngOnInit() {
    this.esMovil = window.innerWidth <= 992;
  }

  @HostListener('window:resize')
  onResize() {
    this.esMovil = window.innerWidth <= 992;
    if (!this.esMovil) this.menuMovilAbierto = false;
  }

  toggleMenu() { this.menuAbierto = !this.menuAbierto; }
  toggleMenuMovil() { this.menuMovilAbierto = !this.menuMovilAbierto; }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (! (event.target as HTMLElement).closest('.user-menu')) {
      this.menuAbierto = false;
    }
  }

  cerrarSesion() {
    if (confirm('¿Cerrar sesión?')) {
      alert('Sesión cerrada');
    }
  }

}