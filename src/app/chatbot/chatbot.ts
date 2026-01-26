// chatbot.component.ts
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy, // ✅ NUEVO
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatbotService } from '../service/chatbot.service';
import { MapService } from '../service/map.service'; // ✅ NUEVO
import * as maplibregl from 'maplibre-gl'; // ✅ NUEVO

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  id: number;
  type?: 'text' | 'map_request' | 'map_response';
  data?: {
    userLocation?: { lat: number; lng: number };
    products?: any[];
    radius?: number;
  };
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.scss'],
})
export class Chatbot implements OnInit, AfterViewInit, OnDestroy {
  // ✅ AGREGAR OnDestroy
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  sidebarOpen = false;
  userMessage = '';
  isTyping = false;
  isLoadingLocation = false;
  locationError = '';
  messages: Message[] = [];
  private messageIdCounter = 0;
  private maps: Map<number, maplibregl.Map> = new Map();

  // ✅ NUEVO: Variables para ubicación manual
  showManualLocationInput = false;
  manualPostalCode = '';
  isLoadingPostalCode = false;

  quickQuestions = [
    '¿Qué productos artesanales tienen?',
    '¿Cómo puedo vender mis productos?',
    '¿Cuáles son los requisitos para registrarme?',
    '¿Cómo contacto a un vendedor?',
    '¿Cuáles son las tarifas de la plataforma?',
    '¿Tienen cerámica de Talavera?',
  ];

  helpCategories = [
    { icon: 'shopping_cart', title: 'Compras', desc: 'Información sobre productos y pedidos' },
    { icon: 'storefront', title: 'Ventas', desc: 'Vender tus productos artesanales' },
    { icon: 'person_add', title: 'Registro', desc: 'Crear tu cuenta en RaícesMX' },
    { icon: 'support_agent', title: 'Soporte', desc: 'Ayuda técnica y asistencia' },
  ];

  constructor(
    private chatbotService: ChatbotService,
    private cdr: ChangeDetectorRef,
    private mapService: MapService, // ✅ NUEVO
  ) {}

  async ngOnInit() {
    document.title = 'Asistente Virtual - RaícesMX';
    await this.loadWelcomeMessage();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
    setTimeout(() => {
      this.messageInput?.nativeElement.focus();
    }, 500);
  }

  // ✅ NUEVO: Limpiar mapas al destruir el componente
  ngOnDestroy() {
    this.maps.forEach((map) => map.remove());
    this.maps.clear();
    console.log('🗑️ Mapas limpiados');
  }

  // ==========================================
  // 🔹 Responsive Sidebar
  // ==========================================
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  // ==========================================
  // 🔹 Mensajes con Backend
  // ==========================================

  private loadWelcomeMessage() {
    this.chatbotService.getGreeting().subscribe({
      next: (response) => {
        console.log('📨 Saludo recibido:', response.message);
        this.addMessage(response.message, 'bot');
      },
      error: (error) => {
        console.error('❌ Error al obtener saludo:', error);
        this.addMessage(
          '¡Hola! 👋 Soy el asistente virtual de RaícesMX. ¿En qué puedo ayudarte hoy? 🇲🇽',
          'bot',
        );
      },
    });
  }

  sendMessage() {
    const trimmedMessage = this.userMessage.trim();
    if (!trimmedMessage) return;

    console.log('🚀 Enviando mensaje:', trimmedMessage);

    this.closeSidebar();
    this.addMessage(trimmedMessage, 'user');
    console.log('✅ Mensaje del usuario agregado. Total:', this.messages.length);

    const currentMessage = trimmedMessage;
    this.userMessage = '';

    setTimeout(() => {
      this.messageInput?.nativeElement.focus();
    }, 0);

    this.isTyping = true;
    this.cdr.detectChanges();

    this.chatbotService.sendMessage(currentMessage).subscribe({
      next: (response) => {
        console.log('📨 Respuesta del bot recibida:', response);

        this.isTyping = false;
        this.cdr.detectChanges();

        if (response.type === 'map_request') {
          this.handleMapRequest(response.message);
        } else {
          this.addMessage(response.message, 'bot');
        }

        console.log('✅ Respuesta agregada. Total:', this.messages.length);
      },
      error: (error) => {
        console.error('❌ Error al enviar mensaje:', error);
        this.isTyping = false;
        this.cdr.detectChanges();
        this.addMessage(
          'Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta de nuevo. 😊',
          'bot',
        );
      },
    });
  }

  // ==========================================
  // 🔹 Manejar solicitud de mapa
  // ==========================================
  private handleMapRequest(message: string) {
    this.addMessageWithType(message, 'bot', 'map_request');
    this.showManualLocationInput = false; // Reset
    // ❌ NO llamar requestUserLocation() aquí (el usuario debe hacer clic)
    console.log('🗺️ Esperando que el usuario elija método de ubicación');
  }

