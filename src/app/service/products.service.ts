// src/app/service/products.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

// Interfaces basadas en tu backend
export interface ProductImage {
  id: number;
  imageUrl: string; // 👈 Según tu backend es "imageUrl"
  publicId: string;
  orden: number;
}

export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
}

export interface ProductSeller {
  id: number;
  fullName: string;
  email: string;
}

export interface Product {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  stock: number;
  unidad: string;
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  codigoPostal: string;
  municipio: string;
  estado: string;
  referencia?: string;
  latitud: number;
  longitud: number;
  vistas: number;
  ventas: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  category: Category;
  seller: ProductSeller;
}

// Respuesta del endpoint GET /products (según tu backend)
export interface ProductsResponse {
  success: boolean;
  count: number; // Productos en la página actual
  total: number; // Total de productos
  page: number; // Página actual
  limit: number; // Productos por página
  products: Product[];
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  categories: Category[];
}

export interface ProductDetailResponse {
  success: boolean;
  product: Product;
}

export interface ProductsQueryParams {
  categoryId?: number;
  estado?: string;
  minPrecio?: number;
  maxPrecio?: number;
  search?: string;
  ordenar?: 'recientes' | 'precio_asc' | 'precio_desc' | 'mas_vendidos';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  /**
   * Obtener productos con filtros y paginación
   */
  getProducts(params?: ProductsQueryParams): Observable<ProductsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof ProductsQueryParams];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ProductsResponse>(this.apiUrl, {
      params: httpParams,
      withCredentials: true,
    });
  }

  /**
   * Obtener detalle de un producto específico
   */
  getProductById(id: number): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Obtener todas las categorías
   */
  getCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(`${this.apiUrl}/categories`, {
      withCredentials: true,
    });
  }

  /**
   * Obtener productos del vendedor actual (requiere autenticación)
   */
  getMyProducts(): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}/my-products`, {
      withCredentials: true,
    });
  }

  /**
   * Crear un nuevo producto (solo vendedores)
   */
  createProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData, {
      withCredentials: true,
    });
  }

  /**
   * Actualizar un producto (solo dueño)
   */
  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, formData, {
      withCredentials: true,
    });
  }

  /**
   * Eliminar un producto (solo dueño)
   */
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Buscar productos por término
   */
  searchProducts(
    searchTerm: string,
    page: number = 1,
    limit: number = 12,
  ): Observable<ProductsResponse> {
    return this.getProducts({
      search: searchTerm,
      page,
      limit,
    });
  }

  /**
   * Filtrar por categoría
   */
  getProductsByCategory(categoryId: number, page: number = 1): Observable<ProductsResponse> {
    return this.getProducts({
      categoryId,
      page,
    });
  }

  /**
   * Filtrar por rango de precio
   */
  getProductsByPriceRange(
    minPrecio: number,
    maxPrecio: number,
    page: number = 1,
  ): Observable<ProductsResponse> {
    return this.getProducts({
      minPrecio,
      maxPrecio,
      page,
    });
  }

  /**
   * Filtrar por estado
   */
  getProductsByEstado(estado: string, page: number = 1): Observable<ProductsResponse> {
    return this.getProducts({
      estado,
      page,
    });
  }

  /**
   * Obtener productos más vendidos
   */
  getBestSellers(limit: number = 12): Observable<ProductsResponse> {
    return this.getProducts({
      ordenar: 'mas_vendidos',
      limit,
    });
  }

  /**
   * Obtener productos más recientes
   */
  getNewestProducts(limit: number = 12): Observable<ProductsResponse> {
    return this.getProducts({
      ordenar: 'recientes',
      limit,
    });
  }
}
