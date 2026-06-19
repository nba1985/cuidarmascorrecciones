import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, HeartPulse, Pill } from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "../components/ui";
import {
  obtenerHistorialesAnimo,
  obtenerRegistrosTomas,
  type HistorialAnimoApi,
  type RegistroTomaApi,
  type UsuarioApi,
} from "../services/api";

type MomentoHistorial = {
  id: string;
  fecha: Date;
  toma?: RegistroTomaApi;
  animo?: HistorialAnimoApi;
};

type GrupoDia = {
  clave: string;
  fecha: Date;
  momentos: MomentoHistorial[];
};

export function Historial() {
  const usuarioActual = obtenerUsuarioActual();
  const [historialAnimo, setHistorialAnimo] = useState<HistorialAnimoApi[]>([]);
  const [registrosTomas, setRegistrosTomas] = useState<RegistroTomaApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarHistorial = async () => {
    setCargando(true);
    try {
      const [tomas, animo] = await Promise.all([
        obtenerRegistrosTomas(usuarioActual?.idUsuario),
        obtenerHistorialesAnimo(usuarioActual?.idUsuario),
      ]);
      setRegistrosTomas(tomas);
      setHistorialAnimo(animo);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el historial.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    Promise.all([
      obtenerRegistrosTomas(usuarioActual?.idUsuario),
      obtenerHistorialesAnimo(usuarioActual?.idUsuario),
    ])
      .then(([tomas, animo]) => {
        setRegistrosTomas(tomas);
        setHistorialAnimo(animo);
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "No se pudo cargar el historial.")
      )
      .finally(() => setCargando(false));
  }, [usuarioActual?.idUsuario]);

  const grupos = useMemo(
    () => agruparPorDia(registrosTomas, historialAnimo),
    [registrosTomas, historialAnimo]
  );

  const tomadas = registrosTomas.filter((registro) => registro.estado).length;

  return (
    <section className="min-h-screen bg-[#F5F5F5] px-4 py-6 text-[#212121]">
      <div className="mx-auto mt-4 max-w-5xl md:mt-8">
        <p className="text-base text-[#747970]">Seguimiento personal</p>
        <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold md:text-5xl">Tu historial</h1>
            <p className="mt-3 max-w-2xl text-[#747970]">
              Cada tarjeta reúne tu medicación y cómo te sentiste en ese momento.
            </p>
          </div>

          {!cargando && !error && grupos.length > 0 && (
            <div className="flex gap-2" aria-label="Resumen del historial">
              <span className="rounded-full border border-[#DCEBDD] bg-[#E8F5E9] px-4 py-2 text-sm font-semibold text-[#2E7D32]">
                {tomadas} {tomadas === 1 ? "toma" : "tomas"}
              </span>
              <span className="rounded-full border border-[#DCEBDD] bg-white px-4 py-2 text-sm font-semibold text-[#386641]">
                {historialAnimo.length} {historialAnimo.length === 1 ? "ánimo" : "ánimos"}
              </span>
            </div>
          )}
        </div>

        <div className="mt-8">
          {cargando ? (
            <LoadingState label="Cargando tu seguimiento..." />
          ) : error ? (
            <ErrorState message={error} onRetry={cargarHistorial} />
          ) : grupos.length === 0 ? (
            <EmptyState
              title="Todavía no hay actividad"
              description="Cuando confirmes una medicación o registres cómo te sentís, aparecerá acá."
            />
          ) : (
            <div className="space-y-8">
              {grupos.map((grupo) => (
                <section key={grupo.clave} aria-labelledby={`dia-${grupo.clave}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                      <CalendarDays size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 id={`dia-${grupo.clave}`} className="text-xl font-bold capitalize">
                        {etiquetaDia(grupo.fecha)}
                      </h2>
                      <p className="text-sm text-[#747970]">
                        {grupo.momentos.length} {grupo.momentos.length === 1 ? "registro" : "registros"}
                      </p>
                    </div>
                  </div>

                  <div className="relative space-y-4 sm:pl-5">
                    <div className="absolute bottom-6 left-[2.45rem] top-5 hidden w-px bg-[#DCEBDD] sm:block" />
                    {grupo.momentos.map((momento) => (
                      <TarjetaMomento key={momento.id} momento={momento} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TarjetaMomento({ momento }: { momento: MomentoHistorial }) {
  const emoji = emojiAnimo(momento.animo);

  return (
    <article className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:ml-10">
      <span className="absolute -left-[3.05rem] top-7 hidden h-4 w-4 rounded-full border-4 border-[#F5F5F5] bg-[#2E7D32] sm:block" />
      <div className="grid md:grid-cols-[1.15fr_0.85fr]">
        <div className="p-5 sm:p-6">
          {momento.toma ? (
            <>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#E8F5E9] text-[#2E7D32]">
                  <Pill size={25} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#2E7D32]">MEDICACIÓN</p>
                  <h3 className="mt-1 truncate text-xl font-bold">
                    {momento.toma.medicamento ?? "Medicamento sin nombre"}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#747970]">
                    <span className="flex items-center gap-1.5">
                      <Clock3 size={16} aria-hidden="true" />
                      {formatearHora(new Date(momento.toma.fechaHoraReal))}
                    </span>
                    <span className={`flex items-center gap-1.5 font-semibold ${momento.toma.estado ? "text-[#2E7D32]" : "text-[#B45309]"}`}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      {momento.toma.estado ? "Tomado" : "Omitido"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#747970]">{textoRegistroToma(momento.toma)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 text-[#747970]">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gray-100">
                <Pill size={24} aria-hidden="true" />
              </span>
              <p>No hay una toma asociada a este registro de ánimo.</p>
            </div>
          )}
        </div>

        <div className="border-t border-[#DCEBDD] bg-[#F7FBF7] p-5 sm:p-6 md:border-l md:border-t-0">
          {momento.animo ? (
            <div className="flex h-full items-center gap-4">
              <span className="text-4xl" role="img" aria-label={`Estado de ánimo: ${textoAnimo(momento.animo)}`}>
                {emoji}
              </span>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-[#386641]">
                  <HeartPulse size={17} aria-hidden="true" /> CÓMO ME SENTÍ
                </p>
                <p className="mt-1 text-lg font-bold">{textoAnimo(momento.animo)}</p>
                <p className="mt-1 text-sm text-[#747970]">{formatearHora(fechaDeAnimo(momento.animo))}</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center gap-4 text-[#747970]">
              <span className="text-3xl" aria-hidden="true">○</span>
              <div>
                <p className="font-semibold text-[#386641]">Sin registro de ánimo</p>
                <p className="mt-1 text-sm">Esta toma no tiene un estado de ánimo asociado.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function agruparPorDia(tomas: RegistroTomaApi[], animos: HistorialAnimoApi[]): GrupoDia[] {
  const claves = new Set([
    ...tomas.map((toma) => claveFecha(new Date(toma.fechaHoraReal))),
    ...animos.map((animo) => claveFecha(fechaDeAnimo(animo))),
  ]);

  return [...claves]
    .map((clave) => {
      const tomasDelDia = tomas
        .filter((toma) => claveFecha(new Date(toma.fechaHoraReal)) === clave)
        .sort((a, b) => +new Date(a.fechaHoraReal) - +new Date(b.fechaHoraReal));
      const animosDelDia = animos
        .filter((animo) => claveFecha(fechaDeAnimo(animo)) === clave)
        .sort((a, b) => +fechaDeAnimo(a) - +fechaDeAnimo(b));
      const cantidad = Math.max(tomasDelDia.length, animosDelDia.length);
      const momentos = Array.from({ length: cantidad }, (_, indice) => {
        const toma = tomasDelDia[indice];
        const animo = animosDelDia[indice];
        const fecha = toma ? new Date(toma.fechaHoraReal) : fechaDeAnimo(animo);
        return {
          id: `${toma?.idRegistroToma ?? "sin-toma"}-${animo?.idHistorialAnimo ?? "sin-animo"}`,
          fecha,
          toma,
          animo,
        };
      }).sort((a, b) => +b.fecha - +a.fecha);

      return { clave, fecha: momentos[0]?.fecha ?? new Date(`${clave}T00:00:00`), momentos };
    })
    .sort((a, b) => +b.fecha - +a.fecha);
}

function obtenerUsuarioActual(): UsuarioApi | null {
  const guardado = localStorage.getItem("cuidarPlusUsuario");
  return guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
}

function fechaDeAnimo(animo: HistorialAnimoApi) {
  const fecha = animo.fecha.slice(0, 10);
  const hora = (animo.hora || "00:00:00").slice(0, 8);
  return new Date(`${fecha}T${hora}`);
}

function claveFecha(fecha: Date) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function etiquetaDia(fecha: Date) {
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  const clave = claveFecha(fecha);
  if (clave === claveFecha(hoy)) return "Hoy";
  if (clave === claveFecha(ayer)) return "Ayer";
  return fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: fecha.getFullYear() === hoy.getFullYear() ? undefined : "numeric",
  });
}

function formatearHora(fecha: Date) {
  return fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function textoAnimo(animo: HistorialAnimoApi) {
  return animo.observaciones?.trim() || "Sin observaciones";
}

function emojiAnimo(animo?: HistorialAnimoApi) {
  if (!animo) return "○";
  const texto = textoAnimo(animo).toLocaleLowerCase("es-AR");
  if (texto.includes("muy mal")) return "😞";
  if (texto.includes("mal")) return "🙁";
  if (texto.includes("regular")) return "😐";
  if (texto.includes("muy bien")) return "😄";
  if (texto.includes("bien")) return "🙂";
  if (animo.idEstado === 3) return "🙁";
  if (animo.idEstado === 2) return "😐";
  return "🙂";
}

function textoRegistroToma(registro: RegistroTomaApi) {
  const observacion = registro.observaciones?.replace(" desde frontend", "").trim();
  return observacion || (registro.estado ? "Dosis confirmada" : "Dosis omitida");
}
