import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import {
  actualizarPerfilCompleto,
  cerrarSesionApi,
  obtenerPerfilUsuario,
  obtenerUsuarios,
  resolverUrlArchivo,
  subirFotoPerfil,
  type PerfilUsuarioApi,
  type UsuarioApi,
} from "../services/api";

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
      fechaNacimiento: usuarioApi.fechaNacimiento?.slice(0, 10) ?? "",
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
    if (!usuarioApi) return;

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
                  <div className="rounded-2xl bg-[#F7FBF7] p-5">
                    <p className="text-sm font-semibold text-[#386641]">Grupo sanguíneo</p>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-2xl rounded-[28px] p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2E7D32]">Editar perfil</h2>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre"
                required
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <input
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Apellido"
                required
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <input
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                placeholder="Ciudad"
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <input
                value={formData.mail}
                onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                placeholder="Correo"
                type="email"
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <input
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="DNI"
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <input
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                type="date"
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <div className="sm:col-span-2 grid sm:grid-cols-[96px_1fr] gap-4 items-center">
                <img
                  src={fotoPreview || resolverUrlArchivo(formData.foto) || paciente.foto}
                  alt="Vista previa"
                  className="w-24 h-24 rounded-3xl object-cover border border-gray-200"
                />
                <label className="border border-gray-300 rounded-2xl p-4 outline-none focus-within:border-[#2E7D32] cursor-pointer">
                  <span className="block font-semibold text-[#212121]">Cargar foto de perfil</span>
                  <span className="block text-sm text-[#747970] mt-1">
                    Se redimensiona automáticamente si es muy grande.
                  </span>
                  <input type="file" accept="image/*" onChange={handleFotoChange} className="sr-only" />
                </label>
              </div>
              <input
                value={formData.grupoSanguineo}
                onChange={(e) => setFormData({ ...formData, grupoSanguineo: e.target.value })}
                placeholder="Grupo sanguíneo (ej: O-)"
                list="grupos-sanguineos"
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <datalist id="grupos-sanguineos">
                <option value="A+" />
                <option value="A-" />
                <option value="B+" />
                <option value="B-" />
                <option value="AB+" />
                <option value="AB-" />
                <option value="O+" />
                <option value="O-" />
              </datalist>
              <input
                value={formData.seguroMedico}
                onChange={(e) => setFormData({ ...formData, seguroMedico: e.target.value })}
                placeholder="Cobertura médica / obra social"
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <input
                value={formData.numeroPoliza}
                onChange={(e) => setFormData({ ...formData, numeroPoliza: e.target.value })}
                placeholder="Número de socio de la obra social"
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <input
                value={formData.alergia}
                onChange={(e) => setFormData({ ...formData, alergia: e.target.value })}
                placeholder="Alergia"
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <input
                value={formData.condicion}
                onChange={(e) => setFormData({ ...formData, condicion: e.target.value })}
                placeholder="Condición"
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <select
                value={formData.tipoTelefono}
                onChange={(e) => setFormData({ ...formData, tipoTelefono: e.target.value })}
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              >
                <option value="">Seleccioná el tipo de teléfono</option>
                <option value="Celular">Celular</option>
                <option value="Fijo">Fijo</option>
                <option value="Trabajo">Trabajo</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
              <input
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Teléfono"
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <input
                value={formData.contactoEmergencia}
                onChange={(e) => setFormData({ ...formData, contactoEmergencia: e.target.value })}
                placeholder="Contacto de emergencia"
                required
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <input
                value={formData.parentesco}
                onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                placeholder="Parentesco"
                required
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
              <input
                type="tel"
                value={formData.telefonoEmergencia}
                onChange={(e) => setFormData({ ...formData, telefonoEmergencia: e.target.value })}
                placeholder="Teléfono del contacto de emergencia"
                required
                className="border border-gray-300 rounded-2xl p-4 outline-none focus:border-[#2E7D32]"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 border border-gray-300 rounded-2xl py-3 font-semibold"
              >
                Cancelar
              </button>
              <button type="submit" className="flex-1 bg-[#2E7D32] text-white rounded-2xl py-3 font-bold">
                Guardar cambios
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
