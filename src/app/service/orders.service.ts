// src/app/service/orders.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ShippingDetails {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais?: string;
}

export interface CreateOrderDto {
  shippingDetails: ShippingDetails;
  codigoCupon?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  buyerId: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  items: any[];
  payments: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order: {
    id: number;
    orderNumber: string;
    total: number;
  };
  paypal: {
    orderId: string;
    approveUrl: string;
  };
}

export interface CapturePaymentResponse {
  success: boolean;
  message: string;
  order: Order;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  /**
   * Crear orden desde el carrito
   */
  createOrder(createOrderDto: CreateOrderDto): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.apiUrl, createOrderDto, {
      withCredentials: true,
    });
  }

  /**
   * Capturar pago de PayPal
   */
  capturePayment(paypalOrderId: string): Observable<CapturePaymentResponse> {
    return this.http.post<CapturePaymentResponse>(
      `${this.apiUrl}/capture`,
      { paypalOrderId },
      { withCredentials: true },
    );
  }

  /**
   * Obtener órdenes del usuario
   */
  getUserOrders(): Observable<{ success: boolean; count: number; orders: Order[] }> {
    return this.http.get<{ success: boolean; count: number; orders: Order[] }>(this.apiUrl, {
      withCredentials: true,
    });
  }

  /**
   * Obtener detalle de orden
   */
  getOrderById(orderId: number): Observable<{ success: boolean; order: Order }> {
    return this.http.get<{ success: boolean; order: Order }>(`${this.apiUrl}/${orderId}`, {
      withCredentials: true,
    });
  }

  /**
   * Cancelar orden
   */
  cancelOrder(orderId: number): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/${orderId}/cancel`,
      {},
      { withCredentials: true },
    );
  }
}
