import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, FileText, Pill, TrendingUp } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../components/ui";
import { cambiarPausaTratamiento, obtenerMedicamentos, obtenerRegistrosTomas, type MedicamentoApi, type RegistroTomaApi, type UsuarioApi } from "../services/api";
import { guardarSeguimiento, obtenerSeguimientos, type SeguimientoMedicamento } from "../utils/seguimientoMedicamentos";

export function MedicamentoDetalle() {
  const { id } = useParams();
  const usuario = obtenerUsuarioActual();
  const [medicamento, setMedicamento] = useState<MedicamentoApi | null>(null);
  const [registros, setRegistros] = useState<RegistroTomaApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cambiandoPausa, setCambiandoPausa] = useState(false);
  const [seguimiento, setSeguimiento] = useState<SeguimientoMedicamento>({});
  const [seguimientoGuardado, setSeguimientoGuardado] = useState(false);

  useEffect(() => {
    Promise.all([obtenerMedicamentos(usuario?.idUsuario), obtenerRegistrosTomas(usuario?.idUsuario)])
      .then(([medicamentos, tomas]) => {
        const encontrado = medicamentos.find((item) => item.idMedicamento === Number(id)) ?? null;
        setMedicamento(encontrado);
        if (encontrado) setSeguimiento(obtenerSeguimientos()[encontrado.idMedicamento] ?? {});
        setRegistros(tomas);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar el medicamento."))
      .finally(() => setCargando(false));
  }, [id, usuario?.idUsuario]);

  const tomas = useMemo(() => registros.filter((registro) => registro.medicamento?.toLocaleLowerCase("es-AR") === medicamento?.nombre.toLocaleLowerCase("es-AR")), [registros, medicamento]);
  const confirmadas = tomas.filter((toma) => toma.estado).length;
  const adherencia = tomas.length ? Math.round((confirmadas / tomas.length) * 100) : 0;

  const alternarPausa = async () => {
    if (!medicamento?.idTratamiento || !usuario) return;
    setCambiandoPausa(true);
    try {
      await cambiarPausaTratamiento(medicamento.idTratamiento, usuario.idUsuario, !medicamento.pausado);
      setMedicamento({ ...medicamento, pausado: !medicamento.pausado });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el estado del tratamiento.");
    } finally {
      setCambiandoPausa(false);
    }
  };

  const guardarDatosSeguimiento = () => {
    if (!medicamento) return;
    guardarSeguimiento(medicamento.idMedicamento, seguimiento);
    setSeguimientoGuardado(true);
    window.setTimeout(() => setSeguimientoGuardado(false), 2500);
  };

  if (cargando) return <main className="min-h-screen bg-[#F5F5F5] p-6"><div className="mx-auto max-w-5xl"><LoadingState label="Cargando medicamento..." /></div></main>;
  if (error) return <main className="min-h-screen bg-[#F5F5F5] p-6"><div className="mx-auto max-w-5xl"><ErrorState message={error} /></div></main>;
  if (!medicamento) return <main className="min-h-screen bg-[#F5F5F5] p-6"><div className="mx-auto max-w-5xl"><EmptyState title="Medicamento no encontrado" description="Puede haber sido eliminado o no pertenecer a tu tratamiento." action={<Link to="/app/medicamentos" className="font-semibold text-[#2E7D32]">Volver a medicamentos</Link>} /></div></main>;

  return (
    <main className="min-h-screen bg-[#F5F5F5] px-4 py-7 text-[#212121]">
      <div className="mx-auto max-w-5xl">
        <Link to="/app/medicamentos" className="inline-flex items-center gap-2 font-semibold text-[#386641]"><ArrowLeft size={19} /> Volver</Link>
        <section className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[#F7FBF7] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#E8F5E9] text-[#2E7D32]"><Pill size={32} /></span>
              <div className="flex-1"><div className="flex flex-wrap items-center gap-3"><p className="font-semibold text-[#2E7D32]">DETALLE DEL TRATAMIENTO</p>{medicamento.pausado && <span className="rounded-full bg-[#FFF8E1] px-3 py-1 text-sm font-semibold text-[#B45309]">Pausado</span>}</div><h1 className="mt-1 text-3xl font-bold sm:text-4xl">{medicamento.nombre}</h1><p className="mt-2 text-[#747970]">{medicamento.descripcion || medicamento.presentacion || "Sin indicaciones adicionales"}</p>{medicamento.idTratamiento && <button type="button" onClick={alternarPausa} disabled={cambiandoPausa} className="mt-4 rounded-2xl border border-[#B7D8B9] bg-white px-4 py-2 font-semibold text-[#2E7D32] disabled:opacity-50">{cambiandoPausa ? "Guardando..." : medicamento.pausado ? "Reanudar tratamiento" : "Pausar tratamiento"}</button>}</div>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            <Dato icon={<Clock3 />} label="Frecuencia" value={medicamento.frecuenciaHoras === 24 || !medicamento.frecuenciaHoras ? "Una vez al día" : `Cada ${medicamento.frecuenciaHoras} horas`} />
            <Dato icon={<CheckCircle2 />} label="Horarios" value={medicamento.horarios.map((item) => item.hora).join(" · ") || medicamento.horario || "Sin horario"} />
            <Dato icon={<TrendingUp />} label="Adherencia" value={`${adherencia}% (${confirmadas}/${tomas.length})`} />
          </div>
        </section>
        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold">Planificación y alertas</h2>
          <p className="mt-2 text-[#747970]">Estos datos se guardan en este dispositivo y alimentan las alertas de Inicio.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">Dosis restantes<input type="number" min="0" value={seguimiento.stock ?? ""} onChange={(event) => setSeguimiento({ ...seguimiento, stock: event.target.value === "" ? undefined : Number(event.target.value) })} className="rounded-2xl border border-gray-300 p-3 font-normal" placeholder="Ej: 12" /></label>
            <label className="grid gap-2 text-sm font-semibold">Fin previsto del tratamiento<input type="date" value={seguimiento.fechaFin ?? ""} onChange={(event) => setSeguimiento({ ...seguimiento, fechaFin: event.target.value || undefined })} className="rounded-2xl border border-gray-300 p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Vencimiento de la receta<input type="date" value={seguimiento.vencimientoReceta ?? ""} onChange={(event) => setSeguimiento({ ...seguimiento, vencimientoReceta: event.target.value || undefined })} className="rounded-2xl border border-gray-300 p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Reanudar tratamiento el<input type="date" value={seguimiento.reanudarEl ?? ""} onChange={(event) => setSeguimiento({ ...seguimiento, reanudarEl: event.target.value || undefined })} className="rounded-2xl border border-gray-300 p-3 font-normal" /></label>
          </div>
          <button type="button" onClick={guardarDatosSeguimiento} className="mt-5 rounded-2xl bg-[#2E7D32] px-5 py-3 font-semibold text-white">{seguimientoGuardado ? "Datos guardados" : "Guardar planificación"}</button>
        </section>
        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3"><FileText className="text-[#2E7D32]" /><h2 className="text-2xl font-bold">Últimas tomas</h2></div>
          {tomas.length === 0 ? <p className="mt-5 text-[#747970]">Todavía no hay tomas registradas para este medicamento.</p> : <div className="mt-5 space-y-3">{tomas.slice(0, 8).map((toma) => <div key={toma.idRegistroToma} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 p-4"><div><p className="font-semibold">{new Date(toma.fechaHoraReal).toLocaleString("es-AR")}</p><p className="mt-1 text-sm text-[#747970]">{toma.observaciones || (toma.estado ? "Dosis confirmada" : "Dosis omitida")}</p></div><span className={`rounded-full px-3 py-1 text-sm font-semibold ${toma.estado ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFF8E1] text-[#B45309]"}`}>{toma.estado ? "Tomada" : "Omitida"}</span></div>)}</div>}
        </section>
      </div>
    </main>
  );
}

function Dato({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <article className="rounded-2xl border border-[#DCEBDD] bg-white p-4"><div className="flex items-center gap-2 text-[#386641]">{icon}<span className="text-sm font-semibold">{label}</span></div><p className="mt-2 font-bold">{value}</p></article>;
}

function obtenerUsuarioActual(): UsuarioApi | null {
  const guardado = localStorage.getItem("cuidarPlusUsuario");
  return guardado ? JSON.parse(guardado) as UsuarioApi : null;
}
