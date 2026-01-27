// frontend/src/app/services/map.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as maplibregl from 'maplibre-gl';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private mapConfig: { apiKey: string; styleUrl: string } | null = null;

  constructor(private http: HttpClient) {}

  /**
   *  Obtener configuración del mapa desde el backend
   */
  private async getMapConfig(): Promise<{
    apiKey: string;
    styleUrl: string;
  }> {
    if (this.mapConfig) {
      return this.mapConfig; // Cache
    }

    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/geocoding/map-config`),
      );

      this.mapConfig = {
        apiKey: response.apiKey,
        styleUrl: response.styleUrl,
      };

      console.log('🗺️ Configuración de mapa obtenida:', this.mapConfig);
      return this.mapConfig;
    } catch (error) {
      console.error('❌ Error obteniendo configuración de mapa:', error);
      // Fallback a configuración demo
      return {
        apiKey: 'demo',
        styleUrl: 'https://api.maptiler.com/maps/streets-v2/style.json?key=demo',
      };
    }
  }

  /**
   *  Crear mapa interactivo con marcadores
   */
  async createMap(
    containerId: string,
    userLocation: { lat: number; lng: number },
    products: any[],
  ): Promise<maplibregl.Map | null> {
    try {
      // Obtener configuración del backend
      const config = await this.getMapConfig();

      console.log(` Creando mapa en #${containerId}`);
      console.log(` Centro: (${userLocation.lat}, ${userLocation.lng})`);
      console.log(` Productos a mostrar: ${products.length}`);

      // Crear mapa centrado en la ubicación del usuario
      const map = new maplibregl.Map({
        container: containerId,
        style: config.styleUrl,
        center: [userLocation.lng, userLocation.lat],
        zoom: 12,
      });

      // Agregar controles de navegación
      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Esperar a que el mapa cargue
      map.on('load', () => {
        console.log('✅ Mapa cargado exitosamente');

        //  Marcador del usuario (azul)
        this.addUserMarker(map, userLocation);

        //  Marcadores de productos (rojo)
        products.forEach((product, index) => {
          this.addProductMarker(map, product, index);
        });

        // Ajustar el zoom para que se vean todos los marcadores
        this.fitBounds(map, userLocation, products);
      });

      map.on('error', (e) => {
        console.error(' Error en el mapa:', e);
      });

      return map;
    } catch (error) {
      console.error(' Error creando mapa:', error);
      return null;
    }
  }

  /**
   *  Agregar marcador del usuario (azul)
   */
  private addUserMarker(map: maplibregl.Map, location: { lat: number; lng: number }): void {
    const el = document.createElement('div');
    el.className = 'user-marker';
    el.innerHTML = `
      <div style="
        width: 30px;
        height: 30px;
        background: #4A90E2;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
      ">
    
      </div>
    `;

    new maplibregl.Marker({ element: el })
      .setLngLat([location.lng, location.lat])
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<strong>📍 Tu ubicación</strong>`))
      .addTo(map);

    console.log(' Marcador de usuario agregado');
  }

  /**
   *  Agregar marcador de producto (rojo con popup)
   */
  private addProductMarker(map: maplibregl.Map, product: any, index: number): void {
    if (!product.latitud || !product.longitud) {
      console.warn(` Producto "${product.titulo}" sin coordenadas`);
      return;
    }

    const el = document.createElement('div');
    el.className = 'product-marker';
    el.innerHTML = `
      <div style="
        width: 35px;
        height: 35px;
        background: #E74C3C;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s;
      "
      onmouseover="this.style.transform='scale(1.2)'"
      onmouseout="this.style.transform='scale(1)'"
      >
        ${index + 1}
      </div>
    `;

    const popupHTML = `
      <div style="min-width: 200px;">
        <img 
          src="${product.images?.[0]?.imageUrl || '/assets/placeholder.webp'}" 
          style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
          onerror="this.src='/assets/placeholder.webp'"
        />
        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #2d3748;">
          ${product.titulo}
        </h4>
        <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #667eea;">
          $${product.precio} MXN
        </p>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #48bb78; display: flex; align-items: center; gap: 4px;">
          <span>📍</span> ${product.distance}km de distancia
        </p>
        <p style="margin: 0; font-size: 11px; color: #718096;">
          ${product.colonia}, ${product.municipio}
        </p>
      </div>
    `;

    new maplibregl.Marker({ element: el })
      .setLngLat([product.longitud, product.latitud])
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(popupHTML))
      .addTo(map);

    console.log(
      ` Marcador #${index + 1} agregado: "${product.titulo}" en (${product.latitud}, ${product.longitud})`,
    );
  }

  /**
   * 🔍 Ajustar zoom para que se vean todos los marcadores
   */
  private fitBounds(
    map: maplibregl.Map,
    userLocation: { lat: number; lng: number },
    products: any[],
  ): void {
    const bounds = new maplibregl.LngLatBounds();

    // Agregar ubicación del usuario
    bounds.extend([userLocation.lng, userLocation.lat]);

    // Agregar ubicaciones de productos
    products.forEach((product) => {
      if (product.latitud && product.longitud) {
        bounds.extend([product.longitud, product.latitud]);
      }
    });

    // Ajustar el mapa con padding
    map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 14,
      duration: 1000,
    });

    console.log(' Mapa ajustado para mostrar todos los marcadores');
  }
}
