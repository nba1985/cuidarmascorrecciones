# CUIDAR+ â€” ContinuaciÃ³n del proyecto

> DocumentaciÃ³n viva. Debe reflejar Ãºnicamente el estado actual del proyecto.
> Ãšltima revisiÃ³n integral: 2026-06-28, despuÃ©s de incorporar el envÃ­o por correo del token de recuperaciÃ³n de contraseÃ±a.

## Reglas de mantenimiento

Antes de cerrar cualquier tarea que cambie de forma relevante el proyecto:

1. Actualizar este documento con el estado realmente implementado y verificado.
2. Registrar funcionalidades nuevas o modificadas.
3. Actualizar la lista de archivos importantes y de archivos modificados recientemente.
4. Resolver, agregar, reordenar o eliminar tareas pendientes segÃºn corresponda.
5. Actualizar los prÃ³ximos pasos y eliminar informaciÃ³n obsoleta.
6. Registrar el cambio histÃ³rico en `CHANGELOG.md`; no convertir este archivo en un diario.
7. Regenerar `CuidarPlus_Corregido.zip` en la carpeta `outputs` original, excluyendo dependencias y artefactos generados.

## Resumen ejecutivo

CUIDAR+ es una aplicaciÃ³n web para acompaÃ±ar tratamientos mÃ©dicos. Permite registrar pacientes, gestionar medicamentos, recetas y recordatorios, confirmar u omitir tomas, consultar historiales, registrar el estado de Ã¡nimo y editar un perfil mÃ©dico con fotografÃ­a y contacto de emergencia.

El repositorio contiene un frontend React/TypeScript, una API ASP.NET Core y un esquema para SQL Server. Backend y frontend compilan correctamente y la integraciÃ³n principal estÃ¡ operativa. La aceptaciÃ³n manual completa queda a cargo del usuario; la mayor deuda tÃ©cnica continÃºa en seguridad, autorizaciÃ³n por usuario, recurrencia temporal, pruebas automatizadas y consolidaciÃ³n de proyectos duplicados.

## Estado actual

### Estado general

- LÃ­nea base importada desde `CuidarPlus_Corregido.zip` el 2026-06-18.
- CÃ³digo explorado Ã­ntegramente en modo lectura antes de crear esta documentaciÃ³n.
- Aproximadamente 148 archivos de texto, 14.000 lÃ­neas y 107 acciones HTTP declaradas.
- No se encontraron marcadores `TODO`, `FIXME` o `HACK`; las tareas pendientes se derivan del comportamiento y la arquitectura observados.
- CompilaciÃ³n del backend: verificada, sin errores ni advertencias.
- CompilaciÃ³n del frontend: verificada con TypeScript y Vite, sin errores.
- IntegraciÃ³n con SQL Server: verificada para lectura de medicamentos y actualizaciÃ³n de horario/frecuencia.
- Pruebas automatizadas: existe una base ejecutable con `node --test` para edad y validaciÃ³n de adjuntos de recetas.

### Funcionalidades implementadas

