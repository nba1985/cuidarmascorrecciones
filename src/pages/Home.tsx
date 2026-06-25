import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import pastillasIcon from "../assets/svg/pastillas.png";
import recetaIcon from "../assets/svg/receta.svg";
import recordatorioIcon from "../assets/svg/recordatorio.svg";
import {
  obtenerMedicamentos,
  crearRegistroToma,
  obtenerRecordatoriosUsuario,
  obtenerRegistrosTomas,
  obtenerUsuarios,
  type MedicamentoApi,
  type RecordatorioApi,
  type RegistroTomaApi,
  type UsuarioApi,
} from "../services/api";
import { minutosHastaHorario, puedeConfirmarHorario, textoVentanaConfirmacion } from "../utils/horarios";
import { Button, Modal } from "../components/ui";
import { obtenerSeguimientos } from "../utils/seguimientoMedicamentos";

export function Home() {
  const navigate = useNavigate();
  const usuarioActual = obtenerUsuarioActual();
  const [usuario, setUsuario] = useState("Usuario");
  const [medicamentos, setMedicamentos] = useState<MedicamentoApi[]>([]);
  const [recordatorios, setRecordatorios] = useState<RecordatorioApi[]>([]);
  const [tomasCompletadas, setTomasCompletadas] = useState(0);
  const [recordatoriosConfirmadosHoy, setRecordatoriosConfirmadosHoy] = useState<Set<number>>(new Set());
  const [mostrarOmitir, setMostrarOmitir] = useState(false);
  const [motivoOmision, setMotivoOmision] = useState("");
  const [guardandoOmision, setGuardandoOmision] = useState(false);
  const [registrosTomas, setRegistrosTomas] = useState<RegistroTomaApi[]>([]);
  const [error, setError] = useState("");
  const [reloj, setReloj] = useState(0);

  useEffect(() => {
    async function cargarDatos() {
      const [usuariosResult, medicamentosResult, recordatoriosResult, tomasResult] =
        await Promise.allSettled([
          obtenerUsuarios(),
          obtenerMedicamentos(usuarioActual?.idUsuario),
          obtenerRecordatoriosUsuario(usuarioActual?.idUsuario),
          obtenerRegistrosTomas(usuarioActual?.idUsuario),
        ]);

      if (usuariosResult.status === "fulfilled") {
        setUsuario(usuarioActual?.nombre ?? usuariosResult.value[0]?.nombre ?? "Usuario");
      }

      if (medicamentosResult.status === "fulfilled") {
        setMedicamentos(medicamentosResult.value);
      }

      if (recordatoriosResult.status === "fulfilled") {
        setRecordatorios(recordatoriosResult.value);
      }

      if (tomasResult.status === "fulfilled") {
        setRegistrosTomas(tomasResult.value);
        const hoy = new Date().toDateString();
        const confirmados = new Set(
          tomasResult.value
            .filter(
              (toma) =>
                toma.estado &&
                toma.idRecordatorio !== null &&
                new Date(toma.fechaHoraReal).toDateString() === hoy
            )
            .map((toma) => toma.idRecordatorio as number)
        );
        setRecordatoriosConfirmadosHoy(confirmados);
        setTomasCompletadas(Math.min(confirmados.size, recordatoriosResult.status === "fulfilled" ? recordatoriosResult.value.length : confirmados.size));
      }

      const primerError = [
        usuariosResult,
        medicamentosResult,
        recordatoriosResult,
        tomasResult,
      ].find((result) => result.status === "rejected");

      setError(
        primerError && primerError.status === "rejected"
          ? primerError.reason instanceof Error
            ? primerError.reason.message
            : "No se pudieron cargar algunos datos."
          : ""
      );
    }

    cargarDatos();
  }, []);

  useEffect(() => {
    const intervalo = window.setInterval(() => setReloj(Date.now()), 30_000);
    return () => window.clearInterval(intervalo);
  }, []);

  const { proximoRecordatorio, esDosisManana } = useMemo(() => {
    const pendientes = recordatorios.filter(
      (recordatorio) => !recordatoriosConfirmadosHoy.has(recordatorio.idRecordatorio)
    );
    const usarManana = recordatorios.length > 0 && pendientes.length === 0;
    const candidatos = usarManana ? [...recordatorios] : pendientes;

    const proximo = candidatos.sort(
      (a, b) =>
        minutosParaProximaDosis(a.fechaHoraProgramada, usarManana) -
        minutosParaProximaDosis(b.fechaHoraProgramada, usarManana)
    )[0];

    return { proximoRecordatorio: proximo, esDosisManana: usarManana };
  }, [recordatorios, recordatoriosConfirmadosHoy, reloj]);

  const medicamentoPrincipal = proximoRecordatorio
    ? medicamentos.find(
        (medicamento) =>
          medicamento.nombre.trim().toLowerCase() ===
          (proximoRecordatorio.canal ?? "").trim().toLowerCase()
      ) ?? medicamentos[0]
    : undefined;
  const horaProgramada = proximoRecordatorio
    ? new Intl.DateTimeFormat("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(proximoRecordatorio.fechaHoraProgramada))
    : "--:--";
  const alertas = useMemo(() => {
    const desde = new Date();
    desde.setDate(desde.getDate() - 7);
    const omitidasRecientes = registrosTomas.filter((toma) => !toma.estado && new Date(toma.fechaHoraReal) >= desde).length;
    const pausados = medicamentos.filter((medicamento) => medicamento.pausado).length;
    const sinHorario = medicamentos.filter((medicamento) => !medicamento.pausado && medicamento.horarios.length === 0).length;
    const seguimiento = obtenerSeguimientos();
    const hoy = new Date();
    const enDias = (fecha?: string) => fecha ? Math.ceil((+new Date(`${fecha}T23:59:59`) - +hoy) / 86_400_000) : null;
    const alertasPlanificacion = medicamentos.flatMap((medicamento) => {
      const datos = seguimiento[medicamento.idMedicamento];
      if (!datos) return [];
      const mensajes: string[] = [];
      if (datos.stock !== undefined && datos.stock <= 5) mensajes.push(`${medicamento.nombre}: quedan ${datos.stock} dosis.`);
      const diasFin = enDias(datos.fechaFin);
      if (diasFin !== null && diasFin >= 0 && diasFin <= 7) mensajes.push(`${medicamento.nombre}: el tratamiento finaliza ${diasFin === 0 ? "hoy" : `en ${diasFin} días`}.`);
      const diasReceta = enDias(datos.vencimientoReceta);
      if (diasReceta !== null && diasReceta < 0) mensajes.push(`${medicamento.nombre}: la receta está vencida.`);
      else if (diasReceta !== null && diasReceta <= 15) mensajes.push(`${medicamento.nombre}: la receta vence ${diasReceta === 0 ? "hoy" : `en ${diasReceta} días`}.`);
      const diasReanudacion = enDias(datos.reanudarEl);
      if (medicamento.pausado && diasReanudacion !== null && diasReanudacion <= 0) mensajes.push(`${medicamento.nombre}: ya corresponde reanudar el tratamiento.`);
      return mensajes;
    });
    return [
      pausados ? `${pausados} ${pausados === 1 ? "tratamiento está pausado" : "tratamientos están pausados"}.` : "",
      sinHorario ? `${sinHorario} ${sinHorario === 1 ? "medicamento no tiene horario activo" : "medicamentos no tienen horario activo"}.` : "",
      omitidasRecientes ? `Registraste ${omitidasRecientes} ${omitidasRecientes === 1 ? "omisión" : "omisiones"} en los últimos 7 días.` : "",
      ...alertasPlanificacion,
    ].filter(Boolean);
  }, [medicamentos, registrosTomas]);

  async function confirmarProximaDosis() {
    if (!proximoRecordatorio) {
      alert("No hay una dosis programada para confirmar.");
      return;
    }

    if (esDosisManana) {
      alert("Las dosis de hoy ya están completas. Esta es la primera dosis de mañana.");
      return;
    }

    if (!puedeConfirmarHorario(proximoRecordatorio.fechaHoraProgramada)) {
      alert(textoVentanaConfirmacion(proximoRecordatorio.fechaHoraProgramada));
      return;
    }

    try {
      const registro = await crearRegistroToma({
        estado: true,
        fechaHoraReal: new Date().toISOString(),
        observaciones: "Dosis confirmada",
        idRecordatorio: proximoRecordatorio.idRecordatorio,
        idHistorialAnimo: null,
      });
      navigate("/app/historial-animo", {
        state: { idRegistroToma: registro.idRegistroToma },
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo confirmar la dosis.");
    }
  }

  async function omitirProximaDosis() {
    if (!proximoRecordatorio || esDosisManana) return;
    setGuardandoOmision(true);
    try {
      const registro = await crearRegistroToma({
        estado: false,
        fechaHoraReal: new Date().toISOString(),
        observaciones: motivoOmision.trim() || "Dosis omitida",
        idRecordatorio: proximoRecordatorio.idRecordatorio,
        idHistorialAnimo: null,
      });
      setMostrarOmitir(false);
      setMotivoOmision("");
      navigate("/app/historial-animo", { state: { idRegistroToma: registro.idRegistroToma } });
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo registrar la omisión.");
    } finally {
      setGuardandoOmision(false);
    }
  }

  return (
    <section
      className="
        min-h-screen
        bg-[#F5F5F5]
        text-[#212121]
        px-3
        md:px-4
        py-4
        md:py-6
      "
    >
      <div
        className="
          max-w-6xl
          mx-auto
          animate-[pageAppear_.45s_ease-out]
        "
      >

        {/* BIENVENIDA */}

        <section className="mt-4 md:mt-10">

          <p
            className="
              text-sm
              md:text-lg
              text-[#747970]
              animate-[softReveal_.45s_ease-out]
            "
          >
            Hola, {usuario}
          </p>
          {error && (
            <p className="text-sm text-[#747970] mt-2">
              Algunos datos todavía no están disponibles.
            </p>
          )}

          <h2
            className="
              text-3xl
              md:text-5xl
              font-bold
              leading-tight
              mt-2
              animate-[softReveal_.6s_ease-out]
            "
          >
            Todo bajo control
          </h2>

        </section>

        {/* GRID */}

        <div
          className="
            grid
            lg:grid-cols-[2fr_1fr]
            gap-4
            md:gap-6
            mt-6
            md:mt-10
          "
        >

          {/* CARD PRINCIPAL */}

          <div
            className="
              dashboard-card

              bg-white
              rounded-3xl

              p-5
              md:p-8

              border
              border-gray-200

              shadow-sm

              animate-[softReveal_.75s_ease-out]
            "
          >

            <span
              className="
                bg-[#2E7D32]/10
                text-[#2E7D32]

                px-3
                py-2

                rounded-full

                text-xs
                md:text-sm

                font-semibold
              "
            >
              PRÓXIMA DOSIS
            </span>

            <h1
              className="
                text-3xl
                md:text-5xl
                font-bold
                mt-5
                text-[#212121]
              "
            >
              {medicamentoPrincipal?.nombre ?? "Sin dosis programada"}
            </h1>

            <p
              className="
                text-[#747970]
                mt-2
                text-base
                md:text-lg
              "
            >
              {medicamentoPrincipal
                ? `${medicamentoPrincipal.presentacion ?? "Sin presentación"} • ${
                    medicamentoPrincipal.descripcion ?? "Sin indicaciones"
                  }`
                : "Cargá medicamentos y recordatorios para ver la próxima dosis."}
            </p>

            <div className="mt-8 md:mt-12">

              <p
                className="
                  text-[#747970]
                  text-base
                  md:text-lg
                "
              >
                {esDosisManana ? "Programada para mañana a las" : "Programada para las"}
              </p>

              <h2
                className="
                  text-4xl
                  md:text-5xl
                  font-bold
                  text-[#2E7D32]
                  mt-2
                "
              >
                {horaProgramada}
              </h2>

            </div>

            <div
              className="
                flex
                flex-col
                sm:flex-row

                gap-3
                md:gap-4

                mt-8
                md:mt-12
              "
            >

              <button
                onClick={confirmarProximaDosis}
                disabled={esDosisManana || !puedeConfirmarHorario(proximoRecordatorio?.fechaHoraProgramada)}
                title={
                  esDosisManana
                    ? "Las dosis de hoy ya están completas."
                    : textoVentanaConfirmacion(proximoRecordatorio?.fechaHoraProgramada)
                }
                className="
                  action-button

                  flex-1

                  bg-[#2E7D32]
                  text-white

                  font-bold

                  py-3
                  md:py-4

                  rounded-2xl
                  disabled:bg-gray-300
                  disabled:text-gray-600
                  disabled:cursor-not-allowed
                  disabled:shadow-none
                "
              >
                Confirmar dosis
              </button>

              <button
                type="button"
                onClick={() => setMostrarOmitir(true)}
                disabled={!proximoRecordatorio || esDosisManana || !puedeConfirmarHorario(proximoRecordatorio?.fechaHoraProgramada)}
                className="
                  secondary-button

                  flex-1

                  border
                  border-[#D7D7D7]

                  text-[#212121]

                  py-3
                  md:py-4

                  rounded-2xl
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                Omitir
              </button>

            </div>

          </div>          {/* PANEL DERECHO */}

          <div
            className="
              flex
              flex-col
              gap-4
              md:gap-6
            "
          >

            <div
              className="
                dashboard-card

                bg-white
                rounded-3xl

                p-5
                md:p-6

                border
                border-gray-200

                shadow-sm

                animate-[softReveal_.9s_ease-out]
              "
            >

              <p
                className="
                  text-[#747970]
                  text-sm
                  md:text-base
                "
              >
                Progreso del día
              </p>

              <h3
                className="
                  text-3xl
                  md:text-4xl

                  font-bold

                  mt-3

                  text-[#2E7D32]
                "
              >
                {tomasCompletadas}/{recordatorios.length || 0}
              </h3>

              <p
                className="
                  text-[#747970]
                  mt-2
                  text-sm
                  md:text-base
                "
              >
                dosis completadas
              </p>

            </div>

            <div
              className="
                dashboard-card

                bg-white
                rounded-3xl

                p-5
                md:p-6

                border
                border-gray-200

                shadow-sm

                animate-[softReveal_1.05s_ease-out]
              "
            >

              <p
                className="
                  text-[#747970]
                  text-sm
                  md:text-base
                "
              >
                Próximo recordatorio
              </p>

              <h3
                className="
                  text-xl
                  md:text-2xl

                  font-bold
                  mt-3
                "
              >
                {medicamentoPrincipal?.nombre ?? "Sin recordatorios"}
              </h3>

              <p
                className="
                  text-[#747970]
                  mt-2

                  text-sm
                  md:text-base
                "
              >
                {horaProgramada}
              </p>

            </div>

          </div>

        </div>

        {alertas.length > 0 && <section className="mt-7 rounded-3xl border border-[#F1D5A8] bg-[#FFF8E1] p-5 sm:p-6" aria-label="Alertas de tratamiento">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#B45309]"><AlertTriangle size={21} /></span>
            <div><h3 className="text-lg font-bold text-[#7C3E00]">Atención a tu tratamiento</h3><ul className="mt-2 space-y-1 text-sm text-[#6B4B24]">{alertas.map((alerta) => <li key={alerta}>• {alerta}</li>)}</ul></div>
          </div>
        </section>}

        {/* ACCESOS RÁPIDOS */}

        <section className="hidden md:block mt-14 pb-8">

          <div className="flex justify-between items-center gap-3">

            <h3
              className="
                text-2xl
                md:text-5xl
                font-bold
                animate-[softReveal_1.15s_ease-out]
              "
            >
              Accesos rápidos
            </h3>

          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3

              gap-4
              md:gap-5

              mt-5
              md:mt-6
            "
          >

            {/* MEDICAMENTOS */}

            <Link
              to="/app/medicamentos"
              className="
                quick-card
                animate-[softReveal_1.25s_ease-out]
              "
            >

              <div className="mb-4">

                <img
                  src={pastillasIcon}
                  alt="Medicamentos"
                  className="
                    quick-icon
                    w-10
                    h-10
                    md:w-12
                    md:h-12
                    object-contain
                  "
                />

              </div>

              <p
                className="
                  font-bold
                  text-base
                  md:text-lg
                  text-[#212121]
                "
              >
                Medicamentos
              </p>

              <p
                className="
                  text-sm
                  text-[#747970]
                  mt-2
                "
              >
                Ver tratamientos activos
              </p>

            </Link>

            {/* RECETAS */}

            <Link
              to="/app/recetas"
              className="
                quick-card
                animate-[softReveal_1.35s_ease-out]
              "
            >

              <div className="mb-4">

                <img
                  src={recetaIcon}
                  alt="Recetas"
                  className="
                    quick-icon
                    w-10
                    h-10
                    md:w-12
                    md:h-12
                    object-contain
                  "
                />

              </div>

              <p
                className="
                  font-bold
                  text-base
                  md:text-lg
                  text-[#212121]
                "
              >
                Recetas
              </p>

              <p
                className="
                  text-sm
                  text-[#747970]
                  mt-2
                "
              >
                Recetario digital
              </p>

            </Link>

            {/* RECORDATORIOS */}

            <Link
              to="/app/recordatorios"
              className="
                quick-card
                animate-[softReveal_1.45s_ease-out]
              "
            >

              <div className="mb-4">

                <img
                  src={recordatorioIcon}
                  alt="Recordatorios"
                  className="
                    quick-icon
                    w-10
                    h-10
                    md:w-12
                    md:h-12
                    object-contain
                  "
                />

              </div>

              <p
                className="
                  font-bold
                  text-base
                  md:text-lg
                  text-[#212121]
                "
              >
                Recordatorios
              </p>

              <p
                className="
                  text-sm
                  text-[#747970]
                  mt-2
                "
              >
                Gestionar alertas y horarios
              </p>

            </Link>

          </div>

        </section>      </div>

      <Modal open={mostrarOmitir} title="Omitir esta dosis" onClose={() => !guardandoOmision && setMostrarOmitir(false)}>
        <p className="mt-3 text-[#747970]">La dosis quedará registrada como omitida. Si querés, contanos el motivo.</p>
        <label className="mt-5 grid gap-2 text-sm font-semibold">
          Motivo (opcional)
          <textarea value={motivoOmision} onChange={(event) => setMotivoOmision(event.target.value)} maxLength={250} rows={3} placeholder="Por ejemplo: estaba fuera de casa" className="rounded-2xl border border-gray-300 p-3 font-normal outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10" />
        </label>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <Button type="button" onClick={() => setMostrarOmitir(false)} disabled={guardandoOmision} className="flex-1 border border-gray-300 py-3">Cancelar</Button>
          <Button type="button" onClick={omitirProximaDosis} loading={guardandoOmision} className="flex-1 bg-[#B45309] py-3 text-white">Registrar omisión</Button>
        </div>
      </Modal>

      <style>{`
        @keyframes pageAppear {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes softReveal {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dashboard-card {
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-2px);

          box-shadow:
            0 8px 20px rgba(0,0,0,.04);
        }

        .quick-card {
          background: white;

          padding: 1.5rem;

          border-radius: 1.5rem;

          border: 1px solid #e5e7eb;

          box-shadow:
            0 1px 2px rgba(0,0,0,.03);

          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
        }

        .quick-card:hover {
          transform: translateY(-2px);

          border-color: rgba(46,125,50,.25);

          box-shadow:
            0 10px 24px rgba(0,0,0,.05);
        }

        .quick-icon {
          transition:
            transform .25s ease;
        }

        .quick-card:hover .quick-icon {
          transform: scale(1.03);
        }

        .action-button {
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            opacity .2s ease;
        }

        .action-button:hover {
          transform: translateY(-1px);

          box-shadow:
            0 8px 16px rgba(46,125,50,.15);
        }

        .action-button:active {
          transform: scale(.99);
        }

        .secondary-button {
          transition:
            background-color .2s ease,
            transform .2s ease;
        }

        .secondary-button:hover {
          background: #f8f8f8;

          transform: translateY(-1px);
        }

        .secondary-button:active {
          transform: scale(.99);
        }
      `}</style>    </section>
  );
}

function obtenerUsuarioActual(): UsuarioApi | null {
  const guardado = localStorage.getItem("cuidarPlusUsuario");
  return guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
}

function minutosParaProximaDosis(fechaHora: string, forzarManana = false) {
  const diferencia = minutosHastaHorario(fechaHora);
  if (diferencia === null) return Number.MAX_SAFE_INTEGER;
  if (forzarManana) return diferencia + 1440;
  return diferencia < -15 ? diferencia + 1440 : diferencia;
}
