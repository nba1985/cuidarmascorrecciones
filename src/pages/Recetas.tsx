import { useEffect, useState } from "react";
import { ExternalLink, FileText, MoreVertical, Pencil, Plus, Trash2, Upload, UserRoundPlus } from "lucide-react";
import {
  actualizarReceta,
  crearMedico,
  crearReceta,
  eliminarReceta,
  obtenerMedicos,
  obtenerRecetas,
  resolverUrlArchivo,
  subirArchivoReceta,
  type MedicoApi,
  type RecetaApi,
  type UsuarioApi,
} from "../services/api";
import { Button, ConfirmDialog, EmptyState, ErrorState, LoadingState, Modal } from "../components/ui";

interface RecetaVista {
  id: number;
  nombre: string;
  observaciones: string;
  idMedico: number | null;
}

const formInicial = {
  nombre: "",
  observaciones: "",
  idMedico: "",
};

const medicoInicial = { nombre: "", apellido: "", matricula: "", telefonoUnico: "", email: "" };

function adaptarReceta(receta: RecetaApi): RecetaVista {
  return {
    id: receta.idReceta,
    nombre: receta.archivos || "Receta digital",
    observaciones: receta.observaciones || "Sin observaciones",
    idMedico: receta.idMedico,
  };
}

export function Recetas() {
  const usuarioActual = obtenerUsuarioActual();
  const [recetas, setRecetas] = useState<RecetaVista[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(formInicial);
  const [medicos, setMedicos] = useState<MedicoApi[]>([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [nuevoMedico, setNuevoMedico] = useState(false);
  const [medicoForm, setMedicoForm] = useState(medicoInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [errorArchivo, setErrorArchivo] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [vistaPrevia, setVistaPrevia] = useState<RecetaVista | null>(null);

  useEffect(() => {
    cargarRecetas();
    obtenerMedicos().then(setMedicos).catch(() => setMedicos([]));
  }, []);

  async function cargarRecetas() {
    setCargando(true);
    try {
      const data = await obtenerRecetas(usuarioActual?.idUsuario);
      setRecetas(data.map(adaptarReceta));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las recetas.");
    } finally {
      setCargando(false);
    }
  }

  function abrirNuevaReceta() {
    setEditingId(null);
    setFormData(formInicial);
    setArchivoSeleccionado(null);
    setNuevoMedico(false);
    setMedicoForm(medicoInicial);
    setOpen(true);
  }

  function abrirEdicion(receta: RecetaVista) {
    setEditingId(receta.id);
    setFormData({
      nombre: receta.nombre,
      observaciones: receta.observaciones === "Sin observaciones" ? "" : receta.observaciones,
      idMedico: receta.idMedico?.toString() ?? "",
    });
    setArchivoSeleccionado(null);
    setNuevoMedico(false);
    setMenuOpen(null);
    setOpen(true);
  }

  function seleccionarArchivo(event: React.ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0] ?? null;
    if (!archivo) return;
    const extension = archivo.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "jpg", "jpeg", "png", "webp", "heic", "heif"].includes(extension)) {
      setErrorArchivo("Formato no permitido. Elegí PDF o una imagen compatible.");
      event.target.value = "";
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      setErrorArchivo("El archivo supera el máximo de 10 MB.");
      event.target.value = "";
      return;
    }
    setArchivoSeleccionado(archivo);
    setErrorArchivo("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setGuardando(true);
      let idMedico = formData.idMedico ? Number(formData.idMedico) : null;
      if (nuevoMedico) {
        const creado = await crearMedico({
          nombre: medicoForm.nombre,
          apellido: medicoForm.apellido,
          matricula: medicoForm.matricula,
          telefonoUnico: medicoForm.telefonoUnico || null,
          email: medicoForm.email || null,
        });
        idMedico = creado.idMedico;
        setMedicos((actuales) => [...actuales, creado]);
      }

      let rutaArchivo = formData.nombre;
      if (archivoSeleccionado) {
        const subida = await subirArchivoReceta(archivoSeleccionado);
        rutaArchivo = subida.ruta;
      }

      if (!rutaArchivo) throw new Error("Seleccioná un archivo de receta.");
      const payload = { archivos: rutaArchivo, observaciones: formData.observaciones, idMedico, idUsuario: usuarioActual?.idUsuario };

      if (editingId) {
        await actualizarReceta(editingId, payload);
      } else {
        await crearReceta(payload);
      }

      await cargarRecetas();
      setFormData(formInicial);
      setEditingId(null);
      setOpen(false);
      setArchivoSeleccionado(null);
      setNuevoMedico(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo guardar la receta.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(id: number) {
    try {
      await eliminarReceta(id, usuarioActual?.idUsuario);
      setRecetas(recetas.filter((receta) => receta.id !== id));
      setMenuOpen(null);
      setEliminandoId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar la receta.");
    }
  }

  return (
    <section className="recetas-page min-h-screen bg-[#F5F5F5] px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[#747970] text-sm">Recetas digitales</p>
            <h1 className="text-3xl md:text-5xl font-bold mt-2">Mis Recetas</h1>
          </div>

          <button
            onClick={abrirNuevaReceta}
            className="bg-[#2E7D32] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
          >
            <Plus size={18} />
            Nueva
          </button>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <input type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por archivo u observación..." aria-label="Buscar recetas" className="w-full rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#2E7D32]/20" />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {cargando && <LoadingState label="Cargando recetas…" />}
          {!cargando && error && <ErrorState message={error} onRetry={() => void cargarRecetas()} />}
          {!cargando && recetas.length === 0 && !error && <EmptyState title="No hay recetas cargadas" description="Adjuntá una receta para tenerla disponible cuando la necesites." action={<Button onClick={abrirNuevaReceta} className="bg-[#2E7D32] text-white px-5 py-3">Cargar primera receta</Button>} />}

          {recetas.filter((item) => `${item.nombre} ${item.observaciones}`.toLocaleLowerCase("es-AR").includes(busqueda.toLocaleLowerCase("es-AR"))).map((receta, index) => (
            <article
              key={receta.id}
              className="relative bg-white rounded-3xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md opacity-0 animate-[slideUp_.55s_ease-out_forwards]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
                    <FileText size={28} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">{receta.nombre}</h2>
                    <p className="text-[#747970] mt-2">Receta cargada en tu perfil</p>
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen(menuOpen === receta.id ? null : receta.id)}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                >
                  <MoreVertical size={20} />
                </button>
              </div>

              <p className="text-[#212121] mt-5 leading-relaxed">{receta.observaciones}</p>

              {receta.nombre.startsWith("/uploads/") && (
                <button type="button" onClick={() => setVistaPrevia(receta)} className="inline-flex items-center gap-2 mt-4 text-[#2E7D32] font-semibold hover:underline">
                  <ExternalLink size={17} /> Vista previa
                </button>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => abrirEdicion(receta)}
                  className="flex-1 border border-gray-300 rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                  <Pencil size={18} />
                  Editar
                </button>
                <button
                  onClick={() => setEliminandoId(receta.id)}
                  className="flex-1 border border-red-200 text-red-600 rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-red-50"
                >
                  <Trash2 size={18} />
                  Eliminar
                </button>
              </div>

              {menuOpen === receta.id && (
                <div className="absolute right-6 top-16 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 z-10">
                  <button
                    onClick={() => abrirEdicion(receta)}
                    className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setEliminandoId(receta.id)}
                    className="w-full text-left px-4 py-2 rounded-xl text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-xl flex flex-col gap-4"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2E7D32]">
              {editingId ? "Editar receta" : "Nueva receta"}
            </h2>

            <label className="border border-dashed border-[#2E7D32]/50 bg-[#2E7D32]/5 rounded-2xl p-4 cursor-pointer">
              <span className="flex items-center gap-2 font-semibold text-[#2E7D32]"><Upload size={19} /> Adjuntar receta</span>
              <span className="block text-sm text-[#747970] mt-1">PDF, JPG, PNG, WEBP, HEIC o HEIF · máximo 10 MB</span>
              <span className="block text-sm font-medium mt-2">{archivoSeleccionado ? `${archivoSeleccionado.name} · ${(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB` : (formData.nombre ? "Archivo actual conservado" : "Ningún archivo seleccionado")}</span>
              {errorArchivo && <span role="alert" className="block text-sm text-red-600 mt-2">{errorArchivo}</span>}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif" className="sr-only" onChange={seleccionarArchivo} />
            </label>

            <select value={formData.idMedico} onChange={(e) => setFormData({ ...formData, idMedico: e.target.value })} disabled={nuevoMedico} className="border border-gray-300 rounded-2xl p-4 bg-white outline-none focus:border-[#2E7D32]">
              <option value="">Sin médico asociado</option>
              {medicos.map((medico) => <option key={medico.idMedico} value={medico.idMedico}>{medico.nombre} {medico.apellido} · Mat. {medico.matricula}</option>)}
            </select>

            <button type="button" onClick={() => setNuevoMedico((valor) => !valor)} className="border border-[#2E7D32]/30 text-[#2E7D32] rounded-2xl py-3 font-semibold flex items-center justify-center gap-2">
              <UserRoundPlus size={18} /> {nuevoMedico ? "Elegir médico existente" : "Cargar médico nuevo"}
            </button>

            {nuevoMedico && (
              <div className="grid sm:grid-cols-2 gap-3 rounded-2xl bg-gray-50 p-4">
                <input required value={medicoForm.nombre} onChange={(e) => setMedicoForm({ ...medicoForm, nombre: e.target.value })} placeholder="Nombre del médico" className="border border-gray-300 rounded-xl p-3" />
                <input required value={medicoForm.apellido} onChange={(e) => setMedicoForm({ ...medicoForm, apellido: e.target.value })} placeholder="Apellido" className="border border-gray-300 rounded-xl p-3" />
                <input required value={medicoForm.matricula} onChange={(e) => setMedicoForm({ ...medicoForm, matricula: e.target.value })} placeholder="Matrícula" className="border border-gray-300 rounded-xl p-3" />
                <input value={medicoForm.telefonoUnico} onChange={(e) => setMedicoForm({ ...medicoForm, telefonoUnico: e.target.value })} placeholder="Teléfono" className="border border-gray-300 rounded-xl p-3" />
                <input type="email" value={medicoForm.email} onChange={(e) => setMedicoForm({ ...medicoForm, email: e.target.value })} placeholder="Email" className="sm:col-span-2 border border-gray-300 rounded-xl p-3" />
              </div>
            )}

            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Observaciones"
              rows={4}
              className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 border border-gray-300 rounded-2xl py-3"
              >
                Cancelar
              </button>
              <button type="submit" disabled={guardando} aria-busy={guardando} className="flex-1 bg-[#2E7D32] text-white rounded-2xl py-3 font-bold disabled:opacity-60">
                {editingId ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <Modal open={Boolean(vistaPrevia)} title="Vista previa de receta" onClose={() => setVistaPrevia(null)}>
        {vistaPrevia && <div className="mt-5">
          {esPdf(vistaPrevia.nombre) ? (
            <iframe src={resolverUrlArchivo(vistaPrevia.nombre)} title={`Receta ${vistaPrevia.nombre}`} className="h-[62vh] w-full rounded-2xl border border-gray-200" />
          ) : esImagenCompatible(vistaPrevia.nombre) ? (
            <img src={resolverUrlArchivo(vistaPrevia.nombre)} alt="Receta adjunta" className="max-h-[62vh] w-full rounded-2xl bg-gray-50 object-contain" />
          ) : (
            <div className="rounded-2xl bg-gray-50 p-6 text-center text-[#747970]">Este formato no admite vista previa directa en todos los navegadores.</div>
          )}
          <a href={resolverUrlArchivo(vistaPrevia.nombre)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-semibold text-[#2E7D32]"><ExternalLink size={17} /> Abrir archivo completo</a>
        </div>}
      </Modal>

      <ConfirmDialog open={eliminandoId !== null} title="Eliminar receta" description="Esta acción eliminará la receta de tu perfil." onCancel={() => setEliminandoId(null)} onConfirm={() => eliminandoId && void handleEliminar(eliminandoId)} />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

function esPdf(nombre: string) {
  return nombre.toLocaleLowerCase("es-AR").split(/[?#]/)[0].endsWith(".pdf");
}

function esImagenCompatible(nombre: string) {
  return /\.(jpe?g|png|webp)$/i.test(nombre.split(/[?#]/)[0]);
}

function obtenerUsuarioActual(): UsuarioApi | null {
  const guardado = localStorage.getItem("cuidarPlusUsuario");
  return guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
}
