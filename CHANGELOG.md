# Changelog

Registro histÃ³rico de cambios de CUIDAR+. El estado operativo vigente se mantiene en `CONTINUATION.md`.

El formato sigue conceptualmente [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). No se asignan versiones retroactivas a cambios anteriores cuyo historial no estÃ¡ disponible.

## [Sin publicar]

### Quitado

- Retirada temporalmente la lectura inteligente de recetas: se eliminaron el botón de análisis con IA, los tipos/cliente frontend, el endpoint POST /api/Recetas/analizar, el servicio Gemini, el DTO de análisis, el paquete Google.GenAI y la configuración Gemini; la carga manual de recetas permanece activa.

### Corregido

- Cruces de cierre de modales: se unifica el estilo de cierre en modal común, Medicamentos, Recetas, Perfil y configuración de sonido para que todos usen la misma `x`, tamaño, color y comportamiento hover.
- Modal de nuevo/editar medicamento en pantallas horizontales bajas tipo Nest Hub/Nest Hub Max: queda por encima del menú inferior y usa una versión compacta hasta 820px de alto para evitar que el título o los botones queden cortados, incluso con A+.
- Modales en responsivo: ahora la capa del modal puede desplazarse verticalmente sólo en móviles, respeta el menú inferior fijo y evita que formularios largos queden trabados; en PC/tablet no muestra scroll interno cuando el modal entra en pantalla, incluso con A+.
- Acciones de tarjetas de Medicamentos: los botones se ordenan mejor, evitan cortar textos como “Ver detalle” y corrigen hover/disabled en modo oscuro para que ningún botón quede claro con texto invisible.
- Tarjetas de contraindicaciones y efectos secundarios en modo oscuro: ahora usan fondos, bordes y títulos oscuros legibles en lista y detalle de medicamentos.
- Textos mojibakeados restantes en el detalle del medicamento, incluyendo ficha clínica, planificación, “Últimas tomas”, “Crónico” y separadores `·`.
- Textos visibles mojibakeados en Recetas, Perfil, Medicamentos, API frontend y componentes comunes; opciones como “Sin médico asociado”, “Médico”, “Matrícula”, “Teléfono” y separadores `·` vuelven a verse correctamente.
- Modales principales de edición/alta en Recetas, Medicamentos y Perfil compactados para evitar scroll interno en el modal y aprovechar mejor el ancho disponible, incluso con el modo A+.
- Contraindicaciones y efectos secundarios existentes en `MEDICAMENTOS` ahora viajan por la API y se muestran en tarjetas, detalle y selecciÃ³n del catÃ¡logo como informaciÃ³n de solo lectura; el usuario no puede modificarlos desde un tratamiento.
- Error 500 al guardar perfiles cuando el contacto de emergencia chocaba con el Ã­ndice Ãºnico histÃ³rico de correo; los contactos nuevos reciben ahora un alias tÃ©cnico Ãºnico y el guardado es transaccional.
- Doble envÃ­o accidental del formulario de perfil mientras la primera actualizaciÃ³n aÃºn estÃ¡ en curso.
- Horarios de dosis, recordatorios e historial presentados consistentemente en formato digital de 24 horas `HH:mm`, sin a. m./p. m.
- El mapa de farmacias de Inicio ahora toma la localidad del perfil del usuario y genera para ella tanto el mapa embebido como la bÃºsqueda externa de Google Maps.

### AÃ±adido

