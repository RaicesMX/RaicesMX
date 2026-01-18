import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  @Input() variant = 'default';
  @Input() showSearch = true;
  
  searchQuery = '';
  cartItems = 5; // Ejemplo - deberías conectar esto con tu servicio de carrito
  menuOpen = false;

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
      // Implementa tu lógica de búsqueda aquí
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    // Prevenir scroll del body cuando el menú está abierto
    document.body.style.overflow = this.menuOpen ? 'hidden' : '';
  }

  closeMenu(): void {
    this.menuOpen = false;
    document.body.style.overflow = '';
  }
}