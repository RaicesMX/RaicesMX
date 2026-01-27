// src/app/service/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ==================== INTERFACES ====================
export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    titulo: string;
    descripcion: string;
    precio: number;
    stock: number;
    unidad: string;
    estado: string;
    images: Array<{
      id: number;
      imageUrl: string;
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
  };
}

export interface Cart {
  id: number;
  userId: number;
  subtotal: number;
  envio: number;
  descuento: number;
  total: number;
  codigoCupon: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface CartResponse {
  success: boolean;
  message: string;
  cart: Cart;
}

export interface CartCountResponse {
  success: boolean;
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;

  // Subject para compartir el número de items entre componentes
  private cartItemsCount$ = new BehaviorSubject<number>(0);
  public cartItemsCountObservable = this.cartItemsCount$.asObservable();

  constructor(private http: HttpClient) {
    this.updateCartCount();
  }

  // ==================== OBTENER CARRITO ====================
  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.apiUrl).pipe(
      tap((response) => {
        if (response.success && response.cart) {
          const count = response.cart.items.reduce((sum, item) => sum + item.cantidad, 0);
          this.cartItemsCount$.next(count);
        }
      }),
    );
  }

  // ==================== AGREGAR AL CARRITO ====================
  addToCart(productId: number, cantidad: number = 1): Observable<CartResponse> {
    return this.http
      .post<CartResponse>(`${this.apiUrl}/add`, {
        productId,
        cantidad,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.updateCartCount();
          }
        }),
      );
  }

  // ==================== ACTUALIZAR CANTIDAD ====================
  updateCartItem(itemId: number, cantidad: number): Observable<CartResponse> {
    return this.http
      .patch<CartResponse>(`${this.apiUrl}/items/${itemId}`, {
        cantidad,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.updateCartCount();
          }
        }),
      );
  }

  // ==================== ELIMINAR ITEM ====================
  removeCartItem(itemId: number): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap((response) => {
        if (response.success) {
          this.updateCartCount();
        }
      }),
    );
  }

  // ==================== VACIAR CARRITO ====================
  clearCart(): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/clear`).pipe(
      tap((response) => {
        if (response.success) {
          this.cartItemsCount$.next(0);
        }
      }),
    );
  }

  // ==================== APLICAR CUPÓN ====================
  applyCoupon(codigoCupon: string): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.apiUrl}/coupon`, {
      codigoCupon,
    });
  }

  // ==================== REMOVER CUPÓN ====================
  removeCoupon(): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.apiUrl}/coupon`);
  }

  // ==================== OBTENER CANTIDAD DE ITEMS ====================
  getCartItemsCount(): Observable<CartCountResponse> {
    return this.http.get<CartCountResponse>(`${this.apiUrl}/count`).pipe(
      tap((response) => {
        if (response.success) {
          this.cartItemsCount$.next(response.count);
        }
      }),
    );
  }

  // ==================== ACTUALIZAR CONTADOR ====================
  private updateCartCount(): void {
    this.getCartItemsCount().subscribe({
      next: (response) => {
        console.log('🔢 Items en carrito:', response.count);
      },
      error: (error) => {
        console.error('❌ Error al obtener cantidad de items:', error);
      },
    });
  }

  // ==================== OBTENER IMAGEN DEL PRODUCTO ====================
  getProductImage(item: CartItem): string {
    if (item.product.images && item.product.images.length > 0) {
      const imagenPrincipal = item.product.images.sort((a, b) => a.orden - b.orden)[0];
      return imagenPrincipal.imageUrl;
    }
    return 'assets/images/placeholder-artesania.jpg';
  }
}
