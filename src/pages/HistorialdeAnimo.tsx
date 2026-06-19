import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  crearHistorialAnimo,
  type UsuarioApi,
} from "../services/api";

const estadosAnimo = [
  {
    id: "muy-bien",
    texto: "Muy bien",
    icono: "😄",
    color: "bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]",
  },
  {
    id: "bien",
    texto: "Bien",
    icono: "🙂",
    color: "bg-[#F1F8E9] border-[#7CB342] text-[#558B2F]",
  },
  {
    id: "regular",
    texto: "Regular",
    icono: "😐",
    color: "bg-[#FFF8E1] border-[#F9A825] text-[#F57F17]",
  },
  {
    id: "mal",
    texto: "Mal",
    icono: "🙁",
    color: "bg-[#FFEBEE] border-[#E57373] text-[#C62828]",
  },
  {
    id: "muy-mal",
    texto: "Muy mal",
    icono: "😞",
    color: "bg-[#FCE4EC] border-[#AD1457] text-[#AD1457]",
  },
];

export function HistorialAnimo() {
  const navigate = useNavigate();
  const usuarioActual = obtenerUsuarioActual();

  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [observacion, setObservacion] = useState("");

  const guardarEstadoAnimo = async () => {
    if (!estadoSeleccionado) {
      alert("Por favor, seleccioná cómo te sentís hoy.");
      return;
    }

    const estadoNormalizado = estadoSeleccionado.toLowerCase();
    const idEstado = estadoNormalizado.includes("mal")
      ? 3
      : estadoNormalizado.includes("regular")
        ? 2
        : 1;

    try {
      const ahora = new Date();

      await crearHistorialAnimo({
        fecha: ahora.toISOString().slice(0, 10),
        hora: ahora.toTimeString().slice(0, 8),
        observaciones: observacion || estadoSeleccionado,
        idUsuario: usuarioActual?.idUsuario ?? null,
        idEstado,
      });

      alert("Estado de ánimo guardado correctamente.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo guardar el estado de ánimo.");
      return;
    }

    setEstadoSeleccionado("");
    setObservacion("");

    navigate("/app");
  };

  return (
    <>
      <section
        className="
          min-h-screen
          bg-[#F5F5F5]
          text-[#212121]
          px-3 md:px-4
          py-4 md:py-6

          animate-[fadeIn_.4s_ease-out]
        "
      >
        <div className="max-w-5xl mx-auto">
          {/* ENCABEZADO */}
          <section
            className="
              mt-4 md:mt-10
              animate-[slideUp_.5s_ease-out]
            "
          >
            <p className="text-sm md:text-lg text-[#747970]">
              Registro diario
            </p>

            <h1 className="text-3xl md:text-6xl font-bold leading-tight mt-2">
              Estado de ánimo
            </h1>
          </section>

          {/* CARD PRINCIPAL */}
          <div
            className="
              bg-white
              rounded-3xl
              p-5 md:p-8

              border
              border-gray-200

              shadow-sm

              mt-6 md:mt-10

              animate-[cardEnter_.6s_ease-out]

              transition-all
              duration-300

              hover:shadow-md
            "
          >
            <span
              className="
                bg-[#2E7D32]/10
                text-[#2E7D32]

                px-3 py-2
                rounded-full

                text-xs md:text-sm
                font-semibold

                animate-[softPulse_3s_infinite]
              "
            >
              BIENESTAR GENERAL
            </span>

            <h2 className="text-3xl md:text-5xl font-bold mt-6 text-[#212121]">
              ¿Cómo te sentís hoy?
            </h2>

            <p className="text-[#747970] mt-3 text-base md:text-lg">
              Seleccioná una opción para registrar cómo te encontrás durante tu
              tratamiento.
            </p>

            {/* OPCIONES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
              {estadosAnimo.map((estado) => (
                <button
                  key={estado.id}
                  onClick={() => setEstadoSeleccionado(estado.texto)}
                  className={`
                    group

                    rounded-3xl
                    border-2

                    p-5 md:p-6

                    text-center

                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:scale-[1.02]
                    hover:shadow-md

                    active:scale-[0.98]

                    ${
                      estadoSeleccionado === estado.texto
                        ? `${estado.color} scale-[1.03] shadow-md`
                        : "bg-white border-gray-200 text-[#212121]"
                    }
                  `}
                >
                  <div
                    className="
                      text-5xl
                      md:text-6xl

                      mb-3

                      transition-transform
                      duration-300

                      group-hover:scale-110
                    "
                  >
                    {estado.icono}
                  </div>

                  <p className="text-lg md:text-xl font-bold">
                    {estado.texto}
                  </p>
                </button>
              ))}
            </div>

            {/* OBSERVACION */}
            <div className="mt-8">
              <label className="block text-lg md:text-xl font-bold mb-3">
                Observación opcional
              </label>

              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ejemplo: Dormí mal, me siento cansado, hoy me sentí mejor..."
                className="
                  w-full
                  min-h-36

                  rounded-3xl
                  border
                  border-gray-300

                  p-4 md:p-5

                  text-base md:text-lg

                  outline-none
                  resize-none

                  transition-all
                  duration-300

                  focus:border-[#2E7D32]
                  focus:ring-4
                  focus:ring-[#2E7D32]/10
                "
              />
            </div>

            {/* BOTON */}
            <button
              onClick={guardarEstadoAnimo}
              className="
                w-full
                mt-8

                bg-[#2E7D32]
                text-white

                font-bold
                text-lg md:text-xl

                py-4
                rounded-2xl

                transition-all
                duration-300

                hover:-translate-y-1
                hover:shadow-lg
                hover:opacity-95

                active:scale-[0.98]
              "
            >
              Guardar estado de ánimo
            </button>
          </div>

          {/* CARD INFORMATIVA */}
          <div
            className="
              bg-white
              rounded-3xl

              p-5 md:p-6

              border
              border-gray-200

              shadow-sm

              mt-6
              mb-8

              animate-[slideUp_.7s_ease-out]

              transition-all
              duration-300

              hover:shadow-md
            "
          >
            <h3 className="text-xl md:text-2xl font-bold">
              ¿Para qué sirve este registro?
            </h3>

            <p className="text-[#747970] mt-3 text-base md:text-lg">
              Este registro ayuda a acompañar tu tratamiento, permitiendo
              observar cómo te sentís día a día junto con tus tomas de
              medicación.
            </p>
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
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes softPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(46, 125, 50, .15);
          }

          70% {
            box-shadow: 0 0 0 10px rgba(46, 125, 50, 0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(46, 125, 50, 0);
          }
        }
      `}</style>
    </>
  );
}

function obtenerUsuarioActual(): UsuarioApi | null {
  const guardado = localStorage.getItem("cuidarPlusUsuario");
  return guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
}
