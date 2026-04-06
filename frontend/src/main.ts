import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

/**
 * Configuración Bootstrap de Angular
 * 
 * Con Angular 17 (standalone), se configura aquí toda la aplicación
 */
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideRouter(routes),
  ],
}).catch((error) => console.error('Error al iniciar:', error));
