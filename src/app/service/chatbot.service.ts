// src/app/services/chatbot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
interface ChatResponse {
  success: boolean;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private apiUrl = `${environment.apiUrl}/chatbot`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el saludo de bienvenida
   */
  getGreeting(): Observable<ChatResponse> {
    return this.http.get<ChatResponse>(`${this.apiUrl}/greeting`);
  }

  /**
   * Obtiene la lista de productos
   */
  getProducts(): Observable<ChatResponse> {
    return this.http.get<ChatResponse>(`${this.apiUrl}/products`);
  }

  /**
   * Envía un mensaje al chatbot
   */
  sendMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/message`, { message });
  }

  /**
   * Busca productos
   */
  searchProducts(query: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/search`, { message: query });
  }
}
