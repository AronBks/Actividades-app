import { Routes } from '@angular/router';
import { TaskListComponent } from './modules/tasks/task-list.component';

/**
 * Rutas de la aplicación Angular
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
  {
    path: 'tasks',
    component: TaskListComponent,
  },
  {
    path: '**',
    redirectTo: 'tasks',
  },
];
