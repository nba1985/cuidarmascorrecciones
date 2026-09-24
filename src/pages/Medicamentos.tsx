import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  asociarMedicamentoUsuario,
  actualizarMedicamento,
  crearRegistroToma,
  crearMedicamento,
  eliminarMedicamento,
  obtenerMedicamentos,
  obtenerDosisFrecuente,
  obtenerRecordatoriosUsuario,
  type MedicamentoApi,
  type UsuarioApi,
} from "../services/api";
import { puedeConfirmarHorario, textoVentanaConfirmacion } from "../utils/horarios";
import { ConfirmDialog } from "../components/ui";
import { obtenerFichaMedicamento } from "../utils/opcionesClinicas";
import { MedicamentoCombobox } from "../components/MedicamentoCombobox";
import { fechaLocal, horaLocal } from "../utils/fechaLocal";

interface Medicamento {
  id: number;
  nombre: string;
  dosis: string;
  horario: string;
  indicaciones: string;
  idLaboratorio: number | null;
  idRecordatorio: number | null;
  frecuenciaHoras: number;
  horarios: Array<{ hora: string; idRecordatorio: number | null }>;
  contraindicaciones: string;
  efectosSecundarios: string;
  fechaInicio: string;
  fechaFin: string;
  tipoTratamiento: "continuo" | "temporal" | "ciclico";
  diasActivos: number | null;
  diasDescanso: number | null;
  cantidadCiclos: number | null;
  estadoCiclo: "activo" | "descanso" | "pendiente" | "finalizado";
  cicloActual: number | null;
  diaActivoActual: number | null;
  proximoCiclo: string;
}

const formInicial = {
  nombre: "",
  dosis: "",
  horario: horaLocal(),
  horarioSecundario: horaLocal(),
  frecuenciaHoras: "24",
  indicaciones: "",
  contraindicaciones: "",
  efectosSecundarios: "",
  tipoTratamiento: "continuo",
  fechaInicio: fechaLocal(),
  fechaFin: "",
  diasActivos: "7",
  diasDescanso: "21",
  cantidadCiclos: "",
};

function adaptarMedicamento(m: MedicamentoApi): Medicamento {
  const ficha = obtenerFichaMedicamento(m.idMedicamento);
  return {
    id: m.idMedicamento,
    nombre: m.nombre,
    dosis: m.presentacion ?? "Sin presentación",
    horario: m.horario ?? "Sin horario",
    indicaciones: m.descripcion ?? "Sin indicaciones",
    idLaboratorio: m.idLaboratorio,
    idRecordatorio: m.idRecordatorio,
    frecuenciaHoras: m.frecuenciaHoras ?? 24,
    contraindicaciones: m.contraindicaciones ?? ficha.contraindicaciones ?? "",
    efectosSecundarios: m.efectosSecundarios ?? ficha.efectosSecundarios ?? "",
    fechaInicio: m.fechaInicio?.slice(0, 10) ?? "",
    fechaFin: m.fechaFin?.slice(0, 10) ?? "",
    tipoTratamiento: m.tipoTratamiento ?? (m.fechaFin ? "temporal" : "continuo"),
    diasActivos: m.diasActivos ?? null,
    diasDescanso: m.diasDescanso ?? null,
    cantidadCiclos: m.cantidadCiclos ?? null,
    estadoCiclo: m.estadoCiclo ?? "activo",
    cicloActual: m.cicloActual ?? null,
    diaActivoActual: m.diaActivoActual ?? null,
    proximoCiclo: m.proximoCiclo?.slice(0, 10) ?? "",
    horarios: m.horarios?.length
      ? m.horarios
      : m.horario
        ? [{ hora: m.horario, idRecordatorio: m.idRecordatorio }]
        : [],
  };
}