- Registro e inicio de sesiÃ³n de usuarios.
- Hash de contraseÃ±as mediante `PasswordHasher<Usuario>`; el login migra contraseÃ±as antiguas en texto plano cuando las detecta.
- Recupero/cambio de contraseÃ±a con token seguro, vencimiento de 30 minutos y persistencia hasheada en SQL Server.
- El token de recuperaciÃ³n se envÃ­a al correo registrado mediante SMTP, vence a los 30 minutos, solo puede utilizarse una vez y nunca se devuelve al navegador.
- La configuraciÃ³n SMTP se mantiene fuera del cÃ³digo mediante User Secrets o variables `Email__*`; si falta o el envÃ­o falla, el token se invalida y la interfaz informa el problema.
- El remitente configurado es `cuidarmasvdr@gmail.com` mediante `smtp.gmail.com:587`; solo falta proporcionar su contraseÃ±a de aplicaciÃ³n mediante User Secrets para habilitar entregas reales.
- El endpoint de recupero asegura automÃ¡ticamente la tabla `PASSWORD_RESET_TOKENS` si la base existente todavÃ­a no la tiene creada.
- Persistencia del usuario actual en `localStorage` bajo la clave `cuidarPlusUsuario`.
- CRUD REST para las entidades principales y catÃ¡logos auxiliares.
- GestiÃ³n de medicamentos asociados a un usuario mediante tratamientos.
- Contraindicaciones y efectos secundarios se leen exclusivamente desde las columnas homÃ³nimas de `MEDICAMENTOS`; se muestran en tarjetas, detalle y como referencia de solo lectura al seleccionar un medicamento. El usuario no puede modificarlos desde un tratamiento.
- Tratamientos crÃ³nicos/de por vida y temporales con fecha de inicio y fin.
- Tratamientos cÃ­clicos configurables con dÃ­as activos, dÃ­as de descanso, cantidad de ciclos opcional y dos horarios diarios independientes.
- Durante el descanso de un tratamiento cÃ­clico no se devuelven recordatorios ni suenan alarmas; el medicamento permanece visible con el estado y la fecha del prÃ³ximo ciclo.
- Las tarjetas de Medicamentos muestran ciclo actual, dÃ­a activo, descanso, prÃ³ximo reinicio o finalizaciÃ³n; el historial previo nunca se elimina.
- Las bases existentes incorporan automÃ¡ticamente `TipoPlan`, `DiasActivos`, `DiasDescanso` y `CantidadCiclos`; tambiÃ©n existe un script SQL manual de respaldo.
- Los tratamientos temporales vencidos dejan de aparecer como activos en Medicamentos, Inicio y Recordatorios, pero sus tomas continÃºan disponibles en Historial.
- CreaciÃ³n automÃ¡tica de horarios y recordatorios desde la frecuencia de un medicamento.
- Frecuencias admitidas por la UI: cada 6, 8, 12 o 24 horas.
- ConfirmaciÃ³n de tomas dentro de una ventana de 15 minutos antes o despuÃ©s del horario.
- Registro de tomas confirmadas u omitidas.
- Historial combinado de tomas y estados de Ã¡nimo.
- Registro de estado de Ã¡nimo con escala visible 1â€“5: Muy mal = 1/5, Mal = 2/5, Regular = 3/5, Bien = 4/5 y Muy bien = 5/5.
- Motivo obligatorio cuando el usuario registra Mal o Muy mal; para Regular, Bien y Muy bien alcanza con seleccionar el emoji.
- GestiÃ³n de recetas desde el frontend.
- Recetas con adjuntos PDF/JPG/PNG/WEBP/HEIC/HEIF de hasta 10 MB, selecciÃ³n de mÃ©dico existente o alta de uno nuevo.
- Recetas muestran tÃ­tulos amigables; las rutas internas de archivos se conservan para apertura/vista previa, pero no se usan como nombre principal.
- Inicio incluye una tarjeta visual de farmacias cercanas con Google Maps embebido y apertura externa; la bÃºsqueda se genera con la localidad registrada en el perfil y usa CÃ³rdoba Capital como respaldo si estÃ¡ vacÃ­a.
- Las horas de prÃ³ximas dosis, recordatorios, historial y detalle de medicamento se muestran uniformemente en formato digital de 24 horas `HH:mm` (`00:00` a `23:59`).
- Modo claro/oscuro persistente desde el encabezado; conserva la estÃ©tica verde de CUIDAR+ y ajusta fondos, textos, bordes, formularios, modales e iframe.
- En modo oscuro el encabezado usa un logo blanco especÃ­fico para conservar contraste y legibilidad.
- Los accesos rÃ¡pidos tienen estilos especÃ­ficos en modo oscuro: fondo oscuro, borde visible, textos legibles e iconos invertidos.
- El acceso rÃ¡pido de Medicamentos y el acceso mobile â€œMedic.â€ usan imÃ¡genes dedicadas para modo claro y modo oscuro, provistas por el usuario.
- Historial y Perfil tienen ajustes de contraste para tarjetas verde claro en modo oscuro, incluyendo estadÃ­sticas, tarjetas de Ã¡nimo y grupo sanguÃ­neo.
- En Perfil, la subtarjeta de grupo sanguÃ­neo usa el mismo fondo y borde que Alergias y Condiciones para mantener uniformidad visual.
- Perfil enriquecido basado en la vista SQL `VW_PerfilUsuario`.
- EdiciÃ³n de perfil, telÃ©fono, datos mÃ©dicos y contacto de emergencia.
- Carga y publicaciÃ³n de fotografÃ­as desde `wwwroot/uploads/perfiles`.
- SelecciÃ³n, vista previa, redimensionado y carga de fotografÃ­a durante el registro de una cuenta nueva.
- PWA bÃ¡sica con manifest, service worker, notificaciones del navegador y alarma sonora.
- Datos iniciales mediante `SeedDemo.sql` y catÃ¡logo mediante `SeedMedicamentosArgentina.sql`.
- ConfiguraciÃ³n del endpoint de API mediante `VITE_API_URL`.
- EdiciÃ³n de horarios diarios compatible con SQL `time`: 24 horas se representa como frecuencia nula y el frontend la interpreta como una vez al dÃ­a.
- Los recordatorios nuevos se persisten Ãºnicamente despuÃ©s de asignar una fecha vÃ¡lida.
- La alarma identifica cada aviso por recordatorio y horario; cambiar la hora permite un nuevo aviso el mismo dÃ­a.
- La alarma tolera hasta cinco minutos de retraso por pestaÃ±as en segundo plano o suspensiÃ³n del equipo.
- La campana abre una configuraciÃ³n de ringtone con Chirp, Arpeggio, Departure, Chalet y Journey; la elecciÃ³n persiste en `localStorage`.
- Los avisos antes bloqueantes se muestran globalmente como toasters de Sonner con estÃ©tica CUIDAR+.
- Biblioteca reutilizable de interfaz para botones, campos, modales, estados de carga/error/vacÃ­o y confirmaciones.
- Estados de carga, reintento, vacÃ­o y guardado aplicados a Recetas y Recordatorios; prevenciÃ³n de envÃ­os duplicados en formularios crÃ­ticos.
- Confirmaciones destructivas integradas en la estÃ©tica de la aplicaciÃ³n, sin diÃ¡logos nativos en Medicamentos y Recetas.
- LÃ­mite, formatos y tamaÃ±o del archivo de receta validados antes de enviarlo, con nombre y tamaÃ±o visibles.
- LÃ­mite de error global para evitar que una excepciÃ³n de React deje la pantalla completamente en blanco.
- Rutas `/app` protegidas en el cliente y retorno automÃ¡tico a la pantalla solicitada despuÃ©s de iniciar sesiÃ³n.
- Cierre local de sesiÃ³n y redirecciÃ³n al login cuando la API responde HTTP 401.
- Mejoras de teclado, foco visible, reducciÃ³n de movimiento, controles tÃ¡ctiles y adaptaciÃ³n de diÃ¡logos en pantallas pequeÃ±as.
- Historial presentado como lÃ­nea de tiempo diaria: cada tarjeta reÃºne una toma y su estado de Ã¡nimo con iconos, emojis, horarios y estados visuales; los registros sin pareja siguen visibles.
- Las nuevas confirmaciones y omisiones enlazan de forma persistente la toma con el Ã¡nimo posterior usando `ID_historial_animo`; los datos antiguos conservan emparejamiento visual compatible.
- Historial con filtros por perÃ­odo, estado y medicamento; estadÃ­sticas de adherencia, confirmadas, omitidas, Ã¡nimo predominante, promedio de Ã¡nimo y porcentaje de estados bajos.
- Calendario mensual con indicadores de dÃ­as completos, omisiones y actividad emocional.
- ExportaciÃ³n de la vista filtrada del Historial mediante impresiÃ³n optimizada para guardar como PDF.
- Inicio permite omitir una dosis con motivo opcional y continuar al registro de Ã¡nimo.
- Pantalla de detalle por medicamento con horarios, frecuencia, adherencia y Ãºltimas tomas.
- Pausa y reanudaciÃ³n manual de tratamientos mediante activaciÃ³n/desactivaciÃ³n de horarios.
- Recordatorios con acciones Tomado, Omitido, Posponer 10 minutos y Editar horario.
- BÃºsquedas en Medicamentos, Recetas y Recordatorios.
- Vista previa integrada para recetas PDF, JPG, PNG y WEBP, con apertura externa para otros formatos.
- Alertas en Inicio para tratamientos pausados, medicamentos sin horario y omisiones recientes.
- Validaciones junto a campos crÃ­ticos del alta de usuario.
- Modo persistente de texto grande accesible desde el encabezado.
- AutenticaciÃ³n backend mediante cookie HTTP-only de 12 horas, autorizaciÃ³n global y rechazo de consultas con un `idUsuario` distinto al autenticado.
- Perfil con una tarjeta unificada de â€œInformaciÃ³n para emergenciasâ€ que reÃºne grupo sanguÃ­neo, alergias y condiciones.
- Tipo de telÃ©fono limitado a opciones seleccionables: Celular, Fijo, Trabajo o WhatsApp.
- CondiciÃ³n clÃ­nica cargada mediante combobox de opciones frecuentes en alta y ediciÃ³n de perfil.
- Ficha clínica de medicamentos desde SQL con contraindicaciones y efectos secundarios de solo lectura, visible en la lista y en el detalle.
- Contacto de emergencia con nombre, parentesco y telÃ©fono propio, disponible tanto en el alta como en la ediciÃ³n y mostrado con acceso de llamada.
- NavegaciÃ³n mÃ³vil de seis accesos con Historial y su icono de lÃ­nea.
- El menÃº inferior responsive tiene estilos propios para modo claro/oscuro, contraste corregido en Ã­conos y etiquetas, estado activo visible y todos sus accesos igualados al verde activo correspondiente.
- ProtecciÃ³n global contra desbordamiento horizontal y ajuste de correos/textos largos en las tarjetas de Perfil.
- ConfiguraciÃ³n de ringtones mediante opciones visibles: selecciÃ³n, escucha, guardado y permiso de notificaciones funcionan como acciones independientes.
- Encabezado superior fijo durante el scroll para mantener siempre visibles la navegaciÃ³n, A+, campana y acceso al perfil.
- Aviso emergente de medicaciÃ³n con acciÃ³n secundaria â€œPosponer toma 10 minutosâ€; al posponer se actualiza el recordatorio en backend y el aviso vuelve a sonar al nuevo horario.

### Limitaciones conocidas

- La primera ejecuciÃ³n con tratamientos cÃ­clicos necesita SQL Server disponible para agregar las columnas; si el usuario de la API no puede alterar tablas debe ejecutarse manualmente `Scripts/AgregarTratamientosCiclicos.sql`.
- La cookie autenticada ya protege globalmente la API y los identificadores de ruta/consulta, pero aÃºn debe auditarse cada DTO con `idUsuario` en el cuerpo para derivarlo siempre de la identidad autenticada.
- `localStorage` conserva el DTO sÃ³lo para representar la interfaz; la API usa la cookie HTTP-only como autoridad de acceso.
- Las fotografÃ­as y recetas servidas como archivos estÃ¡ticos todavÃ­a requieren una polÃ­tica privada de descarga si la aplicaciÃ³n se expone fuera del entorno local.
- Los recordatorios usan fechas construidas con `DateTime.Today`; la recurrencia diaria se interpreta parcialmente en el frontend y necesita un modelo temporal mÃ¡s sÃ³lido para escenarios productivos complejos.
- Los registros histÃ³ricos anteriores al 2026-06-20 pueden no tener relaciÃ³n persistida; Historial los empareja por dÃ­a y orden cronolÃ³gico sin ocultarlos.
- Stock, fechas previstas y vencimientos se guardan actualmente por dispositivo en `localStorage`; para sincronizarlos entre equipos todavÃ­a debe ampliarse la base de datos.
- El botÃ³n **Omitir** de Home no registra todavÃ­a la omisiÃ³n.
- La ediciÃ³n y eliminaciÃ³n no estÃ¡ completa en todas las pantallas.
- La lÃ³gica de perfiles estÃ¡ duplicada entre `AuthController` y `UsuariosController`.
- El contacto de emergencia se representa reutilizando filas de `USUARIOS`, lo que complica el dominio.
- La carga de imÃ¡genes no define un lÃ­mite de tamaÃ±o, valida el contenido sÃ³lo por `ContentType` y no elimina archivos reemplazados.
- El manejo de errores ya dispone de toasters, estados reutilizables y reintentos en pantallas principales, pero todavÃ­a debe unificarse en todas las pÃ¡ginas.
- No hay migraciones de Entity Framework; el esquema se instala manualmente con SQL.
- Hay dos proyectos (`CuidarPlusAPI.csproj` y `CuidarPlus.csproj`) y dos soluciones; todavÃ­a no se determinÃ³ cuÃ¡l debe conservarse como entrada Ãºnica.
- `App.tsx` y `Registro.tsx` estÃ¡n vacÃ­os o sin uso funcional.
- El README propio del frontend conserva el contenido estÃ¡ndar de Vite.
- El paquete original contiene un `.env` y una fotografÃ­a de usuario; debe decidirse si esos archivos deben distribuirse.