- EnvÃ­o del token de recuperaciÃ³n al correo registrado mediante SMTP configurable, con plantilla HTML, vencimiento y uso Ãºnico.
- ConfiguraciÃ³n segura del correo mediante User Secrets o variables `Email__*`, incluyendo instrucciones para Gmail con contraseÃ±a de aplicaciÃ³n.
- Remitente SMTP predeterminado `cuidarmasvdr@gmail.com` sobre Gmail; la contraseÃ±a de aplicaciÃ³n permanece obligatoriamente fuera del repositorio.
- Tratamientos â€œPor ciclosâ€ con dÃ­as activos, dÃ­as de descanso, cantidad de ciclos opcional y dos horarios diarios exactos.
- CÃ¡lculo backend de ciclo actual, dÃ­a activo, prÃ³ximo reinicio y finalizaciÃ³n automÃ¡tica.
- MigraciÃ³n compatible con bases existentes para `TipoPlan`, `DiasActivos`, `DiasDescanso` y `CantidadCiclos`, con inicializaciÃ³n automÃ¡tica y script SQL manual.
- ImÃ¡genes dedicadas de pastillas para el acceso rÃ¡pido â€œMedicamentosâ€: una para modo claro y otra para modo oscuro.
- Logo blanco especÃ­fico para modo oscuro, cargado como asset del frontend y aplicado automÃ¡ticamente en el encabezado.
- Recupero de contraseÃ±a con token seguro, expiraciÃ³n de 30 minutos y persistencia hasheada en SQL Server.
- Tabla SQL `PASSWORD_RESET_TOKENS` con defaults y relaciÃ³n a `USUARIOS`.
- Pantalla pÃºblica `/recuperar-password` para solicitar token y definir una contraseÃ±a nueva.
- Acceso â€œOlvidÃ© mi contraseÃ±aâ€ desde Login.
- Tarjeta â€œFarmacias cercanasâ€ en Inicio con Google Maps embebido y enlace para abrir la bÃºsqueda completa en Google Maps.
- Modo claro/oscuro persistente desde el encabezado, manteniendo la estÃ©tica verde de CUIDAR+.
- TÃ­tulos amigables para recetas: las tarjetas ya no usan la ruta tÃ©cnica `/uploads/recetas/...` como nombre principal.
- Memoria local del nombre original del archivo al subir recetas nuevas.
- Tipo de tratamiento en Medicamentos: crÃ³nico/de por vida o temporal.
- Fecha de inicio y fecha de fin para tratamientos temporales.
- FinalizaciÃ³n automÃ¡tica de tratamientos temporales: dejan de aparecer como activos al pasar la fecha de fin, conservando el historial de tomas.
- Recordatorios filtrados por tratamientos vigentes para que los temporales finalizados no sigan sonando.
- Combobox de condiciones frecuentes en alta y ediciÃ³n de perfil: gripe, resfrÃ­o, asma, hipertensiÃ³n, diabetes, gastritis, migraÃ±a y otras opciones comunes.
- Ficha clÃ­nica local por medicamento con contraindicaciones y efectos secundarios.
- VisualizaciÃ³n de contraindicaciones y efectos secundarios en las tarjetas de Medicamentos y en el detalle del medicamento.
- Escala de estado de Ã¡nimo 1 a 5: Muy mal = 1 y Muy bien = 5, con porcentaje visible en cada opciÃ³n.
- Motivo obligatorio al registrar â€œMalâ€ o â€œMuy malâ€; para estados neutros/positivos basta con elegir el emoji.
- Promedio de Ã¡nimo en Historial y porcentaje de estados bajos sobre los registros filtrados.
- Encabezado superior fijo durante el scroll, manteniendo visible el logo, navegaciÃ³n, A+, campana y perfil.
- PosposiciÃ³n directa del aviso emergente de medicaciÃ³n por 10 minutos, reutilizando la reprogramaciÃ³n real del recordatorio.
- Opciones visibles de ringtone con escucha individual y seÃ±al del tono actualmente guardado.
- Acceso a Historial en la navegaciÃ³n mÃ³vil con icono coherente de Lucide.
- TelÃ©fono propio para el contacto de emergencia, solicitado en alta/ediciÃ³n y mostrado en Perfil con acceso de llamada.
- Selector cerrado de tipo telefÃ³nico: Celular, Fijo, Trabajo y WhatsApp.
- AsociaciÃ³n persistente entre una toma confirmada/omitida y el estado de Ã¡nimo registrado a continuaciÃ³n.
- Filtros de Historial por perÃ­odo, estado y medicamento, con estadÃ­sticas de adherencia y Ã¡nimo predominante.
- Calendario mensual de seguimiento y exportaciÃ³n imprimible para guardar el Historial como PDF.
- OmisiÃ³n de dosis desde Inicio con motivo opcional.
- Pantalla de detalle del medicamento, Ãºltimas tomas, adherencia y pausa/reanudaciÃ³n.
- AcciÃ³n para posponer recordatorios diez minutos sin modificar el horario recurrente.
- BÃºsquedas en Medicamentos, Recetas y Recordatorios; vista previa integrada de recetas.
- Alertas por pausas, falta de horario y omisiones recientes.
- PlanificaciÃ³n local por medicamento: dosis restantes, fin previsto, vencimiento de receta y fecha de reanudaciÃ³n.
- Modo persistente de texto grande y validaciones inline en el registro.
- AutenticaciÃ³n mediante cookie HTTP-only, autorizaciÃ³n global y control de `idUsuario` por sesiÃ³n.
- LÃ­nea de tiempo diaria en Historial, con tarjetas que combinan medicaciÃ³n y estado de Ã¡nimo.
- Emojis de Ã¡nimo, iconos de medicaciÃ³n, resumen de actividad y presentaciÃ³n responsive de registros combinados o sin pareja.
- Biblioteca reutilizable de componentes para botones, campos, modales, carga, error, vacÃ­o y confirmaciones.
- `ErrorBoundary` global y centralizaciÃ³n de toasters en `NotificacionesGlobales`.
- ProtecciÃ³n de las rutas privadas del frontend, preservando el destino solicitado para despuÃ©s del login.
- Base de pruebas automatizadas con `node --test` para edad y adjuntos de recetas.
- Estados vacÃ­os con acciones Ãºtiles y reintento de errores en Recetas y Recordatorios.
- Confirmaciones personalizadas para acciones destructivas en Medicamentos y Recetas.
- Regla de entrega: regenerar `CuidarPlus_Corregido.zip` despuÃ©s de cada cambio importante, sin incluir dependencias ni artefactos de compilaciÃ³n.
- EdiciÃ³n de horario desde la pantalla Recordatorios, con modal y sincronizaciÃ³n backend de `RECORDATORIOS` y `HORARIOS`.
- Adjuntos de recetas en PDF, JPG, JPEG, PNG, WEBP, HEIC y HEIF, con lÃ­mite de 10 MB.
- SelecciÃ³n de mÃ©dico existente y alta de mÃ©dico nuevo desde el formulario de receta.
- Apertura del archivo adjunto desde cada tarjeta de receta.
- Sistema global de toasters con Sonner, colores semÃ¡nticos, cierre manual y estÃ©tica coherente con CUIDAR+.
- Selector persistente de ringtones para recordatorios: Chirp, Arpeggio, Departure, Chalet y Journey.
- Modal de configuraciÃ³n y prueba sonora accesible desde la campana.
- Carga de fotografÃ­a durante el alta de usuarios, con selector de imagen, vista previa y redimensionado automÃ¡tico a JPEG de hasta 512 px.
- Subida de la fotografÃ­a reciÃ©n seleccionada mediante el endpoint existente de perfil despuÃ©s de crear la cuenta.
- RecuperaciÃ³n no destructiva: si falla sÃ³lo la fotografÃ­a, la cuenta permanece creada y puede completarse desde Perfil.

