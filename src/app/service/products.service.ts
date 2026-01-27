// src/app/service/products.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductImage {
  id: number;
  imageUrl: string;
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

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
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
  unidad?: string;
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

  getProductById(id: number): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  getCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(`${this.apiUrl}/categories`, {
      withCredentials: true,
    });
  }

  getMyProducts(): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}/my-products`, {
      withCredentials: true,
    });
  }

  createProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData, {
      withCredentials: true,
    });
  }

  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, formData, {
      withCredentials: true,
    });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
