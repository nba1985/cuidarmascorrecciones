const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5147/api";
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });
  } catch {
    throw new Error("No se pudo conectar con la API. Verificá que el backend esté encendido y que CORS permita Vite.");
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("cuidarPlusUsuario");
      if (window.location.pathname.startsWith("/app")) window.location.assign("/");
    }
    const detail = await response.text().catch(() => "");
    let mensaje = "";

    try {
      const problema = JSON.parse(detail) as { detail?: string; title?: string };
      mensaje = problema.detail || problema.title || "";
    } catch {
      // Conserva mensajes breves, pero no vuelca HTML o trazas completas en un alert.
      if (detail.length <= 300 && !detail.includes("\n") && !detail.trimStart().startsWith("<")) {
        mensaje = detail;
      }
    }

    throw new Error(
      mensaje ||
        (response.status >= 500
          ? "La API tuvo un error interno. Revisá la consola del backend."
          : `La API respondió con estado ${response.status}.`)
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface MedicamentoApi {
  idMedicamento: number;
  idTratamiento?: number | null;
  nombre: string;
  descripcion: string | null;
  presentacion: string | null;
  idLaboratorio: number | null;
  horario: string | null;
  idRecordatorio: number | null;
  frecuenciaHoras: number | null;
  horarios: Array<{ hora: string; idRecordatorio: number | null }>;
  pausado?: boolean;
}

export interface RecordatorioApi {
  idRecordatorio: number;
  canal: string | null;
  fechaHoraProgramada: string;
}

export interface RecetaApi {
  idReceta: number;
  archivos: string | null;
  observaciones: string | null;
  idMedico: number | null;
}

export interface MedicoApi {
  idMedico: number;
  nombre: string;
  apellido: string;
  matricula: string;
  telefonoUnico: string | null;
  email: string | null;
}

export interface RegistroTomaApi {
  idRegistroToma: number;
  estado: boolean;
  fechaHoraReal: string;
  observaciones: string | null;
  idRecordatorio: number | null;
  idHistorialAnimo: number | null;
  medicamento: string | null;
}

export interface HistorialAnimoApi {
  idHistorialAnimo: number;
  fecha: string;
  hora: string;
  observaciones: string | null;
  idUsuario: number | null;
  idEstado: number | null;
}

export interface UsuarioApi {
  idUsuario: number;
  nombre: string;
  apellido: string;
  ciudad: string | null;
  fechaNacimiento: string | null;
  dni: string | null;
  foto: string | null;
  fechaAlta: string | null;
  fechaBaja: string | null;
  mail: string | null;
  idGrupoSanguineo: number | null;
  idUsuarioTipo: number | null;
  idAlergia: number | null;
  idCondicion: number | null;
  idSeguroMedico: number | null;
  idUsuarioPadre: number | null;
  idParentezco: string | null;
}

export interface PerfilUsuarioApi {
  idUsuario: number;
  nombreCompleto: string | null;
  ciudad: string | null;
  fechaNacimiento: string | null;
  edad: number | null;
  dni: string | null;
  mail: string | null;
  grupoSanguineo: string | null;
  seguroMedico: string | null;
  numeroPoliza: string | null;
  alergia: string | null;
  condicion: string | null;
  tipoTelefono: string | null;
  telefono: string | null;
  contactoEmergencia: string | null;
  parentesco: string | null;
  telefonoEmergencia: string | null;
  foto: string | null;
}

export interface PerfilGuardarApi {
  nombre: string;
  apellido: string;
  ciudad?: string | null;
  fechaNacimiento?: string | null;
  dni?: string | null;
  mail?: string | null;
  foto?: string | null;
  grupoSanguineo?: string | null;
  seguroMedico?: string | null;
  numeroPoliza?: string | null;
  alergia?: string | null;
  condicion?: string | null;
  tipoTelefono?: string | null;
  telefono?: string | null;
  contactoEmergencia?: string | null;
  parentesco?: string | null;
  telefonoEmergencia?: string | null;
}

export interface GrupoSanguineoApi {
  idGrupoSanguineo: number;
  tipo: string;
}

export interface LoginResponse {
  usuario: UsuarioApi;
  mensaje: string;
}

export function obtenerMedicamentos(idUsuario?: number) {
  const query = idUsuario ? `?idUsuario=${idUsuario}` : "";
  return request<MedicamentoApi[]>(`/Medicamentos${query}`);
}

export function crearMedicamento(medicamento: {
  nombre: string;
  descripcion: string;
  presentacion: string;
  idLaboratorio: number | null;
  idUsuario?: number;
  horario?: string;
  frecuenciaHoras?: number;
}) {
  return request<MedicamentoApi>("/Medicamentos", {
    method: "POST",
    body: JSON.stringify(medicamento),
  });
}

export function asociarMedicamentoUsuario(
  idMedicamento: number,
  idUsuario: number,
  horario?: string,
  frecuenciaHoras?: number
) {
  return request<void>(`/Medicamentos/${idMedicamento}/usuario/${idUsuario}`, {
    method: "POST",
    body: JSON.stringify({ horario: horario || null, frecuenciaHoras: frecuenciaHoras || 24 }),
  });
}

export function actualizarMedicamento(
  id: number,
  medicamento: {
    nombre: string;
    descripcion: string;
    presentacion: string;
    idLaboratorio: number | null;
    idUsuario?: number;
    horario?: string;
    frecuenciaHoras?: number;
  }
) {
  return request<void>(`/Medicamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(medicamento),
  });
}

export function eliminarMedicamento(id: number, idUsuario?: number) {
  const query = idUsuario ? `?idUsuario=${idUsuario}` : "";
  return request<void>(`/Medicamentos/${id}${query}`, {
    method: "DELETE",
  });
}

export function cambiarPausaTratamiento(idTratamiento: number, idUsuario: number, pausado: boolean) {
  return request<void>(`/Medicamentos/tratamiento/${idTratamiento}/pausa?idUsuario=${idUsuario}`, {
    method: "PUT",
    body: JSON.stringify({ pausado }),
  });
}

export function obtenerRecordatorios() {
  return request<RecordatorioApi[]>("/Recordatorios");
}

export function obtenerRecordatoriosUsuario(idUsuario?: number) {
  const query = idUsuario ? `?idUsuario=${idUsuario}` : "";
  return request<RecordatorioApi[]>(`/Recordatorios${query}`);
}

export function crearRecordatorio(recordatorio: {
  canal: string;
  fechaHoraProgramada: string;
}) {
  return request<RecordatorioApi>("/Recordatorios", {
    method: "POST",
    body: JSON.stringify(recordatorio),
  });
}

export function actualizarRecordatorio(id: number, recordatorio: {
  canal: string;
  fechaHoraProgramada: string;
}) {
  return request<void>(`/Recordatorios/${id}`, {
    method: "PUT",
    body: JSON.stringify(recordatorio),
  });
}

export function posponerRecordatorio(id: number, minutos = 10) {
  return request<RecordatorioApi>(`/Recordatorios/${id}/posponer?minutos=${minutos}`, {
    method: "POST",
  });
}

export function obtenerRecetas(idUsuario?: number) {
  const query = idUsuario ? `?idUsuario=${idUsuario}` : "";
  return request<RecetaApi[]>(`/Recetas${query}`);
}

export function crearReceta(receta: {
  archivos: string;
  observaciones: string;
  idMedico: number | null;
  idUsuario?: number;
}) {
  return request<RecetaApi>("/Recetas", {
    method: "POST",
    body: JSON.stringify(receta),
  });
}

export async function subirArchivoReceta(archivo: File) {
  const formData = new FormData();
  formData.append("archivo", archivo, archivo.name);
  const response = await fetch(`${API_URL}/Recetas/archivo`, { method: "POST", credentials: "include", body: formData });
  if (!response.ok) throw new Error((await response.text()) || "No se pudo subir el archivo de receta.");
  return response.json() as Promise<{ ruta: string; nombreOriginal: string }>;
}

export function obtenerMedicos() {
  return request<MedicoApi[]>("/Medico");
}

export function crearMedico(medico: {
  nombre: string;
  apellido: string;
  matricula: string;
  telefonoUnico?: string | null;
  email?: string | null;
}) {
  return request<MedicoApi>("/Medico", { method: "POST", body: JSON.stringify(medico) });
}

export function actualizarReceta(
  id: number,
  receta: {
    archivos: string;
    observaciones: string;
    idMedico: number | null;
  }
) {
  return request<void>(`/Recetas/${id}`, {
    method: "PUT",
    body: JSON.stringify(receta),
  });
}

export function eliminarReceta(id: number, idUsuario?: number) {
  const query = idUsuario ? `?idUsuario=${idUsuario}` : "";
  return request<void>(`/Recetas/${id}${query}`, {
    method: "DELETE",
  });
}

export function obtenerRegistrosTomas(idUsuario?: number) {
  const query = idUsuario ? `?idUsuario=${idUsuario}` : "";
  return request<RegistroTomaApi[]>(`/RegistrosTomas${query}`);
}

export function crearRegistroToma(registro: {
  estado: boolean;
  fechaHoraReal: string;
  observaciones: string;
  idRecordatorio: number | null;
  idHistorialAnimo: number | null;
}) {
  return request<RegistroTomaApi>("/RegistrosTomas", {
    method: "POST",
    body: JSON.stringify(registro),
  });
}

export function obtenerHistorialesAnimo(idUsuario?: number) {
  const query = idUsuario ? `?idUsuario=${idUsuario}` : "";
  return request<HistorialAnimoApi[]>(`/HistorialesAnimo${query}`);
}

export function crearHistorialAnimo(historial: {
  fecha: string;
  hora: string;
  observaciones: string;
  idUsuario: number | null;
  idEstado: number | null;
  idRegistroToma?: number | null;
}) {
  return request<HistorialAnimoApi>("/HistorialesAnimo", {
    method: "POST",
    body: JSON.stringify(historial),
  });
}

export function cerrarSesionApi() {
  return request<void>("/Auth/logout", { method: "POST" });
}

export function obtenerUsuarios() {
  return request<UsuarioApi[]>("/Usuarios");
}

export function obtenerPerfilUsuario(idUsuario: number) {
  return request<PerfilUsuarioApi>(`/Usuarios/${idUsuario}/perfil`);
}

export function obtenerGruposSanguineos() {
  return request<GrupoSanguineoApi[]>("/GrupoSanguineos");
}

export function crearUsuario(usuario: Partial<UsuarioApi> & {
  nombre: string;
  apellido: string;
  mail?: string;
  passwordHash?: string;
}) {
  return request<UsuarioApi>("/Usuarios", {
    method: "POST",
    body: JSON.stringify(usuario),
  });
}

export function actualizarUsuario(id: number, usuario: Partial<UsuarioApi>) {
  return request<void>(`/Usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(usuario),
  });
}

