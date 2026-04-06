import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskService, ITask, ITaskStatistics, ICreateTaskRequest } from '../../services/task.service';


@Component({
  selector: 'app-task-list',
  standalone: true, // Componente standalone (Angular 17+)
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit, OnDestroy {
  // ==========================================
  // PROPIEDADES DEL ESTADO
  // ==========================================

  /** Array de todas las tareas */
  tasks: ITask[] = [];

  /** Array de tareas filtradas según el filtro activo */
  filteredTasks: ITask[] = [];

  /** Estadísticas de tareas (total, completadas, pendientes, porcentaje) */
  statistics: ITaskStatistics | null = null;

  /** Formulario reactivo para crear tareas */
  taskForm: FormGroup;

  // Estados de carga
  /** Indica si se están cargando las tareas */
  isLoadingTasks = false;

  /** Indica si se está creando una nueva tarea */
  isCreatingTask = false;

  /** ID de la tarea que se está eliminando (para mostrar loading en botón) */
  deletingTaskId: number | null = null;

  /** Filtro activo: 'all', 'pending', 'completed' */
  activeFilter: 'all' | 'pending' | 'completed' = 'all';

  // Manejo de errores
  /** Mensaje de error general */
  errorMessage: string | null = null;

  /** Mensaje de éxito temporal */
  successMessage: string | null = null;

  // Subject para unsubscribe automático
  /** Subject que se completa cuando el componente se destruye */
  private destroy$ = new Subject<void>();

  // ==========================================
  // CONSTRUCTOR E INYECCIÓN DE DEPENDENCIAS
  // ==========================================

  constructor(
    private readonly taskService: TaskService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.taskForm = this.createTaskForm();
  }

  // ==========================================
  // CICLO DE VIDA
  // ==========================================

  /**
   * Initialización del componente
   * 
   * Se ejecuta cuando el componente se crea
   * - Cargar tareas
   * - Cargar estadísticas
   */
  ngOnInit(): void {
    this.loadTasks();
    this.loadStatistics();
  }

  /**
   * Limpieza cuando se destruye el componente
   * 
   * - Completar el Subject para hacer unsubscribe automático
   * - Previene memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // MÉTODOS PÚBLICOS
  // ==========================================

  /**
   * Cargar todas las tareas desde el backend
   * 
   * Procesa según el filtro activo:
   * - 'all': Obtiene todas las tareas
   * - 'pending': Obtiene solo pendientes
   * - 'completed': Obtiene solo completadas
   */
  loadTasks(): void {
    this.isLoadingTasks = true;
    this.errorMessage = null;

    let taskObservable$;

    switch (this.activeFilter) {
      case 'pending':
        taskObservable$ = this.taskService.getPendingTasks();
        break;
      case 'completed':
        taskObservable$ = this.taskService.getCompletedTasks();
        break;
      case 'all':
      default:
        taskObservable$ = this.taskService.getAllTasks();
    }

    taskObservable$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks: ITask[]) => {
          this.tasks = tasks;
          this.filteredTasks = tasks;
          this.isLoadingTasks = false;
        },
        error: (error: Error) => {
          this.handleError('Error al cargar tareas: ' + error.message);
          this.isLoadingTasks = false;
        },
      });
  }

  /**
   * Cargar estadísticas de tareas
   * 
   * Obtiene el total, completadas, pendientes y porcentaje de completamiento
   */
  loadStatistics(): void {
    this.taskService
      .getTaskStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: ITaskStatistics) => {
          this.statistics = stats;
        },
        error: (error: Error) => {
          console.error('Error al cargar estadísticas:', error);
        },
      });
  }

  /**
   * Crear una nueva tarea desde el formulario
   * 
   * Validaciones:
   * - Formulario debe ser válido
   * - Título no puede estar vacío
   * 
   * Después de crear:
   * - Limpiar formulario
   * - Recargar tareas
   * - Recargar estadísticas
   * - Mostrar mensaje de éxito
   */
  addTask(): void {
    // Validar que el formulario sea válido
    if (this.taskForm.invalid) {
      this.handleError('Por favor, completa el formulario correctamente');
      return;
    }

    this.isCreatingTask = true;
    this.errorMessage = null;

    // Obtener datos del formulario
    const createTaskRequest: ICreateTaskRequest = {
      title: this.taskForm.get('title')?.value.trim(),
      description: this.taskForm.get('description')?.value?.trim() || undefined,
    };

    // Enviar request al backend
    this.taskService
      .createTask(createTaskRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newTask: ITask) => {
          // Agregar la nueva tarea a la lista
          this.tasks.unshift(newTask);

          // Recargar según filtro
          this.applyFilter(this.activeFilter);

          // Limpiar formulario
          this.taskForm.reset();

          // Actualizar estadísticas
          this.loadStatistics();

          // Mostrar mensaje de éxito
          this.successMessage = `✓ Tarea "${newTask.title}" creada exitosamente`;
          this.hideSuccessMessageAfterDelay();

          this.isCreatingTask = false;
        },
        error: (error: Error) => {
          this.handleError('Error al crear tarea: ' + error.message);
          this.isCreatingTask = false;
        },
      });
  }

  /**
   * Completar una tarea
   * 
   * @param {ITask} task - Tarea a completar
   */
  completeTask(task: ITask): void {
    this.taskService
      .completeTask(task.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (completedTask: ITask) => {
          // Actualizar tarea en la lista
          const index = this.tasks.findIndex((t) => t.id === completedTask.id);
          if (index !== -1) {
            this.tasks[index] = completedTask;
          }

          // Recargar filtro
          this.applyFilter(this.activeFilter);

          // Actualizar estadísticas
          this.loadStatistics();

          // Mostrar mensaje de éxito
          this.successMessage = `✓ Tarea "${completedTask.title}" completada`;
          this.hideSuccessMessageAfterDelay();
        },
        error: (error: Error) => {
          this.handleError('Error al completar tarea: ' + error.message);
        },
      });
  }

  /**
   * Eliminar una tarea
   * 
   * Pide confirmación antes de eliminar (opcional pero recomendado)
   * 
   * @param {ITask} task - Tarea a eliminar
   */
  deleteTask(task: ITask): void {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`,
    );

    if (!confirmDelete) {
      return;
    }

    this.deletingTaskId = task.id;

    this.taskService
      .deleteTask(task.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remover tarea de la lista
          this.tasks = this.tasks.filter((t) => t.id !== task.id);

          // Recargar filtro
          this.applyFilter(this.activeFilter);

          // Actualizar estadísticas
          this.loadStatistics();

          // Mostrar mensaje de éxito
          this.successMessage = `✓ Tarea eliminada exitosamente`;
          this.hideSuccessMessageAfterDelay();

          this.deletingTaskId = null;
        },
        error: (error: Error) => {
          this.handleError('Error al eliminar tarea: ' + error.message);
          this.deletingTaskId = null;
        },
      });
  }

  /**
   * Aplicar filtro a las tareas
   * 
   * @param {'all' | 'pending' | 'completed'} filter - Filtro a aplicar
   */
  applyFilter(filter: 'all' | 'pending' | 'completed'): void {
    this.activeFilter = filter;

    switch (filter) {
      case 'pending':
        this.filteredTasks = this.tasks.filter((t) => !t.isCompleted);
        break;
      case 'completed':
        this.filteredTasks = this.tasks.filter((t) => t.isCompleted);
        break;
      case 'all':
      default:
        this.filteredTasks = this.tasks;
    }
  }

  /**
   * Obtener el número de tareas en filtro actual
   * 
   * @returns {number} Cantidad de tareas filtradas
   */
  getFilteredTaskCount(): number {
    return this.filteredTasks.length;
  }

  /**
   * Verificar si el formulario es válido
   * 
   * @returns {boolean} true si el formulario es válido
   */
  isFormValid(): boolean {
    return this.taskForm.valid;
  }

  // ==========================================
  // MÉTODOS PRIVADOS
  // ==========================================

  /**
   * Crear formulario reactivo para tareas
   * 
   * Validaciones:
   * - title: Required, min 3 caracteres, max 255
   * - description: Optional, max 2000 caracteres
   * 
   * @returns {FormGroup} Formulario configurado
   */
  private createTaskForm(): FormGroup {
    return this.formBuilder.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      description: [
        '',
        [
          Validators.maxLength(2000),
        ],
      ],
    });
  }

  /**
   * Manejar errores y mostrar mensaje
   * 
   * @param {string} message - Mensaje de error
   */
  private handleError(message: string): void {
    this.errorMessage = message;
    console.error(message);

    // Limpiar mensaje después de 5 segundos
    setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }

  /**
   * Ocultar mensaje de éxito después de un delay
   */
  private hideSuccessMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }
}
