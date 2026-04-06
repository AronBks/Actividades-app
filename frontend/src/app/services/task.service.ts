import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Interfaz que representa una Tarea
 * 
 * Espeja la estructura del backend (Task entity)
 */
export interface ITask {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para crear una tarea
 * Espeja el CreateTaskDto del backend
 */
export interface ICreateTaskRequest {
  title: string;
  description?: string;
}

/**
 * DTO para actualizar una tarea
 * Espeja el UpdateTaskDto del backend
 */
export interface IUpdateTaskRequest {
  title?: string;
  description?: string;
  isCompleted?: boolean;
}

/**
 * Estadísticas de tareas
 */
export interface ITaskStatistics {
  total: number;
  completed: number;
  pending: number;
  completionPercentage: number;
}

/**
 * TaskService (Frontend)
 * 
 * Capa de integración HTTP que consume la API del backend.
 * 
 * Responsabilidades:
 * - Configurar URLs base de la API
 * - Realizar solicitudes HTTP al backend
 * - Transformar respuestas
 * - Manejar errores
 * - Proporcionar métodos reutilizables para componentes
 * 
 * Ventajas:
 * - Centralización de la lógica de comunicación HTTP
 * - Componentes no conocen la API REST (desacoplamiento)
 * - Fácil de mockear para testing
 * - Un único punto de entrada a la BD
 */
@Injectable({
  providedIn: 'root', // Singleton disponible en toda la aplicación
})
export class TaskService {
  /**
   * URL base de la API del backend
   * 
   * En desarrollo: http://localhost:3000/api
   * En producción: https://api.ejemplo.com
   */
  private readonly apiUrl = 'http://localhost:3000/api/tasks';

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Crear una nueva tarea
   * 
   * @param {ICreateTaskRequest} task - Datos de la tarea a crear
   * @returns {Observable<ITask>} Observable con la tarea creada
   */
  createTask(task: ICreateTaskRequest): Observable<ITask> {
    return this.httpClient
      .post<ITask>(this.apiUrl, task)
      .pipe(
        catchError(this.handleError),
      );
  }

  /**
   * Obtener todas las tareas
   * 
   * @returns {Observable<ITask[]>} Observable con array de tareas
   */
  getAllTasks(): Observable<ITask[]> {
    return this.httpClient
      .get<ITask[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError),
      );
  }

  /**
   * Obtener tareas pendientes
   * 
   * @returns {Observable<ITask[]>} Observable con tareas sin completar
   */
  getPendingTasks(): Observable<ITask[]> {
    return this.httpClient
      .get<ITask[]>(`${this.apiUrl}/pending`)
      .pipe(
        catchError(this.handleError),
      );
  }

  /**
   * Obtener tareas completadas
   * 
   * @returns {Observable<ITask[]>} Observable con tareas completadas
   */
  getCompletedTasks(): Observable<ITask[]> {
    return this.httpClient
      .get<ITask[]>(`${this.apiUrl}/completed`)
      .pipe(
        catchError(this.handleError),
      );
  }

  /**
   * Obtener estadísticas de tareas
   * 
   * @returns {Observable<ITaskStatistics>} Observable con estadísticas
   */
  getTaskStatistics(): Observable<ITaskStatistics> {
    return this.httpClient
      .get<ITaskStatistics>(`${this.apiUrl}/statistics`)
      .pipe(
        catchError(this.handleError),
      );
  }

  /**
   * Obtener una tarea por su ID
   * 
   * @param {number} id - ID de la tarea
   * @returns {Observable<ITask>} Observable con la tarea solicitada
   */
  getTaskById(id: number): Observable<ITask> {
    return this.httpClient
      .get<ITask>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError),
      );
  }

  /**
   * Actualizar una tarea existente
   * 
   * @param {number} id - ID de la tarea a actualizar
   * @param {IUpdateTaskRequest} updateData - Datos a actualizar
   * @returns {Observable<ITask>} Observable con la tarea actualizada
   */
  updateTask(id: number, updateData: IUpdateTaskRequest): Observable<ITask> {
    return this.httpClient
      .put<ITask>(`${this.apiUrl}/${id}`, updateData)
      .pipe(
        catchError(this.handleError),
      );
  }

  /**
   * Marcar una tarea como completada
   * 
   * @param {number} id - ID de la tarea a completar
   * @returns {Observable<ITask>} Observable con la tarea marcada como completada
   */
  completeTask(id: number): Observable<ITask> {
    return this.httpClient
      .put<ITask>(`${this.apiUrl}/${id}/complete`, {})
      .pipe(
        catchError(this.handleError),
      );
  }

  /**
   * Eliminar una tarea
   * 
   * @param {number} id - ID de la tarea a eliminar
   * @returns {Observable<void>} Observable vacío (204 No Content)
   */
  deleteTask(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError),
      );
  }

  /**
   * Manejo centralizado de errores HTTP
   * 
   * @param {HttpErrorResponse} error - Error HTTP
   * @returns {Observable<never>} Observable con error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error de cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código: ${error.status}, Mensaje: ${error.message}`;
    }

    console.error('Error HTTP:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