## Arquitectura y decisiones vigentes

### Frontend

- React 19 con TypeScript 6 y Vite 8.
- React Router 7 mediante `createBrowserRouter`.
- Tailwind CSS 4 y estilos adicionales embebidos en componentes.
- Acceso a la API centralizado en `src/services/api.ts` usando `fetch`.
- Estado principalmente local con hooks; Zustand estÃ¡ instalado pero no se utiliza como almacÃ©n global visible.
- El usuario autenticado se conserva en `localStorage`.
- La alarma consulta recordatorios cada 30 segundos y utiliza Notification API, service worker y audio local.

### Backend

- ASP.NET Core Web API sobre .NET 8.
- Entity Framework Core 8 con proveedor SQL Server.
- OrganizaciÃ³n por `Controllers`, `DTOs`, `Models` y `Data`.
- Los controladores contienen principalmente acceso a datos y lÃ³gica de negocio; existe un primer servicio aislado para anÃ¡lisis de recetas, pero todavÃ­a no hay una capa de servicios general.
- Mapeo database-first con atributos `[Table]`, `[Column]` y `[Key]`.
- Relaciones configuradas en `CuidarPlusContext.OnModelCreating`, en general con `DeleteBehavior.NoAction`.
- Swagger disponible sÃ³lo en entorno Development.
- CORS permite orÃ­genes HTTP loopback para el entorno local de Vite.
- Archivos estÃ¡ticos habilitados para servir fotografÃ­as subidas.

### Base de datos

- SQL Server, base esperada: `CuidarPlus`.
- El esquema se crea con `CuidadPlus.sql`.
- Entidades principales: usuarios, medicamentos, tratamientos, horarios, recordatorios, registros de tomas, recetas e historiales de Ã¡nimo.
- CatÃ¡logos: grupos sanguÃ­neos, alergias, condiciones, seguros, tipos de usuario, laboratorios, mÃ©dicos, especialidades y estados.
- La vista `VW_PerfilUsuario` compone los datos de perfil consumidos por la API.
- `SeedDemo.sql` aporta datos mÃ­nimos y credenciales demo; `SeedMedicamentosArgentina.sql` carga catÃ¡logo adicional.

## Flujo principal de datos

1. El usuario inicia sesiÃ³n o se registra mediante `AuthController`.
2. El frontend guarda el DTO del usuario en `localStorage`.
3. Al asociar un medicamento, la API crea o reactiva un `TRATAMIENTO`.
4. La frecuencia genera registros en `HORARIOS` y `RECORDATORIOS`.
5. Home y Recordatorios consultan esos recordatorios por usuario.
6. Una confirmaciÃ³n u omisiÃ³n crea un `REGISTRO_TOMA`.
7. El usuario puede registrar su estado en `HISTORIALES_ANIMO`.
8. Historial combina ambos conjuntos para presentarlos en la interfaz.

## Archivos mÃ¡s importantes

### RaÃ­z y datos

- `CuidadPlus.sql`: esquema, claves y vista de perfil.
- `README_EJECUCION.md`: instrucciones operativas actuales.
- `CHANGELOG.md`: historial acumulativo de cambios.

### Backend

- `CUIDADPLUSAPI/Program.cs`: registro de servicios y pipeline HTTP.
- `CUIDADPLUSAPI/Data/CuidarPlusContext.cs`: DbSets, defaults, vista y relaciones.
- `CUIDADPLUSAPI/Controllers/AuthController.cs`: login, registro, hash de contraseÃ±as y recupero con token.
- `CUIDADPLUSAPI/Models/PasswordResetToken.cs`: persistencia de tokens hasheados para recupero de contraseÃ±a.
- `CUIDADPLUSAPI/DTOs/AuthDtos.cs`: contratos de login, registro y recupero de contraseÃ±a.
- `CUIDADPLUSAPI/Controllers/MedicamentosController.cs`: asociaciÃ³n usuario-medicamento y generaciÃ³n de horarios.
- `CUIDADPLUSAPI/Controllers/UsuariosController.cs`: CRUD, perfil completo y fotografÃ­as.
- `CUIDADPLUSAPI/Controllers/RecordatoriosController.cs`: recordatorios, filtrado por usuario y sincronizaciÃ³n de horarios editados.
- `CUIDADPLUSAPI/Controllers/RegistrosTomasController.cs`: trazabilidad de tomas.
- `CUIDADPLUSAPI/Controllers/RecetasController.cs`: recetas, adjuntos y asociaciÃ³n indirecta por tratamiento.
- `CUIDADPLUSAPI/Controllers/HistorialesAnimoController.cs`: estados de Ã¡nimo.
- `CUIDADPLUSAPI/Scripts/SeedDemo.sql`: datos mÃ­nimos de demostraciÃ³n.
- `CUIDADPLUSAPI/Scripts/SeedMedicamentosArgentina.sql`: catÃ¡logo de medicamentos y laboratorios.

### Frontend

- `CUIDAR/Cuidar-/src/services/api.ts`: tipos, configuraciÃ³n y operaciones REST.
- `CUIDAR/Cuidar-/src/routes.tsx`: rutas pÃºblicas y de la aplicaciÃ³n.
- `CUIDAR/Cuidar-/src/pages/RecuperarPassword.tsx`: flujo pÃºblico de solicitud de token y actualizaciÃ³n de contraseÃ±a.
- `CUIDAR/Cuidar-/src/components/ui.tsx`: componentes reutilizables y estados comunes de interfaz.
- `CUIDAR/Cuidar-/src/components/RutaProtegida.tsx`: guard de sesiÃ³n para el Ã¡rbol privado.
- `CUIDAR/Cuidar-/src/components/ErrorBoundary.tsx`: recuperaciÃ³n ante errores de renderizado.
- `CUIDAR/Cuidar-/src/components/NotificacionesGlobales.tsx`: toasters y avisos diferidos globales.
- `CUIDAR/Cuidar-/src/pages/Home.tsx`: tablero, prÃ³xima dosis, progreso diario y mapa de farmacias cercanas.
- `CUIDAR/Cuidar-/src/components/layouts/Layouts.tsx`: marco general, encabezado fijo, navegaciÃ³n principal y toggles A+/modo oscuro.
- `CUIDAR/Cuidar-/src/pages/Medicamentos.tsx`: gestiÃ³n de medicamentos y frecuencias.
- `CUIDAR/Cuidar-/src/pages/Recordatorios.tsx`: confirmaciÃ³n, omisiÃ³n y ediciÃ³n de horarios.
- `CUIDAR/Cuidar-/src/pages/Historial.tsx`: historial consolidado.
- `CUIDAR/Cuidar-/src/pages/HistorialdeAnimo.tsx`: registro emocional.
- `CUIDAR/Cuidar-/src/pages/Perfil.tsx`: ediciÃ³n de datos y foto.
- `CUIDAR/Cuidar-/src/components/RecordatorioAlarma.tsx`: alarma, sonido y notificaciones.
- `CUIDAR/Cuidar-/src/index.css`: accesibilidad global, adaptaciÃ³n responsive y modo oscuro.
- `CUIDAR/Cuidar-/src/assets/img/logo-modo-oscuro.png`: variante blanca del logo usada al activar modo oscuro.
- `CUIDAR/Cuidar-/src/assets/img/pastillas-ok.png`: icono de Medicamentos para accesos rÃ¡pidos en modo claro.
- `CUIDAR/Cuidar-/src/assets/img/pastillas-ok-modo-oscuro.png`: icono de Medicamentos para accesos rÃ¡pidos en modo oscuro.
- `CUIDAR/Cuidar-/src/utils/horarios.ts`: cÃ¡lculos y ventana de confirmaciÃ³n.
- `CUIDAR/Cuidar-/src/utils/opcionesClinicas.ts`: condiciones frecuentes y fichas clÃ­nicas locales de medicamentos.
- `CUIDAR/Cuidar-/public/sw.js`: service worker.
- `CUIDAR/Cuidar-/tests/logic.test.mjs`: pruebas automatizadas iniciales de reglas sensibles.

