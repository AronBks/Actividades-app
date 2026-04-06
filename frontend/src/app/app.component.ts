import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Componente Raíz de la Aplicación Angular
 * 
 * Actúa como shell de la aplicación donde se renderiza
 * el router outlet con los componentes de las rutas
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <main class="app-main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-main {
      width: 100%;
      min-height: 100vh;
      background-color: #f9fafb;
      font-family: system-ui, -apple-system, sans-serif;
    }
  `],
})
export class AppComponent {
  title = 'Task Management System';
}
