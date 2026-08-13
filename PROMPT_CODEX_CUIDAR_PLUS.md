# Prompt para Codex - CUIDAR+

Necesito que corrijas y completes un proyecto llamado **CUIDAR+**, una app web de gestión de medicación, recetas digitales, recordatorios, confirmación de tomas, historial de tomas y estado de ánimo.

## Tecnologías del proyecto

- Frontend: React + TypeScript + Tailwind CSS + Vite.
- Backend: ASP.NET Core Web API en .NET 8, C# y Entity Framework Core.
- Base de datos: SQL Server, script `CuidadPlus.sql`.
- API REST con JSON entre frontend y backend.

## Estructura detectada

- Backend: carpeta `CUIDADPLUSAPI/`
  - `Program.cs`
  - `Data/CuidarPlusContext.cs`
  - `Models/`
  - `DTOs/`
  - `Controllers/`
  - `appsettings.json`
- Frontend: carpeta `CUIDAR/Cuidar-/`
  - `src/pages/`
  - `src/services/api.ts`
  - `src/routes.tsx`
- SQL: `CuidadPlus.sql`

## Objetivo principal

Dejar funcionando la conexión completa:

1. SQL Server Management Studio / SQL Server.
2. ASP.NET Core Web API.
3. Frontend React.

El resultado esperado es que se pueda ejecutar la API, abrir Swagger, ejecutar el frontend y que las pantallas principales consuman datos reales de la API.

## Base de datos detectada

El script usa la base `CuidarPlus` y tiene tablas como:

- `GRUPOS_SANGUINEOS`
- `ALERGIAS`
- `CONDICIONES`
- `SEGUROS_MEDICOS`
- `USUARIOS`
- `TELEFONOS`
- `COMPONENTES`
- `ESPECIALIDADES`
- `ESTADOS`
- `HISTORIALES_ANIMO`
- `HORARIOS`
- `LABORATORIOS`
- `MEDICAMENTOS`
- `MEDICOS`
- `NOTIFICACIONES`
- `RECETAS`
- `RECORDATORIOS`
- `REGISTROS_TOMAS`
- `TRATAMIENTOS`
- `USUARIOS_TIPOS`

## Problemas o puntos a revisar

### Backend

1. Revisar `appsettings.json`:

```json
"DefaultConnection": "Server=.\\SQLEXPRESS;Database=CuidarPlus;Trusted_Connection=True;TrustServerCertificate=True;"
```

Ajustar si hace falta para SQL Server local. También dejar un comentario o ejemplo para usar `localhost`, `SQLEXPRESS` o servidor con usuario y contraseña.

2. Revisar `Program.cs`:

Actualmente tiene CORS para:

```csharp
policy.WithOrigins("http://localhost:5173")
```

Mantenerlo o agregar también el puerto real que use Vite si cambia.

3. Revisar `CuidarPlusContext.cs`:

Corregir nombres de `DbSet` si están mal escritos. Ejemplo detectado:

```csharp
public DbSet<Notificacion> Notificacions { get; set; }
```

Debería quedar más claro como:

```csharp
public DbSet<Notificacion> Notificaciones { get; set; }
```

y actualizar los controladores que lo usen.

4. Validar que todos los modelos tengan `[Table]`, `[Column]` y `[Key]` correctos según el script SQL.

5. Agregar relaciones en `OnModelCreating` si hace falta, principalmente claves foráneas entre:

- `USUARIOS` y `GRUPOS_SANGUINEOS`
- `USUARIOS` y `USUARIOS_TIPOS`
- `USUARIOS` y `ALERGIAS`
- `USUARIOS` y `CONDICIONES`
- `USUARIOS` y `SEGUROS_MEDICOS`
- `TELEFONOS` y `USUARIOS`
- `MEDICAMENTOS` y `LABORATORIOS`
- `COMPONENTES` y `MEDICAMENTOS`
- `ESPECIALIDADES` y `MEDICOS`
- `HISTORIALES_ANIMO` y `USUARIOS`
- `HISTORIALES_ANIMO` y `ESTADOS`
- `HORARIOS` y `RECORDATORIOS`
- `HORARIOS` y `TRATAMIENTOS`
- `NOTIFICACIONES` y `RECORDATORIOS`
- `RECETAS` y `MEDICOS`
- `REGISTROS_TOMAS` y `RECORDATORIOS`
- `REGISTROS_TOMAS` y `HISTORIALES_ANIMO`
- `TRATAMIENTOS` y `USUARIOS`
- `TRATAMIENTOS` y `MEDICAMENTOS`
- `TRATAMIENTOS` y `RECETAS`
- `TRATAMIENTOS` y `MEDICOS`

