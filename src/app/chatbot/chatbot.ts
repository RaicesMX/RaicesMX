// chatbot.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.scss']
})
export class Chatbot implements OnInit, AfterViewInit {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;
  
  userMessage = '';
  isTyping = false;
  
  messages: Message[] = [
    {
      text: '¡Hola! Soy el asistente virtual de RaícesMX. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    },
    {
      text: 'Estoy aquí para ayudarte con información sobre productos artesanales, ventas, registro de vendedores y soporte general.',
      sender: 'bot',
      timestamp: new Date()
    }
  ];
  
  quickQuestions = [
    '¿Cómo puedo vender mis productos artesanales?',
    '¿Cuáles son los requisitos para registrarme?',
    '¿Cómo contacto a un artesano?',
    '¿Cuáles son las tarifas de la plataforma?',
    '¿Cómo puedo hacer un pedido?',
    '¿Qué tipos de productos aceptan?'
  ];
  
  helpCategories = [
    { icon: 'shopping_cart', title: 'Compras', desc: 'Información sobre productos y pedidos' },
    { icon: 'storefront', title: 'Ventas', desc: 'Vender tus productos artesanales' },
    { icon: 'person_add', title: 'Registro', desc: 'Crear tu cuenta en RaícesMX' },
    { icon: 'support_agent', title: 'Soporte', desc: 'Ayuda técnica y asistencia' }
  ];
  
  botResponses: { [key: string]: string[] } = {
    'ventas': [
      'Para vender en RaícesMX, primero regístrate como vendedor en nuestra plataforma. Luego podrás subir fotos de tus productos artesanales, establecer precios y gestionar tus ventas.',
      'Como vendedor en RaícesMX, disfrutas de una comisión competitiva del 10% por venta exitosa. Proporcionamos herramientas para gestionar inventario y seguimiento de pedidos.',
      'Los productos artesanales mexicanos son nuestra especialidad: cerámica, textiles, joyería tradicional, madera tallada y más. Cada producto pasa por revisión de calidad.'
    ],
    'registro': [
      'El registro en RaícesMX es completamente gratuito. Necesitas proporcionar información básica, comprobante de domicilio y datos fiscales para recibir pagos.',
      'Como vendedor registrado, tendrás acceso a nuestro dashboard donde podrás gestionar productos, ver estadísticas de ventas y comunicarte con compradores.',
      'El proceso de verificación toma de 1 a 2 días hábiles. Una vez aprobado, podrás comenzar a subir tus productos inmediatamente.'
    ],
    'compras': [
      'Puedes explorar productos artesanales por categoría: cerámica, textiles, joyería, etc. Cada producto incluye descripción detallada y fotos del artesano.',
      'Para hacer un pedido, selecciona el producto, elige cantidad y haz clic en "Comprar". Aceptamos múltiples métodos de pago seguro.',
      'Los tiempos de envío varían según la ubicación del artesano. Normalmente es de 3 a 7 días hábiles dentro de México.'
    ],
    'productos': [
      'RaícesMX se especializa en productos artesanales mexicanos auténticos: talavera, bordados, alebrijes, plata, cobre y más.',
      'Cada producto en nuestra plataforma incluye certificado de autenticidad y la historia del artesano que lo creó.',
      'Trabajamos directamente con comunidades artesanales para garantizar comercio justo y preservar técnicas tradicionales.'
    ],
    'soporte': [
      'Nuestro equipo de soporte está disponible de lunes a sábado de 8:00 AM a 8:00 PM. Puedes contactarnos por WhatsApp: 55-1234-5678',
      'Para consultas sobre pedidos, envía un correo a: pedidos@raicesmx.com. Para soporte técnico: soporte@raicesmx.com',
      'Contamos con centro de ayuda en línea con tutoriales y guías paso a paso para compradores y vendedores.'
    ],
    'default': [
      'Entiendo que quieres información sobre ese tema. Déjame proporcionarte los detalles más relevantes.',
      'Esa es una excelente pregunta. Permíteme darte la información más actualizada que tenemos.',
      'Gracias por tu consulta. Aquí tienes la información que necesitas sobre ese tema.'
    ]
  };
  
  ngOnInit() {
    document.title = 'Asistente Virtual - RaícesMX';
  }
  
  ngAfterViewInit() {
    this.scrollToBottom();
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 500);
  }
  
  sendMessage() {
    if (!this.userMessage.trim()) return;
    
    const userMsg: Message = {
      text: this.userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    this.messages.push(userMsg);
    
    const userInput = this.userMessage.toLowerCase();
    this.userMessage = '';
    
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 100);
    
    this.isTyping = true;
    this.scrollToBottom();
    
    setTimeout(() => {
      this.getBotResponse(userInput);
      this.isTyping = false;
      this.scrollToBottom();
    }, 800 + Math.random() * 800);
  }
  
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
  
  selectQuickQuestion(question: string) {
    this.userMessage = question;
    setTimeout(() => this.sendMessage(), 100);
  }
  
  selectHelpCategory(category: string) {
    const categoryMap: { [key: string]: string } = {
      'Compras': 'compras',
      'Ventas': 'ventas',
      'Registro': 'registro',
      'Soporte': 'soporte'
    };
    
    const userMsg: Message = {
      text: `Quiero información sobre: ${category}`,
      sender: 'user',
      timestamp: new Date()
    };
    this.messages.push(userMsg);
    
    this.isTyping = true;
    this.scrollToBottom();
    
    setTimeout(() => {
      this.getBotResponse(categoryMap[category]);
      this.isTyping = false;
      this.scrollToBottom();
    }, 800);
  }
  
  private getBotResponse(userInput: string) {
    let responseType = 'default';
    
    const patterns: { [key: string]: RegExp[] } = {
      'ventas': [/vender/, /ventas/, /vendedor/, /producto.*mio/, /mi.*producto/],
      'registro': [/registro/, /registrar/, /cuenta/, /perfil/, /ingresar/],
      'compras': [/comprar/, /pedido/, /orden/, /pago/, /envío/, /entrega/],
      'productos': [/producto/, /artesanal/, /cerámica/, /textil/, /joyería/, /artesanía/],
      'soporte': [/soporte/, /ayuda/, /contacto/, /problema/, /error/, /queja/]
    };
    
    for (const [category, regexes] of Object.entries(patterns)) {
      if (regexes.some(regex => regex.test(userInput))) {
        responseType = category;
        break;
      }
    }
    
    const responses = this.botResponses[responseType];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const botMsg: Message = {
      text: randomResponse,
      sender: 'bot',
      timestamp: new Date()
    };
    this.messages.push(botMsg);
  }
  
  private scrollToBottom() {
    try {
      setTimeout(() => {
        if (this.chatContainer) {
          this.chatContainer.nativeElement.scrollTop = 
            this.chatContainer.nativeElement.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
  
  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  clearChat() {
    this.messages = [
      {
        text: '¡Hola! He reiniciado nuestra conversación. ¿En qué puedo ayudarte hoy?',
        sender: 'bot',
        timestamp: new Date()
      }
    ];
  }
  
  getSuggestedQuestions(): string[] {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage?.sender === 'bot') {
      if (lastMessage.text.includes('ventas') || lastMessage.text.includes('vender')) {
        return ['¿Cuánto cuesta registrarme?', '¿Qué documentos necesito?', '¿Cómo subo mis productos?'];
      }
      if (lastMessage.text.includes('compras') || lastMessage.text.includes('compra')) {
        return ['¿Aceptan tarjetas?', '¿Hacen envíos internacionales?', '¿Hay garantía?'];
      }
    }
    return [];
  }
}