import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface PreguntaFrecuente {
  id: number;
  pregunta: string;
  respuesta: string;
  abierta: boolean;
  util: boolean;
  categoria: string;
}

interface CategoriaAyuda {
  id: number;
  nombre: string;
  abierta: boolean;
  preguntas: PreguntaFrecuente[];
}

interface MensajeContacto {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ayuda.html',
  styleUrls: ['./ayuda.scss']
})
export class AyudaComponent implements OnInit {
  // Propiedades para búsqueda
  terminoBusqueda: string = '';
  resultadosBusqueda: PreguntaFrecuente[] = [];

  // Datos de ejemplo para las categorías y preguntas
  categoriasAyuda: CategoriaAyuda[] = [
    {
      id: 1,
      nombre: '📦 Pedidos y Envíos',
      abierta: false,
      preguntas: [
        {
          id: 1,
          pregunta: '¿Cuánto tiempo tarda en llegar mi pedido?',
          respuesta: 'Los tiempos de entrega varían según tu ubicación: Ciudad de México: 2-3 días hábiles, Interior de la República: 4-7 días hábiles, Zonas rurales: 7-10 días hábiles. Recibirás un código de seguimiento por email una vez que tu pedido sea enviado.',
          abierta: false,
          util: false,
          categoria: 'pedidos'
        },
        {
          id: 2,
          pregunta: '¿Cómo puedo rastrear mi pedido?',
          respuesta: 'Puedes rastrear tu pedido ingresando a tu cuenta en RaícesMX y yendo a la sección "Mis Pedidos". También recibirás un email con el número de guía y enlace de seguimiento una vez que tu pedido sea enviado.',
          abierta: false,
          util: false,
          categoria: 'pedidos'
        },
        {
          id: 3,
          pregunta: '¿Hacen envíos internacionales?',
          respuesta: 'Actualmente solo realizamos envíos dentro de México. Estamos trabajando para expandirnos internacionalmente en el futuro.',
          abierta: false,
          util: false,
          categoria: 'pedidos'
        }
      ]
    },
    {
      id: 2,
      nombre: '💳 Pagos y Facturación',
      abierta: false,
      preguntas: [
        {
          id: 4,
          pregunta: '¿Qué métodos de pago aceptan?',
          respuesta: 'Aceptamos tarjetas de crédito y débito (Visa, MasterCard, American Express), PayPal, transferencias bancarias y pagos en efectivo a través de OXXO.',
          abierta: false,
          util: false,
          categoria: 'pagos'
        },
        {
          id: 5,
          pregunta: '¿Cómo puedo obtener mi factura?',
          respuesta: 'Puedes solicitar tu factura desde tu cuenta en la sección "Mis Pedidos". Necesitamos tus datos fiscales completos. La factura se enviará por email en un plazo máximo de 72 horas.',
          abierta: false,
          util: false,
          categoria: 'pagos'
        }
      ]
    },
    {
      id: 3,
      nombre: '🔄 Devoluciones y Garantías',
      abierta: false,
      preguntas: [
        {
          id: 6,
          pregunta: '¿Cuál es la política de devoluciones?',
          respuesta: 'Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del producto. El artículo debe estar en su estado original, sin usar y con el empaque original. Los costos de envío de la devolución corren por cuenta del cliente.',
          abierta: false,
          util: false,
          categoria: 'devoluciones'
        },
        {
          id: 7,
          pregunta: '¿Qué hago si recibo un producto dañado?',
          respuesta: 'Si recibes un producto dañado, contáctanos dentro de las 48 horas siguientes a la recepción. Toma fotos del producto y empaque, y nuestro equipo de soporte te asistirá con el reemplazo o reembolso.',
          abierta: false,
          util: false,
          categoria: 'devoluciones'
        }
      ]
    },
    {
      id: 4,
      nombre: '👤 Mi Cuenta',
      abierta: false,
      preguntas: [
        {
          id: 8,
          pregunta: '¿Cómo cambio mi contraseña?',
          respuesta: 'Puedes cambiar tu contraseña desde la sección "Mi Perfil" en tu cuenta. Si olvidaste tu contraseña, usa la opción "Recuperar contraseña" en la página de login.',
          abierta: false,
          util: false,
          categoria: 'cuenta'
        },
        {
          id: 9,
          pregunta: '¿Cómo actualizo mi información personal?',
          respuesta: 'Puedes actualizar tu información personal, dirección de envío y preferencias desde la sección "Mi Perfil" en tu cuenta.',
          abierta: false,
          util: false,
          categoria: 'cuenta'
        }
      ]
    }
  ];

  // Propiedades para el formulario de contacto
  mensajeContacto: MensajeContacto = {
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  };

  enviando: boolean = false;

  ngOnInit(): void {
    // Inicializar cualquier dato necesario
  }

