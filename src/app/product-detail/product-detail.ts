import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetailComponent {
  productId: number | null = null;
  producto: any; // 👈 Aquí definimos la propiedad individual
  productos = [
    { nombre: 'Alebrije Artesanal', precio: 450, imagen: 'assets/images/Alebrigue_Artesanal.jpg', descripcion: 'Figura artesanal de madera tallada y pintada a mano.' },
    { nombre: 'Blusa Bordada', precio: 380, imagen: 'assets/images/Blusa_Bordada.jpg', descripcion: 'Blusa tradicional con bordado de flores coloridas.' },
    { nombre: 'Cerámica Talavera', precio: 220, imagen: 'assets/images/Ceramica_Talavera.jpg', descripcion: 'Cerámica decorativa típica de Puebla, hecha a mano.' },
    { nombre: 'Jarrón Talavera', precio: 520, imagen: 'assets/images/Jarrón_Talavera.jpg', descripcion: 'Jarrón pintado con motivos florales en estilo Talavera.' },
    { nombre: 'Plato Talavera', precio: 180, imagen: 'assets/images/Plato_Talavera.jpg', descripcion: 'Plato artesanal de cerámica decorado con patrones tradicionales.' },
    { nombre: 'Máscara Huichol', precio: 680, imagen: 'assets/images/Máscara_Huichol.jpg', descripcion: 'Máscara decorativa elaborada con chaquiras huicholes.' }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.producto = this.productos[id]; // 👈 Ya no da error
  }

  volver() {
    this.router.navigate(['/']);
  }

  compartir() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Enlace copiado al portapapeles 📋');
  }
}
