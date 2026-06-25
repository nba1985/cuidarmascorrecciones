import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, HeartPulse, Pill, Printer, SlidersHorizontal, TrendingUp } from "lucide-react";
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
  const [periodo, setPeriodo] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [medicamento, setMedicamento] = useState("todos");
  const [mesCalendario, setMesCalendario] = useState(() => new Date());

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

  const medicamentos = useMemo(
    () => [...new Set(registrosTomas.map((registro) => registro.medicamento).filter(Boolean) as string[])].sort(),
    [registrosTomas]
  );
  const tomasFiltradas = useMemo(
    () => registrosTomas.filter((registro) => {
      const cumplePeriodo = fechaEnPeriodo(new Date(registro.fechaHoraReal), periodo);
      const cumpleEstado = estado === "todos" || (estado === "tomado" ? registro.estado : !registro.estado);
      const cumpleMedicamento = medicamento === "todos" || registro.medicamento === medicamento;
      return cumplePeriodo && cumpleEstado && cumpleMedicamento;
    }),
    [registrosTomas, periodo, estado, medicamento]
  );
  const animosFiltrados = useMemo(() => {
    const idsRelacionados = new Set(tomasFiltradas.map((toma) => toma.idHistorialAnimo).filter(Boolean));
    return historialAnimo.filter((animo) => {
      if (!fechaEnPeriodo(fechaDeAnimo(animo), periodo)) return false;
      if (estado !== "todos" || medicamento !== "todos") return idsRelacionados.has(animo.idHistorialAnimo);
      return true;
    });
  }, [historialAnimo, tomasFiltradas, periodo, estado, medicamento]);
  const grupos = useMemo(
    () => agruparPorDia(tomasFiltradas, animosFiltrados),
    [tomasFiltradas, animosFiltrados]
  );
  const estadisticas = useMemo(
    () => calcularEstadisticas(tomasFiltradas, animosFiltrados),
    [tomasFiltradas, animosFiltrados]
  );

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
          <button type="button" onClick={() => window.print()} className="print:hidden inline-flex items-center justify-center gap-2 rounded-2xl border border-[#B7D8B9] bg-white px-5 py-3 font-semibold text-[#2E7D32] shadow-sm hover:bg-[#E8F5E9]">
            <Printer size={19} /> Exportar a PDF
          </button>

        </div>

        <div className="mt-8">
          {cargando ? (
            <LoadingState label="Cargando tu seguimiento..." />
          ) : error ? (
            <ErrorState message={error} onRetry={cargarHistorial} />
          ) : (
            <div>
              <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm" aria-label="Filtros del historial">
                <div className="flex items-center gap-2 font-bold text-[#386641]">
                  <SlidersHorizontal size={20} aria-hidden="true" /> Filtrar seguimiento
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Filtro label="Período" value={periodo} onChange={setPeriodo}>
                    <option value="todos">Todo el historial</option>
                    <option value="hoy">Hoy</option>
                    <option value="semana">Últimos 7 días</option>
                    <option value="mes">Últimos 30 días</option>
                  </Filtro>
                  <Filtro label="Estado" value={estado} onChange={setEstado}>
                    <option value="todos">Tomadas y omitidas</option>
                    <option value="tomado">Solo tomadas</option>
                    <option value="omitido">Solo omitidas</option>
                  </Filtro>
                  <Filtro label="Medicamento" value={medicamento} onChange={setMedicamento}>
                    <option value="todos">Todos los medicamentos</option>
                    {medicamentos.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
                  </Filtro>
                </div>
              </section>

              <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Estadísticas del historial">
                <Estadistica label="Adherencia" value={`${estadisticas.adherencia}%`} detail={`${estadisticas.tomadas} de ${estadisticas.total} tomas`} icon={<TrendingUp size={20} />} />
                <Estadistica label="Confirmadas" value={String(estadisticas.tomadas)} detail="Dosis registradas" icon={<CheckCircle2 size={20} />} />
                <Estadistica label="Omitidas" value={String(estadisticas.omitidas)} detail="Para revisar" icon={<Clock3 size={20} />} />
                <Estadistica label="Ánimo frecuente" value={estadisticas.emojiAnimo} detail={estadisticas.animoPredominante} icon={<HeartPulse size={20} />} />
              </section>

              <CalendarioMensual
                mes={mesCalendario}
                tomas={registrosTomas}
                animos={historialAnimo}
                onAnterior={() => setMesCalendario((actual) => new Date(actual.getFullYear(), actual.getMonth() - 1, 1))}
                onSiguiente={() => setMesCalendario((actual) => new Date(actual.getFullYear(), actual.getMonth() + 1, 1))}
              />

              {grupos.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="No hay resultados para estos filtros"
                    description="Probá ampliando el período o seleccionando otro medicamento."
                  />
                </div>
              ) : <div className="mt-8 space-y-8">
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
              </div>}
            </div>
          )}
        </div>
      </div>
      <style>{`@media print { header, footer, nav, .print\\:hidden { display: none !important; } body, section { background: white !important; } article { break-inside: avoid; box-shadow: none !important; } }`}</style>
    </section>
  );
}

