-- Crear base de datos
CREATE DATABASE task_management_db;

-- Tabla: tasks
-- Descripción: Almacena todas las tareas del sistema


CREATE TABLE IF NOT EXISTS tasks (
    -- Identificador único de la tarea
    id SERIAL PRIMARY KEY,
    
    -- Título de la tarea (obligatorio, no puede estar vacío)
    title VARCHAR(255) NOT NULL,
    
    -- Descripción detallada de la tarea (opcional)
    description TEXT,
    
    -- Estado de completado 
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Fecha de creación 
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Fecha de actualización 
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Índices para optimizar consultas frecuentes
-- =====================================================

-- Índice en is_completed para optimizar búsqueda de tareas pendientes
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);

-- Índice en created_at para ordenar tareas por fecha
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- =====================================================
-- Datos de prueba (opcional)
-- =====================================================
INSERT INTO tasks (title, description, is_completed) VALUES 
    ('Configurar el proyecto NestJS', 'Instalar dependencias y configurar ambiente de desarrollo', FALSE),
    ('Crear modelo de datos', 'Definir entidades y relaciones en TypeORM', FALSE),
    ('Desarrollar endpoints API', 'Crear controllers y services para CRUD de tareas', FALSE);

-- Verificar que los datos se insertaron correctamente
SELECT * FROM tasks;