## Archivos modificados recientemente

### 2026-08-13 — Retiro temporal de lectura inteligente de recetas

- `CUIDAR/Cuidar-/src/pages/Recetas.tsx` y `src/services/api.ts`: se quitó la acción de análisis con IA, sus estados, tipos y llamada HTTP; la carga manual de recetas, médicos, observaciones y vista previa queda vigente.
- `CUIDADPLUSAPI/Controllers/RecetasController.cs`, `Program.cs`, `CuidarPlusAPI.csproj` y `appsettings.json`: se retiró el endpoint de análisis, el servicio Gemini, el DTO de análisis, el paquete `Google.GenAI` y la configuración `Gemini` para evitar errores por claves/API hasta reimplementarlo más adelante.
- `README_EJECUCION.md`: ya no indica configurar claves de IA; aclara que la lectura inteligente queda postergada.

Verificación: backend Release compilado con 0 errores/advertencias; frontend compilado; pruebas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks. ZIP regenerado en `outputs/CuidarPlus_Corregido.zip` y sincronizado con el ZIP original de `2026-06-11`.

### 2026-08-13 — Corrección visual de modales y textos

- `CUIDAR/Cuidar-/src/pages/Recetas.tsx`: corrige mojibake visible en archivo adjunto, médico, matrícula, mensajes de carga/error y confirmaciones; el modal de nueva/editar receta queda compacto, sin scroll interno y con textarea más bajo.
- `CUIDAR/Cuidar-/src/pages/Medicamentos.tsx`: el modal de nuevo/editar medicamento pasa a un diseño ancho en grilla, con campos, tarjetas de tratamiento y ficha clínica más compactas para entrar mejor en pantalla.
- `CUIDAR/Cuidar-/src/pages/Perfil.tsx`: el modal de edición usa tres columnas en escritorio, campos más compactos y bloque de foto reducido para evitar el scroll interno.
- `CUIDAR/Cuidar-/src/services/api.ts` y `src/components/ui.tsx`: corrigen textos mojibakeados comunes y el modal genérico deja de forzar scroll interno.
- `CUIDAR/Cuidar-/src/index.css`, `src/components/ui.tsx`, `src/components/RecordatorioAlarma.tsx`, `src/pages/Medicamentos.tsx`, `src/pages/Perfil.tsx`, `src/pages/Recetas.tsx` y `src/pages/Recordatorios.tsx`: incorporan una capa de modal desplazable sólo en móvil, con espacio inferior para la navegación fija; desde 768px el panel no fuerza scroll interno para evitar barras en PC/tablet cuando el modal entra en pantalla, incluso con A+.
- `CUIDAR/Cuidar-/src/index.css` y `src/pages/Medicamentos.tsx`: agregan variante compacta para el modal de nuevo/editar medicamento en pantallas horizontales bajas tipo Nest Hub/Nest Hub Max (`min-width: 768px` y `max-height: 820px`), elevando el z-index del modal por encima del menú inferior y reduciendo paddings/gaps/alturas mínimas para que entren título, ficha clínica y botones incluso con A+.
- `CUIDAR/Cuidar-/src/index.css`, `src/components/ui.tsx`, `src/components/RecordatorioAlarma.tsx`, `src/pages/Medicamentos.tsx`, `src/pages/Perfil.tsx` y `src/pages/Recetas.tsx`: unifican el cierre por cruz con la clase `modal-close-button`, usando la misma `x`, tamaño, color y hover en modo claro/oscuro; Recetas y Perfil incorporan cruz de cierre en el encabezado.
- `CUIDAR/Cuidar-/src/index.css`: agrega variantes oscuras para fondos, bordes y títulos de tarjetas clínicas de contraindicaciones y efectos secundarios, evitando tarjetas claras con texto lavado en modo oscuro.
- `CUIDAR/Cuidar-/src/index.css` y `CUIDAR/Cuidar-/src/pages/Medicamentos.tsx`: ajustan las acciones de cada tarjeta de Medicamentos para que los botones mantengan texto en una sola línea cuando hay espacio, se distribuyan en grilla en tamaños intermedios y no queden con texto invisible al hacer hover/disabled en modo oscuro.
- `CUIDAR/Cuidar-/src/pages/MedicamentoDetalle.tsx`: limpia mojibake remanente en ficha clínica, planificación, “Últimas tomas”, “Crónico” y separadores.

Verificación: frontend compilado y pruebas 2/2. Backend sin cambios en esta corrección. ZIP regenerado en `outputs/CuidarPlus_Corregido.zip` y sincronizado con el ZIP original de `2026-06-11`.

### 2026-06-28 â€” RecuperaciÃ³n de contraseÃ±a por correo

- `Services/EmailService.cs`: cliente SMTP configurable y correo HTML con token, vencimiento e indicaciones de seguridad.
- `Controllers/AuthController.cs`: envÃ­a el token al correo registrado, deja de exponerlo en JSON e invalida el token si falla la entrega.
- `Program.cs`, `appsettings.json` y `DTOs/AuthDtos.cs`: registro del servicio y contrato seguro sin token de respuesta.
- `src/pages/RecuperarPassword.tsx` y `src/services/api.ts`: eliminan el token de desarrollo y guÃ­an al usuario a revisar su correo.
- `README_EJECUCION.md`: instrucciones de User Secrets para Gmail u otro servidor SMTP.

VerificaciÃ³n: backend Release y frontend compilados correctamente. El envÃ­o real queda condicionado a configurar credenciales SMTP vÃ¡lidas del propietario del proyecto.

### 2026-06-28 â€” Ficha clÃ­nica de medicamentos desde SQL

- `Models/Medicamento.cs` y `DTOs/Medicamento*.cs`: incorporan `Contraindicaciones` y `EfectosSecundarios` (`Efectos_secundarios` en SQL).
- `Controllers/MedicamentosController.cs`: incluye ambos campos en catÃ¡logo, medicamentos del usuario y detalle, pero no permite modificarlos desde las altas o ediciones de tratamientos.
- `src/services/api.ts`: amplÃ­a el contrato TypeScript y los payloads de guardado.
- `src/pages/Medicamentos.tsx` y `MedicamentoDetalle.tsx`: muestran la informaciÃ³n persistida en SQL; en el formulario reemplazan los campos editables por una tarjeta clÃ­nica de solo lectura.

VerificaciÃ³n: API real devolviÃ³ para Aspirina ambos textos almacenados; backend Release compilado con 0 errores/advertencias; frontend compilado; pruebas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-28 â€” CorrecciÃ³n de perfil

- `Controllers/UsuariosController.cs`: guardado transaccional, validaciÃ³n de correo duplicado, respuestas `ProblemDetails` y correo tÃ©cnico Ãºnico para contactos de emergencia, evitando el conflicto del Ã­ndice Ãºnico de `Mail`.
- `src/pages/Perfil.tsx`: bloquea envÃ­os dobles mientras se guarda y muestra el estado â€œGuardando...â€.

VerificaciÃ³n: backend Release compilado con 0 errores/advertencias; frontend compilado; pruebas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-28 â€” Horarios de 24 horas y farmacias segÃºn localidad

- `src/utils/formatoFecha.ts`: centraliza la representaciÃ³n exacta `HH:mm` sin indicadores a. m./p. m.
- `src/pages/Home.tsx`: muestra la prÃ³xima dosis en 24 horas y construye el mapa y el enlace externo con la ciudad del usuario autenticado.
- `src/pages/Recordatorios.tsx`, `Historial.tsx` y `MedicamentoDetalle.tsx`: unifican todos los horarios visibles mediante el formateador comÃºn.

