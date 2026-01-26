// frontend/src/app/services/chatbot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

//  Interfaz para respuestas del chatbot
export interface ChatResponse {
  success: boolean;
  message: string;
  type?: 'text' | 'map_request' | 'map_response';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private apiUrl = 'http://localhost:3000/chatbot';

  constructor(private http: HttpClient) {}

  /**
   * Obtener saludo de bienvenida
   */
  getGreeting(): Observable<ChatResponse> {
    //  ANTES: return this.http.get<ChatResponse>`${this.apiUrl}/greeting`, {
    //  AHORA: Paréntesis después de .get()
    return this.http.get<ChatResponse>(`${this.apiUrl}/greeting`, {
      withCredentials: true,
    });
  }

  /**
   * Enviar mensaje al chatbot
   */
  sendMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      `${this.apiUrl}/message`,
      { message },
      { withCredentials: true },
    );
  }

  /**
   * 🗺️ Buscar productos cercanos a una ubicación
   */
  getNearbyProducts(lat: number, lng: number, radius: number = 5): Observable<any> {
    // ANTES: return this.http.get`${this.apiUrl}/../products/nearby`, {
    //  AHORA: Paréntesis después de .get()
    return this.http.get(`${this.apiUrl}/../products/nearby`, {
      params: {
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
      },
      withCredentials: true,
    });
  }

  /** Obtener coordenadas desde código postal
   */
  getCoordinatesFromPostalCode(cp: string): Observable<any> {
    return this.http.get(`http://localhost:3000/geocoding/codigo-postal`, {
      params: { cp },
      withCredentials: true,
    });
  }
}
