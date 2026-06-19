import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ImagePlus, Lock, Mail, User } from "lucide-react";
import { registrarUsuario, subirFotoPerfil } from "../services/api";

export function Nuevacuenta() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    mail: "",
    password: "",
    confirmarPassword: "",
    ciudad: "",
    fechaNacimiento: "",
    dni: "",
    grupoSanguineo: "",
    seguroMedico: "",
    numeroPoliza: "",
    alergia: "",
    condicion: "",
    tipoTelefono: "",
    telefono: "",
    contactoEmergencia: "",
    parentesco: "",
  });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [fotoArchivo, setFotoArchivo] = useState<Blob | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");

  useEffect(() => {
    return () => {
      if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    };
  }, [fotoPreview]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      setError("Seleccioná un archivo de imagen válido.");
      e.target.value = "";
      return;
    }

    try {
      const reducida = await redimensionarImagen(archivo, 512);
      setFotoArchivo(reducida);
      setFotoPreview(URL.createObjectURL(reducida));
      setError("");
    } catch {
      setError("No se pudo procesar la imagen seleccionada.");
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.password !== formData.confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const response = await registrarUsuario({
        nombre: formData.nombre,
        apellido: formData.apellido,
        mail: formData.mail,
        password: formData.password,
        ciudad: formData.ciudad || null,
        fechaNacimiento: formData.fechaNacimiento || null,
        dni: formData.dni || null,
        foto: null,
        grupoSanguineo: formData.grupoSanguineo || null,
        seguroMedico: formData.seguroMedico || null,
        numeroPoliza: formData.numeroPoliza || null,
        alergia: formData.alergia || null,
        condicion: formData.condicion || null,
        tipoTelefono: formData.tipoTelefono || null,
        telefono: formData.telefono || null,
        contactoEmergencia: formData.contactoEmergencia || null,
        parentesco: formData.parentesco || null,
      });

      let usuarioRegistrado = response.usuario;

      if (fotoArchivo) {
        try {
          const fotoSubida = await subirFotoPerfil(response.usuario.idUsuario, fotoArchivo);
          usuarioRegistrado = { ...response.usuario, foto: fotoSubida.foto };
        } catch {
          // La cuenta ya existe: se inicia sesión igualmente y la foto puede
          // volver a cargarse desde Editar perfil.
          sessionStorage.setItem(
            "cuidarPlusAviso",
            "La cuenta se creó, pero la foto no pudo subirse. Podés reintentar desde Perfil."
          );
        }
      }

      localStorage.setItem("cuidarPlusUsuario", JSON.stringify(usuarioRegistrado));
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="min-h-screen bg-gray-100 flex justify-center items-center p-4 animate-[fadeIn_.5s_ease-out]">
      <div className="w-full max-w-[640px]">
        <div className="bg-[#ECECEC] rounded-[32px] px-5 py-7 shadow-md animate-[cardEnter_.6s_ease-out]">
          <div className="text-center mb-7">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] mb-3">
              Crear cuenta
            </h1>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Registrate para empezar a gestionar tus medicamentos
            </p>
            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-[#0F172A]">Datos personales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center bg-white border border-gray-300 rounded-2xl px-4 py-3 focus-within:border-[#067A34] focus-within:ring-4 focus-within:ring-[#067A34]/10">
                <User className="text-gray-500 mr-3" size={20} />
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre"
                  required
                  className="w-full outline-none bg-transparent text-sm sm:text-base"
                />
              </div>

              <div className="flex items-center bg-white border border-gray-300 rounded-2xl px-4 py-3 focus-within:border-[#067A34] focus-within:ring-4 focus-within:ring-[#067A34]/10">
                <User className="text-gray-500 mr-3" size={20} />
                <input
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  placeholder="Apellido"
                  required
                  className="w-full outline-none bg-transparent text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex items-center bg-white border border-gray-300 rounded-2xl px-4 py-3 focus-within:border-[#067A34] focus-within:ring-4 focus-within:ring-[#067A34]/10">
              <Mail className="text-gray-500 mr-3" size={20} />
              <input
                type="email"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                placeholder="Correo electrónico"
                required
                className="w-full outline-none bg-transparent text-sm sm:text-base"
              />
            </div>

            <h2 className="text-lg font-bold text-[#0F172A] mt-2">Información personal adicional</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder="Ciudad"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
              <input
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                placeholder="DNI"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
              <input
                name="grupoSanguineo"
                value={formData.grupoSanguineo}
                onChange={handleChange}
                placeholder="Grupo sanguíneo (ej: O-)"
                list="grupos-sanguineos-registro"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
              <datalist id="grupos-sanguineos-registro">
                <option value="A+" />
                <option value="A-" />
                <option value="B+" />
                <option value="B-" />
                <option value="AB+" />
                <option value="AB-" />
                <option value="O+" />
                <option value="O-" />
              </datalist>
            </div>

            <div className="grid grid-cols-[88px_1fr] gap-4 items-center bg-white border border-gray-300 rounded-2xl p-4">
              <div className="w-[88px] h-[88px] rounded-3xl bg-[#067A34]/10 text-[#067A34] overflow-hidden flex items-center justify-center border border-[#067A34]/20">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Vista previa de perfil" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} />
                )}
              </div>
              <label className="cursor-pointer">
                <span className="flex items-center gap-2 font-semibold text-[#0F172A]">
                  <ImagePlus size={20} className="text-[#067A34]" />
                  Cargar foto de perfil
                </span>
                <span className="block text-sm text-gray-600 mt-1">
                  Elegí una imagen. Se ajustará automáticamente.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="sr-only"
                />
              </label>
            </div>

            <h2 className="text-lg font-bold text-[#0F172A] mt-2">Cobertura y contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                name="seguroMedico"
                value={formData.seguroMedico}
                onChange={handleChange}
                placeholder="Cobertura médica / obra social"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
              <input
                name="numeroPoliza"
                value={formData.numeroPoliza}
                onChange={handleChange}
                placeholder="Número de socio de la obra social"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
              <input
                name="alergia"
                value={formData.alergia}
                onChange={handleChange}
                placeholder="Alergia"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
              <input
                name="condicion"
                value={formData.condicion}
                onChange={handleChange}
                placeholder="Condición"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
              <input
                name="tipoTelefono"
                value={formData.tipoTelefono}
                onChange={handleChange}
                placeholder="Tipo teléfono"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
              <input
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
              <input
                name="contactoEmergencia"
                value={formData.contactoEmergencia}
                onChange={handleChange}
                placeholder="Contacto emergencia"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
              <input
                name="parentesco"
                value={formData.parentesco}
                onChange={handleChange}
                placeholder="Parentesco"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
              />
            </div>

            <h2 className="text-lg font-bold text-[#0F172A] mt-2">Seguridad</h2>
            <div className="flex items-center bg-white border border-gray-300 rounded-2xl px-4 py-3 focus-within:border-[#067A34] focus-within:ring-4 focus-within:ring-[#067A34]/10">
              <Lock className="text-gray-500 mr-3" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                required
                minLength={4}
                className="w-full outline-none bg-transparent text-sm sm:text-base"
              />
            </div>

            <div className="flex items-center bg-white border border-gray-300 rounded-2xl px-4 py-3 focus-within:border-[#067A34] focus-within:ring-4 focus-within:ring-[#067A34]/10">
              <Lock className="text-gray-500 mr-3" size={20} />
              <input
                type="password"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                placeholder="Confirmar contraseña"
                required
                minLength={4}
                className="w-full outline-none bg-transparent text-sm sm:text-base"
              />
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-[#067A34] text-white rounded-2xl py-3.5 font-bold text-lg mt-1 disabled:opacity-70"
            >
              {guardando ? "Creando..." : "Crear cuenta"}
            </button>

            <Link
              to="/"
              className="w-full text-center border border-gray-300 rounded-2xl py-3.5 font-semibold text-[#0F172A] hover:bg-white"
            >
              Ya tengo cuenta
            </Link>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(12px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </section>
  );
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

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("No se pudo preparar la imagen."));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
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
