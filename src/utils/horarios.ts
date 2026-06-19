export const VENTANA_CONFIRMACION_MINUTOS = 15;

export function minutosHastaHorario(valor: string, ahora = new Date()) {
  const fecha = valor.includes("T") ? new Date(valor) : null;
  const partes = fecha && !Number.isNaN(fecha.getTime())
    ? [fecha.getHours(), fecha.getMinutes()]
    : valor.split(":").slice(0, 2).map(Number);

  if (partes.length < 2 || partes.some(Number.isNaN)) return null;

  const minutosObjetivo = partes[0] * 60 + partes[1];
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
  let diferencia = minutosObjetivo - minutosActuales;

  if (diferencia > 720) diferencia -= 1440;
  if (diferencia < -720) diferencia += 1440;
  return diferencia;
}

export function puedeConfirmarHorario(valor?: string | null, ahora = new Date()) {
  if (!valor || valor === "Sin horario") return false;
  const diferencia = minutosHastaHorario(valor, ahora);
  return diferencia !== null && Math.abs(diferencia) <= VENTANA_CONFIRMACION_MINUTOS;
}

export function textoVentanaConfirmacion(valor?: string | null) {
  if (!valor || valor === "Sin horario") return "Primero cargá un horario.";
  return `Podés confirmar desde 15 minutos antes hasta 15 minutos después de las ${valor.slice(0, 5)}.`;
}
