export function formatearHora24(valor: Date | string) {
  const fecha = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "--:--";
  return `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`;
}

export function formatearFechaHora24(valor: Date | string) {
  const fecha = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Fecha no disponible";
  return `${fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })} · ${formatearHora24(fecha)}`;
}
