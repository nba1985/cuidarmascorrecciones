# CUIDAR+ corregido

## Base de datos

1. Crear la base en SQL Server si no existe:

```sql
CREATE DATABASE CuidarPlus;
GO
```

2. Ejecutar `CuidadPlus.sql`.
3. Ejecutar `CUIDADPLUSAPI/Scripts/SeedDemo.sql` para cargar datos mÃ­nimos de prueba.

La API intenta agregar automÃ¡ticamente las columnas necesarias para tratamientos cÃ­clicos. Si el usuario de SQL Server no tiene permiso para alterar tablas, ejecutar una vez `CUIDADPLUSAPI/Scripts/AgregarTratamientosCiclicos.sql`.

## Backend

```bash
cd CUIDADPLUSAPI
dotnet restore
dotnet build
dotnet run
```

Swagger queda disponible normalmente en:

```txt
https://localhost:7243/swagger
```

La cadena activa estÃ¡ en `CUIDADPLUSAPI/appsettings.json`. Se dejÃ³ `SQLEXPRESS` como valor principal y ejemplos para `localhost` y SQL Auth.

## Frontend

```bash
cd CUIDAR/Cuidar-
copy .env.example .env
npm install
npm run dev
```

Abrir:

```txt
http://localhost:5173
```

Usuario demo:

```txt
demo@cuidarplus.local
demo
```

## Endpoints MVP

- `GET/POST/PUT/DELETE /api/Medicamentos`
- `GET/POST/PUT/DELETE /api/Recordatorios`
- `GET/POST/PUT/DELETE /api/Recetas`
- `GET/POST/PUT/DELETE /api/RegistrosTomas`
- `GET/POST/PUT/DELETE /api/HistorialesAnimo`
- `GET/POST/PUT/DELETE /api/Usuarios`
- `POST /api/Auth/login`
- `POST /api/Auth/registro`

## Cambios principales

- Se corrigieron nombres de `DbSet` y ruta/clase de `UsuariosController`.
- Se agregaron relaciones y defaults en `CuidarPlusContext`.
- Se agregÃ³ CORS para Vite en `localhost` y `127.0.0.1`.
- Se creÃ³ `SeedDemo.sql`.
- El frontend usa `VITE_API_URL` y servicios API tipados.
- Home, Medicamentos, Recordatorios, Recetas, Historial de Ãnimo, Perfil y Login consumen la API.

## Pendiente sugerido

- Reemplazar password plano por hash real y JWT.
- Agregar endpoints especÃ­ficos para prÃ³xima dosis y perfil enriquecido.
- Completar ediciÃ³n/eliminaciÃ³n desde el frontend para todas las pantallas.
- Agregar tests automatizados de API y frontend.
# Lectura inteligente de recetas

La lectura con IA fue retirada temporalmente. La carga manual de recetas sigue funcionando con adjuntos PDF/JPG/PNG/WEBP/HEIC/HEIF, médico asociado, observaciones y vista previa. No configurar claves `Gemini` por ahora; se reimplementará más adelante.

# ConfiguraciÃ³n del correo para recuperar contraseÃ±as

El token se envÃ­a por SMTP al correo registrado y nunca se devuelve al navegador. El proyecto ya incluye `smtp.gmail.com` y `cuidarmasvdr@gmail.com` como remitente; Ãºnicamente la contraseÃ±a de aplicaciÃ³n debe configurarse con User Secrets, fuera del cÃ³digo y del ZIP.

Ejemplo para Gmail, ejecutado desde la raÃ­z del proyecto:

```powershell
dotnet user-secrets set "Email:Password" "TU_CONTRASEÃ‘A_DE_APLICACION" --project .\CUIDADPLUSAPI\CuidarPlusAPI.csproj
```

Gmail requiere verificaciÃ³n en dos pasos y una contraseÃ±a de aplicaciÃ³n de 16 caracteres; no debe utilizarse la contraseÃ±a normal de la cuenta. Para otro proveedor, cambiar host, puerto, remitente y credenciales por los valores de su servicio SMTP. DespuÃ©s de configurar el secreto, reiniciar la API.


