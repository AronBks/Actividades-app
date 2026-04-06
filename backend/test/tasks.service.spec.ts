import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TaskService } from '../src/tasks/services/tasks.service';
import { TaskRepository } from '../src/tasks/repositories/task.repository';
import { Task } from '../src/tasks/entities/task.entity';
import { CreateTaskDto } from '../src/tasks/dtos/create-task.dto';

/**
 * TaskService Unit Tests
 * 
 * Pruebas unitarias para validar la lógica de negocio del servicio de tareas.
 * 
 * Estrategia de testing:
 * - Mock del Repository para aislar el servicio
 * - Probar reglas de negocio críticas
 * - Validar excepciones y casos edge
 * - Verificar transformación de datos
 * 
 * Ventajas:
 * - Rápidas (no usan BD real)
 * - Aisladas (no dependen de otros servicios)
 * - Documentan el comportamiento esperado
 */
describe('TaskService', () => {
  let service: TaskService;
  let repository: TaskRepository;

  // ==========================================
  // SETUP: Antes de cada test
  // ==========================================
  beforeEach(async () => {
    // Crear módulo de testing con mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          // Mock del TaskRepository
          provide: TaskRepository,
          useValue: {
            createTask: jest.fn(),
            findAllTasks: jest.fn(),
            findPendingTasks: jest.fn(),
            findTaskById: jest.fn(),
            updateTask: jest.fn(),
            markTaskAsCompleted: jest.fn(),
            deleteTask: jest.fn(),
            getTaskStatistics: jest.fn(),
          },
        },
      ],
    }).compile();

    // Obtener instancias del módulo de testing
    service = module.get<TaskService>(TaskService);
    repository = module.get<TaskRepository>(TaskRepository);
  });

  // ==========================================
  // PRUEBA 1: Crear tarea con datos válidos
  // ==========================================
  describe('createTask', () => {
    it('debería crear exitosamente una nueva tarea con datos válidos', async () => {
      // ARRANGE: Preparar datos de entrada y salida esperada
      const createTaskDto: CreateTaskDto = {
        title: 'Aprender NestJS',
        description: 'Estudiar el framework NestJS en profundidad',
      };

      // Mock de la tarea creada (como la retornaría la BD)
      const expectedTask: Task = {
        id: 1,
        title: 'Aprender NestJS',
        description: 'Estudiar el framework NestJS en profundidad',
        isCompleted: false,
        createdAt: new Date('2026-04-06T10:00:00Z'),
        updatedAt: new Date('2026-04-06T10:00:00Z'),
      };

      // Configurar el mock para retornar la tarea esperada
      jest.spyOn(repository, 'createTask').mockResolvedValue(expectedTask);

      // ACT: Ejecutar la acción que se quiere probar
      const result = await service.createTask(createTaskDto);

      // ASSERT: Verificar que el resultado es el esperado
      expect(result).toEqual(expectedTask);
      expect(result.id).toBe(1);
      expect(result.title).toBe('Aprender NestJS');
      expect(result.isCompleted).toBe(false);
      
      // Verificar que el repository fue llamado
      expect(repository.createTask).toHaveBeenCalled();
      expect(repository.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Aprender NestJS',
          description: 'Estudiar el framework NestJS en profundidad',
          isCompleted: false,
        }),
      );
    });

    it('debería fallar al intentar crear una tarea sin título', async () => {
      // ARRANGE: Datos inválidos (sin título)
      const invalidDto: CreateTaskDto = {
        title: '', // Título vacío - INVÁLIDO
        description: 'Una descripción',
      };

      // ACT & ASSERT: Verificar que lanza BadRequestException
      await expect(service.createTask(invalidDto)).rejects.toThrow(
        BadRequestException,
      );

      // Verificar que NO se llamó al repository (validación en el servicio)
      expect(repository.createTask).not.toHaveBeenCalled();
    });

    it('debería fallar al intentar crear una tarea solo con espacios en blanco', async () => {
      // ARRANGE: Título con solo espacios
      const invalidDto: CreateTaskDto = {
        title: '   ', // Solo espacios - INVÁLIDO
      };

      // ACT & ASSERT
      await expect(service.createTask(invalidDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(repository.createTask).not.toHaveBeenCalled();
    });

    it('debería trimmar espacios en blanco del título y descripción', async () => {
      // ARRANGE: Datos con espacios en blanco al inicio/final
      const dtoWithSpaces: CreateTaskDto = {
        title: '  Tarea con espacios  ',
        description: '  Descripción con espacios  ',
      };

      const expectedTask: Task = {
        id: 2,
        title: 'Tarea con espacios',
        description: 'Descripción con espacios',
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'createTask').mockResolvedValue(expectedTask);

      // ACT
      await service.createTask(dtoWithSpaces);

      // ASSERT: Verificar que se pasaron datos sin espacios
      expect(repository.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Tarea con espacios',
          description: 'Descripción con espacios',
        }),
      );
    });
  });

  // ==========================================
  // PRUEBA 2: Marcar tarea como completada
  // ==========================================
  describe('markTaskAsCompleted', () => {
    it('debería marcar exitosamente una tarea como completada', async () => {
      // ARRANGE: Preparar datos
      const taskId = 1;
      const existingTask: Task = {
        id: taskId,
        title: 'Tarea pendiente',
        description: 'Una tarea sin completar',
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const completedTask: Task = {
        ...existingTask,
        isCompleted: true,
        updatedAt: new Date(),
      };

      // Configurar mocks
      jest
        .spyOn(repository, 'findTaskById')
        .mockResolvedValue(existingTask);
      jest
        .spyOn(repository, 'markTaskAsCompleted')
        .mockResolvedValue(completedTask);

      // ACT
      const result = await service.markTaskAsCompleted(taskId);

      // ASSERT
      expect(result.isCompleted).toBe(true);
      expect(result.id).toBe(taskId);
      expect(repository.findTaskById).toHaveBeenCalledWith(taskId);
      expect(repository.markTaskAsCompleted).toHaveBeenCalledWith(taskId);
    });

    it('debería lanzar NotFoundException si la tarea no existe', async () => {
      // ARRANGE
      const nonExistentTaskId = 999;
      jest.spyOn(repository, 'findTaskById').mockResolvedValue(null);

      // ACT & ASSERT
      await expect(
        service.markTaskAsCompleted(nonExistentTaskId),
      ).rejects.toThrow(NotFoundException);

      expect(repository.findTaskById).toHaveBeenCalledWith(nonExistentTaskId);
      expect(repository.markTaskAsCompleted).not.toHaveBeenCalled();
    });

    it('debería retornar la tarea si ya estaba completada', async () => {
      // ARRANGE: Tarea que ya está completada
      const taskId = 1;
      const alreadyCompletedTask: Task = {
        id: taskId,
        title: 'Tarea ya completada',
        description: 'Ya está hecha',
        isCompleted: true, // Ya completada
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(repository, 'findTaskById')
        .mockResolvedValue(alreadyCompletedTask);

      // ACT
      const result = await service.markTaskAsCompleted(taskId);

      // ASSERT
      expect(result.isCompleted).toBe(true);
      // El método markTaskAsCompleted del repo NO debería ser llamado
      // ya que la tarea ya estaba completada
      expect(repository.markTaskAsCompleted).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // PRUEBAS ADICIONALES: Obtener tareas pendientes
  // ==========================================
  describe('getPendingTasks', () => {
    it('debería retornar solo las tareas pendientes', async () => {
      // ARRANGE
      const pendingTasks: Task[] = [
        {
          id: 1,
          title: 'Tarea 1',
          description: 'Pendiente',
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Tarea 2',
          description: 'Pendiente',
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest
        .spyOn(repository, 'findPendingTasks')
        .mockResolvedValue(pendingTasks);

      // ACT
      const result = await service.getPendingTasks();

      // ASSERT
      expect(result).toEqual(pendingTasks);
      expect(result.length).toBe(2);
      expect(result.every((task) => !task.isCompleted)).toBe(true);
    });
  });

  // ==========================================
  // PRUEBAS ADICIONALES: Obtener estadísticas
  // ==========================================
  describe('getTaskStatistics', () => {
    it('debería retornar estadísticas correctas', async () => {
      // ARRANGE
      const statistics = {
        total: 10,
        completed: 7,
        pending: 3,
      };

      jest
        .spyOn(repository, 'getTaskStatistics')
        .mockResolvedValue(statistics);

      // ACT
      const result = await service.getTaskStatistics();

      // ASSERT
      expect(result.total).toBe(10);
      expect(result.completed).toBe(7);
      expect(result.pending).toBe(3);
      expect(result.completionPercentage).toBe(70); // (7/10) * 100 = 70%
    });

    it('debería retornar 0% si no hay tareas', async () => {
      // ARRANGE
      jest.spyOn(repository, 'getTaskStatistics').mockResolvedValue({
        total: 0,
        completed: 0,
        pending: 0,
      });

      // ACT
      const result = await service.getTaskStatistics();

      // ASSERT
      expect(result.completionPercentage).toBe(0);
    });
  });
});