VerificaciÃ³n: frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-28 â€” Tratamientos cÃ­clicos e intermitentes

- `Models/Tratamiento.cs`: persiste tipo de plan, dÃ­as activos, descanso y cantidad opcional de ciclos.
- `DTOs/Medicamento*.cs`: transportan configuraciÃ³n cÃ­clica y horarios diarios exactos.
- `Services/PlanTratamientoService.cs`: calcula actividad, descanso, ciclo, dÃ­a activo, prÃ³ximo reinicio y fecha final.
- `Services/SchemaCiclosInitializer.cs` y `Scripts/AgregarTratamientosCiclicos.sql`: compatibilidad automÃ¡tica/manual con bases existentes.
- `Controllers/MedicamentosController.cs`: valida y guarda planes cÃ­clicos, admite dos horarios independientes y expone su estado actual.
- `Controllers/RecordatoriosController.cs`: excluye recordatorios durante descansos, antes del inicio y despuÃ©s del Ãºltimo ciclo.
- `src/services/api.ts` y `src/pages/Medicamentos.tsx`: formulario â€œPor ciclosâ€, estados visuales y bloqueo de confirmaciÃ³n durante descansos.

VerificaciÃ³n: backend Release compilado con 0 errores/advertencias; frontend compilado; pruebas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks. La API inicia aun si SQL Server no estÃ¡ disponible; la aplicaciÃ³n real del cambio de esquema queda para el prÃ³ximo arranque con `SQLEXPRESS` accesible.

### 2026-06-26 â€” Textos de recupero de contraseÃ±a

- `AuthController.cs`: corrige mojibake en mensajes del flujo de recupero/restablecimiento de contraseÃ±a: token generado, validaciones, token invÃ¡lido y contraseÃ±a actualizada.
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados con la correcciÃ³n.

VerificaciÃ³n: backend compilado con 0 errores/advertencias; frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-26 â€” Recupero de contraseÃ±a compatible con bases existentes

- `AuthController.cs`: antes de generar o validar un token, verifica si existe `PASSWORD_RESET_TOKENS`; si falta, la crea automÃ¡ticamente con clave primaria, defaults y clave forÃ¡nea a `USUARIOS`.
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados con la correcciÃ³n.

Motivo: en bases ya creadas antes de agregar recupero de contraseÃ±a, el endpoint `POST /api/Auth/solicitar-recupero` respondÃ­a HTTP 500 porque la tabla nueva no existÃ­a.

VerificaciÃ³n: backend compilado con 0 errores/advertencias; frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-26 â€” Grupo sanguÃ­neo unificado visualmente

- `Perfil.tsx`: la subtarjeta â€œGrupo sanguÃ­neoâ€ ya no usa fondo verde diferenciado; ahora comparte fondo/borde con â€œAlergiasâ€ y â€œCondicionesâ€.
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados con la correcciÃ³n visual.

VerificaciÃ³n: frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-26 â€” Icono original de Medicamentos en modo oscuro

- `pastillas-ok.png`: nuevo asset para el acceso rÃ¡pido â€œMedicamentosâ€ en modo claro.
- `pastillas-ok-modo-oscuro.png`: nuevo asset para el acceso rÃ¡pido â€œMedicamentosâ€ en modo oscuro.
- `Home.tsx`: alterna automÃ¡ticamente entre ambas imÃ¡genes segÃºn el modo activo.
- `index.css`: evita filtros sobre las imÃ¡genes de medicamentos y muestra la variante oscura cuando estÃ¡ activa la clase global `modo-oscuro`.
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados con la correcciÃ³n visual.

VerificaciÃ³n: frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-26 â€” Historial y grupo sanguÃ­neo en modo oscuro

- `index.css`: ajusta fondos verde claro (`#F7FBF7`, `#F1F8E9`, `#E8F5E9`) para modo oscuro, evitando tarjetas claras con texto claro.
- `index.css`: refuerza colores verdes, amarillos y bordes usados por Historial, calendario, tarjetas de Ã¡nimo y grupo sanguÃ­neo del Perfil.
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados con la correcciÃ³n visual.

VerificaciÃ³n: frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-26 â€” Accesos rÃ¡pidos en modo oscuro

- `index.css`: agrega estilos especÃ­ficos para `.quick-card` en modo oscuro, con fondo oscuro, borde reforzado, sombras coherentes, textos legibles e iconos invertidos.
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados con la correcciÃ³n visual.

VerificaciÃ³n: frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-26 â€” Logo para modo oscuro

- `logo-modo-oscuro.png`: nuevo asset de logo blanco para mejorar contraste en modo oscuro.
- `Layouts.tsx`: cambia automÃ¡ticamente entre el logo original y el logo blanco segÃºn `modoOscuro`.
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados con la correcciÃ³n visual.

VerificaciÃ³n: frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-26 â€” Mapa de farmacias en Villa del Rosario

- `Home.tsx`: corrige el iframe de Google Maps para buscar explÃ­citamente â€œfarmacias Villa del Rosario CÃ³rdoba Argentinaâ€.
- `Home.tsx`: el enlace externo ahora usa el link de bÃºsqueda compartido por el usuario (`https://maps.app.goo.gl/SdDmgNe5QkqsAa2BA`).
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados con la correcciÃ³n vigente.

VerificaciÃ³n: frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-25 â€” Recupero de contraseÃ±a con token

- `PasswordResetToken.cs`: nuevo modelo para guardar tokens de recupero hasheados, con creaciÃ³n, expiraciÃ³n, uso y vÃ­nculo a usuario.
- `CuidarPlusContext.cs`: agrega `PasswordResetTokens`, defaults y relaciÃ³n con `USUARIOS`.
- `AuthDtos.cs`: agrega DTOs de solicitud y restablecimiento de contraseÃ±a.
- `AuthController.cs`: agrega endpoints pÃºblicos `POST /api/Auth/solicitar-recupero` y `POST /api/Auth/restablecer-password`.
- `CuidadPlus.sql`: agrega la tabla `PASSWORD_RESET_TOKENS`, defaults y clave forÃ¡nea a `USUARIOS`.
- `api.ts`: agrega funciones para solicitar token y restablecer contraseÃ±a.
- `RecuperarPassword.tsx`: nueva pantalla pÃºblica para generar token y actualizar la contraseÃ±a.
- `routes.tsx` y `Login.tsx`: agregan la ruta `/recuperar-password` y el acceso â€œOlvidÃ© mi contraseÃ±aâ€.
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados para reflejar el estado vigente.

DecisiÃ³n: el token plano se muestra sÃ³lo como ayuda de desarrollo local mientras no exista servicio de email; en SQL se persiste Ãºnicamente el hash del token.

VerificaciÃ³n: backend compilado con 0 errores/advertencias; frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-25 â€” Farmacias cercanas y modo claro/oscuro

- `Home.tsx`: agrega una tarjeta de â€œFarmacias cercanasâ€ en Inicio con iframe de Google Maps y enlace externo.
- `Layouts.tsx`: agrega el botÃ³n de modo claro/oscuro en el encabezado y persiste la preferencia en `localStorage`.
- `index.css`: incorpora los estilos globales de modo oscuro para fondos, textos, bordes, formularios, modales, header, footer e iframe.
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados para reflejar el estado actual e histÃ³rico de esta tanda.

VerificaciÃ³n: frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-25 â€” Nombres amigables en Recetas

- `Recetas.tsx`: separa el tÃ­tulo visible de la ruta real del archivo.
- `Recetas.tsx`: las recetas antiguas con `/uploads/recetas/...` se muestran como â€œReceta digital #IDâ€.
- `Recetas.tsx`: al subir recetas nuevas se guarda en `localStorage` el nombre original del archivo para usarlo como tÃ­tulo visible.
- `Recetas.tsx`: la ruta interna queda como detalle secundario truncado y sigue usÃ¡ndose para vista previa y apertura externa.

VerificaciÃ³n: frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-25 â€” Tratamientos crÃ³nicos y temporales

