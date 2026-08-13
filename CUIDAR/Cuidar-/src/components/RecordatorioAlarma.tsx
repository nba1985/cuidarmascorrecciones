import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellRing, Check, Play, Volume2 } from "lucide-react";
import { obtenerRecordatoriosUsuario, posponerRecordatorio, type RecordatorioApi, type UsuarioApi } from "../services/api";
import { minutosHastaHorario } from "../utils/horarios";

const RINGTONES = ["Chirp.mp3", "Arpeggio.mp3", "Departure.mp3", "Chalet.mp3", "Journey.mp3"] as const;
type Ringtone = (typeof RINGTONES)[number];

function ringtoneInicial(): Ringtone {
  const guardado = localStorage.getItem("cuidarPlusRingtone");
  return RINGTONES.includes(guardado as Ringtone) ? (guardado as Ringtone) : "Chirp.mp3";
}

export function RecordatorioAlarma() {
  const [activo, setActivo] = useState<RecordatorioApi | null>(null);
  const [permiso, setPermiso] = useState<NotificationPermission>(
    typeof Notification === "undefined" ? "denied" : Notification.permission
  );
  const [configuracionAbierta, setConfiguracionAbierta] = useState(false);
  const [ringtoneGuardado, setRingtoneGuardado] = useState<Ringtone>(ringtoneInicial);
  const [ringtoneSeleccionado, setRingtoneSeleccionado] = useState<Ringtone>(ringtoneInicial);
  const [probando, setProbando] = useState<Ringtone | null>(null);
  const [posponiendo, setPosponiendo] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const intervaloSonidoRef = useRef<number | null>(null);
  const revisandoRef = useRef(false);

  const detenerSonido = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    if (intervaloSonidoRef.current !== null) {
      window.clearInterval(intervaloSonidoRef.current);
      intervaloSonidoRef.current = null;
    }
  }, []);

  const sonar = useCallback(async () => {
    audioRef.current ??= new AudioContext();
    const contexto = audioRef.current;
    try {
      if (contexto.state !== "running") await contexto.resume();
    } catch {
      return;
    }
    if (contexto.state !== "running") return;

    const oscilador = contexto.createOscillator();
    const ganancia = contexto.createGain();
    oscilador.frequency.setValueAtTime(880, contexto.currentTime);
    ganancia.gain.setValueAtTime(0.0001, contexto.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(0.18, contexto.currentTime + 0.02);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + 0.7);
    oscilador.connect(ganancia);
    ganancia.connect(contexto.destination);
    oscilador.start();
    oscilador.stop(contexto.currentTime + 0.75);
  }, []);

  const reproducirRingtone = useCallback(async (prueba = false, ringtoneElegido: Ringtone = ringtoneGuardado) => {
    const ruta = `/audio/${encodeURIComponent(ringtoneElegido)}`;
    if (!ringtoneRef.current || !ringtoneRef.current.src.endsWith(ruta)) {
      detenerSonido();
      ringtoneRef.current = new Audio(ruta);
    }
    const ringtone = ringtoneRef.current;
    ringtone.loop = !prueba;
    ringtone.volume = 0.85;
    ringtone.currentTime = 0;

    try {
      await ringtone.play();
      if (prueba) {
        window.setTimeout(() => {
          ringtone.pause();
          ringtone.currentTime = 0;
        }, 2_500);
      }
    } catch {
      await sonar();
      if (!prueba) intervaloSonidoRef.current = window.setInterval(() => void sonar(), 2_500);
    }
  }, [detenerSonido, ringtoneGuardado, sonar]);

  const revisarRecordatorios = useCallback(async () => {
    if (revisandoRef.current) return;
    const guardado = localStorage.getItem("cuidarPlusUsuario");
    const usuario = guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
    if (!usuario?.idUsuario) return;

    revisandoRef.current = true;
    try {
      const recordatorios = await obtenerRecordatoriosUsuario(usuario.idUsuario);
      const encontrado = recordatorios.find((recordatorio) => {
        const diferencia = minutosHastaHorario(recordatorio.fechaHoraProgramada);
        if (diferencia === null || diferencia > 1 || diferencia < -5) return false;
        return !localStorage.getItem(claveAviso(recordatorio));
      });
      if (!encontrado) return;

      localStorage.setItem(claveAviso(encontrado), "1");
      setActivo(encontrado);
      if (Notification.permission === "granted") {
        const registro = await navigator.serviceWorker.ready;
        await registro.showNotification("Hora de tu medicación", {
          body: `Es momento de tomar ${encontrado.canal || "tu medicamento"}.`,
          icon: "/logo%20mas%20ok.png",
          badge: "/logo%20mas%20ok.png",
          tag: `recordatorio-${encontrado.idRecordatorio}`,
          requireInteraction: true,
        });
      }
    } catch {
      // Se vuelve a intentar en la próxima revisión.
    } finally {
      revisandoRef.current = false;
    }
  }, []);

  useEffect(() => {
    const inicio = window.setTimeout(() => void revisarRecordatorios(), 0);
    const intervalo = window.setInterval(() => void revisarRecordatorios(), 30_000);
    return () => {
      window.clearTimeout(inicio);
      window.clearInterval(intervalo);
    };
  }, [revisarRecordatorios]);

  useEffect(() => {
    if (!activo) {
      detenerSonido();
      return;
    }
    void reproducirRingtone();
    return detenerSonido;
  }, [activo, detenerSonido, reproducirRingtone]);

  async function activarAvisos() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("Este navegador no admite notificaciones de la aplicación.");
      return;
    }
    audioRef.current ??= new AudioContext();
    await audioRef.current.resume().catch(() => undefined);
    const resultado = await Notification.requestPermission();
    setPermiso(resultado);
    if (resultado === "granted") {
      localStorage.setItem("cuidarPlusAvisosActivados", "1");
      alert("Notificaciones activadas correctamente.");
    } else {
      alert("El navegador no concedió el permiso. Podés cambiarlo desde la configuración del sitio.");
    }
  }

  async function probarRingtone(ringtone: Ringtone) {
    setRingtoneSeleccionado(ringtone);
    setProbando(ringtone);
    await reproducirRingtone(true, ringtone);
    window.setTimeout(() => setProbando((actual) => actual === ringtone ? null : actual), 2_500);
  }

  function guardarRingtone() {
    detenerSonido();
    localStorage.setItem("cuidarPlusRingtone", ringtoneSeleccionado);
    setRingtoneGuardado(ringtoneSeleccionado);
    setConfiguracionAbierta(false);
    alert(`Tono ${nombreRingtone(ringtoneSeleccionado)} guardado.`);
  }

  function cerrarConfiguracion() {
    detenerSonido();
    setProbando(null);
    setRingtoneSeleccionado(ringtoneGuardado);
    setConfiguracionAbierta(false);
  }

  async function posponerAviso() {
    if (!activo) return;
    try {
      setPosponiendo(true);
      detenerSonido();
      await posponerRecordatorio(activo.idRecordatorio, 10);
      setActivo(null);
    } catch {
      await reproducirRingtone(false, ringtoneGuardado);
      alert("No se pudo posponer el aviso. Intentá nuevamente.");
    } finally {
      setPosponiendo(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          detenerSonido();
          setRingtoneSeleccionado(ringtoneGuardado);
          setConfiguracionAbierta(true);
        }}
        title={permiso === "granted" ? `Ringtone: ${nombreRingtone(ringtoneGuardado)}` : "Configurar sonido y notificaciones"}
        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[#2E7D32] hover:bg-[#2E7D32]/10"
      >
        {permiso === "granted" ? <BellRing size={20} /> : <Bell size={20} />}
      </button>

      {configuracionAbierta && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="sonido-title" className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-5 shadow-xl sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#2E7D32]">NOTIFICACIONES</p>
                <h2 id="sonido-title" className="mt-1 text-2xl font-bold">Sonido de recordatorios</h2>
              </div>
              <button type="button" onClick={cerrarConfiguracion} className="h-10 w-10 rounded-full hover:bg-gray-100" aria-label="Cerrar configuración">×</button>
            </div>

            <div className={`mt-5 flex flex-col items-start justify-between gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${permiso === "granted" ? "border-[#B7D8B9] bg-[#F7FBF7]" : "border-gray-200 bg-gray-50"}`}>
              <div>
                <p className="font-semibold">Notificaciones {permiso === "granted" ? "activadas" : "desactivadas"}</p>
                <p className="mt-1 text-sm text-[#747970]">{permiso === "granted" ? "El navegador mostrará avisos mientras la aplicación esté abierta." : "Activá el permiso para recibir avisos del navegador."}</p>
              </div>
              {permiso !== "granted" && <button type="button" onClick={() => void activarAvisos()} className="shrink-0 rounded-xl border border-[#2E7D32] px-3 py-2 text-sm font-semibold text-[#2E7D32]">Activar notificaciones</button>}
            </div>

            <fieldset className="mt-6">
              <legend className="font-bold">Elegí un tono</legend>
              <p className="mt-1 text-sm text-[#747970]">Podés escucharlos antes de guardar.</p>
              <div className="mt-4 grid gap-3">
                {RINGTONES.map((ringtone) => {
                  const seleccionado = ringtoneSeleccionado === ringtone;
                  return (
                    <div key={ringtone} className={`flex items-center gap-2 rounded-2xl border p-2 transition ${seleccionado ? "border-[#2E7D32] bg-[#F7FBF7] ring-2 ring-[#2E7D32]/10" : "border-gray-200"}`}>
                      <button type="button" onClick={() => setRingtoneSeleccionado(ringtone)} aria-pressed={seleccionado} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 text-left">
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${seleccionado ? "border-[#2E7D32] bg-[#2E7D32] text-white" : "border-gray-300"}`}>{seleccionado && <Check size={15} />}</span>
                        <span className="font-semibold">{nombreRingtone(ringtone)}</span>
                        {ringtoneGuardado === ringtone && <span className="ml-auto hidden text-xs text-[#747970] sm:inline">Actual</span>}
                      </button>
                      <button type="button" onClick={() => void probarRingtone(ringtone)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#386641] hover:bg-[#E8F5E9]">
                        <Play size={15} fill="currentColor" /> {probando === ringtone ? "Sonando" : "Escuchar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" onClick={cerrarConfiguracion} className="flex-1 rounded-2xl border border-gray-300 py-3 font-semibold">Cancelar</button>
              <button type="button" onClick={guardarRingtone} disabled={ringtoneSeleccionado === ringtoneGuardado} className="flex-1 rounded-2xl bg-[#2E7D32] py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">Guardar tono</button>
            </div>
          </section>
        </div>
      )}

      {activo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-7 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2E7D32]/10 text-[#2E7D32]"><Volume2 size={32} /></div>
            <h2 className="mt-5 text-3xl font-bold">Hora de tu medicación</h2>
            <p className="mt-3 text-lg text-[#747970]">Es momento de tomar <strong className="text-[#212121]">{activo.canal || "tu medicamento"}</strong>.</p>
            <button type="button" onClick={() => setActivo(null)} className="mt-7 w-full rounded-2xl bg-[#2E7D32] py-4 font-bold text-white">Cerrar aviso</button>
            <button type="button" onClick={() => void posponerAviso()} disabled={posponiendo} className="mt-3 w-full rounded-2xl border border-gray-300 py-3 font-semibold disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400">{posponiendo ? "Posponiendo..." : "Posponer toma 10 minutos"}</button>
          </div>
        </div>
      )}
    </>
  );
}

function claveAviso(recordatorio: RecordatorioApi) {
  const fecha = new Date(recordatorio.fechaHoraProgramada);
  const horario = Number.isNaN(fecha.getTime())
    ? recordatorio.fechaHoraProgramada
    : [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, "0"),
        String(fecha.getDate()).padStart(2, "0"),
        String(fecha.getHours()).padStart(2, "0"),
        String(fecha.getMinutes()).padStart(2, "0"),
      ].join("");
  return `cuidarPlusAviso-${recordatorio.idRecordatorio}-${horario}`;
}

function nombreRingtone(ringtone: Ringtone) {
  return ringtone.replace(".mp3", "");
}