export function actualizarPerfilCompleto(id: number, perfil: PerfilGuardarApi) {
  return request<void>(`/Usuarios/${id}/perfil-completo`, {
    method: "PUT",
    body: JSON.stringify(perfil),
  });
}

export async function subirFotoPerfil(idUsuario: number, archivo: Blob) {
  const formData = new FormData();
  formData.append("archivo", archivo, "perfil.jpg");

  const response = await fetch(`${API_URL}/Usuarios/${idUsuario}/foto`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("No se pudo subir la foto de perfil.");
  }

  return response.json() as Promise<{ foto: string }>;
}

export function resolverUrlArchivo(ruta?: string | null) {
  if (!ruta) return "";
  if (ruta.startsWith("http") || ruta.startsWith("data:")) return ruta;
  return `${API_ORIGIN}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
}

export function loginUsuario(mail: string, password: string) {
  return request<LoginResponse>("/Auth/login", {
    method: "POST",
    body: JSON.stringify({ mail, password }),
  });
}

export function registrarUsuario(usuario: {
  nombre: string;
  apellido: string;
  mail: string;
  password: string;
} & Partial<PerfilGuardarApi>) {
  return request<LoginResponse>("/Auth/registro", {
    method: "POST",
    body: JSON.stringify(usuario),
  });
}