- `MedicamentoDto.cs`, `MedicamentoCrearDto.cs`, `MedicamentoActualizarDto.cs` y `MedicamentoAsociarDto.cs`: contrato ampliado con `FechaInicio` y `FechaFin`.
- `MedicamentosController.cs`: los tratamientos activos incluyen crÃ³nicos y temporales no vencidos; la baja manual cierra el tratamiento sin borrar historial.
- `RecordatoriosController.cs`: los recordatorios se filtran por tratamientos vigentes para evitar avisos de tratamientos finalizados.
- `api.ts`: tipos y payloads de medicamentos admiten fecha de inicio y fecha de fin.
- `Medicamentos.tsx`: formulario con tipo de tratamiento, fechas y validaciÃ³n de temporales.
- `MedicamentoDetalle.tsx`: visualizaciÃ³n de tipo de tratamiento y fecha de fin.

VerificaciÃ³n: backend compilado con 0 errores/advertencias; frontend compilado; pruebas automatizadas 2/2; lint con 0 errores y cinco advertencias conocidas de hooks.

### 2026-06-25 â€” Segunda tanda de mejoras clÃ­nicas

- `opcionesClinicas.ts`: nuevo mÃ³dulo para condiciones frecuentes y fichas clÃ­nicas locales de medicamentos.
- `Nuevacuenta.tsx`: condiciÃ³n clÃ­nica ahora se carga con combobox de opciones frecuentes.
- `Perfil.tsx`: ediciÃ³n de condiciÃ³n clÃ­nica con combobox, preservando condiciones existentes que no estÃ©n en la lista.
- `Medicamentos.tsx`: formulario ampliado con contraindicaciones y efectos secundarios; se guardan por medicamento en `localStorage`.
- `Medicamentos.tsx`: las tarjetas muestran ficha clÃ­nica cuando existe y la bÃºsqueda tambiÃ©n contempla esos textos.
- `MedicamentoDetalle.tsx`: nueva secciÃ³n â€œFicha clÃ­nica del medicamentoâ€ con contraindicaciones y efectos secundarios.

VerificaciÃ³n: frontend compilado, pruebas automatizadas 2/2 y lint con 0 errores; continÃºan cinco advertencias conocidas de hooks.

### 2026-06-25 â€” Primera tanda de mejoras de Ã¡nimo

- `HistorialdeAnimo.tsx`: escala 1â€“5 con porcentaje visible en cada emoji.
- `HistorialdeAnimo.tsx`: el campo de motivo aparece y es obligatorio sÃ³lo para â€œMalâ€ y â€œMuy malâ€.
- `HistorialdeAnimo.tsx`: limpieza de textos/emojis para evitar caracteres mojibakeados en la pantalla.
- `Historial.tsx`: nuevas estadÃ­sticas de promedio de Ã¡nimo y porcentaje de estados bajos sobre los registros filtrados.
- `Historial.tsx`: cada tarjeta de Ã¡nimo muestra categorÃ­a, valor 1â€“5, porcentaje y motivo cuando existe.

VerificaciÃ³n: frontend compilado, pruebas automatizadas 2/2 y lint con 0 errores; continÃºan cinco advertencias conocidas de hooks.

### 2026-06-25 â€” Encabezado fijo y posposiciÃ³n desde alarma

- `Layouts.tsx`: el encabezado superior pasa a `sticky top-0`, por lo que queda visible mientras se desplaza el contenido de las pÃ¡ginas.
- `RecordatorioAlarma.tsx`: el botÃ³n secundario del aviso activo cambia de â€œRepetir sonidoâ€ a â€œPosponer toma 10 minutosâ€.
- `RecordatorioAlarma.tsx`: la posposiciÃ³n usa `posponerRecordatorio(id, 10)`, detiene el sonido actual y permite que el mismo recordatorio vuelva a dispararse con la nueva hora programada.

VerificaciÃ³n: frontend compilado y pruebas automatizadas 2/2.

### 2026-06-20 â€” DirecciÃ³n integrada al resumen personal

- `Perfil.tsx`: DirecciÃ³n particular se trasladÃ³ a la tarjeta principal, debajo de nombre, edad y estado, con icono de ubicaciÃ³n.
- Se eliminÃ³ la tarjeta independiente de direcciÃ³n.
- La tarjeta de contacto de emergencia ocupa ahora el ancho completo y distribuye datos y llamada de forma equilibrada.

VerificaciÃ³n: frontend compilado y pruebas automatizadas 2/2.

### 2026-06-20 â€” Acciones de contacto segÃºn contexto

- `Perfil.tsx`: eliminados â€œLlamarâ€ y â€œSMSâ€ de la tarjeta de contacto del perfil propio, ya que implicaban comunicarse con el mismo usuario.
- Se conserva â€œLlamar al contactoâ€ en la tarjeta de emergencia.
- Las acciones directas sobre el paciente quedan reservadas para una futura vista de cuidador con perfiles a cargo.

VerificaciÃ³n: frontend compilado y pruebas automatizadas ejecutadas correctamente.

### 2026-06-20 â€” Selector de ringtones simplificado

- `RecordatorioAlarma.tsx`: eliminado el desplegable y el botÃ³n ambiguo â€œGuardar, activar y probarâ€.
- Cada ringtone se presenta como una opciÃ³n visible con selecciÃ³n y botÃ³n â€œEscucharâ€.
- â€œGuardar tonoâ€, â€œActivar notificacionesâ€ y â€œCancelarâ€ son acciones separadas con estado claro.
- El tono en uso se conserva hasta guardar; cerrar o cancelar descarta la selecciÃ³n temporal.
- En el aviso activo, la acciÃ³n secundaria disponible es posponer la toma diez minutos.
- Se corrigieron dependencias de hooks del componente de alarma.

VerificaciÃ³n: frontend compila, pruebas 2/2 y lint sin errores; quedan cinco advertencias conocidas en otras pantallas.

### 2026-06-20 â€” Breakpoints para tablets y plegables

- `Layouts.tsx`: el encabezado de escritorio se activa desde `xl` (1280 px), evitando superposiciÃ³n de logo, enlaces y controles entre 768 y 1279 px.
- Tablets y plegables usan encabezado compacto y menÃº inferior de seis accesos.
- Logo con tamaÃ±o escalonado y sin contracciÃ³n; navegaciÃ³n y controles con anchos resistentes al modo A+.
- En pantallas muy angostas se muestran â€œMedic.â€ y â€œAvisosâ€ para evitar colisiones, conservando nombres completos mediante etiquetas accesibles.

VerificaciÃ³n: frontend compila, pruebas 2/2 y lint sin errores; permanecen las seis advertencias de hooks conocidas.

### 2026-06-20 â€” NavegaciÃ³n y responsive mÃ³vil

- `Layouts.tsx`: agregado Historial al menÃº inferior mediante el icono `History` de Lucide; navegaciÃ³n compactada a seis columnas y contenedores limitados al ancho disponible.
- `Perfil.tsx`: grids con columnas encogibles, tarjetas sin ancho mÃ­nimo implÃ­cito y correo con corte seguro en cualquier carÃ¡cter.
- `index.css`: lÃ­mites globales de ancho, bloqueo del desbordamiento horizontal y reglas seguras para medios y tarjetas de perfil.

VerificaciÃ³n: frontend compila, pruebas 2/2 y lint sin errores; permanecen seis advertencias de hooks ya registradas.

### 2026-06-20 â€” InformaciÃ³n de emergencia en Perfil

- `Perfil.tsx`: unificaciÃ³n visual de grupo sanguÃ­neo y antecedentes, eliminaciÃ³n de â€œVer en el mapaâ€, selector de tipo telefÃ³nico y visualizaciÃ³n del telÃ©fono del familiar.
- `Nuevacuenta.tsx`: selector de tipo de telÃ©fono y campos obligatorios de nombre, parentesco y telÃ©fono del contacto de emergencia.
- `UsuariosController.cs` y `AuthController.cs`: guardado/actualizaciÃ³n del telÃ©fono del contacto relacionado en `TELEFONOS`.
- `PerfilUsuarioDto.cs`, `PerfilGuardarDto.cs`, `AuthDtos.cs` y `api.ts`: contrato `telefonoEmergencia` de extremo a extremo.
- `api.ts`: las cargas multipart de fotografÃ­as y recetas envÃ­an ahora la cookie autenticada.

VerificaciÃ³n: backend y frontend compilan sin errores; lint sin errores y con las seis advertencias de hooks ya conocidas. No se escribieron datos de prueba en perfiles reales.

