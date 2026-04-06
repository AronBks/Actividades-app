# Sistema de Gestión de Tareas

Sistema de Gestión de Tareas desarrollado con NestJS, Angular y PostgreSQL.

## Características

- Crear tareas con título y descripción
- Marcar tareas como completadas
- Eliminar tareas
- Filtrar por estado (Pendientes, Completadas, Todas)
- Estadísticas en tiempo real
- Validación de datos
- Arquitectura por capas
- Testing automatizado
- API RESTful

## Estructura del Proyecto

```
Examen Actividades/
├── backend/
│   ├── src/
│   │   ├── tasks/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── entities/
│   │   │   └── dtos/
│   │   └── app.module.ts
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/
│   │   │   └── modules/tasks/
│   │   └── main.ts
│   ├── package.json
│   └── angular.json
├── database/
│   └── schema.sql
└── README.md
```

## Instalación

### Requisitos

- Node.js >= 18.x
- PostgreSQL >= 12.x
- npm >= 9.x

### Base de Datos

Crear la base de datos:

```sql
CREATE DATABASE task_management_db;
```

Ejecutar el script SQL:

```bash
psql -U postgres -d task_management_db -f database/schema.sql
```

### Backend

```bash
cd backend
npm install
cp .env.example .env

# Editar .env con los siguientes valores:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=tu_password
# DB_NAME=task_management_db

npm run start:dev
# Servidor en http://localhost:3000
```

### Frontend

En otra terminal:

```bash
cd frontend
npm install
npm start
# Aplicación en http://localhost:4200
```

## API Endpoints

| Método | Endpoint | Descripción |
|--------|---------|------------|
| GET | `/api/tasks` | Obtener todas las tareas |
| GET | `/api/tasks/pending` | Obtener tareas pendientes |
| GET | `/api/tasks/completed` | Obtener tareas completadas |
| GET | `/api/tasks/statistics` | Obtener estadísticas |
| GET | `/api/tasks/:id` | Obtener una tarea |
| POST | `/api/tasks` | Crear tarea |
| PUT | `/api/tasks/:id` | Actualizar tarea |
| PUT | `/api/tasks/:id/complete` | Marcar como completada |
| DELETE | `/api/tasks/:id` | Eliminar tarea |

## Pruebas

```bash
cd backend
npm test
```

```
Capa de Presentación (Frontend)
         ↓ HTTP
Capa de Aplicación (Backend)
         ↓ Services & DTOs
Capa de Persistencia (BD)
```

### Patrones Utilizados

- **Repository Pattern**: Abstracción de acceso a datos
- **Dependency Injection**: Desacoplamiento de componentes
- **DTO Pattern**: Validación de datos de entrada
- **Reactive Forms**: Angular Reactive Forms
- **RxJS**: Programación reactiva

## 🔐 Seguridad

- Validación estricta de DTOs en servidor
- Sanitización de inputs
- CORS configurado
- Validación de tipos TypeScript
## Solución de Problemas

### Backend no inicia

```bash
# Verificar PostgreSQL
psql -U postgres -d task_management_db -c "SELECT 1"

# Reinstalar dependencias
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend no conecta

1. Verificar que backend está en http://localhost:3000
2. Verificar CORS en backend/src/app.module.ts
3. Verificar URL en frontend/src/app/services/task.service.ts

### Pruebas fallan

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm test
```

## Documentación

- database/schema.sql - Schema de base de datos
- backend/.env.example - Variables de entorno

## Notas

- Backend: http://localhost:3000
- Frontend: http://localhost:4200
- Base de datos: PostgreSQL en localhost:5432
