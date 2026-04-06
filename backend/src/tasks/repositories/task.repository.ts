import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';

/**
 * TaskRepository
 * 
 * Capa de acceso a datos (Data Access Layer) para la entidad Task.
 * 
 * Extensión de TypeORM Repository que proporciona métodos genéricos (CRUD)
 * y permite agregar métodos especializados para consultas complejas.
 * 
 * Al usar Repository Pattern, conseguimos:
 * - Abstracción de la BD (fácil cambiar de PostgreSQL a MySQL)
 * - Testeable (mockeable fácilmente)
 * - Centralización de queries (fácil optimizar índices)
 */
@Injectable()
export class TaskRepository extends Repository<Task> {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {
    super(tasksRepository.target, tasksRepository.manager);
  }

  /**
   * Obtiene todas las tareas (sin filtrar)
   * 
   * Retorna todas las tareas ordenadas por fecha de creación descendente
   * (las más nuevas primero).
   */
  async findAllTasks(): Promise<Task[]> {
    return this.tasksRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Obtiene todas las tareas pendientes (isCompleted = false)
   * 
   * Utiliza índice en BD para consulta optimizada.
   * @returns {Promise<Task[]>} Array de tareas sin completar
   */
  async findPendingTasks(): Promise<Task[]> {
    return this.tasksRepository.find({
      where: {
        isCompleted: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Obtiene todas las tareas completadas (isCompleted = true)
   * 
   * @returns {Promise<Task[]>} Array de tareas completadas
   */
  async findCompletedTasks(): Promise<Task[]> {
    return this.tasksRepository.find({
      where: {
        isCompleted: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Obtiene una tarea por su ID
   * 
   * @param {number} id - ID de la tarea a buscar
   * @returns {Promise<Task | null>} Tarea encontrada o null si no existe
   */
  async findTaskById(id: number): Promise<Task | null> {
    return this.tasksRepository.findOneBy({ id });
  }

  /**
   * Crea y guarda una nueva tarea
   * 
   * @param {Partial<Task>} taskData - Datos de la tarea a crear
   * @returns {Promise<Task>} Tarea creada con ID generado
   */
  async createTask(taskData: Partial<Task>): Promise<Task> {
    const newTask = this.tasksRepository.create(taskData);
    return this.tasksRepository.save(newTask);
  }

  /**
   * Actualiza una tarea existente
   * 
   * @param {number} id - ID de la tarea a actualizar
   * @param {Partial<Task>} updateData - Datos a actualizar
   * @returns {Promise<Task | null>} Tarea actualizada o null si no existe
   */
  async updateTask(id: number, updateData: Partial<Task>): Promise<Task | null> {
    const task = await this.tasksRepository.findOneBy({ id });
    
    if (!task) {
      return null;
    }

    // Fusionar datos actualizados en la entidad
    Object.assign(task, updateData);
    
    // Guardar en BD (updatedAt se actualiza automáticamente)
    return this.tasksRepository.save(task);
  }

  /**
   * Marca una tarea como completada
   * 
   * Método especializado que proporciona semántica clara en el negocio.
   * Internamente usa updateTask pero expresa mejor la intención.
   * 
   * @param {number} id - ID de la tarea a completar
   * @returns {Promise<Task | null>} Tarea marcada como completada
   */
  async markTaskAsCompleted(id: number): Promise<Task | null> {
    return this.updateTask(id, { isCompleted: true });
  }

  /**
   * Elimina una tarea
   * 
   * @param {number} id - ID de la tarea a eliminar
   * @returns {Promise<boolean>} true si se eliminó exitosamente, false si no existe
   */
  async deleteTask(id: number): Promise<boolean> {
    const result = await this.tasksRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * Obtiene estadísticas de tareas
   * 
   * Retorna un objeto con conteos de tareas pendientes, completadas y total.
   * Útil para dashboard o UI de estadísticas.
   * 
   * @returns {Promise<{ total: number; completed: number; pending: number }>}
   */
  async getTaskStatistics(): Promise<{
    total: number;
    completed: number;
    pending: number;
  }> {
    const total = await this.tasksRepository.count();
    const completed = await this.tasksRepository.countBy({ isCompleted: true });
    const pending = total - completed;

    return { total, completed, pending };
  }
}
