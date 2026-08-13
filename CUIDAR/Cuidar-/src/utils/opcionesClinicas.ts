export const CONDICIONES_FRECUENTES = [
  "Sin condición",
  "Ninguna",
  "Gripe",
  "Resfrío",
  "Resfriado",
  "Alergia estacional",
  "Asma",
  "Hipertensión",
  "Diabetes",
  "Gastritis",
  "Migraña",
  "Dolor muscular",
  "Dolor de garganta",
  "Sinusitis",
  "Otra condición",
];

export interface FichaClinicaMedicamento {
  contraindicaciones?: string;
  efectosSecundarios?: string;
}

const CLAVE_FICHAS = "cuidarPlusFichasMedicamentos";

export function obtenerFichasMedicamentos(): Record<number, FichaClinicaMedicamento> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_FICHAS) || "{}") as Record<number, FichaClinicaMedicamento>;
  } catch {
    return {};
  }
}

export function obtenerFichaMedicamento(idMedicamento: number): FichaClinicaMedicamento {
  return obtenerFichasMedicamentos()[idMedicamento] ?? {};
}

export function guardarFichaMedicamento(idMedicamento: number, ficha: FichaClinicaMedicamento) {
  const fichas = obtenerFichasMedicamentos();
  const limpia = {
    contraindicaciones: ficha.contraindicaciones?.trim() || undefined,
    efectosSecundarios: ficha.efectosSecundarios?.trim() || undefined,
  };

  if (!limpia.contraindicaciones && !limpia.efectosSecundarios) {
    delete fichas[idMedicamento];
  } else {
    fichas[idMedicamento] = limpia;
  }

  localStorage.setItem(CLAVE_FICHAS, JSON.stringify(fichas));
}