  // Calcular el total de preguntas
  get totalPreguntas(): number {
    return this.categoriasAyuda.reduce((total, categoria) => total + categoria.preguntas.length, 0);
  }

  // Filtrar contenido basado en la búsqueda
  filtrarContenido(): void {
    if (!this.terminoBusqueda.trim()) {
      this.resultadosBusqueda = [];
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.resultadosBusqueda = [];

    this.categoriasAyuda.forEach(categoria => {
      categoria.preguntas.forEach(pregunta => {
        if (
          pregunta.pregunta.toLowerCase().includes(termino) ||
          pregunta.respuesta.toLowerCase().includes(termino)
        ) {
          this.resultadosBusqueda.push({ ...pregunta });
        }
      });
    });
  }

  // Filtrar por categoría específica
  filtrarPorCategoria(categoria: string): void {
    this.terminoBusqueda = '';
    this.resultadosBusqueda = [];
    
    // Abrir la categoría correspondiente
    const catIndex = this.categoriasAyuda.findIndex(cat => 
      cat.preguntas.some(p => p.categoria === categoria)
    );
    
    if (catIndex !== -1) {
      this.categoriasAyuda[catIndex].abierta = true;
      // Scroll a la categoría
      setTimeout(() => {
        const element = document.querySelector('.categoria-preguntas:nth-child(' + (catIndex + 1) + ')');
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  // Alternar visibilidad de categoría
  toggleCategoria(categoria: CategoriaAyuda): void {
    categoria.abierta = !categoria.abierta;
  }

  // Alternar visibilidad de pregunta
  togglePregunta(pregunta: PreguntaFrecuente): void {
    pregunta.abierta = !pregunta.abierta;
  }

  // Marcar pregunta como útil
  marcarUtil(pregunta: PreguntaFrecuente): void {
    pregunta.util = !pregunta.util;
    
    // Aquí podrías enviar esta información a tu backend
    console.log(`Pregunta ${pregunta.id} marcada como ${pregunta.util ? 'útil' : 'no útil'}`);
  }

  // Compartir pregunta
  compartirPregunta(pregunta: PreguntaFrecuente): void {
    if (navigator.share) {
      navigator.share({
        title: pregunta.pregunta,
        text: pregunta.respuesta,
        url: window.location.href
      }).catch(error => console.log('Error sharing:', error));
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const texto = `${pregunta.pregunta}\n\n${pregunta.respuesta}\n\nCompartido desde RaícesMX`;
      navigator.clipboard.writeText(texto).then(() => {
        alert('Pregunta copiada al portapapeles');
      }).catch(() => {
        // Fallback más básico
        const textArea = document.createElement('textarea');
        textArea.value = texto;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Pregunta copiada al portapapeles');
      });
    }
  }

  // Métodos de contacto
  iniciarChat(): void {
    alert('Iniciando chat en vivo... El servicio de chat estará disponible pronto.');
    // Aquí integrarías con tu servicio de chat en vivo
  }

  abrirEmail(): void {
    window.location.href = 'mailto:soporte@raicesmx.com';
  }

  llamarSoporte(): void {
    window.location.href = 'tel:+525512345678';
  }

  // Enviar mensaje de contacto
  enviarMensaje(): void {
    if (this.validarFormularioContacto()) {
      this.enviando = true;
      
      // Simular envío del formulario
      setTimeout(() => {
        console.log('Mensaje enviado:', this.mensajeContacto);
        alert('¡Mensaje enviado con éxito! Te contactaremos pronto.');
        
        // Resetear formulario
        this.mensajeContacto = {
          nombre: '',
          email: '',
          asunto: '',
          mensaje: ''
        };
        
        this.enviando = false;
      }, 2000);
    }
  }

  // Validar formulario de contacto
  private validarFormularioContacto(): boolean {
    if (!this.mensajeContacto.nombre.trim()) {
      alert('Por favor ingresa tu nombre');
      return false;
    }
    
    if (!this.mensajeContacto.email.trim()) {
      alert('Por favor ingresa tu email');
      return false;
    }
    
    if (!this.validarEmail(this.mensajeContacto.email)) {
      alert('Por favor ingresa un email válido');
      return false;
    }
    
    if (!this.mensajeContacto.asunto) {
      alert('Por favor selecciona un asunto');
      return false;
    }
    
    if (!this.mensajeContacto.mensaje.trim()) {
      alert('Por favor ingresa tu mensaje');
      return false;
    }
    
    return true;
  }

  // Validar formato de email
  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Métodos para recursos adicionales
  verGuias(): void {
    alert('Redirigiendo a guías de compra...');
    // Navegar a página de guías
  }

  verTutoriales(): void {
    alert('Redirigiendo a video tutoriales...');
    // Navegar a página de tutoriales
  }

  verPoliticas(): void {
    alert('Redirigiendo a políticas y términos...');
    // Navegar a página de políticas
  }
}