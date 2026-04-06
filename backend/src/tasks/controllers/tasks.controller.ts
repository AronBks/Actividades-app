import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { TaskService } from '../services/tasks.service';
import { Task } from '../entities/task.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async createTask(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    return this.taskService.createTask(createTaskDto);
  }

  @Get()
  async getAllTasks(): Promise<Task[]> {
    return this.taskService.getAllTasks();
  }

  @Get('pending')
  async getPendingTasks(): Promise<Task[]> {
    return this.taskService.getPendingTasks();
  }

  @Get('completed')
  async getCompletedTasks(): Promise<Task[]> {
    return this.taskService.getCompletedTasks();
  }

  @Get('statistics')
  async getStatistics(): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionPercentage: number;
  }> {
    return this.taskService.getTaskStatistics();
  }

  @Get(':id')
  async getTaskById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Task> {
    return this.taskService.getTaskById(id);
  }

  @Put(':id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.taskService.updateTask(id, updateTaskDto);
  }

  @Put(':id/complete')
  async markTaskAsCompleted(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Task> {
    return this.taskService.markTaskAsCompleted(id);
  }

  @Delete(':id')
  async deleteTask(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.taskService.deleteTask(id);
  }
}