  // ==========================================
  // 🔹 Alternar input manual de ubicación
  // ==========================================
  toggleManualLocationInput() {
    this.showManualLocationInput = !this.showManualLocationInput;
    this.manualPostalCode = '';
    this.locationError = '';
  }

  // ==========================================
  // 🔹 Buscar por código postal
  // ==========================================
  searchByPostalCode() {
    const cp = this.manualPostalCode.trim();

    if (!/^\d{5}$/.test(cp)) {
      this.locationError = '❌ Por favor ingresa un código postal válido de 5 dígitos';
      return;
    }

    this.isLoadingPostalCode = true;
    this.locationError = '';
    this.cdr.detectChanges();

    console.log(`🔍 Buscando coordenadas para CP: ${cp}...`);

    // Llamar al backend para obtener coordenadas del CP
    this.chatbotService.getCoordinatesFromPostalCode(cp).subscribe({
      next: (response) => {
        console.log('📍 Coordenadas del CP:', response);

        // ✅ Mantener loading activo hasta que termine la búsqueda
        // this.isLoadingPostalCode = false; // ← NO apagar aquí
        this.showManualLocationInput = false;
        this.manualPostalCode = '';

        // ✅ CORRECCIÓN: Acceder a response.data
        const lat = response.data.latitud;
        const lng = response.data.longitud;

        console.log(`✅ CP ${cp} → (${lat}, ${lng}) - Buscando productos...`);

        // Agregar mensaje temporal
        this.addMessage(
          `📍 Ubicación encontrada: ${response.data.colonia}, ${response.data.municipio}. Buscando productos cercanos...`,
          'bot',
        );

        // Buscar productos con las coordenadas obtenidas
        this.fetchNearbyProducts(lat, lng);

        // Apagar loading después de iniciar búsqueda
        this.isLoadingPostalCode = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error obteniendo coordenadas del CP:', error);
        this.isLoadingPostalCode = false;
        this.locationError = '❌ Código postal no encontrado. Intenta con otro.';
        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // 🔹 Solicitar ubicación del usuario
  // ==========================================
  requestUserLocation() {
    this.isLoadingLocation = true;
    this.locationError = '';
    this.cdr.detectChanges();

    if (!navigator.geolocation) {
      this.locationError = 'Tu navegador no soporta geolocalización.';
      this.isLoadingLocation = false;
      this.addMessage(
        '❌ Tu navegador no soporta geolocalización. Por favor, actualiza tu navegador.',
        'bot',
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log('📍 Ubicación obtenida:', { lat, lng });

        this.isLoadingLocation = false;
        this.fetchNearbyProducts(lat, lng);
      },
      (error) => {
        console.error('❌ Error obteniendo ubicación:', error);
        this.isLoadingLocation = false;

        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              '❌ Necesito tu permiso para acceder a tu ubicación. Por favor, permite el acceso en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '❌ No pude obtener tu ubicación. Intenta de nuevo.';
            break;
          case error.TIMEOUT:
            errorMessage = '❌ La solicitud de ubicación expiró. Intenta de nuevo.';
            break;
          default:
            errorMessage = '❌ Error desconocido al obtener ubicación.';
        }

        this.locationError = errorMessage;
        this.addMessage(errorMessage, 'bot');
        this.cdr.detectChanges();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  // ==========================================
  // 🔹 Buscar productos cercanos
  // ==========================================
  private fetchNearbyProducts(lat: number, lng: number, radius: number = 50) {
    this.isTyping = true;
    this.cdr.detectChanges();

    console.log(`🔍 Buscando productos en radio de ${radius}km desde (${lat}, ${lng})`);

    this.chatbotService.getNearbyProducts(lat, lng, radius).subscribe({
      next: (response) => {
        console.log('🗺️ Productos cercanos:', response);

        this.isTyping = false;

        if (response.count === 0) {
          this.addMessage(
            `😔 No encontré productos artesanales en un radio de ${radius}km de tu ubicación.`,
            'bot',
          );
        } else {
          const messageData = {
            userLocation: { lat, lng },
            products: response.products,
            radius,
          };

          // ✅ GUARDAR el ID del mensaje ANTES de incrementar
          const messageId = this.messageIdCounter;

          // Agregar mensaje con datos del mapa
          this.addMessageWithType(
            `🗺️ Encontré ${response.count} producto(s) artesanal(es) cerca de ti:`,
            'bot',
            'map_response',
            messageData,
          );

          // ✅ NUEVO: Renderizar mapa después de agregar el mensaje
          this.renderMapAfterView(messageId, messageData);
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error buscando productos cercanos:', error);
        this.isTyping = false;
        this.addMessage(
          '❌ Hubo un error al buscar productos cercanos. Por favor, intenta de nuevo.',
          'bot',
        );
        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // 🗺️ NUEVO: Renderizar mapa después de agregar mensaje
  // ==========================================
  private renderMapAfterView(messageId: number, data: any): void {
    setTimeout(() => {
      const containerId = `map-${messageId}`;
      const container = document.getElementById(containerId);

      if (!container) {
        console.error(`❌ No se encontró el contenedor del mapa: #${containerId}`);
        console.log(
          '🔍 Contenedores disponibles:',
          Array.from(document.querySelectorAll('[id^="map-"]')).map((el) => el.id),
        );
        return;
      }

      console.log(`🗺️ Renderizando mapa en #${containerId}`);
      console.log('📦 Datos del mapa:', data);

      // Limpiar mapa anterior si existe
      if (this.maps.has(messageId)) {
        console.log(`🗑️ Eliminando mapa anterior #${messageId}`);
        this.maps.get(messageId)?.remove();
        this.maps.delete(messageId);
      }

      // Crear nuevo mapa
      this.mapService
        .createMap(containerId, data.userLocation, data.products)
        .then((map) => {
          if (map) {
            this.maps.set(messageId, map);
            console.log(`✅ Mapa #${messageId} creado exitosamente`);
          } else {
            console.error('❌ No se pudo crear el mapa');
          }
        })
        .catch((error) => {
          console.error('❌ Error al crear el mapa:', error);
        });
    }, 300); // Esperar a que Angular renderice el DOM
  }

  // ==========================================
  // 🔹 Agregar mensaje con tipo y datos
  // ==========================================
  private addMessageWithType(
    text: string,
    sender: 'user' | 'bot',
    type: 'text' | 'map_request' | 'map_response',
    data?: any,
  ) {
    const newMessage: Message = {
      text,
      sender,
      timestamp: new Date(),
      id: this.messageIdCounter++, // Incrementa DESPUÉS de asignar
      type,
      data,
    };

    this.messages = [...this.messages, newMessage];

    console.log('📝 Mensaje con tipo agregado:', newMessage);
    console.log('📋 Total de mensajes:', this.messages.length);

    setTimeout(() => {
      this.scrollToBottom();
      this.cdr.detectChanges();
    }, 50);
  }

  private addMessage(text: string, sender: 'user' | 'bot') {
    const newMessage: Message = {
      text,
      sender,
      timestamp: new Date(),
      id: this.messageIdCounter++,
    };

    this.messages = [...this.messages, newMessage];

    console.log('📝 Mensaje agregado:', newMessage);
    console.log('📋 Array actual:', this.messages);

    setTimeout(() => {
      this.scrollToBottom();
      this.cdr.detectChanges();
    }, 50);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  selectQuickQuestion(question: string) {
    this.userMessage = question;
    this.sendMessage();
    this.closeSidebar();
  }

  selectHelpCategory(category: string) {
    const categoryMessages: { [key: string]: string } = {
      Compras: '¿Cómo puedo comprar productos artesanales?',
      Ventas: '¿Cómo puedo vender mis productos artesanales?',
      Registro: '¿Cómo me registro en la plataforma?',
      Soporte: 'Necesito ayuda con soporte técnico',
    };

    this.userMessage = categoryMessages[category];
    this.sendMessage();
    this.closeSidebar();
  }

  clearChat() {
    // Limpiar mapas antes de borrar mensajes
    this.maps.forEach((map) => map.remove());
    this.maps.clear();

    this.messages = [];
    this.messageIdCounter = 0;
    this.isTyping = false;
    this.cdr.detectChanges();
    this.loadWelcomeMessage();
  }

  // ==========================================
  // 🔹 Utilidades
  // ==========================================

  private scrollToBottom() {
    try {
      if (this.chatContainer) {
        const container = this.chatContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Error en scroll:', err);
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  trackByMessageId(index: number, message: Message): number {
    return message.id;
  }

  getSuggestedQuestions(): string[] {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage?.sender === 'bot') {
      const text = lastMessage.text.toLowerCase();

      if (text.includes('productos') || text.includes('categoría')) {
        return [
          '¿Tienen cerámica de Talavera?',
          '¿Venden joyería de plata?',
          '¿Qué textiles tienen disponibles?',
        ];
      }
      if (text.includes('ventas') || text.includes('vender')) {
        return [
          '¿Cuánto cuesta registrarme?',
          '¿Qué documentos necesito?',
          '¿Cómo subo mis productos?',
        ];
      }
      if (text.includes('compra') || text.includes('pedido')) {
        return ['¿Aceptan tarjetas?', '¿Hacen envíos internacionales?', '¿Hay garantía?'];
      }
    }
    return [];
  }
}