function CalendarioMensual({ mes, tomas, animos, onAnterior, onSiguiente }: {
  mes: Date;
  tomas: RegistroTomaApi[];
  animos: HistorialAnimoApi[];
  onAnterior: () => void;
  onSiguiente: () => void;
}) {
  const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const desplazamiento = (primerDia.getDay() + 6) % 7;
  const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1 - desplazamiento);
  const dias = Array.from({ length: 42 }, (_, indice) => {
    const fecha = new Date(inicio);
    fecha.setDate(inicio.getDate() + indice);
    return fecha;
  });
  const hoy = claveFecha(new Date());

  return (
    <section className="mt-5 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6" aria-label="Calendario de adherencia">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-[#386641]">Calendario de seguimiento</p>
          <h2 className="mt-1 text-xl font-bold capitalize">{mes.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onAnterior} aria-label="Mes anterior" className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-[#386641] hover:bg-[#F1F8E9]"><ChevronLeft size={20} /></button>
          <button type="button" onClick={onSiguiente} aria-label="Mes siguiente" className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-[#386641] hover:bg-[#F1F8E9]"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-7 text-center text-xs font-semibold text-[#747970]">
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((dia) => <span key={dia} className="py-2">{dia}</span>)}
        {dias.map((fecha) => {
          const clave = claveFecha(fecha);
          const tomasDia = tomas.filter((toma) => claveFecha(new Date(toma.fechaHoraReal)) === clave);
          const tieneAnimo = animos.some((animo) => claveFecha(fechaDeAnimo(animo)) === clave);
          const completa = tomasDia.length > 0 && tomasDia.every((toma) => toma.estado);
          const incompleta = tomasDia.some((toma) => !toma.estado);
          const fueraDeMes = fecha.getMonth() !== mes.getMonth();
          const color = completa ? "bg-[#E8F5E9] text-[#2E7D32]" : incompleta ? "bg-[#FFF8E1] text-[#B45309]" : tieneAnimo ? "bg-[#F1F8E9] text-[#558B2F]" : "text-[#747970]";
          return (
            <div key={clave} className={`relative mx-auto grid h-9 w-9 place-items-center rounded-xl text-sm ${color} ${fueraDeMes ? "opacity-35" : ""} ${clave === hoy ? "ring-2 ring-[#2E7D32] ring-offset-1" : ""}`} title={completa ? "Día completo" : incompleta ? "Con dosis omitidas" : tieneAnimo ? "Con ánimo registrado" : "Sin actividad"}>
              {fecha.getDate()}
              {(tomasDia.length > 0 || tieneAnimo) && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${incompleta ? "bg-[#B45309]" : "bg-[#2E7D32]"}`} />}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#747970]">
        <Leyenda color="bg-[#E8F5E9]" texto="Día completo" />
        <Leyenda color="bg-[#FFF8E1]" texto="Con omisiones" />
        <Leyenda color="bg-[#F1F8E9]" texto="Solo ánimo" />
      </div>
    </section>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return <span className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${color} border border-gray-200`} />{texto}</span>;
}

function Filtro({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="text-sm font-semibold text-[#555B52]">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 font-normal text-[#212121] outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20">
        {children}
      </select>
    </label>
  );
}

function Estadistica({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <article className="rounded-3xl border border-[#DCEBDD] bg-[#F7FBF7] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#386641]">{icon}{label}</div>
      <p className="mt-2 text-2xl font-bold sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-[#747970] sm:text-sm">{detail}</p>
    </article>
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
      const animosUsados = new Set<number>();
      const momentosRelacionados = tomasDelDia.flatMap((toma) => {
        if (!toma.idHistorialAnimo) return [];
        const animo = animosDelDia.find((item) => item.idHistorialAnimo === toma.idHistorialAnimo);
        if (!animo) return [];
        animosUsados.add(animo.idHistorialAnimo);
        return [{
          id: `${toma.idRegistroToma}-${animo.idHistorialAnimo}`,
          fecha: new Date(toma.fechaHoraReal),
          toma,
          animo,
        }];
      });
      const tomasSinRelacion = tomasDelDia.filter((toma) => !toma.idHistorialAnimo || !animosUsados.has(toma.idHistorialAnimo));
      const animosSinRelacion = animosDelDia.filter((animo) => !animosUsados.has(animo.idHistorialAnimo));
      const cantidad = Math.max(tomasSinRelacion.length, animosSinRelacion.length);
      const momentosSinRelacion = Array.from({ length: cantidad }, (_, indice) => {
        const toma = tomasSinRelacion[indice];
        const animo = animosSinRelacion[indice];
        const fecha = toma ? new Date(toma.fechaHoraReal) : fechaDeAnimo(animo);
        return {
          id: `${toma?.idRegistroToma ?? "sin-toma"}-${animo?.idHistorialAnimo ?? "sin-animo"}`,
          fecha,
          toma,
          animo,
        };
      });
      const momentos = [...momentosRelacionados, ...momentosSinRelacion]
        .sort((a, b) => +b.fecha - +a.fecha);

      return { clave, fecha: momentos[0]?.fecha ?? new Date(`${clave}T00:00:00`), momentos };
    })
    .sort((a, b) => +b.fecha - +a.fecha);
}

function fechaEnPeriodo(fecha: Date, periodo: string) {
  if (periodo === "todos") return true;
  const ahora = new Date();
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const limite = new Date(inicioHoy);
  if (periodo === "hoy") return fecha >= inicioHoy;
  limite.setDate(limite.getDate() - (periodo === "semana" ? 6 : 29));
  return fecha >= limite;
}

function calcularEstadisticas(tomas: RegistroTomaApi[], animos: HistorialAnimoApi[]) {
  const tomadas = tomas.filter((toma) => toma.estado).length;
  const omitidas = tomas.length - tomadas;
  const frecuencias = new Map<string, number>();
  animos.forEach((animo) => {
    const texto = categoriaAnimo(animo);
    frecuencias.set(texto, (frecuencias.get(texto) ?? 0) + 1);
  });
  const animoPredominante = [...frecuencias.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Sin registros";
  return {
    total: tomas.length,
    tomadas,
    omitidas,
    adherencia: tomas.length ? Math.round((tomadas / tomas.length) * 100) : 0,
    animoPredominante,
    emojiAnimo: animoPredominante === "Sin registros" ? "—" : emojiPorTexto(animoPredominante),
  };
}

function categoriaAnimo(animo: HistorialAnimoApi) {
  const texto = textoAnimo(animo).toLocaleLowerCase("es-AR");
  if (texto.includes("muy mal")) return "Muy mal";
  if (texto.includes("mal")) return "Mal";
  if (texto.includes("regular")) return "Regular";
  if (texto.includes("muy bien")) return "Muy bien";
  if (texto.includes("bien")) return "Bien";
  if (animo.idEstado === 3) return "Mal";
  if (animo.idEstado === 2) return "Regular";
  return "Bien";
}

function emojiPorTexto(texto: string) {
  if (texto === "Muy mal") return "😞";
  if (texto === "Mal") return "🙁";
  if (texto === "Regular") return "😐";
  if (texto === "Muy bien") return "😄";
  return "🙂";
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