6. Revisar que todos los controladores compilen y usen correctamente los DTOs.

7. Agregar endpoints funcionales mínimos para el MVP:

- `GET /api/Medicamentos`
- `POST /api/Medicamentos`
- `PUT /api/Medicamentos/{id}`
- `DELETE /api/Medicamentos/{id}`
- `GET /api/Recordatorios`
- `POST /api/Recordatorios`
- `GET /api/Recetas`
- `POST /api/Recetas`
- `GET /api/RegistrosTomas`
- `POST /api/RegistrosTomas`
- `GET /api/HistorialesAnimo`
- `POST /api/HistorialesAnimo`
- `GET /api/Usuarios`
- `POST /api/Usuarios`

8. Crear o completar datos iniciales si hacen falta para que no fallen altas por claves foráneas, por ejemplo:

- laboratorio por defecto con `ID_laboratorio = 1`
- estados de ánimo
- usuario demo
- médico demo

Se puede hacer con script SQL o con seed en EF Core.

### Frontend

1. Revisar `src/services/api.ts`.

Actualmente solo tiene funciones para medicamentos y usa:

```ts
const API_URL = "https://localhost:7243/api";
```

Hacerlo configurable con `.env`:

```env
VITE_API_URL=https://localhost:7243/api
```

Y en TypeScript:

```ts
const API_URL = import.meta.env.VITE_API_URL ?? "https://localhost:7243/api";
```

2. Crear servicios para:

- medicamentos
- recordatorios
- recetas
- registros de tomas
- historial de ánimo
- usuarios

3. Conectar pantallas que hoy estén con datos fijos o mockeados:

- `Home.tsx`: dejar de mostrar siempre “Hola, Mateo”, “Atorvastatina” y “21:00”; traer la próxima dosis desde la API o, si todavía no existe endpoint específico, calcularla desde recordatorios/horarios/tratamientos.
- `Medicamentos.tsx`: ya consume `obtenerMedicamentos()` y `crearMedicamento()`, pero revisar tipos nulos (`descripcion`, `presentacion`) y evitar que se rompa si vienen null.
- `Recordatorios.tsx`: conectar a la API.
- `Recetas.tsx`: conectar a la API.
- `HistorialdeAnimo.tsx`: conectar a la API.
- `Perfil.tsx`: conectar con usuario demo o usuario actual.
- `Login.tsx` y `Nuevacuenta.tsx`: implementar flujo básico sin JWT si el proyecto todavía no tiene autenticación real, o crear endpoints básicos de login/registro si corresponde.

4. Agregar manejo de errores amigable:

- API apagada.
- Error CORS.
- Base de datos sin datos.
- Error 400/500.

5. Validar que el frontend compile con:

```bash
npm install
npm run build
npm run dev
```

### Requisitos de ejecución

1. Restaurar la base en SQL Server:

```sql
CREATE DATABASE CuidarPlus;
GO
USE CuidarPlus;
GO
-- ejecutar el contenido de CuidadPlus.sql
```

Si el script ya contiene `USE [CuidarPlus]`, verificar que la base exista antes de correrlo.

2. Ejecutar backend:

```bash
cd CUIDADPLUSAPI
dotnet restore
dotnet build
dotnet run
```

3. Revisar Swagger:

```txt
https://localhost:7243/swagger
```

Si el puerto cambia, actualizar el frontend.

4. Ejecutar frontend:

```bash
cd CUIDAR/Cuidar-
npm install
npm run dev
```

5. Probar en navegador:

```txt
http://localhost:5173
```

## Entregable esperado

Quiero que realices las correcciones necesarias en el código y que al final me indiques:

1. Archivos modificados.
2. Errores encontrados.
3. Cómo ejecutar la base, la API y el frontend.
4. Endpoints disponibles.
5. Qué quedó pendiente para una segunda etapa.

Prioridad: que compile y funcione el MVP antes que agregar funciones avanzadas.