### Corregido

- El token de recuperaciÃ³n dejÃ³ de exponerse en la respuesta HTTP y en la pantalla; si el correo falla, el token generado se invalida.
- Los recordatorios de tratamientos cÃ­clicos dejan de mostrarse y sonar durante los dÃ­as de descanso sin eliminar el medicamento ni su historial.
- MenÃº inferior responsive: mejor contraste y legibilidad en modo oscuro, etiquetas mÃ¡s estables y estado activo coherente con la estÃ©tica CUIDAR+.
- MenÃº inferior responsive: el acceso â€œMedic.â€ ahora reutiliza las imÃ¡genes de pastillas de Accesos rÃ¡pidos para modo claro y oscuro, sin filtros que generen cuadrados blancos.
- MenÃº inferior responsive: el acceso â€œMedic.â€ ahora tambiÃ©n se pinta de verde cuando estÃ¡ activo, igual que los demÃ¡s accesos del menÃº.
- MenÃº inferior responsive en modo claro: los Ã­conos de imagen de Inicio, Avisos, Recetas y Perfil ahora tambiÃ©n se pintan de verde al estar activos.
- Recupero de contraseÃ±a: mensajes de token, validaciones y confirmaciÃ³n ya no muestran mojibake; ahora se leen correctamente con acentos.
- Recupero de contraseÃ±a: `POST /api/Auth/solicitar-recupero` ya no falla con HTTP 500 en bases existentes sin `PASSWORD_RESET_TOKENS`; la API crea la tabla automÃ¡ticamente si falta.
- Perfil: la subtarjeta â€œGrupo sanguÃ­neoâ€ ahora usa el mismo fondo y borde que â€œAlergiasâ€ y â€œCondicionesâ€ en modo claro y oscuro.
- El acceso rÃ¡pido â€œMedicamentosâ€ ya no depende de filtros CSS para verse en modo oscuro; alterna entre las imÃ¡genes `pastillas-ok.png` y `pastillas-ok-modo-oscuro.png`.
- Historial en modo oscuro: estadÃ­sticas, tarjetas de Ã¡nimo, calendario y fondos verde claro ahora usan variantes oscuras legibles.
- Perfil en modo oscuro: el bloque de grupo sanguÃ­neo ya no queda claro con texto claro; se ajustÃ³ el contraste de fondo, verdes y bordes.
- Accesos rÃ¡pidos en modo oscuro: las tarjetas ya no quedan blancas con texto claro; ahora usan fondo oscuro, bordes visibles, textos legibles e iconos invertidos.
- El mapa de farmacias de Inicio ya no usa una bÃºsqueda genÃ©rica por coordenadas; ahora busca explÃ­citamente farmacias en Villa del Rosario, CÃ³rdoba, Argentina.
- El botÃ³n â€œAbrir en Google Mapsâ€ de farmacias usa el link compartido por el usuario para Villa del Rosario.
- Vista de Recetas: rutas internas largas y GUIDs pasan a mostrarse como detalle secundario truncado, no como tÃ­tulo visible.
- La baja manual de un medicamento se mantiene como cierre lÃ³gico del tratamiento y no elimina registros histÃ³ricos.
- Limpieza de textos y emojis en la pantalla Estado de Ã¡nimo, evitando caracteres mojibakeados visibles.
- DirecciÃ³n particular integrada en la tarjeta principal del paciente para simplificar el Perfil.
- Contacto de emergencia ampliado para aprovechar el espacio liberado.
- Eliminados los botones â€œLlamarâ€ y â€œSMSâ€ del perfil propio; se mantiene la llamada al contacto de emergencia.
- Separadas las acciones de seleccionar, escuchar, guardar y activar notificaciones.
- Reemplazado el botÃ³n ambiguo â€œGuardar, activar y probarâ€ por controles con una Ãºnica responsabilidad.
- El botÃ³n secundario del aviso activo ya no repite el audio: ahora pospone la toma diez minutos y vuelve a permitir una alarma al nuevo horario.
- El menÃº de escritorio ya no se fuerza en iPad Mini/Air/Pro, Surface ni plegables: se reserva para anchos desde 1280 px.
- Logo, navegaciÃ³n y controles del encabezado ya no se superponen al activar A+.
- Etiquetas del menÃº inferior adaptadas para anchos de 344 px.
- Eliminado el desplazamiento horizontal mÃ³vil provocado por textos largos y columnas que no podÃ­an reducir su ancho.
- Correo, tarjetas, contenido principal y menÃº inferior ahora respetan el ancho real del dispositivo.
- Perfil reÃºne grupo sanguÃ­neo, alergias y condiciones bajo â€œInformaciÃ³n para emergenciasâ€.
- Eliminado temporalmente â€œVer en el mapaâ€ de DirecciÃ³n particular.
- Las cargas de fotos y recetas incluyen credenciales de la sesiÃ³n autenticada.
- PrevenciÃ³n de envÃ­os repetidos mientras se guardan recetas, recordatorios o el inicio de sesiÃ³n.
- Cierre de la sesiÃ³n local y redirecciÃ³n al acceso ante respuestas HTTP 401.
- ValidaciÃ³n previa de formato y tamaÃ±o de adjuntos, mostrando nombre y tamaÃ±o seleccionados.
- OrganizaciÃ³n del alta de usuario en secciones claras y mejoras de foco, teclado, movimiento reducido y diÃ¡logos mÃ³viles.
- TerminologÃ­a de cobertura: â€œNÃºmero de pÃ³lizaâ€ fue reemplazado visualmente por â€œNÃºmero de socio de la obra socialâ€.
- CÃ¡lculo de edad en Perfil: ahora descuenta un aÃ±o cuando el cumpleaÃ±os todavÃ­a no ocurriÃ³ en el aÃ±o actual.
- Error HTTP 500 al editar con frecuencia de 24 horas: SQL `time` no acepta `24:00:00`; ahora la frecuencia diaria se representa con `NULL`.
- Los recordatorios nuevos ya no intentan persistir `DateTime.MinValue`.
- La ediciÃ³n ya no fuerza `idLaboratorio = 1`; conserva el laboratorio asociado o utiliza `NULL`.
- El registro busca el tipo `Paciente` por nombre en lugar de asumir el ID 1.
- Cambiar un horario permite una alarma nueva el mismo dÃ­a; la clave incluye el horario programado.
- La alarma tolera retrasos de hasta cinco minutos e impide revisiones simultÃ¡neas.
- Los errores `ProblemDetails` se muestran de forma mÃ¡s Ãºtil.

