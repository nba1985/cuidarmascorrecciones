import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, Volume2 } from "lucide-react";
import { obtenerRecordatoriosUsuario, type RecordatorioApi, type UsuarioApi } from "../services/api";
import { minutosHastaHorario } from "../utils/horarios";

const RINGTONES = ["Chirp.mp3", "Arpeggio.mp3", "Departure.mp3", "Chalet.mp3", "Journey.mp3"] as const;
type Ringtone = (typeof RINGTONES)[number];

export function RecordatorioAlarma() {
  const [activo, setActivo] = useState<RecordatorioApi | null>(null);
  const [permiso, setPermiso] = useState<NotificationPermission>(
    typeof Notification === "undefined" ? "denied" : Notification.permission
  );
  const [configuracionAbierta, setConfiguracionAbierta] = useState(false);
  const [ringtoneSeleccionado, setRingtoneSeleccionado] = useState<Ringtone>(() => {
    const guardado = localStorage.getItem("cuidarPlusRingtone");
    return RINGTONES.includes(guardado as Ringtone) ? (guardado as Ringtone) : "Chirp.mp3";
  });
  const audioRef = useRef<AudioContext | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const intervaloSonidoRef = useRef<number | null>(null);
  const revisandoRef = useRef(false);

  useEffect(() => {
    revisarRecordatorios();
    const intervalo = window.setInterval(revisarRecordatorios, 30_000);
    return () => window.clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (!activo) {
      detenerSonido();
      return;
    }

    void reproducirRingtone();
    return detenerSonido;
  }, [activo]);

  async function activarAvisos() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("Este navegador no admite notificaciones de la aplicación.");
      return;
    }

    audioRef.current ??= new AudioContext();
    await audioRef.current.resume();
    await reproducirRingtone(true);
    const resultado = await Notification.requestPermission();
    setPermiso(resultado);

    if (resultado === "granted") {
      localStorage.setItem("cuidarPlusAvisosActivados", "1");
      localStorage.setItem("cuidarPlusRingtone", ringtoneSeleccionado);
      setConfiguracionAbierta(false);
      alert("Recordatorios activados. El tono que escuchaste es el sonido de prueba.");
    }
  }

  async function revisarRecordatorios() {
    if (revisandoRef.current) return;

    const guardado = localStorage.getItem("cuidarPlusUsuario");
    const usuario = guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
    if (!usuario?.idUsuario) return;

    revisandoRef.current = true;
    try {
      const recordatorios = await obtenerRecordatoriosUsuario(usuario.idUsuario);
      const encontrado = recordatorios.find((recordatorio) => {
        const diferencia = minutosHastaHorario(recordatorio.fechaHoraProgramada);
        // Tolera pestañas en segundo plano o equipos suspendidos sin disparar
        // recordatorios futuros antes de tiempo.
        if (diferencia === null || diferencia > 1 || diferencia < -5) return false;

        const clave = claveAviso(recordatorio);
        return !localStorage.getItem(clave);
      });

      if (!encontrado) return;

      // La clave incluye el horario: si el usuario lo cambia, el nuevo aviso no
      // queda bloqueado por una alarma anterior del mismo día.
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
      // La alarma vuelve a intentar en la próxima revisión.
    } finally {
      revisandoRef.current = false;
    }
  }

  async function sonar() {
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
  }

  async function reproducirRingtone(prueba = false) {
    const ruta = `/audio/${encodeURIComponent(ringtoneSeleccionado)}`;
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
      if (!prueba) {
        intervaloSonidoRef.current = window.setInterval(() => void sonar(), 2_500);
      }
    }
  }

  function detenerSonido() {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    if (intervaloSonidoRef.current !== null) {
      window.clearInterval(intervaloSonidoRef.current);
      intervaloSonidoRef.current = null;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfiguracionAbierta(true)}
        title={permiso === "granted" ? `Ringtone: ${ringtoneSeleccionado.replace(".mp3", "")}` : "Configurar sonido y notificaciones"}
        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[#2E7D32] hover:bg-[#2E7D32]/10"
      >
        {permiso === "granted" ? <BellRing size={20} /> : <Bell size={20} />}
      </button>

      {configuracionAbierta && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#2E7D32]">NOTIFICACIONES</p>
                <h2 className="text-2xl font-bold mt-1">Elegí el ringtone</h2>
              </div>
              <button type="button" onClick={() => setConfiguracionAbierta(false)} className="w-10 h-10 rounded-full hover:bg-gray-100" aria-label="Cerrar configuración">×</button>
            </div>

            <select
              value={ringtoneSeleccionado}
              onChange={(event) => setRingtoneSeleccionado(event.target.value as Ringtone)}
              className="w-full mt-6 border border-gray-300 rounded-2xl p-4 bg-white outline-none focus:border-[#2E7D32]"
              aria-label="Ringtone de recordatorios"
            >
              {RINGTONES.map((ringtone) => (
                <option key={ringtone} value={ringtone}>{ringtone.replace(".mp3", "")}</option>
              ))}
            </select>

            <button type="button" onClick={() => void activarAvisos()} className="w-full mt-5 bg-[#2E7D32] text-white rounded-2xl py-4 font-bold">
              Guardar, activar y probar
            </button>
          </div>
        </div>
      )}

      {activo && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-7 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
              <Volume2 size={32} />
            </div>
            <h2 className="text-3xl font-bold mt-5">Hora de tu medicación</h2>
            <p className="text-[#747970] text-lg mt-3">
              Es momento de tomar <strong className="text-[#212121]">{activo.canal || "tu medicamento"}</strong>.
            </p>
            <button
              type="button"
              onClick={() => setActivo(null)}
              className="w-full mt-7 bg-[#2E7D32] text-white rounded-2xl py-4 font-bold"
            >
              Cerrar aviso
            </button>
            <button
              type="button"
              onClick={() => void reproducirRingtone()}
              className="w-full mt-3 border border-gray-300 rounded-2xl py-3 font-semibold"
            >
              Activar o probar sonido
            </button>
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
