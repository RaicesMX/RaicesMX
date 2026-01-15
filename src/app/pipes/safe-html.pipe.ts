// src/app/pipes/safe-html.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pipe para sanitizar HTML de forma segura
 *
 * Uso:
 * <div [innerHTML]="userContent | safeHtml"></div>
 */
@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    // Angular sanitiza y remueve scripts maliciosos
    return this.sanitizer.sanitize(1, value) || '';
  }
}
