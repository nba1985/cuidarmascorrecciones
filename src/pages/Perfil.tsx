import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import {
  actualizarPerfilCompleto,
  obtenerAlergias,
  obtenerCiudades,
  obtenerCondiciones,
  obtenerGruposSanguineos,
  cerrarSesionApi,
  obtenerPerfilUsuario,
  obtenerUsuarios,
  resolverUrlArchivo,
  subirFotoPerfil,
  type PerfilUsuarioApi,
  type UsuarioApi,
} from "../services/api";
import { fechaLocal } from "../utils/fechaLocal";

const formInicial = {
  nombre: "",
  apellido: "",
  ciudad: "",
  mail: "",
  dni: "",
  fechaNacimiento: "",
  foto: "",
  grupoSanguineo: "",
  seguroMedico: "",
  numeroPoliza: "",
  alergia: "",
  condicion: "",
  tipoTelefono: "",
  telefono: "",
    contactoEmergencia: "",
    parentesco: "",
    telefonoEmergencia: "",
};

export function Perfil() {
  const navigate = useNavigate();
  const [usuarioApi, setUsuarioApi] = useState<UsuarioApi | null>(() => {
    const guardado = localStorage.getItem("cuidarPlusUsuario");
    return guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
  });
  const [open, setOpen] = useState(false);
  const [perfil, setPerfil] = useState<PerfilUsuarioApi | null>(null);
  const [formData, setFormData] = useState(formInicial);
  const [fotoArchivo, setFotoArchivo] = useState<Blob | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [grupos, setGrupos] = useState<string[]>([]);
  const [alergias, setAlergias] = useState<string[]>([]);
  const [condiciones, setCondiciones] = useState<string[]>([]);
  const [procesandoDni, setProcesandoDni] = useState(false);
  const [mensajeDni, setMensajeDni] = useState("");

  async function handleDniChange(event: React.ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    setProcesandoDni(true);
    setMensajeDni("");
    try {
      const { leerDni } = await import("../utils/ocrDni");
      const datos = await leerDni(archivo);
      setFormData((actual) => ({ ...actual,
        nombre: datos.nombre || actual.nombre,
        apellido: datos.apellido || actual.apellido,
        dni: datos.dni || actual.dni,
        fechaNacimiento: datos.fechaNacimiento || actual.fechaNacimiento,
      }));
      setMensajeDni("Revisá nombre, apellido, DNI y fecha antes de guardar: la lectura puede tener errores.");
    } catch {
      setMensajeDni("No se pudo leer el DNI. Podés completar los campos manualmente.");
    } finally { setProcesandoDni(false); event.target.value = ""; }
  }

  useEffect(() => {
    void Promise.allSettled([obtenerCiudades(), obtenerGruposSanguineos(), obtenerAlergias(), obtenerCondiciones()]).then(([c, g, a, co]) => {
      if (c.status === "fulfilled") setCiudades(c.value);
      if (g.status === "fulfilled") setGrupos(g.value.map((item) => item.tipo));
      if (a.status === "fulfilled") setAlergias(a.value.map((item) => item.descripcion));
      if (co.status === "fulfilled") setCondiciones(co.value.map((item) => item.tipo));
    });
  }, []);

  useEffect(() => {
    if (usuarioApi) return;

    obtenerUsuarios()
      .then((usuarios) => {
        const demo = usuarios.find((u) => u.mail === "demo@cuidarplus.local");
        setUsuarioApi(demo ?? usuarios[0] ?? null);
      })
      .catch(() => setError("No se pudo cargar el perfil desde la API."));
  }, [usuarioApi]);

  useEffect(() => {
    if (!usuarioApi?.idUsuario) return;

    obtenerPerfilUsuario(usuarioApi.idUsuario)
      .then(setPerfil)
      .catch(() => setError("No se pudo cargar VW_PerfilUsuario desde la API."));
  }, [usuarioApi?.idUsuario]);

  useEffect(() => {
    if (!open) return;

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [open]);

  const paciente = useMemo(() => {
    const edad = calcularEdad(perfil?.fechaNacimiento ?? usuarioApi?.fechaNacimiento);

    return {
      nombre: perfil?.nombreCompleto ?? (usuarioApi ? `${usuarioApi.nombre} ${usuarioApi.apellido}` : "Usuario demo"),
      edad,
      sangre: perfil?.grupoSanguineo ?? "Sin dato",
      doctor: "Médico demo",
      direccion: perfil?.ciudad ?? usuarioApi?.ciudad ?? "Sin ciudad cargada",
      contacto: perfil?.mail ?? usuarioApi?.mail ?? "Sin contacto cargado",
      dni: perfil?.dni ?? usuarioApi?.dni ?? "Sin DNI cargado",
      seguroMedico: perfil?.seguroMedico ?? "Sin cobertura médica",
      numeroPoliza: perfil?.numeroPoliza ?? "Sin número de socio",
      alergia: perfil?.alergia ?? "Sin alergia",
      condicion: perfil?.condicion ?? "Sin condición",
      tipoTelefono: perfil?.tipoTelefono ?? "Sin teléfono",
      telefono: perfil?.telefono ?? "Sin teléfono",
      contactoEmergencia: perfil?.contactoEmergencia ?? "Sin contacto",
      parentesco: perfil?.parentesco ?? "Sin parentesco",
      telefonoEmergencia: perfil?.telefonoEmergencia ?? "Sin teléfono cargado",
      foto:
        resolverUrlArchivo(usuarioApi?.foto) ||
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    };
  }, [perfil, usuarioApi]);

  const cerrarSesion = async () => {
    try {
      await cerrarSesionApi();
    } catch {
      // La limpieza local igualmente cierra la interfaz si la API no responde.
    }
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  function abrirEdicion() {
    if (!usuarioApi) return;

    setFormData({
      nombre: usuarioApi.nombre,
      apellido: usuarioApi.apellido,
      ciudad: usuarioApi.ciudad ?? "",
      mail: usuarioApi.mail ?? "",
      dni: usuarioApi.dni ?? "",
      fechaNacimiento: usuarioApi.fechaNacimiento?.slice(0, 10) ?? fechaLocal(),
      foto: usuarioApi.foto ?? "",
      grupoSanguineo: perfil?.grupoSanguineo?.startsWith("Sin ") ? "" : perfil?.grupoSanguineo ?? "",
      seguroMedico: perfil?.seguroMedico?.startsWith("Sin ") ? "" : perfil?.seguroMedico ?? "",
      numeroPoliza: perfil?.numeroPoliza?.startsWith("Sin ") ? "" : perfil?.numeroPoliza ?? "",
      alergia: perfil?.alergia?.startsWith("Sin ") ? "" : perfil?.alergia ?? "",
      condicion: perfil?.condicion?.startsWith("Sin ") ? "" : perfil?.condicion ?? "",
      tipoTelefono: perfil?.tipoTelefono === "Sin teléfono" ? "" : perfil?.tipoTelefono ?? "",
      telefono: perfil?.telefono === "Sin teléfono" ? "" : perfil?.telefono ?? "",
      contactoEmergencia: perfil?.contactoEmergencia === "Sin contacto" ? "" : perfil?.contactoEmergencia ?? "",
      parentesco: perfil?.parentesco === "Sin parentesco" ? "" : perfil?.parentesco ?? "",
      telefonoEmergencia: perfil?.telefonoEmergencia ?? "",
    });
    setFotoArchivo(null);
    setFotoPreview("");
    setOpen(true);
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    try {
      const reducida = await redimensionarImagen(archivo, 512);
      setFotoArchivo(reducida);
      setFotoPreview(URL.createObjectURL(reducida));
    } catch {
      alert("No se pudo procesar la imagen seleccionada.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioApi || guardando) return;

    setGuardando(true);
    try {
      let fotoFinal = formData.foto || null;

      if (fotoArchivo) {
        const subida = await subirFotoPerfil(usuarioApi.idUsuario, fotoArchivo);
        fotoFinal = subida.foto;
      }

      const actualizado: UsuarioApi = {
        ...usuarioApi,
        nombre: formData.nombre,
        apellido: formData.apellido,
        ciudad: formData.ciudad || null,
        mail: formData.mail || null,
        dni: formData.dni || null,
        fechaNacimiento: formData.fechaNacimiento || null,
        foto: fotoFinal,
      };

      await actualizarPerfilCompleto(usuarioApi.idUsuario, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        ciudad: formData.ciudad || null,
        mail: formData.mail || null,
        dni: formData.dni || null,
        fechaNacimiento: formData.fechaNacimiento || null,
        foto: fotoFinal,
        grupoSanguineo: formData.grupoSanguineo || null,
        seguroMedico: formData.seguroMedico || null,
        numeroPoliza: formData.numeroPoliza || null,
        alergia: formData.alergia || null,
        condicion: formData.condicion || null,
        tipoTelefono: formData.tipoTelefono || null,
        telefono: formData.telefono || null,
        contactoEmergencia: formData.contactoEmergencia || null,
        parentesco: formData.parentesco || null,
        telefonoEmergencia: formData.telefonoEmergencia || null,
      });
      setUsuarioApi(actualizado);
      localStorage.setItem("cuidarPlusUsuario", JSON.stringify(actualizado));
      const perfilActualizado = await obtenerPerfilUsuario(usuarioApi.idUsuario).catch(() => null);
      if (perfilActualizado) {
        setPerfil(perfilActualizado);
      }
      setFotoArchivo(null);
      setFotoPreview("");
      setOpen(false);
      setError("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo actualizar el perfil.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <section className="min-h-screen max-w-full overflow-x-clip bg-[#F5F5F5] text-[#212121] px-1 sm:px-4 py-6 animate-[pageAppear_.35s_ease-out]">
        <div className="max-w-6xl min-w-0 mx-auto">
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="grid min-w-0 lg:grid-cols-[340px_minmax(0,1fr)] gap-6 mt-6 lg:mt-10">
            <aside className="profile-card bg-white rounded-[28px] border border-gray-200 shadow-sm p-6 h-fit">
              <img
                src={paciente.foto}
                alt={paciente.nombre}
                className="profile-avatar w-36 h-36 rounded-[30px] mx-auto object-cover border-4 border-[#2E7D32]/10"
              />

              <div className="flex justify-center mt-5">
                <div className="inline-flex items-center gap-2 bg-[#2E7D32]/10 text-[#2E7D32] px-4 py-2 rounded-full text-sm font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                  Activo
                </div>
              </div>

              <div className="text-center mt-5">
                <h1 className="text-3xl font-bold tracking-tight leading-tight">{paciente.nombre}</h1>
                <div className="flex justify-center gap-3 mt-4 flex-wrap">
                  <span className="bg-[#F5F5F5] border border-gray-200 px-4 py-2 rounded-full text-sm">
                    {paciente.edad ? `${paciente.edad} años` : "Edad sin dato"}
                  </span>
                  <span className="bg-[#2E7D32]/10 text-[#2E7D32] px-4 py-2 rounded-full text-sm font-medium">
                    Paciente registrado
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-5">
                <p className="text-sm text-[#747970]">Dirección particular</p>
                <div className="mt-2 flex items-start gap-2 text-left">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-[#2E7D32]" aria-hidden="true" />
                  <p className="font-bold leading-snug [overflow-wrap:anywhere]">{paciente.direccion}</p>
                </div>
              </div>

              <button
                onClick={abrirEdicion}
                className="w-full mt-6 bg-[#2E7D32] text-white rounded-2xl py-4 font-bold text-base shadow-sm"
              >
                Editar perfil
              </button>

              <button
                onClick={cerrarSesion}
                className="w-full mt-3 bg-white border border-gray-200 hover:bg-gray-100 rounded-2xl py-4 font-semibold shadow-sm"
              >
                Cerrar sesión
              </button>
            </aside>

            <div className="grid min-w-0 md:grid-cols-2 gap-6">
              <div className="profile-card md:col-span-2 bg-white rounded-[28px] p-7 border border-gray-200 shadow-sm">
                <p className="text-[#747970] text-base">Información para emergencias</p>
                <div className="mt-5 grid gap-5 sm:grid-cols-3">
                  <div className="rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm font-semibold text-[#747970]">Grupo sanguíneo</p>
                    <h2 className="mt-2 text-5xl font-bold tracking-tight text-[#2E7D32]">{paciente.sangre}</h2>
                  </div>
                  <div className="rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm font-semibold text-[#747970]">Alergias</p>
                    <h2 className="mt-2 text-xl font-bold">{paciente.alergia}</h2>
                  </div>
                  <div className="rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm font-semibold text-[#747970]">Condiciones</p>
                    <h2 className="mt-2 text-xl font-bold">{paciente.condicion}</h2>
                  </div>
                </div>
              </div>

              <div className="profile-card bg-white rounded-[28px] p-7 border border-gray-200 shadow-sm">
                <p className="text-[#747970] text-base">Contacto</p>
                <h2 className="max-w-full text-2xl font-bold tracking-tight mt-5 [overflow-wrap:anywhere]">
                  {paciente.contacto}
                </h2>
                <p className="text-[#747970] mt-3">DNI: {paciente.dni}</p>
                <p className="text-[#747970] mt-2">
                  {paciente.tipoTelefono}: {paciente.telefono}
                </p>
              </div>

              <div className="profile-card bg-white rounded-[28px] p-7 border border-gray-200 shadow-sm">
                <p className="text-[#747970] text-base">Cobertura médica / obra social</p>
                <h2 className="text-3xl font-bold mt-5 tracking-tight">{paciente.seguroMedico}</h2>
                <p className="text-[#747970] mt-3 text-base">Número de socio: {paciente.numeroPoliza}</p>
              </div>

              <div className="profile-card md:col-span-2 bg-white rounded-[28px] p-7 border border-gray-200 shadow-sm md:flex md:items-center md:justify-between md:gap-6">
                <div>
                  <p className="text-[#747970] text-base">Contacto de emergencia</p>
                  <h2 className="text-2xl font-bold mt-4 tracking-tight">{paciente.contactoEmergencia}</h2>
                  <p className="text-[#747970] mt-3">Parentesco: {paciente.parentesco}</p>
                  <p className="text-[#747970] mt-2">Teléfono: {paciente.telefonoEmergencia}</p>
                </div>
                {perfil?.telefonoEmergencia && <a href={`tel:${perfil.telefonoEmergencia}`} className="mt-5 inline-flex shrink-0 rounded-2xl bg-[#2E7D32] px-5 py-3 font-semibold text-white md:mt-0">Llamar al contacto</a>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {open && (
        <div className="modal-scroll-layer fixed inset-0 bg-black/40 flex justify-center z-50 p-3 sm:p-4">
          <form
            onSubmit={handleSubmit}
            className="modal-scroll-panel bg-white w-full max-w-6xl rounded-[28px] p-4 shadow-xl sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2E7D32]">Editar perfil</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="modal-close-button">x</button>
            </div>

            <div className="grid gap-3 mt-4 md:grid-cols-3">
              <label className="md:col-span-3 rounded-2xl border border-dashed border-[#2E7D32] p-3 font-semibold text-[#2E7D32]">
                {procesandoDni ? "Leyendo DNI..." : "Adjuntar foto del DNI para completar datos"}
                <input type="file" accept="image/*" onChange={handleDniChange} disabled={procesandoDni} className="mt-2 block w-full text-sm" />
                {mensajeDni && <span className="mt-2 block text-sm font-normal">{mensajeDni}</span>}
              </label>
              <label htmlFor="perfil-nombre" className="sr-only">Nombre</label>
              <input
                id="perfil-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre"
                required
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              />
              <label htmlFor="perfil-apellido" className="sr-only">Apellido</label>
              <input
                id="perfil-apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Apellido"
                required
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              />
              <label htmlFor="perfil-ciudad" className="sr-only">Ciudad</label>
              <select id="perfil-ciudad"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              ><option value="">Seleccioná una ciudad</option>{formData.ciudad && !ciudades.includes(formData.ciudad) && <option value={formData.ciudad}>{formData.ciudad}</option>}{ciudades.map((ciudad) => <option key={ciudad} value={ciudad}>{ciudad}</option>)}</select>
              <label htmlFor="perfil-mail" className="sr-only">Correo electrónico</label>
              <input
                id="perfil-mail"
                value={formData.mail}
                onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                placeholder="Correo"
                type="email"
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              />
              <label htmlFor="perfil-dni" className="sr-only">Número de DNI</label>
              <input
                id="perfil-dni"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="DNI"
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              />
              <label htmlFor="perfil-nacimiento" className="sr-only">Fecha de nacimiento</label>
              <input
                id="perfil-nacimiento"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                type="date"
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              />
              <div className="md:col-span-3 grid grid-cols-[72px_1fr] gap-3 items-center">
                <img
                  src={fotoPreview || resolverUrlArchivo(formData.foto) || paciente.foto}
                  alt="Vista previa"
                  className="h-[72px] w-[72px] rounded-2xl object-cover border border-gray-200"
                />
                <label className="border border-gray-300 rounded-2xl p-3 outline-none focus-within:border-[#2E7D32] cursor-pointer">
                  <span className="block font-semibold text-[#212121]">Cargar foto de perfil</span>
                  <span className="block text-sm text-[#747970] mt-1">
                    Se redimensiona automáticamente si es muy grande.
                  </span>
                  <input type="file" accept="image/*" onChange={handleFotoChange} className="sr-only" />
                </label>
              </div>
              <label htmlFor="perfil-sangre" className="sr-only">Grupo sanguíneo</label>
              <select id="perfil-sangre"
                value={formData.grupoSanguineo}
                onChange={(e) => setFormData({ ...formData, grupoSanguineo: e.target.value })}
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              ><option value="">Seleccioná un grupo sanguíneo</option>{formData.grupoSanguineo && !grupos.includes(formData.grupoSanguineo) && <option value={formData.grupoSanguineo}>{formData.grupoSanguineo}</option>}{grupos.map((grupo) => <option key={grupo} value={grupo}>{grupo}</option>)}</select>
              <label htmlFor="perfil-seguro" className="sr-only">Cobertura médica u obra social</label>
              <input
                id="perfil-seguro"
                value={formData.seguroMedico}
                onChange={(e) => setFormData({ ...formData, seguroMedico: e.target.value })}
                placeholder="Cobertura médica / obra social"
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              />
              <label htmlFor="perfil-poliza" className="sr-only">Número de socio de la obra social</label>
              <input
                id="perfil-poliza"
                value={formData.numeroPoliza}
                onChange={(e) => setFormData({ ...formData, numeroPoliza: e.target.value })}
                placeholder="Número de socio de la obra social"
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              />
              <label htmlFor="perfil-alergia" className="sr-only">Alergia</label>
              <select id="perfil-alergia"
                value={formData.alergia}
                onChange={(e) => setFormData({ ...formData, alergia: e.target.value })}
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              ><option value="">Seleccioná una alergia</option>{formData.alergia && !alergias.includes(formData.alergia) && <option value={formData.alergia}>{formData.alergia}</option>}{alergias.map((alergia) => <option key={alergia} value={alergia}>{alergia}</option>)}</select>
              <label htmlFor="perfil-condicion" className="sr-only">Condición médica</label>
              <select
                id="perfil-condicion"
                value={formData.condicion}
                onChange={(e) => setFormData({ ...formData, condicion: e.target.value })}
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              >
                <option value="">Seleccioná una condición</option>
                {formData.condicion && !condiciones.includes(formData.condicion) && (
                  <option value={formData.condicion}>{formData.condicion}</option>
                )}
                {condiciones.map((condicion) => (
                  <option key={condicion} value={condicion}>{condicion}</option>
                ))}
              </select>
              <label htmlFor="perfil-tipo-telefono" className="sr-only">Tipo de teléfono</label>
              <select
                id="perfil-tipo-telefono"
                value={formData.tipoTelefono}
                onChange={(e) => setFormData({ ...formData, tipoTelefono: e.target.value })}
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              >
                <option value="">Seleccioná el tipo de teléfono</option>
                <option value="Celular">Celular</option>
                <option value="Fijo">Fijo</option>
                <option value="Trabajo">Trabajo</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
              <label htmlFor="perfil-telefono" className="sr-only">Teléfono</label>
              <input
                id="perfil-telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Teléfono"
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              />
              <label htmlFor="perfil-contacto" className="sr-only">Nombre del contacto de emergencia</label>
              <input
                id="perfil-contacto"
                value={formData.contactoEmergencia}
                onChange={(e) => setFormData({ ...formData, contactoEmergencia: e.target.value })}
                placeholder="Contacto de emergencia"
                required
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              />
              <label htmlFor="perfil-parentesco" className="sr-only">Parentesco con el contacto de emergencia</label>
              <select id="perfil-parentesco"
                value={formData.parentesco}
                onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                required
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              ><option value="">Seleccioná un parentesco</option>{["Padre", "Madre", "Hijo/a", "Hermano/a", "Abuelo/a", "Cónyuge", "Tutor/a", "Otro"].map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}</select>
              <label htmlFor="perfil-telefono-emergencia" className="sr-only">Teléfono del contacto de emergencia</label>
              <input
                id="perfil-telefono-emergencia"
                type="tel"
                value={formData.telefonoEmergencia}
                onChange={(e) => setFormData({ ...formData, telefonoEmergencia: e.target.value })}
                placeholder="Teléfono del contacto de emergencia"
                required
                className="border border-gray-300 rounded-2xl p-3 outline-none focus:border-[#2E7D32]"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:col-span-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 border border-gray-300 rounded-2xl py-3 font-semibold"
              >
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="flex-1 bg-[#2E7D32] text-white rounded-2xl py-3 font-bold disabled:cursor-wait disabled:opacity-60">
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes pageAppear {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .profile-card {
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .profile-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,.04);
        }

        .profile-avatar {
          transition: transform .3s ease;
        }

        .profile-avatar:hover {
          transform: scale(1.02);
        }
      `}</style>
    </>
  );
}

function calcularEdad(valor?: string | null) {
  if (!valor) return null;
  const nacimiento = new Date(`${valor.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const todaviaNoCumplio = hoy.getMonth() < nacimiento.getMonth()
    || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (todaviaNoCumplio) edad--;
  return Math.max(edad, 0);
}

function redimensionarImagen(archivo: File, maxSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      image.src = String(reader.result);
    };
    reader.onerror = reject;

    image.onload = () => {
      const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * ratio);
      canvas.height = Math.round(image.height * ratio);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo preparar la imagen."));
        return;
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("No se pudo redimensionar la imagen."));
        },
        "image/jpeg",
        0.86
      );
    };
    image.onerror = reject;
    reader.readAsDataURL(archivo);
  });
}



