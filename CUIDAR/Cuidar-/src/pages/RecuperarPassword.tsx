import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";
import { restablecerPassword, solicitarRecuperoPassword } from "../services/api";

export function RecuperarPassword() {
  const [mail, setMail] = useState("");
  const [token, setToken] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [solicitando, setSolicitando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function handleSolicitar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");

    try {
      setSolicitando(true);
      const respuesta = await solicitarRecuperoPassword(mail);
      setMensaje(respuesta.mensaje);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo solicitar el recupero.");
    } finally {
      setSolicitando(false);
    }
  }

  async function handleRestablecer(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (nuevaPassword.length < 4) {
      setError("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setGuardando(true);
      const respuesta = await restablecerPassword(mail, token, nuevaPassword);
      setMensaje(respuesta.mensaje);
      setToken("");
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo restablecer la contraseña.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-[460px] rounded-[32px] bg-[#ECECEC] px-5 py-7 shadow-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
            <KeyRound size={26} />
          </div>
          <h1 className="mb-3 text-4xl font-extrabold text-[#0F172A]">Recuperar contraseña</h1>
          <p className="text-base leading-relaxed text-gray-600">
            Pedí un token temporal y creá una nueva contraseña para tu cuenta.
          </p>
        </div>

        {error && <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {mensaje && <p className="mb-4 rounded-2xl border border-[#A5D6A7] bg-[#E8F5E9] p-3 text-sm text-[#1B5E20]">{mensaje}</p>}

        <form onSubmit={handleSolicitar} className="mb-5 flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700" htmlFor="mail-recupero">
            Correo de la cuenta
          </label>
          <div className="flex items-center rounded-2xl border border-gray-300 bg-white px-4 py-3 focus-within:border-[#067A34] focus-within:ring-4 focus-within:ring-[#067A34]/10">
            <Mail className="mr-3 text-gray-500" size={20} />
            <input
              id="mail-recupero"
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="tu correo"
              className="w-full bg-transparent text-sm outline-none sm:text-base"
              required
            />
          </div>
          <button
            type="submit"
            disabled={solicitando}
            className="rounded-2xl bg-[#067A34] py-3.5 text-base font-bold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {solicitando ? "Enviando token…" : "Enviar token por correo"}
          </button>
        </form>

        <form onSubmit={handleRestablecer} className="flex flex-col gap-3">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token"
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
            required
          />
          <input
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            placeholder="Nueva contraseña"
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
            required
          />
          <input
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            placeholder="Confirmar nueva contraseña"
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#067A34] focus:ring-4 focus:ring-[#067A34]/10"
            required
          />
          <button
            type="submit"
            disabled={guardando}
            className="rounded-2xl border border-[#067A34] bg-white py-3.5 text-base font-bold text-[#067A34] transition hover:bg-[#E8F5E9] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {guardando ? "Actualizando…" : "Actualizar contraseña"}
          </button>
        </form>

        <Link to="/" className="mt-5 block text-center text-sm font-semibold text-[#067A34] hover:underline">
          Volver al inicio de sesión
        </Link>
      </div>
    </section>
  );
}
