import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,  // ¡IMPORTANTE! Esto es standalone
  imports: [CommonModule, FormsModule, RouterModule], // Módulos necesarios
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  @Input() cartItems = 0;  // Sin tipo explícito (valor por defecto)
  @Input() showSearch = true;
  @Input() variant: 'default' | 'minimal' = 'default';
  
  @Output() searchEvent = new EventEmitter<string>();  // Cambiado de 'search'
  
  searchQuery = '';
  
  onSearch() {
    if (this.searchQuery.trim()) {
      this.searchEvent.emit(this.searchQuery);
    }
  }
}