export function Medicamentos() {
  const navigate = useNavigate();
  const usuarioActual = obtenerUsuarioActual();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [catalogoMedicamentos, setCatalogoMedicamentos] = useState<MedicamentoApi[]>([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(formInicial);
  const [, setReloj] = useState(Date.now());
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarMedicamentos();
    cargarCatalogoMedicamentos();
  }, []);

  useEffect(() => {
    if (!open) return;

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [open]);

  useEffect(() => {
    const intervalo = window.setInterval(() => setReloj(Date.now()), 30_000);
    return () => window.clearInterval(intervalo);
  }, []);

  async function cargarMedicamentos() {
    try {
      const data = await obtenerMedicamentos(usuarioActual?.idUsuario);
      setMedicamentos(data.map(adaptarMedicamento));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los medicamentos.");
    }
  }

  async function cargarCatalogoMedicamentos() {
    try {
      const data = await obtenerMedicamentos();
      setCatalogoMedicamentos(data);
    } catch {
      setCatalogoMedicamentos([]);
    }
  }

  function normalizarTexto(texto: string) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function buscarMedicamentoCatalogo(nombre: string) {
    const nombreNormalizado = normalizarTexto(nombre);

    return catalogoMedicamentos.find(
      (medicamento) => normalizarTexto(medicamento.nombre) === nombreNormalizado
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const nuevoFormulario = {
      ...formData,
      [name]: value,
    };

    if (name === "nombre") {
      const medicamentoCatalogo = buscarMedicamentoCatalogo(value);

      if (medicamentoCatalogo) {
        const ficha = obtenerFichaMedicamento(medicamentoCatalogo.idMedicamento);
        nuevoFormulario.dosis = medicamentoCatalogo.presentacion ?? "";
        nuevoFormulario.indicaciones = medicamentoCatalogo.descripcion ?? "";
        nuevoFormulario.contraindicaciones = medicamentoCatalogo.contraindicaciones ?? ficha.contraindicaciones ?? "";
        nuevoFormulario.efectosSecundarios = medicamentoCatalogo.efectosSecundarios ?? ficha.efectosSecundarios ?? "";
      }
    }

    if (name === "tipoTratamiento" && value === "continuo") {
      nuevoFormulario.fechaFin = "";
    }

    setFormData(nuevoFormulario);
  }

  async function seleccionarMedicamentoCatalogo(medicamento: MedicamentoApi) {
    const ficha = obtenerFichaMedicamento(medicamento.idMedicamento);
    setFormData((actual) => ({
      ...actual,
      nombre: medicamento.nombre,
      dosis: medicamento.presentacion ?? "",
      indicaciones: medicamento.descripcion ?? "",
      contraindicaciones: medicamento.contraindicaciones ?? ficha.contraindicaciones ?? "",
      efectosSecundarios: medicamento.efectosSecundarios ?? ficha.efectosSecundarios ?? "",
    }));
    try {
      const sugerencia = await obtenerDosisFrecuente(medicamento.idMedicamento);
      if (sugerencia.dosis) setFormData((actual) => actual.nombre === medicamento.nombre ? { ...actual, dosis: sugerencia.dosis } : actual);
    } catch {
      // La presentación del catálogo sigue disponible si no se puede calcular la sugerencia.
    }
  }

  function abrirNuevoMedicamento() {
    setEditingId(null);
    setFormData({ ...formInicial, horario: horaLocal(), horarioSecundario: horaLocal(), fechaInicio: fechaLocal() });
    setOpen(true);
  }

  function abrirEdicion(medicamento: Medicamento) {
    setEditingId(medicamento.id);
    setFormData({
      nombre: medicamento.nombre,
      dosis: medicamento.dosis === "Sin presentación" ? "" : medicamento.dosis,
      horario: medicamento.horario === "Sin horario" ? "" : medicamento.horario,
      horarioSecundario: medicamento.horarios[1]?.hora ?? "",
      frecuenciaHoras: medicamento.frecuenciaHoras.toString(),
      indicaciones: medicamento.indicaciones === "Sin indicaciones" ? "" : medicamento.indicaciones,
      contraindicaciones: medicamento.contraindicaciones,
      efectosSecundarios: medicamento.efectosSecundarios,
      tipoTratamiento: medicamento.tipoTratamiento,
      fechaInicio: medicamento.fechaInicio || fechaLocal(),
      fechaFin: medicamento.fechaFin,
      diasActivos: String(medicamento.diasActivos ?? 7),
      diasDescanso: String(medicamento.diasDescanso ?? 21),
      cantidadCiclos: medicamento.cantidadCiclos?.toString() ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.tipoTratamiento === "temporal" && !formData.fechaFin) {
      alert("Para un tratamiento temporal cargá la fecha de fin.");
      return;
    }

    if (formData.tipoTratamiento === "temporal" && formData.fechaFin < formData.fechaInicio) {
      alert("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    if (formData.tipoTratamiento === "ciclico") {
      if (!formData.horario || !formData.horarioSecundario) {
        alert("Para un tratamiento cíclico cargá los dos horarios diarios.");
        return;
      }
      if (formData.horario === formData.horarioSecundario) {
        alert("Los horarios de las dos tomas deben ser diferentes.");
        return;
      }
      if (Number(formData.diasActivos) < 1 || Number(formData.diasDescanso) < 1) {
        alert("Los días activos y de descanso deben ser mayores a cero.");
        return;
      }
    }

    const medicamentoEditado = editingId
      ? medicamentos.find((medicamento) => medicamento.id === editingId)
      : null;
    const medicamentoCatalogo = buscarMedicamentoCatalogo(formData.nombre);

    const payload = {
      nombre: formData.nombre,
      descripcion: formData.indicaciones,
      presentacion: formData.dosis,
      idLaboratorio:
        medicamentoEditado?.idLaboratorio ?? medicamentoCatalogo?.idLaboratorio ?? null,
      idUsuario: usuarioActual?.idUsuario,
      horario: formData.horario,
      frecuenciaHoras: Number(formData.frecuenciaHoras),
      fechaInicio: formData.fechaInicio || null,
      fechaFin: formData.tipoTratamiento === "temporal" ? formData.fechaFin : null,
      tipoTratamiento: formData.tipoTratamiento,
      diasActivos: formData.tipoTratamiento === "ciclico" ? Number(formData.diasActivos) : null,
      diasDescanso: formData.tipoTratamiento === "ciclico" ? Number(formData.diasDescanso) : null,
      cantidadCiclos: formData.tipoTratamiento === "ciclico" && formData.cantidadCiclos ? Number(formData.cantidadCiclos) : null,
      horarios: formData.tipoTratamiento === "ciclico" ? [formData.horario, formData.horarioSecundario] : undefined,
    };

    try {
      if (editingId) {
        await actualizarMedicamento(editingId, payload);
      } else {
        if (medicamentoCatalogo && usuarioActual?.idUsuario) {
          await asociarMedicamentoUsuario(
            medicamentoCatalogo.idMedicamento,
            usuarioActual.idUsuario,
            {
              horario: formData.horario,
              frecuenciaHoras: Number(formData.frecuenciaHoras),
              fechaInicio: formData.fechaInicio || null,
              fechaFin: formData.tipoTratamiento === "temporal" ? formData.fechaFin : null,
              tipoTratamiento: formData.tipoTratamiento,
              diasActivos: formData.tipoTratamiento === "ciclico" ? Number(formData.diasActivos) : null,
              diasDescanso: formData.tipoTratamiento === "ciclico" ? Number(formData.diasDescanso) : null,
              cantidadCiclos: formData.tipoTratamiento === "ciclico" && formData.cantidadCiclos ? Number(formData.cantidadCiclos) : null,
              horarios: formData.tipoTratamiento === "ciclico" ? [formData.horario, formData.horarioSecundario] : undefined,
            }
          );
        } else {
          await crearMedicamento(payload);
        }
      }

      await cargarMedicamentos();
      await cargarCatalogoMedicamentos();
      setFormData({ ...formInicial, horario: horaLocal(), horarioSecundario: horaLocal(), fechaInicio: fechaLocal() });
      setEditingId(null);
      setOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo guardar el medicamento.");
    }
  }

  async function handleEliminar(id: number) {
    try {
      await eliminarMedicamento(id, usuarioActual?.idUsuario);
      setMedicamentos(medicamentos.filter((medicamento) => medicamento.id !== id));
      setEliminandoId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar el medicamento.");
    }
  }

  async function confirmarToma(medicamento: Medicamento) {
    if (medicamento.estadoCiclo !== "activo") {
      alert(medicamento.estadoCiclo === "descanso" ? "Este tratamiento está en su período de descanso." : "Este tratamiento no está activo hoy.");
      return;
    }
    const horarioDisponible = medicamento.horarios.find((item) => puedeConfirmarHorario(item.hora));

    if (!horarioDisponible) {
      alert(
        medicamento.horarios.length
          ? `Podés confirmar únicamente cerca de estos horarios: ${medicamento.horarios.map((item) => item.hora).join(", ")}.`
          : textoVentanaConfirmacion(medicamento.horario)
      );
      return;
    }

    try {
      let idRecordatorio = horarioDisponible.idRecordatorio;

      if (!idRecordatorio) {
        const recordatorios = await obtenerRecordatoriosUsuario(usuarioActual?.idUsuario);
        const recordatorio = recordatorios.find(
          (item) =>
            normalizarTexto(item.canal ?? "") === normalizarTexto(medicamento.nombre) &&
            puedeConfirmarHorario(item.fechaHoraProgramada)
        );
        idRecordatorio = recordatorio?.idRecordatorio ?? null;
      }

      if (!idRecordatorio) {
        alert("No se encontró el recordatorio de este medicamento. Editalo y volvé a guardar su horario.");
        return;
      }

      await crearRegistroToma({
        estado: true,
        fechaHoraReal: new Date().toISOString(),
        observaciones: "Dosis confirmada",
        idRecordatorio,
        idHistorialAnimo: null,
      });
      navigate("/app/historial-animo");
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo confirmar la dosis.");
    }
  }

  return (
    <>
      <section className="min-h-screen bg-[#F5F5F5] text-[#212121] px-4 py-6">
        <div className="max-w-4xl mx-auto animate-[fadeIn_.5s_ease-out]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="animate-[slideUp_.5s_ease-out]">
              <h1 className="text-3xl md:text-4xl font-bold text-[#2E7D32]">Medicamentos</h1>
              <p className="text-[#747970] mt-2 text-base md:text-lg">
                Gestioná tu tratamiento diario fácilmente.
              </p>
              {error && <p className="text-red-600 mt-3">{error}</p>}
            </div>

            <button
              onClick={abrirNuevoMedicamento}
              className="bg-[#2E7D32] text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
            >
              + Agregar medicamento
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <input type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por nombre, dosis o indicación..." aria-label="Buscar medicamentos" className="w-full rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#2E7D32]/20" />
          </div>

          <div className="mt-5 flex flex-col gap-5">
            {medicamentos.filter((item) => `${item.nombre} ${item.dosis} ${item.indicaciones} ${item.contraindicaciones} ${item.efectosSecundarios}`.toLocaleLowerCase("es-AR").includes(busqueda.toLocaleLowerCase("es-AR"))).map((medicamento, index) => (
              <div
                key={medicamento.id}
                className="group bg-white border border-gray-200 rounded-3xl p-6 shadow-sm opacity-0 animate-[slideUp_.6s_ease-out_forwards] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110">
                      +
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold">{medicamento.nombre}</h2>

                      <div className="flex flex-wrap gap-3 mt-3">
                        <span className="bg-[#2E7D32]/10 text-[#2E7D32] px-4 py-2 rounded-full text-sm font-semibold">
                          {medicamento.dosis}
                        </span>

                        <span className="bg-gray-100 text-[#212121] px-4 py-2 rounded-full text-sm font-semibold">
                          {medicamento.tipoTratamiento === "ciclico"
                            ? `${medicamento.horarios.length} tomas por día activo`
                            : medicamento.frecuenciaHoras === 24
                              ? "Una vez al día"
                              : `Cada ${medicamento.frecuenciaHoras} horas`}
                        </span>
                        {medicamento.horarios.map((item) => (
                          <span
                            key={`${medicamento.id}-${item.hora}`}
                            className="bg-gray-100 text-[#212121] px-4 py-2 rounded-full text-sm font-semibold"
                          >
                            {item.hora}
                          </span>
                        ))}
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${medicamento.tipoTratamiento === "ciclico" ? "bg-[#E8F5E9] text-[#2E7D32]" : medicamento.fechaFin ? "bg-[#FFF8E1] text-[#B45309]" : "bg-[#E8F5E9] text-[#2E7D32]"}`}>
                          {medicamento.tipoTratamiento === "ciclico"
                            ? `Cíclico: ${medicamento.diasActivos} días + ${medicamento.diasDescanso} de descanso`
                            : medicamento.fechaFin
                              ? `Temporal hasta ${formatearFechaCorta(medicamento.fechaFin)}`
                              : "Crónico / de por vida"}
                        </span>
                        {medicamento.tipoTratamiento === "ciclico" && (
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${medicamento.estadoCiclo === "activo" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFF8E1] text-[#B45309]"}`}>
                            {textoEstadoCiclo(medicamento)}
                          </span>
                        )}
                      </div>

                      <p className="text-[#747970] mt-4">{medicamento.indicaciones}</p>
                      {(medicamento.contraindicaciones || medicamento.efectosSecundarios) && (
                        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                          {medicamento.contraindicaciones && (
                            <div className="rounded-2xl border border-[#F4B4B4] bg-[#FFF7F7] p-3">
                              <p className="font-bold text-[#8A1C1C]">Contraindicaciones</p>
                              <p className="mt-1 text-[#747970]">{medicamento.contraindicaciones}</p>
                            </div>
                          )}
                          {medicamento.efectosSecundarios && (
                            <div className="rounded-2xl border border-[#F6D58A] bg-[#FFFDF4] p-3">
                              <p className="font-bold text-[#8A5A00]">Efectos secundarios</p>
                              <p className="mt-1 text-[#747970]">{medicamento.efectosSecundarios}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:w-40 xl:shrink-0">
                    <Link
                      to={`/app/medicamentos/${medicamento.id}`}
                      className="whitespace-nowrap border border-[#B7D8B9] bg-[#F7FBF7] px-6 py-3 text-center font-semibold text-[#2E7D32] rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E8F5E9] active:scale-[0.98]"
                    >
                      Ver detalle
                    </Link>
                    <button
                      onClick={() => confirmarToma(medicamento)}
                      disabled={medicamento.estadoCiclo !== "activo" || !medicamento.horarios.some((item) => puedeConfirmarHorario(item.hora))}
                      title={
                        medicamento.horarios.length
                          ? `Horarios: ${medicamento.horarios.map((item) => item.hora).join(", ")}`
                          : textoVentanaConfirmacion(medicamento.horario)
                      }
                      className="whitespace-nowrap bg-[#2E7D32] text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      Confirmar
                    </button>

                    <button
                      onClick={() => abrirEdicion(medicamento)}
                      className="whitespace-nowrap border border-gray-300 px-6 py-3 rounded-2xl text-[#212121] transition-all duration-300 hover:bg-[#F7FBF7] hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => setEliminandoId(medicamento.id)}
                      className="whitespace-nowrap border border-red-200 text-red-600 px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-red-50 hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {open && (
          <div className="modal-scroll-layer fixed inset-0 bg-black/40 flex justify-center z-50 p-3 sm:p-4 animate-[fadeIn_.25s_ease-out]">
            <div className="modal-scroll-panel medication-modal-panel bg-white w-full max-w-5xl rounded-3xl p-4 shadow-xl animate-[modalPop_.3s_ease-out] sm:p-5">
              <div className="flex justify-between items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#2E7D32]">
                  {editingId ? "Editar medicamento" : "Nuevo medicamento"}
                </h2>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="modal-close-button"
                >
                  x
                </button>
              </div>

              <form onSubmit={handleSubmit} className="medication-modal-form mt-4 grid gap-3 lg:grid-cols-2">
                <MedicamentoCombobox value={formData.nombre} catalogo={catalogoMedicamentos}
                  onChange={(nombre) => handleChange({ target: { name: "nombre", value: nombre } } as React.ChangeEvent<HTMLInputElement>)}
                  onSelect={seleccionarMedicamentoCatalogo} />

                <input
                  type="text"
                  name="dosis"
                  value={formData.dosis}
                  onChange={handleChange}
                  placeholder="Dosis / Presentación"
                  required
                  className="w-full border border-gray-300 rounded-2xl p-3 outline-none transition-all duration-300 focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10"
                />

                {formData.tipoTratamiento === "ciclico" ? (
                    <div className="grid gap-3 lg:col-span-2 lg:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold">Primera toma
                      <input type="time" name="horario" value={formData.horario} onChange={handleChange} required className="w-full rounded-2xl border border-gray-300 p-3 font-normal outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">Segunda toma
                      <input type="time" name="horarioSecundario" value={formData.horarioSecundario} onChange={handleChange} required className="w-full rounded-2xl border border-gray-300 p-3 font-normal outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10" />
                    </label>
                  </div>
                ) : (
                  <>
                    <input type="time" name="horario" value={formData.horario} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl p-3 outline-none transition-all duration-300 focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10" />
                    <select name="frecuenciaHoras" value={formData.frecuenciaHoras} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl p-3 bg-white outline-none transition-all duration-300 focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10">
                      <option value="24">Una vez al día</option>
                      <option value="12">Cada 12 horas</option>
                      <option value="8">Cada 8 horas</option>
                      <option value="6">Cada 6 horas</option>
                    </select>
                  </>
                )}

                <div className="rounded-3xl border border-[#DCEBDD] bg-[#F7FBF7] p-3 lg:col-span-2">
                  <p className="font-bold text-[#386641]">Tipo de tratamiento</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <label className={`cursor-pointer rounded-2xl border p-3 ${formData.tipoTratamiento === "continuo" ? "border-[#2E7D32] bg-white ring-2 ring-[#2E7D32]/10" : "border-gray-200 bg-white"}`}>
                      <input
                        type="radio"
                        name="tipoTratamiento"
                        value="continuo"
                        checked={formData.tipoTratamiento === "continuo"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="font-bold">Crónico / de por vida</span>
                      <span className="mt-1 block text-xs text-[#747970] sm:text-sm">No tiene fecha de finalización obligatoria.</span>
                    </label>
                    <label className={`cursor-pointer rounded-2xl border p-3 ${formData.tipoTratamiento === "temporal" ? "border-[#2E7D32] bg-white ring-2 ring-[#2E7D32]/10" : "border-gray-200 bg-white"}`}>
                      <input
                        type="radio"
                        name="tipoTratamiento"
                        value="temporal"
                        checked={formData.tipoTratamiento === "temporal"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="font-bold">Temporal</span>
                      <span className="mt-1 block text-xs text-[#747970] sm:text-sm">Al finalizar deja de aparecer como activo.</span>
                    </label>
                    <label className={`cursor-pointer rounded-2xl border p-3 ${formData.tipoTratamiento === "ciclico" ? "border-[#2E7D32] bg-white ring-2 ring-[#2E7D32]/10" : "border-gray-200 bg-white"}`}>
                      <input type="radio" name="tipoTratamiento" value="ciclico" checked={formData.tipoTratamiento === "ciclico"} onChange={handleChange} className="sr-only" />
                      <span className="font-bold">Por ciclos</span>
                      <span className="mt-1 block text-xs text-[#747970] sm:text-sm">Alterna días de toma y descanso.</span>
                    </label>
                  </div>
                  {formData.tipoTratamiento === "ciclico" && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <label className="grid gap-2 text-sm font-semibold">Días activos
                        <input type="number" min="1" max="365" name="diasActivos" value={formData.diasActivos} onChange={handleChange} required className="rounded-2xl border border-gray-300 p-3 font-normal outline-none focus:border-[#2E7D32]" />
                      </label>
                      <label className="grid gap-2 text-sm font-semibold">Días de descanso
                        <input type="number" min="1" max="365" name="diasDescanso" value={formData.diasDescanso} onChange={handleChange} required className="rounded-2xl border border-gray-300 p-3 font-normal outline-none focus:border-[#2E7D32]" />
                      </label>
                      <label className="grid gap-2 text-sm font-semibold">Cantidad de ciclos
                        <input type="number" min="1" max="100" name="cantidadCiclos" value={formData.cantidadCiclos} onChange={handleChange} placeholder="Sin límite" className="rounded-2xl border border-gray-300 p-3 font-normal outline-none focus:border-[#2E7D32]" />
                      </label>
                      <p className="text-sm text-[#747970] sm:col-span-3">Si dejás la cantidad vacía, se repetirá hasta que finalices el tratamiento manualmente.</p>
                    </div>
                  )}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold">
                      Fecha de inicio
                      <input
                        type="date"
                        name="fechaInicio"
                        value={formData.fechaInicio}
                        onChange={handleChange}
                        className="rounded-2xl border border-gray-300 p-3 font-normal outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10"
                      />
                    </label>
                    {formData.tipoTratamiento === "temporal" && (
                      <label className="grid gap-2 text-sm font-semibold">
                        Fecha de fin
                        <input
                          type="date"
                          name="fechaFin"
                          value={formData.fechaFin}
                          onChange={handleChange}
                          required
                          className="rounded-2xl border border-gray-300 p-3 font-normal outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <textarea
                  name="indicaciones"
                  value={formData.indicaciones}
                  onChange={handleChange}
                  placeholder="Descripción / Indicaciones"
                  rows={2}
                  className="w-full border border-gray-300 rounded-2xl p-3 outline-none transition-all duration-300 focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 lg:col-span-2"
                />

                {(formData.contraindicaciones || formData.efectosSecundarios) && (
                  <section className="rounded-2xl border border-[#DCEBDD] bg-[#F7FBF7] p-3 lg:col-span-2" aria-label="Información clínica del medicamento">
                    <p className="font-bold text-[#386641]">Información clínica del catálogo</p>
                    <p className="mt-1 text-sm text-[#747970]">Estos datos provienen de la base de medicamentos y no pueden modificarse desde el tratamiento.</p>
                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      <div>
                        <p className="text-sm font-bold text-[#8A1C1C]">Contraindicaciones</p>
                        <p className="mt-1 text-sm text-[#747970]">{formData.contraindicaciones || "Sin información cargada."}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#8A5A00]">Efectos secundarios</p>
                        <p className="mt-1 text-sm text-[#747970]">{formData.efectosSecundarios || "Sin información cargada."}</p>
                      </div>
                    </div>
                  </section>
                )}

                <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 border border-gray-300 py-3 sm:py-4 rounded-2xl transition-all duration-300 hover:bg-gray-100 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-[#2E7D32] text-white py-3 sm:py-4 rounded-2xl font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                  >
                    {editingId ? "Guardar cambios" : "Guardar medicamento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <ConfirmDialog open={eliminandoId !== null} title="Eliminar medicamento" description="El tratamiento dejará de aparecer entre tus medicamentos activos." onCancel={() => setEliminandoId(null)} onConfirm={() => eliminandoId && void handleEliminar(eliminandoId)} />
    </>
  );
}

function obtenerUsuarioActual(): UsuarioApi | null {
  const guardado = localStorage.getItem("cuidarPlusUsuario");
  return guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
}

function formatearFechaCorta(fecha: string) {
  return new Date(`${fecha.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR");
}

function textoEstadoCiclo(medicamento: Medicamento) {
  if (medicamento.estadoCiclo === "activo") {
    return `Ciclo ${medicamento.cicloActual ?? 1}${medicamento.cantidadCiclos ? ` de ${medicamento.cantidadCiclos}` : ""} · día ${medicamento.diaActivoActual ?? 1} activo`;
  }
  if (medicamento.estadoCiclo === "descanso") {
    return medicamento.proximoCiclo ? `Descanso · reinicia ${formatearFechaCorta(medicamento.proximoCiclo)}` : "En descanso";
  }
  if (medicamento.estadoCiclo === "pendiente") return `Comienza ${formatearFechaCorta(medicamento.fechaInicio)}`;
  return "Tratamiento finalizado";
}