### Verificado

- Textos de recupero de contraseÃ±a: backend compila 0 errores/advertencias, frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- Recupero de contraseÃ±a compatible con bases existentes: backend compila 0 errores/advertencias, frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- Grupo sanguÃ­neo unificado visualmente: frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- ImÃ¡genes de pastillas para accesos rÃ¡pidos: frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- Historial y grupo sanguÃ­neo en modo oscuro: frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- Accesos rÃ¡pidos en modo oscuro: frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- Logo de modo oscuro: frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- CorrecciÃ³n del mapa de farmacias: frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- Recupero de contraseÃ±a con token: backend compila 0 errores/advertencias, frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- Farmacias cercanas y modo claro/oscuro: frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- CorrecciÃ³n visual de nombres de recetas: frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- Tratamientos crÃ³nicos/temporales: backend compila 0 errores/advertencias, frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- Segunda tanda de mejoras clÃ­nicas: frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- Primera tanda de mejoras de Ã¡nimo: frontend compila, pruebas 2/2 y lint sin errores; persisten cinco advertencias conocidas de hooks.
- API autenticada: 401 sin sesiÃ³n, 200 con usuario propio y 403 al solicitar otro usuario.
- Backend y frontend compilan sin errores; pruebas automatizadas 2/2 y lint sin errores.
- Historial renovado en navegador de escritorio y mÃ³vil, con estado vacÃ­o correcto y sin errores de consola.
- CompilaciÃ³n, pruebas y lint sin errores despuÃ©s del rediseÃ±o de Historial.
- `npm test`: 2 pruebas aprobadas de 2.
- `npm run lint`: sin errores; permanecen seis advertencias de dependencias de hooks para limpieza futura.
- Ruta privada `/app/recetas`: redirecciÃ³n correcta al login sin sesiÃ³n.
- `/nuevacuenta`: secciones y campos accesibles visibles, sin errores de consola.
- CompilaciÃ³n final de ambas copias: backend con 0 errores/advertencias y frontend TypeScript/Vite correcto.
- Swagger contiene `/api/Recetas/archivo`, `/api/Medico` y PUT `/api/Recordatorios/{id}`.
- Interfaz local: selector con cinco ringtones, formulario de recetas con formatos permitidos, mÃ©dicos y etiquetas de nÃºmero de socio, sin errores de consola.
- Los cinco ringtones responden HTTP 200 desde Vite.
- Caso de edad 18/10/1985 al 18/06/2026: 40 aÃ±os.
- CompilaciÃ³n correcta despuÃ©s de reemplazar las ventanas `alert` por toasters globales.
- Los cinco archivos de sonido estÃ¡n presentes y el frontend compila correctamente con la selecciÃ³n de ringtone.
- `npm run build` correcto despuÃ©s de incorporar la fotografÃ­a al alta, tanto en la copia ejecutada como en la entregable.
- Selector `image/*` visible y Ãºnico en `/nuevacuenta`, sin errores de consola.
- Backend: 0 errores y 0 advertencias en `dotnet build CuidarPlusAPI.csproj`.
- Frontend: compilaciÃ³n TypeScript y Vite correcta.
- TAURAL del usuario 11 actualizado a las 11:01: HTTP 204 y lectura posterior correcta.
- `/audio/alarma.mp3`: HTTP 200, 847.441 bytes y cabecera ID3 vÃ¡lida.
- ActivaciÃ³n de sonido desde la interfaz sin errores de consola.

