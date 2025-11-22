import { Component, HostListener, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './view-product.html',
  styleUrl: './view-product.scss'
})
export class ViewProductComponent implements OnDestroy {
  
  id!: number;
  cantidad: number = 1;
  calificacionUsuario: number = 0;
  hoverCalificacion: number = 0;
  imagenActiva: number = 0;
  itemsCarrito: number = 3;
  imagenZoomed: boolean = false;
  imagenesCargadas: boolean = false;
  private isBrowser: boolean;

  // Producto por defecto (se actualizará según el ID)
  producto: any = {
    id: 1,
    nombre: "Jarrón de Talavera Poblana",
    precio: 850,
    descripcion: "Hermoso jarrón artesanal de Talavera poblana, elaborado con técnicas tradicionales que datan del siglo XVI. Cada pieza es única y pintada a mano por maestros artesanos.",
    rating: 4.8,
    imagen: "assets/images/Jarrón_Talavera.jpg",
    imagenes: [
      "assets/images/Jarrón_Talavera.jpg",
      "assets/images/Plato_Talavera.jpg",
      "assets/images/Ceramica_Talavera.jpg",
      "assets/images/Ceramica_Cubiertos.jpg"
    ],
    stock: 8,
    caracteristicas: [
      "Pintado completamente a mano",
      "Material: Cerámica de alta calidad",
      "Técnica: Talavera auténtica",
      "Colores minerales naturales"
    ],
    envio: {
      fecha: "Envío mañana",
      costo: 79,
      devolucion: "Gratis 30 días"
    },
    vendedor: {
      nombre: "Artesanos de Puebla",
      reputacion: "Excelente",
      ventas: 1240
    },
    resenas: [
      { usuario: "Ana G.", rating: 5, comentario: "La calidad es excepcional, superó mis expectativas." },
      { usuario: "Carlos M.", rating: 4, comentario: "Muy bonito, llegó perfectamente empacado." }
    ]
  };

  productosRelacionados = [
    {
      id: 2,
      nombre: "Blusa Bordada Tradicional",
      precio: 450,
      imagen: "assets/images/Blusa_Bordada.jpg"
    },
    {
      id: 3,
      nombre: "Máscara Huichol Artesanal",
      precio: 620,
      imagen: "assets/images/Máscara_Huichol.jpg"
    },
    {
      id: 4,
      nombre: "Alebrije Mexicano",
      precio: 720,
      imagen: "assets/images/Alebrigue_Artesanal.jpg"
    },
    {
      id: 5,
      nombre: "Jaguar Cerámico",
      precio: 380,
      imagen: "assets/images/Jaguar_ceramico.jpg"
    },
    {
      id: 6,
      nombre: "Prendas Textiles",
      precio: 290,
      imagen: "assets/images/Prendas_textiles.jpg"
    }
  ];

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID del producto:', this.id);
    
