export interface SeguimientoMedicamento {
  stock?: number;
  fechaFin?: string;
  vencimientoReceta?: string;
  reanudarEl?: string;
}

const CLAVE = "cuidarPlusSeguimientoMedicamentos";

export function obtenerSeguimientos(): Record<number, SeguimientoMedicamento> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || "{}") as Record<number, SeguimientoMedicamento>;
  } catch {
    return {};
  }
}

export function guardarSeguimiento(idMedicamento: number, datos: SeguimientoMedicamento) {
  const actuales = obtenerSeguimientos();
  actuales[idMedicamento] = datos;
  localStorage.setItem(CLAVE, JSON.stringify(actuales));
}