### Pendiente

- Completar una prueba visual temporizada de la alarma con el usuario 11 y permisos del navegador.
- Registrar aquÃ­ las futuras incorporaciones, correcciones, cambios y eliminaciones.

## [LÃ­nea base] â€” 2026-06-18

### AÃ±adido

- `CONTINUATION.md` como documentaciÃ³n viva y fuente del estado actual del proyecto.
- `CHANGELOG.md` como registro histÃ³rico acumulativo.
- Reglas de cierre que exigen actualizar ambos documentos despuÃ©s de cambios importantes.

### Documentado

- Resumen ejecutivo y alcance funcional de CUIDAR+.
- Estado conocido del frontend React, la API ASP.NET Core y la base SQL Server.
- Decisiones arquitectÃ³nicas y flujo principal de datos.
- Funcionalidades ya presentes en el ZIP recibido.
- Limitaciones de seguridad, consistencia temporal y mantenibilidad detectadas.
- Archivos centrales, tareas pendientes y prÃ³ximos pasos priorizados.

### Notas

- Esta entrada establece el punto inicial conocido a partir de `CuidarPlus_Corregido.zip`.
- No se atribuyen fechas ni autores a las correcciones que ya estaban dentro del ZIP.
- No se modificÃ³ lÃ³gica funcional durante la creaciÃ³n de esta lÃ­nea base documental.

