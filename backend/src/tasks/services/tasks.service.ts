import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Task } from '../entities/task.entity';
import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    if (!createTaskDto.title || createTaskDto.title.trim().length === 0) {
      throw new BadRequestException('El título no puede estar vacío');
    }

    const newTaskData: Partial<Task> = {
      title: createTaskDto.title.trim(),
      description: createTaskDto.description ? createTaskDto.description.trim() : null,
      isCompleted: false,
    };

    return this.taskRepository.createTask(newTaskData);
  }

  async getAllTasks(): Promise<Task[]> {
    return this.taskRepository.findAllTasks();
  }

  async getPendingTasks(): Promise<Task[]> {
    return this.taskRepository.findPendingTasks();
  }

  async getCompletedTasks(): Promise<Task[]> {
    return this.taskRepository.findCompletedTasks();
  }

  async getTaskById(id: number): Promise<Task> {
    const task = await this.taskRepository.findTaskById(id);
    if (!task) {
      throw new NotFoundException(`Tarea ${id} no encontrada`);
    }
    return task;
  }

  async markTaskAsCompleted(taskId: number): Promise<Task> {
    const task = await this.taskRepository.findTaskById(taskId);
    if (!task) {
      throw new NotFoundException(`Tarea ${taskId} no encontrada`);
    }
    return this.taskRepository.markTaskAsCompleted(taskId);
  }

  async updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const existingTask = await this.taskRepository.findTaskById(id);
    if (!existingTask) {
      throw new NotFoundException(`Tarea ${id} no encontrada`);
    }

    const dataToUpdate: Partial<Task> = {};

    if (updateTaskDto.title !== undefined) {
      const trimmedTitle = updateTaskDto.title.trim();
      if (trimmedTitle.length === 0) {
        throw new BadRequestException('El título no puede estar vacío');
      }
      dataToUpdate.title = trimmedTitle;
    }

    if (updateTaskDto.description !== undefined) {
      dataToUpdate.description = updateTaskDto.description
        ? updateTaskDto.description.trim()
        : null;
    }

    if (updateTaskDto.isCompleted !== undefined) {
      dataToUpdate.isCompleted = updateTaskDto.isCompleted;
    }

    return this.taskRepository.updateTask(id, dataToUpdate);
  }

  async deleteTask(id: number): Promise<void> {
    const wasDeleted = await this.taskRepository.deleteTask(id);
    if (!wasDeleted) {
      throw new NotFoundException(`Tarea ${id} no encontrada`);
    }
  }

  async getTaskStatistics(): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionPercentage: number;
  }> {
    const statistics = await this.taskRepository.getTaskStatistics();
    const completionPercentage =
      statistics.total > 0
        ? Math.round((statistics.completed / statistics.total) * 100)
        : 0;

    return {
      ...statistics,
      completionPercentage,
    };
  }
}
