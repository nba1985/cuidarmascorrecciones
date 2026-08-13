import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { crearHistorialAnimo, type UsuarioApi } from "../services/api";

const estadosAnimo = [
  {
    id: "muy-bien",
    texto: "Muy bien",
    valor: 5,
    icono: "😄",
    color: "bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]",
  },
  {
    id: "bien",
    texto: "Bien",
    valor: 4,
    icono: "🙂",
    color: "bg-[#F1F8E9] border-[#7CB342] text-[#558B2F]",
  },
  {
    id: "regular",
    texto: "Regular",
    valor: 3,
    icono: "😐",
    color: "bg-[#FFF8E1] border-[#F9A825] text-[#F57F17]",
  },
  {
    id: "mal",
    texto: "Mal",
    valor: 2,
    icono: "🙁",
    color: "bg-[#FFEBEE] border-[#E57373] text-[#C62828]",
  },
  {
    id: "muy-mal",
    texto: "Muy mal",
    valor: 1,
    icono: "😞",
    color: "bg-[#FCE4EC] border-[#AD1457] text-[#AD1457]",
  },
];

export function HistorialAnimo() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuarioActual = obtenerUsuarioActual();
  const idRegistroToma = (location.state as { idRegistroToma?: number } | null)?.idRegistroToma;

  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [observacion, setObservacion] = useState("");
  const estadoActual = estadosAnimo.find((estado) => estado.texto === estadoSeleccionado);
  const requiereMotivo = Boolean(estadoActual && estadoActual.valor <= 2);

  const guardarEstadoAnimo = async () => {
    if (!estadoActual) {
      alert("Por favor, seleccioná cómo te sentís hoy.");
      return;
    }

    if (requiereMotivo && !observacion.trim()) {
      alert("Contanos brevemente el motivo para poder acompañar mejor ese estado de ánimo.");
      return;
    }

    const idEstado = estadoActual.valor <= 2 ? 3 : estadoActual.valor === 3 ? 2 : 1;
    const observaciones = requiereMotivo
      ? `${estadoActual.texto}: ${observacion.trim()}`
      : estadoActual.texto;

    try {
      const ahora = new Date();

      await crearHistorialAnimo({
        fecha: ahora.toISOString().slice(0, 10),
        hora: ahora.toTimeString().slice(0, 8),
        observaciones,
        idUsuario: usuarioActual?.idUsuario ?? null,
        idEstado,
        idRegistroToma: idRegistroToma ?? null,
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
      <section className="min-h-screen bg-[#F5F5F5] px-3 py-4 text-[#212121] animate-[fadeIn_.4s_ease-out] md:px-4 md:py-6">
        <div className="mx-auto max-w-5xl">
          <section className="mt-4 animate-[slideUp_.5s_ease-out] md:mt-10">
            <p className="text-sm text-[#747970] md:text-lg">Registro diario</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-6xl">Estado de ánimo</h1>
          </section>

          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 animate-[cardEnter_.6s_ease-out] hover:shadow-md md:mt-10 md:p-8">
            <span className="rounded-full bg-[#2E7D32]/10 px-3 py-2 text-xs font-semibold text-[#2E7D32] animate-[softPulse_3s_infinite] md:text-sm">
              BIENESTAR GENERAL
            </span>

            <h2 className="mt-6 text-3xl font-bold text-[#212121] md:text-5xl">¿Cómo te sentís hoy?</h2>
            <p className="mt-3 text-base text-[#747970] md:text-lg">
              Seleccioná una opción para registrar cómo te encontrás durante tu tratamiento.
            </p>

            <div className="mt-5 rounded-3xl border border-[#DCEBDD] bg-[#F7FBF7] p-4 text-sm text-[#386641]">
              <p className="font-bold">Escala de ánimo</p>
              <p className="mt-1 text-[#747970]">
                Muy bien vale 5/5 (100%) y Muy mal vale 1/5 (20%). Si elegís Mal o Muy mal, te pedimos un motivo.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {estadosAnimo.map((estado) => (
                <button
                  key={estado.id}
                  type="button"
                  onClick={() => {
                    setEstadoSeleccionado(estado.texto);
                    if (estado.valor > 2) setObservacion("");
                  }}
                  className={`group rounded-3xl border-2 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] md:p-6 ${
                    estadoSeleccionado === estado.texto
                      ? `${estado.color} scale-[1.03] shadow-md`
                      : "border-gray-200 bg-white text-[#212121]"
                  }`}
                >
                  <div className="mb-3 text-5xl transition-transform duration-300 group-hover:scale-110 md:text-6xl">
                    {estado.icono}
                  </div>
                  <p className="text-lg font-bold md:text-xl">{estado.texto}</p>
                  <p className="mt-1 text-sm font-semibold opacity-80">
                    {estado.valor}/5 · {estado.valor * 20}%
                  </p>
                </button>
              ))}
            </div>

            {requiereMotivo && (
              <>
                <div className="mt-6 rounded-3xl border border-[#F4B4B4] bg-[#FFF7F7] p-4 text-[#8A1C1C]">
                  <p className="font-bold">Te pedimos un motivo para este estado</p>
                  <p className="mt-1 text-sm">
                    Ayuda a identificar si fue por dolor, sueño, medicación, preocupación u otro motivo.
                  </p>
                </div>

                <div className="mt-8">
                  <label className="mb-3 block text-lg font-bold md:text-xl">Motivo</label>
                  <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    maxLength={300}
                    placeholder="Ejemplo: dormí mal, tuve dolor, me sentí cansado, tuve preocupaciones..."
                    className="min-h-36 w-full resize-none rounded-3xl border border-gray-300 p-4 text-base outline-none transition-all duration-300 focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 md:p-5 md:text-lg"
                  />
                  <p className="mt-2 text-sm text-[#747970]">{observacion.length}/300 caracteres</p>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={guardarEstadoAnimo}
              className="mt-8 w-full rounded-2xl bg-[#2E7D32] py-4 text-lg font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:opacity-95 hover:shadow-lg active:scale-[0.98] md:text-xl"
            >
              Guardar estado de ánimo
            </button>
          </div>

          <div className="mb-8 mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 animate-[slideUp_.7s_ease-out] hover:shadow-md md:p-6">
            <h3 className="text-xl font-bold md:text-2xl">¿Para qué sirve este registro?</h3>
            <p className="mt-3 text-base text-[#747970] md:text-lg">
              Este registro ayuda a acompañar tu tratamiento, permitiendo observar cómo te sentís día a día junto con tus tomas de medicación.
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(20px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes softPulse {
          0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, .15); }
          70% { box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
          100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
        }
      `}</style>
    </>
  );
}

function obtenerUsuarioActual(): UsuarioApi | null {
  const guardado = localStorage.getItem("cuidarPlusUsuario");
  return guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
}
