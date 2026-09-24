import { useState } from "react";
import type { MedicamentoApi } from "../services/api";
import { fechaLocal } from "../utils/fechaLocal";

function activoEnFecha(m: MedicamentoApi, fecha: Date) {
  const dia = fechaLocal(fecha);
  if (!m.fechaInicio || dia < m.fechaInicio.slice(0, 10) || (m.fechaFin && dia > m.fechaFin.slice(0, 10))) return false;
  if (m.tipoTratamiento !== "ciclico") return true;
  const activos = m.diasActivos ?? 0;
  const descanso = m.diasDescanso ?? 0;
  if (activos < 1 || descanso < 1) return false;
  const [anio, mes, jornada] = m.fechaInicio.slice(0, 10).split("-").map(Number);
  const diferencia = Math.floor((Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) - Date.UTC(anio, mes - 1, jornada)) / 86_400_000);
  if (m.cantidadCiclos && diferencia >= m.cantidadCiclos * (activos + descanso)) return false;
  return diferencia % (activos + descanso) < activos;
}

export function CalendarioTratamientos({ medicamentos }: { medicamentos: MedicamentoApi[] }) {
  const [mes, setMes] = useState(() => new Date());
  const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const desplazamiento = (inicio.getDay() + 6) % 7;
  const dias = Array.from({ length: 42 }, (_, indice) => new Date(mes.getFullYear(), mes.getMonth(), indice - desplazamiento + 1));

  return <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6" aria-label="Calendario de tratamientos">
    <div className="flex items-center justify-between gap-2">
      <div><h3 className="text-2xl font-bold">Calendario de tomas</h3><p className="mt-1 text-sm text-[#747970]">Pasá el cursor o seleccioná un día para ver el plan.</p></div>
      <div className="flex gap-2"><button type="button" aria-label="Mes anterior" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))} className="rounded-lg border px-3 py-1">‹</button><button type="button" aria-label="Mes siguiente" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))} className="rounded-lg border px-3 py-1">›</button></div>
    </div>
    <p className="mt-4 font-semibold capitalize">{mes.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}</p>
    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs sm:text-sm">{["L", "M", "M", "J", "V", "S", "D"].map((dia, indice) => <b key={indice}>{dia}</b>)}
      {dias.map((dia) => { const tomas = medicamentos.filter((m) => activoEnFecha(m, dia)); const detalle = tomas.map((m) => `${m.nombre} · ${m.presentacion || "Sin dosis"} · ${m.horarios.map((h) => h.hora).join(", ") || "Sin horario"} · ${m.frecuenciaHoras ? `cada ${m.frecuenciaHoras} h` : "diario"}`).join("\n");
        return <button type="button" key={fechaLocal(dia)} title={detalle || "Sin tomas programadas"} aria-label={`${dia.toLocaleDateString("es-AR")}: ${detalle || "sin tomas"}`} className={`relative min-h-10 rounded-xl border p-1 ${dia.getMonth() === mes.getMonth() ? "" : "opacity-35"} ${tomas.length ? "border-[#2E7D32] bg-[#E8F5E9]" : "border-transparent"}`}><span>{dia.getDate()}</span>{tomas.length > 0 && <span className="mx-auto mt-0.5 block h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />}</button>;
      })}
    </div>
  </section>;
}
