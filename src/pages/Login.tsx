import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
} from "lucide-react";
import { loginUsuario } from "../services/api";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mail, setMail] = useState("demo@cuidarplus.local");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");
  const [ingresando, setIngresando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setIngresando(true);
      const response = await loginUsuario(mail, password);
      localStorage.setItem("cuidarPlusUsuario", JSON.stringify(response.usuario));
      setError("");
      navigate((location.state as { desde?: string } | null)?.desde || "/app", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setIngresando(false);
    }
  }

  return (
    <>
      <section
        className="
          min-h-screen
          bg-gray-100
          flex
          justify-center
          items-center
          p-4

          animate-[fadeIn_.5s_ease-out]
        "
      >
        {/* CONTENEDOR */}
        <div className="w-full max-w-[380px]">
          {/* CARD */}
          <div
            className="
              bg-[#ECECEC]
              rounded-[32px]
              px-5
              py-7

              shadow-md

              animate-[cardEnter_.6s_ease-out]

              transition-all
              duration-300
            "
          >
            {/* TITULO */}
            <div
              className="
                text-center
                mb-7

                animate-[slideUp_.7s_ease-out]
              "
            >
              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] mb-3">
                Bienvenido
              </h2>

              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Ingresá para gestionar tus medicamentos
              </p>
              {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
            </div>

            {/* FORM */}
            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-4"
            >
              {/* EMAIL */}
              <div
                className="
                  flex
                  items-center

                  bg-white
                  border
                  border-gray-300

                  rounded-2xl
                  px-4
                  py-3

                  transition-all
                  duration-300

                  focus-within:border-[#067A34]
                  focus-within:ring-4
                  focus-within:ring-[#067A34]/10
                "
              >
                <Mail
                  className="text-gray-500 mr-3"
                  size={20}
                />

                <input
                  type="email"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="
                    w-full
                    outline-none
                    bg-transparent
                    text-sm
                    sm:text-base
                  "
                />
              </div>

              {/* PASSWORD */}
              <div
                className="
                  flex
                  items-center

                  bg-white
                  border
                  border-gray-300

                  rounded-2xl
                  px-4
                  py-3

                  transition-all
                  duration-300

                  focus-within:border-[#067A34]
                  focus-within:ring-4
                  focus-within:ring-[#067A34]/10
                "
              >
                <Lock
                  className="text-gray-500 mr-3"
                  size={20}
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="
                    w-full
                    outline-none
                    bg-transparent
                    text-sm
                    sm:text-base
                  "
                />

                <Eye
                  className="
                    text-gray-500
                    cursor-pointer

                    transition-transform
                    duration-300

                    hover:scale-110
                  "
                  size={20}
                />
              </div>

              {/* LOGIN */}
              <button
                type="submit"
                disabled={ingresando}
                aria-busy={ingresando}
                className="
                  w-full

                  bg-[#067A34]
                  text-white

                  rounded-2xl
                  py-3.5

                  font-bold
                  text-lg

                  mt-1

                  transition-all
                  duration-300

                  hover:bg-green-900
                  hover:-translate-y-1
                  hover:shadow-lg

                  active:scale-[0.98]
                "
              >
                {ingresando ? "Ingresando…" : "Ingresar →"}
              </button>

              {/* DIVIDER */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-[1px] bg-gray-300"></div>

                <span className="text-gray-500 text-xs sm:text-sm whitespace-nowrap">
                  o continuar con
                </span>

                <div className="flex-1 h-[1px] bg-gray-300"></div>
              </div>

              {/* GOOGLE */}
              <button
                type="button"
                className="
                  w-full

                  bg-white
                  border
                  border-gray-300

                  rounded-2xl
                  py-3
                  px-4

                  flex
                  items-center
                  justify-center
                  gap-3

                  text-sm
                  sm:text-base
                  font-semibold

                  transition-all
                  duration-300

                  hover:bg-gray-50
                  hover:-translate-y-0.5
                  hover:shadow-md

                  active:scale-[0.98]
                "
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  alt="Google"
                  className="w-5 h-5"
                />

                Continuar con Google
              </button>

              {/* FACEBOOK */}
              <button
                type="button"
                className="
                  w-full

                  bg-white
                  border
                  border-gray-300

                  rounded-2xl
                  py-3
                  px-4

                  flex
                  items-center
                  justify-center
                  gap-3

                  text-sm
                  sm:text-base
                  font-semibold

                  transition-all
                  duration-300

                  hover:bg-gray-50
                  hover:-translate-y-0.5
                  hover:shadow-md

                  active:scale-[0.98]
                "
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/124/124010.png"
                  alt="Facebook"
                  className="w-5 h-5"
                />

                Continuar con Facebook
              </button>

              {/* DIVIDER */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-[1px] bg-gray-300"></div>

                <span className="text-gray-500 text-xs">
                  o
                </span>

                <div className="flex-1 h-[1px] bg-gray-300"></div>
              </div>

              {/* CREAR CUENTA */}
              <button
                type="button"
                onClick={() => navigate("/nuevacuenta")}
                className="
                  w-full

                  border
                  border-gray-400

                  rounded-2xl
                  py-3

                  font-semibold
                  text-gray-800
                  text-base

                  bg-transparent

                  transition-all
                  duration-300

                  hover:bg-gray-100
                  hover:-translate-y-0.5

                  active:scale-[0.98]
                "
              >
                Crear cuenta
              </button>
            </form>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(24px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