    // Cargar producto según ID
    this.cargarProductoPorId(this.id);
  }

  // 🟦 Cargar producto por ID - CORREGIDO
  cargarProductoPorId(id: number) {
    // Base de datos simulada de productos con firma de índice
    const productos: { [key: number]: any } = {
      1: {
        id: 1,
        nombre: "Jarrón de Talavera Poblana",
        precio: 850,
        descripcion: "Hermoso jarrón artesanal de Talavera poblana, elaborado con técnicas tradicionales que datan del siglo XVI. Cada pieza es única y pintada a mano por maestros artesanos.",
        rating: 4.8,
        imagen: "assets/images/Jarrón_Talavera.jpg",
        imagenes: [
          "assets/images/Jarrón_Talavera.jpg",
          "assets/images/Plato_Talavera.jpg",
          "assets/images/Ceramica_Talavera.jpg",
          "assets/images/Ceramica_Cubiertos.jpg"
        ],
        stock: 8,
        caracteristicas: [
          "Pintado completamente a mano",
          "Material: Cerámica de alta calidad",
          "Técnica: Talavera auténtica",
          "Colores minerales naturales"
        ],
        envio: {
          fecha: "Envío mañana",
          costo: 79,
          devolucion: "Gratis 30 días"
        },
        vendedor: {
          nombre: "Artesanos de Puebla",
          reputacion: "Excelente",
          ventas: 1240
        },
        resenas: [
          { usuario: "Ana G.", rating: 5, comentario: "La calidad es excepcional, superó mis expectativas." },
          { usuario: "Carlos M.", rating: 4, comentario: "Muy bonito, llegó perfectamente empacado." }
        ]
      },
      2: {
        id: 2,
        nombre: "Alebrije Artesanal",
        precio: 450,
        descripcion: "Colorido alebrije artesanal mexicano, tallado en madera y pintado a mano por artesanos oaxaqueños. Cada pieza es única y representa la rica tradición mexicana.",
        rating: 4.7,
        imagen: "assets/images/Alebrigue_Artesanal.jpg",
        imagenes: [
          "assets/images/Alebrigue_Artesanal.jpg"
        ],
        stock: 5,
        caracteristicas: [
          "Tallado completamente a mano",
          "Material: Madera de copal",
          "Pintura natural mineral",
          "Protección con barniz natural"
        ],
        envio: {
          fecha: "Envío en 3 días",
          costo: 65,
          devolucion: "Gratis 30 días"
        },
        vendedor: {
          nombre: "Artesanos de Oaxaca",
          reputacion: "Excelente",
          ventas: 890
        },
        resenas: [
          { usuario: "María L.", rating: 5, comentario: "Los colores son vibrantes y la calidad excelente." },
          { usuario: "Roberto S.", rating: 4, comentario: "Muy bonito, perfecto para decoración." }
        ]
      },
      3: {
        id: 3,
        nombre: "Blusa Bordada Tradicional",
        precio: 380,
        descripcion: "Hermosa blusa tradicional bordada a mano con hilos de seda. Inspirada en los trajes típicos de diferentes regiones de México. Confeccionada con algodón 100% natural.",
        rating: 4.6,
        imagen: "assets/images/Blusa_Bordada.jpg",
        imagenes: [
          "assets/images/Blusa_Bordada.jpg"
        ],
        stock: 12,
        caracteristicas: [
          "Bordado completamente a mano",
          "Material: Algodón 100% natural",
          "Hilos de seda natural",
          "Tallas disponibles: S, M, L"
        ],
        envio: {
          fecha: "Envío mañana",
          costo: 45,
          devolucion: "Gratis 30 días"
        },
        vendedor: {
          nombre: "Tejedoras Mexicanas",
          reputacion: "Excelente", 
          ventas: 1560
        },
        resenas: [
          { usuario: "Laura G.", rating: 5, comentario: "El bordado es impresionante, muy buena calidad." },
          { usuario: "Sofia R.", rating: 4, comentario: "Muy cómoda y bonita, llega perfecta." }
        ]
      },
      4: {
        id: 4,
        nombre: "Cerámica Talavera",
        precio: 220,
        descripcion: "Auténtica cerámica de Talavera con diseños tradicionales. Cada pieza es única y certificada como Talavera original. Perfecta para decorar tu hogar.",
        rating: 4.5,
        imagen: "assets/images/Ceramica_Talavera.jpg",
        imagenes: [
          "assets/images/Ceramica_Talavera.jpg"
        ],
        stock: 15,
        caracteristicas: [
          "Cerámica certificada Talavera",
          "Pintura mineral natural",
          "Cocción tradicional",
          "Resistente al horno y microondas"
        ],
        envio: {
          fecha: "Envío en 2 días",
          costo: 55,
          devolucion: "Gratis 30 días"
        },
        vendedor: {
          nombre: "Alfareros de Puebla",
          reputacion: "Excelente",
          ventas: 2100
        },
        resenas: [
          { usuario: "Carlos P.", rating: 5, comentario: "Auténtica Talavera, hermosa calidad." },
          { usuario: "Ana M.", rating: 4, comentario: "Perfecta para mi cocina, muy resistente." }
        ]
      },
      5: {
        id: 5,
        nombre: "Máscara Huichol Artesanal", 
        precio: 620,
        descripcion: "Máscara tradicional huichol elaborada con chaquira y semillas. Representa la rica cultura wixárika y sus tradiciones ancestrales. Cada cuenta es colocada manualmente.",
        rating: 4.9,
        imagen: "assets/images/Máscara_Huichol.jpg",
        imagenes: [
          "assets/images/Máscara_Huichol.jpg"
        ],
        stock: 3,
        caracteristicas: [
          "Chaquira colocada manualmente",
          "Diseños tradicionales huicholes", 
          "Marco de madera natural",
          "Técnica ancestral"
        ],
        envio: {
          fecha: "Envío en 4 días",
          costo: 85,
          devolucion: "Gratis 30 días"
        },
        vendedor: {
          nombre: "Comunidad Wixárika",
          reputacion: "Excelente",
          ventas: 340
        },
        resenas: [
          { usuario: "Miguel A.", rating: 5, comentario: "Obra de arte, el trabajo es impresionante." },
          { usuario: "Elena C.", rating: 5, comentario: "Increíble detalle, vale cada peso." }
        ]
      },
      6: {
        id: 6,
        nombre: "Plato Talavera Decorativo",
        precio: 180,
        descripcion: "Plato decorativo de Talavera con diseños azules tradicionales. Perfecto para servir o como pieza decorativa. Certificado como Talavera original.",
        rating: 4.4,
        imagen: "assets/images/Plato_Talavera.jpg", 
        imagenes: [
          "assets/images/Plato_Talavera.jpg"
        ],
        stock: 20,
        caracteristicas: [
          "Diámetro: 25 cm",
          "Cerámica de alta calidad",
          "Diseños azules tradicionales",
          "Apto para alimentos"
        ],
        envio: {
          fecha: "Envío mañana", 
          costo: 50,
          devolucion: "Gratis 30 días"
        },
        vendedor: {
          nombre: "Ceramistas Mexicanos",
          reputacion: "Excelente",
          ventas: 1780
        },
        resenas: [
          { usuario: "Patricia L.", rating: 4, comentario: "Muy bonito, perfecto tamaño." },
          { usuario: "Javier M.", rating: 5, comentario: "Los colores son vibrantes, excelente calidad." }
        ]
      }
    };

    // Cargar el producto según el ID, o mantener el default si no existe
    const productoEncontrado = productos[id];
    if (productoEncontrado) {
      this.producto = productoEncontrado;
    } else {
      console.log('Producto no encontrado, usando producto default');
    }
  }

  // 🟦 Sistema de calificación
  calificar(rating: number) {
    this.calificacionUsuario = rating;
    console.log(`Calificación dada: ${rating} estrellas`);
  }

  // 🟦 Cambiar imagen de la galería (MEJORADO)
  cambiarImagen(index: number) {
    // Si está en zoom, primero cerrar el zoom suavemente
    if (this.imagenZoomed) {
      this.imagenZoomed = false;
      if (this.isBrowser) {
        document.body.style.overflow = '';
      }
      
      // Pequeño delay para que la transición sea suave
      setTimeout(() => {
        this.imagenActiva = index;
        this.producto.imagen = this.producto.imagenes[index];
      }, 300);
    } else {
      // Cambio normal sin zoom
      this.imagenActiva = index;
      this.producto.imagen = this.producto.imagenes[index];
    }
  }

  // 🟦 Botón de compartir
  compartir() {
    if (navigator.share) {
      navigator.share({
        title: this.producto.nombre,
        text: this.producto.descripcion,
        url: window.location.href,
      })
      .then(() => console.log('Compartido exitosamente'))
      .catch((error) => console.log('Error al compartir', error));
    } else {
      alert("Compartido en redes sociales (simulación)");
    }
  }

  // 🟦 Aumentar cantidad
  aumentar() {
    if (this.cantidad < this.producto.stock) this.cantidad++;
  }

  // 🟦 Disminuir cantidad
  disminuir() {
    if (this.cantidad > 1) this.cantidad--;
  }

  // 🟦 Comprar ahora
  comprarAhora() {
    alert(`Redirigiendo a checkout con ${this.cantidad} unidades de ${this.producto.nombre}`);
  }

  // 🟦 Agregar al carrito
  agregarAlCarrito() {
    this.itemsCarrito += this.cantidad;
    alert(`Agregado al carrito: ${this.cantidad} x ${this.producto.nombre}`);
  }

  // 🟦 Ver producto relacionado
  verProducto(id: number) {
    this.router.navigate(['/producto', id]);
  }

  // === MÉTODOS DE ZOOM CORREGIDOS ===

  // 🟦 Alternar zoom de la imagen
  alternarZoom() {
    this.imagenZoomed = !this.imagenZoomed;
    
    if (this.isBrowser) {
        if (this.imagenZoomed) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
  }

  // 🟦 Cerrar zoom (con prevención de evento)
  cerrarZoom(event: Event) {
    event.stopPropagation(); // IMPORTANTE: prevenir propagación
    this.imagenZoomed = false;
    if (this.isBrowser) {
        document.body.style.overflow = '';
    }
  }

  // 🟦 Verificar cuando las imágenes se cargan
  onImageLoad() {
    this.imagenesCargadas = true;
  }

  // 🟦 Cerrar zoom con tecla ESC (CORREGIDO)
  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (this.isBrowser && event.key === 'Escape' && this.imagenZoomed) {
      this.imagenZoomed = false;
      document.body.style.overflow = '';
    }
  }

  // 🟦 Cleanup al destruir el componente (CORREGIDO)
  ngOnDestroy() {
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  // 🟦 Verificar página activa para resaltar en el header
  esPaginaActiva(ruta: string): boolean {
    if (typeof window !== 'undefined') {
        return window.location.pathname === ruta;
    }
    return false;
  }
}