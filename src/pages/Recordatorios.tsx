import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ban, CheckCircle2, Clock3, Pencil } from "lucide-react";
import {
  actualizarRecordatorio,
  crearRegistroToma,
  obtenerRecordatoriosUsuario,
  type RecordatorioApi,
  type UsuarioApi,
} from "../services/api";
import { puedeConfirmarHorario, textoVentanaConfirmacion } from "../utils/horarios";
import { EmptyState, ErrorState, LoadingState } from "../components/ui";

interface RecordatorioVista {
  id: number;
  hora: string;
  titulo: string;
  descripcion: string;
  estado: "activo" | "pendiente";
  fechaHoraProgramada: string;
}

function adaptarRecordatorio(recordatorio: RecordatorioApi, index: number): RecordatorioVista {
  const fecha = new Date(recordatorio.fechaHoraProgramada);

  return {
    id: recordatorio.idRecordatorio,
    hora: new Intl.DateTimeFormat("es-AR", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(fecha),
    titulo: recordatorio.canal || "Recordatorio",
    descripcion: `Programado para ${fecha.toLocaleDateString("es-AR")}`,
    estado: index === 0 ? "activo" : "pendiente",
    fechaHoraProgramada: recordatorio.fechaHoraProgramada,
  };
}

export function Recordatorios() {
  const navigate = useNavigate();
  const usuarioActual = obtenerUsuarioActual();
  const [recordatorios, setRecordatorios] = useState<RecordatorioVista[]>([]);
  const [error, setError] = useState("");
  const [, setReloj] = useState(Date.now());
  const [editando, setEditando] = useState<RecordatorioVista | null>(null);
  const [horaEditada, setHoraEditada] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    void cargarRecordatorios();
  }, []);

  async function cargarRecordatorios() {
    setCargando(true);
    await obtenerRecordatoriosUsuario(usuarioActual?.idUsuario)
      .then((data) => {
        setRecordatorios(data.map(adaptarRecordatorio));
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "No se pudieron cargar los recordatorios.")
      ).finally(() => setCargando(false));
  }

  useEffect(() => {
    const intervalo = window.setInterval(() => setReloj(Date.now()), 30_000);
    return () => window.clearInterval(intervalo);
  }, []);

  async function registrarToma(recordatorio: RecordatorioVista, estado: boolean) {
    if (estado && !puedeConfirmarHorario(recordatorio.fechaHoraProgramada)) {
      alert(textoVentanaConfirmacion(recordatorio.fechaHoraProgramada));
      return;
    }

    try {
      setGuardando(true);
      await crearRegistroToma({
        estado,
        fechaHoraReal: new Date().toISOString(),
        observaciones: estado ? "Dosis confirmada" : "Dosis omitida",
        idRecordatorio: recordatorio.id,
        idHistorialAnimo: null,
      });

      if (estado) {
        navigate("/app/historial-animo");
      } else {
        alert("Dosis omitida.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo guardar el registro de toma.");
    }
  }

  function abrirEdicion(recordatorio: RecordatorioVista) {
    const fecha = new Date(recordatorio.fechaHoraProgramada);
    setHoraEditada(`${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`);
    setEditando(recordatorio);
  }

  async function guardarHorario(e: React.FormEvent) {
    e.preventDefault();
    if (!editando || !horaEditada) return;

    try {
      const fechaBase = editando.fechaHoraProgramada.slice(0, 10);
      await actualizarRecordatorio(editando.id, {
        canal: editando.titulo,
        fechaHoraProgramada: `${fechaBase}T${horaEditada}:00`,
      });
      await cargarRecordatorios();
      setEditando(null);
      alert("Horario actualizado correctamente.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo actualizar el horario.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="max-w-6xl mx-auto py-6 md:py-10">
      <div className="mb-8 animate-[fadeIn_.5s_ease-out]">
        <p className="text-[#747970] text-base md:text-lg">Gestión diaria</p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
          <h1 className="text-3xl md:text-5xl font-bold">Recordatorios</h1>
          <Link
            to="/app/historial"
            className="bg-white border border-gray-200 rounded-2xl px-5 py-3 font-semibold text-[#2E7D32] shadow-sm hover:bg-[#2E7D32]/10"
          >
            Ver historial de tomas
          </Link>
        </div>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>

      <div className="relative">
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-1 bg-[#D9D9D9]" />

        <div className="flex flex-col gap-8 md:gap-10">
          {cargando && <LoadingState label="Cargando recordatorios…" />}
          {!cargando && error && <ErrorState message={error} onRetry={() => void cargarRecordatorios()} />}
          {!cargando && recordatorios.length === 0 && !error && <EmptyState title="No hay recordatorios programados" description="Editá un medicamento y asignale un horario para crear el primer recordatorio." />}

          {recordatorios.map((item, index) => (
            <div
              key={item.id}
              className="flex gap-4 md:gap-6 relative z-10 animate-[slideUp_.6s_ease-out_forwards]"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div
                className={`relative min-w-12 md:min-w-16 h-12 md:h-16 rounded-full flex items-center justify-center shadow-sm ${
                  item.estado === "activo"
                    ? "bg-[#2E7D32] text-white"
                    : "bg-[#ECEEE8] text-[#7A7A7A]"
                }`}
              >
                <Clock3 size={28} />
              </div>

              <div className="bg-white rounded-3xl p-5 md:p-7 border border-gray-200 shadow-sm flex-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-sm md:text-base font-bold text-[#2E7D32] uppercase">
                  {item.hora}
                </p>

                <h2 className="text-2xl md:text-4xl font-bold mt-3">{item.titulo}</h2>

                <p className="text-[#747970] mt-2 text-base md:text-lg">{item.descripcion}</p>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button
                    onClick={() => registrarToma(item, true)}
                    disabled={!puedeConfirmarHorario(item.fechaHoraProgramada)}
                    title={textoVentanaConfirmacion(item.fechaHoraProgramada)}
                    className="flex-1 bg-[#2E7D32] text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <CheckCircle2 size={20} />
                    Confirmar
                  </button>

                  <button
                    onClick={() => registrarToma(item, false)}
                    className="flex-1 border border-[#747970] text-[#212121] py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-100 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Ban size={20} />
                    Omitir
                  </button>

                  <button
                    onClick={() => abrirEdicion(item)}
                    className="flex-1 border border-[#2E7D32]/40 text-[#2E7D32] py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#2E7D32]/10"
                  >
                    <Pencil size={19} /> Editar horario
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editando && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={guardarHorario} className="w-full max-w-md bg-white rounded-3xl p-7 shadow-xl">
            <p className="text-sm font-semibold text-[#2E7D32]">RECORDATORIO</p>
            <h2 className="text-2xl font-bold mt-1">Editar horario</h2>
            <p className="text-[#747970] mt-2">{editando.titulo}</p>
            <input type="time" required value={horaEditada} onChange={(e) => setHoraEditada(e.target.value)} className="w-full mt-6 border border-gray-300 rounded-2xl p-4 text-lg outline-none focus:border-[#2E7D32]" />
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setEditando(null)} className="flex-1 border border-gray-300 rounded-2xl py-3">Cancelar</button>
              <button type="submit" disabled={guardando} aria-busy={guardando} className="flex-1 bg-[#2E7D32] text-white rounded-2xl py-3 font-bold disabled:opacity-60">{guardando ? "Guardando…" : "Guardar horario"}</button>
            </div>
          </form>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

function obtenerUsuarioActual(): UsuarioApi | null {
  const guardado = localStorage.getItem("cuidarPlusUsuario");
  return guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
}
