// chatbot.component.ts
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatbotService } from '../service/chatbot.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  id: number;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.scss'],
})
export class Chatbot implements OnInit, AfterViewInit {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  sidebarOpen = false;
  userMessage = '';
  isTyping = false;
  messages: Message[] = [];
  private messageIdCounter = 0;

  quickQuestions = [
    '¿Qué productos artesanales tienen?',
    '¿Cómo puedo vender mis productos?',
    '¿Cuáles son los requisitos para registrarme?',
    '¿Cómo contacto a un artesano?',
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

  /**
   * Carga el mensaje de bienvenida desde el backend
   */
  private loadWelcomeMessage() {
    // NO mostrar indicador de escritura en el mensaje de bienvenida inicial
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

  /**
   * Envía un mensaje al chatbot
   */
  sendMessage() {
    const trimmedMessage = this.userMessage.trim();
    if (!trimmedMessage) return;

    console.log('🚀 Enviando mensaje:', trimmedMessage);

    this.closeSidebar();

    // Agregar mensaje del usuario
    this.addMessage(trimmedMessage, 'user');
    console.log('✅ Mensaje del usuario agregado. Total:', this.messages.length);

    const currentMessage = trimmedMessage;
    this.userMessage = '';

    // Focus en el input
    setTimeout(() => {
      this.messageInput?.nativeElement.focus();
    }, 0);

    // Mostrar indicador de escritura y forzar detección de cambios
    this.isTyping = true;
    this.cdr.detectChanges();

    // Enviar al backend
    this.chatbotService.sendMessage(currentMessage).subscribe({
      next: (response) => {
        console.log('📨 Respuesta del bot recibida:', response.message);
        // Primero ocultar el indicador
        this.isTyping = false;
        this.cdr.detectChanges();
        // Luego agregar el mensaje
        this.addMessage(response.message, 'bot');
        console.log('✅ Respuesta agregada. Total:', this.messages.length);
      },
      error: (error) => {
        console.error('❌ Error al enviar mensaje:', error);
        // Primero ocultar el indicador
        this.isTyping = false;
        this.cdr.detectChanges();
        // Luego agregar el mensaje de error
        this.addMessage(
          'Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta de nuevo. 😊',
          'bot',
        );
      },
    });
  }

  /**
   * Agrega un mensaje al array
   */
  private addMessage(text: string, sender: 'user' | 'bot') {
    const newMessage: Message = {
      text,
      sender,
      timestamp: new Date(),
      id: this.messageIdCounter++,
    };

    // Crear nueva referencia del array para activar detección de cambios
    this.messages = [...this.messages, newMessage];

    console.log('📝 Mensaje agregado:', newMessage);
    console.log('📋 Array actual:', this.messages);

    // Scroll al final después de que Angular actualice la vista
    setTimeout(() => {
      this.scrollToBottom();
      this.cdr.detectChanges();
    }, 50);
  }

  /**
   * Maneja el evento de teclado (Enter para enviar)
   */
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Selecciona una pregunta rápida
   */
  selectQuickQuestion(question: string) {
    this.userMessage = question;
    this.sendMessage();
    this.closeSidebar();
  }

  /**
   * Selecciona una categoría de ayuda
   */
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

  /**
   * Limpia el chat y reinicia
   */
  clearChat() {
    this.messages = [];
    this.messageIdCounter = 0;
    this.isTyping = false;
    this.cdr.detectChanges();
    this.loadWelcomeMessage();
  }

  // ==========================================
  // 🔹 Utilidades
  // ==========================================

  /**
   * Hace scroll al final del chat
   */
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

  /**
   * Formatea la hora del mensaje
   */
  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * TrackBy para optimizar ngFor
   */
  trackByMessageId(index: number, message: Message): number {
    return message.id;
  }

  /**
   * Obtiene preguntas sugeridas según el contexto
   */
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
