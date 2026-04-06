import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskService } from './services/tasks.service';
import { TaskController } from './controllers/tasks.controller';
import { TaskRepository } from './repositories/task.repository';

/**
 * TasksModule
 * 
 * Módulo NestJS que encapsula todo lo relacionado con tareas.
 * 
 * Estructura modular:
 * - Imports: Módulos externos necesarios (TypeOrmModule)
 * - Controllers: Exponen los endpoints HTTP
 * - Providers: Servicios e inyectables (TaskService, TaskRepository)
 * - Exports: Servicios disponibles para otros módulos
 * 
 * Ventajas:
 * - Aislamiento: Toda la lógica de tareas en un solo módulo
 * - Reutilizable: Puede importarse en otros proyectos/módulos
 * - Lazy-loading: Puede cargarse bajo demanda
 */
@Module({
  // Importar módulos de terceros
  imports: [
    // TypeOrmModule configura la BD para la entidad Task
    // Proporciona inyección automática de Repository<Task>
    TypeOrmModule.forFeature([Task]),
  ],
  
  // Controladores HTTP
  controllers: [TaskController],
  
  // Servicios e inyectables
  providers: [TaskService, TaskRepository],
  
  // Exportar servicios para que otros módulos puedan usarlos
  exports: [TaskService, TaskRepository],
})
export class TasksModule {}
