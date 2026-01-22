// src/app/welcome/welcome.component.ts - VERSIÓN CORREGIDA
import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.scss']
})
export class WelcomeComponent implements AfterViewInit {
  
  ngAfterViewInit() {
    this.loadScrollEffects();
  }

  private loadScrollEffects() {
    // Cargar GSAP y LocomotiveScroll desde CDN
    if (!(window as any).gsap) {
      const gsapScript = document.createElement('script');
      gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
      document.head.appendChild(gsapScript);
    }

    if (!(window as any).ScrollTrigger) {
      const scrollTriggerScript = document.createElement('script');
      scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
      scrollTriggerScript.onload = () => this.initScroll();
      document.head.appendChild(scrollTriggerScript);
    } else {
      this.initScroll();
    }
  }

  private initScroll() {
    setTimeout(() => {
      if (!(window as any).LocomotiveScroll) {
        const locomotiveScript = document.createElement('script');
        locomotiveScript.src = 'https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.js';
        locomotiveScript.onload = () => this.setupEffects();
        document.head.appendChild(locomotiveScript);
      } else {
        this.setupEffects();
      }
    }, 300);
  }

  private setupEffects() {
    const gsap = (window as any).gsap;
    const ScrollTrigger = (window as any).ScrollTrigger;
    const LocomotiveScroll = (window as any).LocomotiveScroll;

    if (!gsap || !ScrollTrigger || !LocomotiveScroll) return;

    gsap.registerPlugin(ScrollTrigger);

    // Scroll suave
    const container = document.querySelector(".scroll-container");
    if (!container) return;

    const scroller = new LocomotiveScroll({
      el: container,
      smooth: true,
      multiplier: 0.8
    });

    scroller.on("scroll", ScrollTrigger.update);

    // CORRECCIÓN: Agregar tipo al parámetro 'value'
    ScrollTrigger.scrollerProxy(container, {
      scrollTop: (value: number) => {
        return arguments.length 
          ? scroller.scrollTo(value, 0, 0)
          : scroller.scroll.instance.scroll.y;
      },
      getBoundingClientRect: () => {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      }
    });

    ScrollTrigger.addEventListener("refresh", () => scroller.update());
    ScrollTrigger.refresh();

    // Efectos de cambio de color
    this.setupColorTransitions(gsap, ScrollTrigger, container);
  }

  private setupColorTransitions(gsap: any, ScrollTrigger: any, container: any) {
    const sections = document.querySelectorAll("[data-bgcolor]");
    
    sections.forEach((section: any, index: number) => {
      const prevSection = index > 0 ? sections[index - 1] : null;
      
      ScrollTrigger.create({
        trigger: section,
        scroller: container,
        start: "top 40%",
        onEnter: () => {
          const bgColor = section.getAttribute('data-bgcolor');
          const textColor = section.getAttribute('data-textcolor');
          
          if (bgColor && textColor) {
            gsap.to("body", {
              backgroundColor: bgColor,
              color: textColor,
              duration: 1.5,
              ease: "power2.inOut"
            });
          }
        },
        onLeaveBack: () => {
          if (prevSection) {
            const prevBg = prevSection.getAttribute('data-bgcolor');
            const prevText = prevSection.getAttribute('data-textcolor');
            
            if (prevBg && prevText) {
              gsap.to("body", {
                backgroundColor: prevBg,
                color: prevText,
                duration: 1.5,
                ease: "power2.inOut"
              });
            }
          } else {
            // Volver a colores iniciales
            gsap.to("body", {
              backgroundColor: "#9d2449",
              color: "#FFFFFF",
              duration: 1.5,
              ease: "power2.inOut"
            });
          }
        }
      });
    });
  }
}