### 2026-06-20 â€” Paquete de quince mejoras

- `Historial.tsx`: relaciÃ³n persistente prioritaria, filtros, estadÃ­sticas, calendario mensual y exportaciÃ³n imprimible a PDF.
- `Home.tsx`: omisiÃ³n con motivo, enlace tomaâ€“Ã¡nimo y alertas de tratamiento.
- `MedicamentoDetalle.tsx`, `Medicamentos.tsx` y `routes.tsx`: detalle, adherencia, pausa/reanudaciÃ³n y bÃºsqueda.
- `seguimientoMedicamentos.ts`: persistencia local de dosis restantes, fin previsto, vencimiento y fecha de reanudaciÃ³n para alimentar alertas.
- `Recordatorios.tsx` y `RecordatoriosController.cs`: posposiciÃ³n de diez minutos y enlace del Ã¡nimo para tomadas/omitidas.
- `Recetas.tsx`: bÃºsqueda y vista previa integrada de PDF e imÃ¡genes.
- `Nuevacuenta.tsx`: validaciones junto a correo y contraseÃ±as, mÃ¡s validaciÃ³n de DNI/fecha.
- `Layouts.tsx` e `index.css`: modo persistente de texto grande.
- `Program.cs`, `AuthController.cs`, `UsuariosController.cs` y `api.ts`: cookie HTTP-only, autorizaciÃ³n global, credenciales CORS y aislamiento por identificador.
- `MedicamentosController.cs`, `MedicamentoDto.cs` y `CambiarPausaTratamientoDto.cs`: estado y operaciÃ³n de pausa.
- `HistorialesAnimoController.cs` y `HistorialAnimoCrearDto.cs`: asociaciÃ³n persistente de la toma dentro del alta de Ã¡nimo.

VerificaciÃ³n: backend y frontend compilan sin errores; pruebas 2/2; lint con 0 errores y 6 advertencias preexistentes. API: sin sesiÃ³n HTTP 401, acceso propio HTTP 200 y acceso a otro `idUsuario` HTTP 403.

### 2026-06-18 â€” RediseÃ±o del Historial

- `CUIDAR/Cuidar-/src/pages/Historial.tsx`: reemplazadas las dos columnas independientes por una lÃ­nea de tiempo agrupada por fecha.
- Cada tarjeta combina medicaciÃ³n, resultado de la toma, horario y estado de Ã¡nimo con su emoji.
- Se incorporaron resumen de actividad, carga, reintento, estado vacÃ­o, registros sin pareja y diseÃ±o responsive.
- El emparejamiento actual conserva todos los datos y relaciona visualmente toma/Ã¡nimo por dÃ­a y orden cronolÃ³gico, sin modificar la lÃ³gica ni la base de datos.

VerificaciÃ³n: `npm run build`, `npm test` y `npm run lint` sin errores; revisiÃ³n en navegador de escritorio y mÃ³vil sin errores de consola.

### 2026-06-18 â€” Doce mejoras de experiencia y robustez

- `src/components/ui.tsx`: componentes reutilizables para formularios, botones, modales y estados de pantalla.
- `src/components/RutaProtegida.tsx`, `src/routes.tsx`, `src/pages/Login.tsx` y `src/services/api.ts`: protecciÃ³n de rutas, retorno post-login y expiraciÃ³n local ante HTTP 401.
- `src/components/ErrorBoundary.tsx`, `src/components/NotificacionesGlobales.tsx` y `src/main.tsx`: recuperaciÃ³n global y centralizaciÃ³n de notificaciones.
- `src/pages/Recetas.tsx`, `src/pages/Recordatorios.tsx` y `src/pages/Medicamentos.tsx`: carga, reintento, estados vacÃ­os, prevenciÃ³n de duplicados y confirmaciones personalizadas.
- `src/pages/Nuevacuenta.tsx`: formulario organizado por secciones claras.
- `src/index.css`: foco visible, adaptaciÃ³n mÃ³vil/tÃ¡ctil y preferencia de movimiento reducido.
- `package.json` y `tests/logic.test.mjs`: comando y base de pruebas automatizadas.

VerificaciÃ³n: `npm run build`, `npm test` (2/2), `npm run lint` sin errores, `dotnet build` y recorrido local de rutas/formulario sin errores de consola.

### 2026-06-18 â€” DocumentaciÃ³n viva

- `CONTINUATION.md`: creado como estado operativo vigente.
- `CHANGELOG.md`: creado como historial acumulativo.

No se modificÃ³ lÃ³gica funcional en esta tarea.

### 2026-06-18 â€” Horarios y alarma

- `CUIDADPLUSAPI/Controllers/MedicamentosController.cs`: frecuencia diaria compatible con SQL `time`, creaciÃ³n vÃ¡lida de recordatorios y validaciÃ³n de laboratorios.
- `CUIDADPLUSAPI/Controllers/AuthController.cs`: eliminado el ID fijo para el tipo Paciente.
- `CUIDAR/Cuidar-/src/pages/Medicamentos.tsx`: conserva el laboratorio real al editar.
- `CUIDAR/Cuidar-/src/components/RecordatorioAlarma.tsx`: clave por horario, tolerancia ante retrasos y protecciÃ³n contra consultas simultÃ¡neas.
- `CUIDAR/Cuidar-/src/services/api.ts`: contratos anulables alineados y mejores mensajes de error.
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados.

VerificaciÃ³n: actualizaciÃ³n real de TAURAL (usuario 11) a las 11:01 respondiÃ³ HTTP 204; `/audio/alarma.mp3` respondiÃ³ HTTP 200 y 847.441 bytes.

### 2026-06-18 â€” FotografÃ­a en alta de usuario

- `CUIDAR/Cuidar-/src/pages/Nuevacuenta.tsx`: reemplazada la URL manual por un selector de imagen con vista previa, validaciÃ³n, redimensionado a 512 px y carga mediante el endpoint de perfil.
- Si la cuenta se crea pero falla la fotografÃ­a, el alta continÃºa y se deja preparado un aviso para reintentar desde Perfil.
- `CONTINUATION.md` y `CHANGELOG.md`: actualizados.

VerificaciÃ³n: `npm run build` correcto en la copia ejecutada y la entregable; selector Ãºnico con `accept="image/*"` comprobado en `localhost:5174/nuevacuenta`, sin errores de consola.

### 2026-06-18 â€” SelecciÃ³n de ringtones

- `CUIDAR/Cuidar-/src/components/RecordatorioAlarma.tsx`: selector de ringtone, persistencia y prueba sonora desde la campana.
- `CUIDAR/Cuidar-/public/audio/`: incorporados Chirp, Arpeggio, Departure, Chalet y Journey.
- La reproducciÃ³n de la alarma utiliza el tono elegido y conserva el oscilador como respaldo si el navegador bloquea audio.

VerificaciÃ³n: los cinco MP3 existen en ambas copias y `npm run build` finalizÃ³ correctamente.

### 2026-06-18 â€” Toasters globales

- `CUIDAR/Cuidar-/src/main.tsx`: incorporado `Toaster` global y adaptaciÃ³n de `window.alert` a notificaciones emergentes no bloqueantes.
- Los avisos diferidos, como una foto fallida despuÃ©s del alta, se recuperan desde `sessionStorage`.
- Se mantienen los `confirm()` de acciones destructivas para exigir una decisiÃ³n explÃ­cita.

VerificaciÃ³n: compilaciÃ³n TypeScript/Vite correcta en ambas copias.

### 2026-06-18 â€” Archivos de recetas y mÃ©dicos

- `CUIDADPLUSAPI/Controllers/RecetasController.cs`: endpoint multipart seguro por extensiÃ³n, tamaÃ±o y nombre aleatorio en `wwwroot/uploads/recetas`.
- `CUIDAR/Cuidar-/src/services/api.ts`: carga de archivos y servicios de mÃ©dicos.
- `CUIDAR/Cuidar-/src/pages/Recetas.tsx`: adjuntos, apertura de archivo, selecciÃ³n y alta de mÃ©dico.

VerificaciÃ³n: ambos backends y frontends compilan correctamente; la API local fue reiniciada con el cÃ³digo actualizado.

### 2026-06-18 â€” Edad exacta

