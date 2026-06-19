import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  asociarMedicamentoUsuario,
  actualizarMedicamento,
  crearRegistroToma,
  crearMedicamento,
  eliminarMedicamento,
  obtenerMedicamentos,
  obtenerRecordatoriosUsuario,
  type MedicamentoApi,
  type UsuarioApi,
} from "../services/api";
import { puedeConfirmarHorario, textoVentanaConfirmacion } from "../utils/horarios";
import { ConfirmDialog } from "../components/ui";

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
}

const formInicial = {
  nombre: "",
  dosis: "",
  horario: "",
  frecuenciaHoras: "24",
  indicaciones: "",
};

function adaptarMedicamento(m: MedicamentoApi): Medicamento {
  return {
    id: m.idMedicamento,
    nombre: m.nombre,
    dosis: m.presentacion ?? "Sin presentación",
    horario: m.horario ?? "Sin horario",
    indicaciones: m.descripcion ?? "Sin indicaciones",
    idLaboratorio: m.idLaboratorio,
    idRecordatorio: m.idRecordatorio,
    frecuenciaHoras: m.frecuenciaHoras ?? 24,
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

  useEffect(() => {
    cargarMedicamentos();
    cargarCatalogoMedicamentos();
  }, []);

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
        nuevoFormulario.dosis = medicamentoCatalogo.presentacion ?? "";
        nuevoFormulario.indicaciones = medicamentoCatalogo.descripcion ?? "";
      }
    }

    setFormData(nuevoFormulario);
  }

  function abrirNuevoMedicamento() {
    setEditingId(null);
    setFormData(formInicial);
    setOpen(true);
  }

  function abrirEdicion(medicamento: Medicamento) {
    setEditingId(medicamento.id);
    setFormData({
      nombre: medicamento.nombre,
      dosis: medicamento.dosis === "Sin presentación" ? "" : medicamento.dosis,
      horario: medicamento.horario === "Sin horario" ? "" : medicamento.horario,
      frecuenciaHoras: medicamento.frecuenciaHoras.toString(),
      indicaciones: medicamento.indicaciones === "Sin indicaciones" ? "" : medicamento.indicaciones,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
    };

    try {
      if (editingId) {
        await actualizarMedicamento(editingId, payload);
      } else {
        if (medicamentoCatalogo && usuarioActual?.idUsuario) {
          await asociarMedicamentoUsuario(
            medicamentoCatalogo.idMedicamento,
            usuarioActual.idUsuario,
            formData.horario,
            Number(formData.frecuenciaHoras)
          );
        } else {
          await crearMedicamento(payload);
        }
      }

      await cargarMedicamentos();
      await cargarCatalogoMedicamentos();
      setFormData(formInicial);
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

          <div className="mt-10 flex flex-col gap-5">
            {medicamentos.map((medicamento, index) => (
              <div
                key={medicamento.id}
                className="group bg-white border border-gray-200 rounded-3xl p-6 shadow-sm opacity-0 animate-[slideUp_.6s_ease-out_forwards] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
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
                          {medicamento.frecuenciaHoras === 24
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
                      </div>

                      <p className="text-[#747970] mt-4">{medicamento.indicaciones}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => confirmarToma(medicamento)}
                      disabled={!medicamento.horarios.some((item) => puedeConfirmarHorario(item.hora))}
                      title={
                        medicamento.horarios.length
                          ? `Horarios: ${medicamento.horarios.map((item) => item.hora).join(", ")}`
                          : textoVentanaConfirmacion(medicamento.horario)
                      }
                      className="bg-[#2E7D32] text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      Confirmar
                    </button>

                    <button
                      onClick={() => abrirEdicion(medicamento)}
                      className="border border-gray-300 px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-gray-100 hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => setEliminandoId(medicamento.id)}
                      className="border border-red-200 text-red-600 px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-red-50 hover:-translate-y-0.5 active:scale-[0.98]"
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4 animate-[fadeIn_.25s_ease-out]">
            <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-8 shadow-xl animate-[modalPop_.3s_ease-out] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#2E7D32]">
                  {editingId ? "Editar medicamento" : "Nuevo medicamento"}
                </h2>

                <button
                  onClick={() => setOpen(false)}
                  className="text-xl sm:text-2xl text-gray-500 transition-all duration-300 hover:text-black hover:rotate-90"
                >
                  x
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 flex flex-col gap-4 sm:gap-5">
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  list="medicamentos-catalogo"
                  placeholder="Nombre"
                  required
                  className="w-full border border-gray-300 rounded-2xl p-3 sm:p-4 outline-none transition-all duration-300 focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10"
                />
                <datalist id="medicamentos-catalogo">
                  {catalogoMedicamentos.map((medicamento) => (
                    <option
                      key={medicamento.idMedicamento}
                      value={medicamento.nombre}
                      label={medicamento.presentacion ?? medicamento.descripcion ?? medicamento.nombre}
                    />
                  ))}
                </datalist>

                <input
                  type="text"
                  name="dosis"
                  value={formData.dosis}
                  onChange={handleChange}
                  placeholder="Dosis / Presentación"
                  required
                  className="w-full border border-gray-300 rounded-2xl p-3 sm:p-4 outline-none transition-all duration-300 focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10"
                />

                <input
                  type="time"
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-2xl p-3 sm:p-4 outline-none transition-all duration-300 focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10"
                />

                <select
                  name="frecuenciaHoras"
                  value={formData.frecuenciaHoras}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-2xl p-3 sm:p-4 bg-white outline-none transition-all duration-300 focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10"
                >
                  <option value="24">Una vez al día</option>
                  <option value="12">Cada 12 horas</option>
                  <option value="8">Cada 8 horas</option>
                  <option value="6">Cada 6 horas</option>
                </select>

                <textarea
                  name="indicaciones"
                  value={formData.indicaciones}
                  onChange={handleChange}
                  placeholder="Descripción / Indicaciones"
                  rows={4}
                  className="w-full border border-gray-300 rounded-2xl p-3 sm:p-4 outline-none transition-all duration-300 focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10"
                />

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
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