- `CUIDAR/Cuidar-/src/pages/Perfil.tsx`: cÃ¡lculo por aÃ±o, mes y dÃ­a, independiente del `DATEDIFF(YEAR)` impreciso de la vista existente.
- Para nacimiento 18/10/1985, la edad permanece en 40 hasta el cumpleaÃ±os de 2026.

VerificaciÃ³n: ambos frontends compilan correctamente.

### 2026-06-18 â€” NÃºmero de socio

- `Perfil.tsx` y `Nuevacuenta.tsx`: la interfaz utiliza â€œCobertura mÃ©dica / obra socialâ€ y â€œNÃºmero de socioâ€.
- Se conserva el nombre tÃ©cnico `numeroPoliza` en DTOs y base para mantener compatibilidad.

VerificaciÃ³n: ambos frontends compilan correctamente.

### 2026-06-18 â€” EdiciÃ³n de recordatorios

- `CUIDADPLUSAPI/Controllers/RecordatoriosController.cs`: al editar un recordatorio tambiÃ©n sincroniza los registros `HORARIOS` asociados.
- `CUIDAR/Cuidar-/src/services/api.ts`: operaciÃ³n PUT de recordatorios.
- `CUIDAR/Cuidar-/src/pages/Recordatorios.tsx`: botÃ³n y modal para modificar la hora.

VerificaciÃ³n: backends y frontends compilan sin errores; Swagger expone PUT `/api/Recordatorios/{id}`.

## Tareas pendientes

### P0 â€” VerificaciÃ³n de la lÃ­nea base

- [x] Ejecutar `dotnet build` sobre `CuidarPlusAPI.csproj`: 0 errores y 0 advertencias.
- [x] Ejecutar `npm run build` en el frontend: correcto.
- [ ] Ejecutar el esquema y los seeds en SQL Server de prueba.
- [ ] Verificar el flujo completo con una cuenta que tenga medicamentos, ademÃ¡s de la prueba directa realizada con usuario 11.
- [x] Confirmar puertos efectivos: frontend observado en 5174; API en HTTPS 7243 y HTTP 5147.
- [ ] Alinear la documentaciÃ³n de puertos variables de Vite con `README_EJECUCION.md`.

### P1 â€” Seguridad y aislamiento

- [x] Implementar autenticaciÃ³n con cookie HTTP-only.
- [x] Agregar autorizaciÃ³n global a endpoints protegidos.
- [x] Implementar recupero/cambio de contraseÃ±a mediante token con expiraciÃ³n.
- [ ] Obtener el usuario desde la identidad autenticada, no desde `idUsuario` arbitrarios.
- [x] Evitar que `GET /api/Usuarios` exponga informaciÃ³n global a pacientes.
- [ ] Incorporar validaciÃ³n sistemÃ¡tica de DTOs y respuestas `ProblemDetails`.
- [ ] Endurecer la carga de fotografÃ­as: tamaÃ±o mÃ¡ximo, contenido real, extensiones permitidas y limpieza.

### P1 â€” Consistencia funcional

- [x] Implementar **Omitir** en Home.
- [ ] Definir recurrencia y zona horaria de recordatorios en el backend.
- [x] Implementar tratamientos cÃ­clicos con dÃ­as activos/descanso y supresiÃ³n automÃ¡tica de recordatorios durante pausas programadas.
- [ ] Persistir en SQL Server las fichas clÃ­nicas de medicamentos y la planificaciÃ³n de tratamientos que hoy usan `localStorage`.
- [ ] Evitar confirmaciones duplicadas de una misma dosis mediante una restricciÃ³n transaccional en backend.
- [ ] Revisar la asociaciÃ³n de recetas, tratamientos y usuarios.
- [ ] Reimplementar más adelante lectura inteligente de recetas sin afectar la carga manual.
- [ ] Como segunda etapa, permitir convertir medicamentos confirmados por el usuario en tratamientos y recordatorios sin duplicarlos.
- [x] Persistir una relaciÃ³n explÃ­cita entre cada toma y el estado de Ã¡nimo generado despuÃ©s de confirmarla u omitirla.
- [ ] RediseÃ±ar el contacto de emergencia como entidad o estructura explÃ­cita.
- [ ] Completar ediciÃ³n/eliminaciÃ³n donde la interfaz aÃºn no lo permita.

### P2 â€” Mantenibilidad

- [ ] Consolidar los `.csproj` y `.sln` duplicados.
- [ ] Extraer lÃ³gica repetida de perfil y autenticaciÃ³n a servicios.
- [ ] Reducir controladores CRUD repetitivos y mapear DTOs de forma consistente.
- [ ] Decidir si se adoptan migraciones EF Core o se mantiene SQL versionado como fuente de verdad.
- [ ] Reemplazar el README estÃ¡ndar del frontend.
- [ ] Eliminar o implementar `App.tsx` y `Registro.tsx`.
- [ ] Revisar dependencias instaladas pero aparentemente no utilizadas.

### P2 â€” Calidad

- [x] Crear una base de pruebas automatizadas y cubrir edad y validaciÃ³n de archivos.
- [ ] Corregir advertencias de `react-hooks/exhaustive-deps` sin alterar la lÃ³gica existente.
- [ ] Limpiar textos mojibakeados visibles y documentaciÃ³n afectada.
- [ ] Ampliar pruebas unitarias para horarios, recurrencia y autenticaciÃ³n.
- [ ] Agregar pruebas de integraciÃ³n para endpoints crÃ­ticos.
- [ ] Agregar pruebas de interfaz para login, medicamento, confirmaciÃ³n e historial.
- [ ] Incorporar lint y builds al flujo de integraciÃ³n continua.
- [x] Incorporar una primera mejora transversal de foco, teclado, movimiento reducido y diÃ¡logos mÃ³viles.
- [ ] Realizar una auditorÃ­a completa de accesibilidad y experiencia mÃ³vil en todas las pantallas.

## PrÃ³ximos pasos prioritarios

1. Probar carga manual de recetas sin lectura inteligente y confirmar que no aparece el error de API/clave.
2. Persistir en SQL Server la planificación que todavía vive en `localStorage`.
3. Reimplementar más adelante la lectura inteligente de recetas con una estrategia de credenciales estable, manteniendo la carga manual como flujo principal.
4. Corregir las advertencias de hooks reportadas por ESLint.
5. Limpiar textos mojibakeados en interfaz/documentación sin cambiar la lógica.
6. Realizar aceptación manual de las mejoras con una cuenta real que tenga actividad.
7. Verificar envío real de email para recupero de contraseña con la contraseña de aplicación configurada.
8. Auditar DTOs que reciben `idUsuario` en el cuerpo y derivarlo exclusivamente de la cookie autenticada.

## Instrucciones de ejecuciÃ³n conocidas

### Base de datos

1. Crear la base `CuidarPlus` si no existe.
2. Ejecutar `CuidadPlus.sql`.
3. Ejecutar `CUIDADPLUSAPI/Scripts/SeedDemo.sql`.
4. Opcionalmente ejecutar `SeedMedicamentosArgentina.sql`.

### Backend

```powershell
cd CUIDADPLUSAPI
dotnet restore
dotnet build
dotnet run
```

La conexiÃ³n predeterminada usa `Server=.\SQLEXPRESS;Database=CuidarPlus;Trusted_Connection=True;TrustServerCertificate=True;`.

### Frontend

```powershell
cd CUIDAR/Cuidar-
Copy-Item .env.example .env
npm install
npm run dev
```

Valores documentados actualmente:

- Frontend: `http://localhost:5173`.
- API esperada por `.env.example`: `https://localhost:7243/api`.
- Credenciales demo: `demo@cuidarplus.local` / `demo`.

Estos valores todavÃ­a deben contrastarse con la ejecuciÃ³n real.

## Criterio para cerrar futuras tareas

Una tarea no se considera terminada hasta que:

- el cambio solicitado estÃ© implementado;
- se hayan ejecutado verificaciones proporcionales al riesgo;
- `CONTINUATION.md` represente el nuevo estado sin datos obsoletos;
- `CHANGELOG.md` registre el cambio histÃ³rico;
- los archivos modificados y tareas pendientes estÃ©n actualizados.
- el ZIP de entrega estÃ© actualizado y su contenido haya sido verificado.






