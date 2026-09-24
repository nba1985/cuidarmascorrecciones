import type { HistorialAnimoApi, RegistroTomaApi } from "../services/api";

export function GraficosHistorial({ tomas, animos }: { tomas: RegistroTomaApi[]; animos: HistorialAnimoApi[] }) {
  const dias = Array.from({ length: 7 }, (_, indice) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - (6 - indice));
    const registros = tomas.filter((item) => new Date(item.fechaHoraReal).toDateString() === fecha.toDateString());
    return { etiqueta: fecha.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" }), tomadas: registros.filter((item) => item.estado).length, omitidas: registros.filter((item) => !item.estado).length };
  });
  const maximo = Math.max(1, ...dias.map((dia) => dia.tomadas + dia.omitidas));
  const bajos = animos.filter((item) => item.idEstado === 3).length;
  const porcentaje = animos.length ? Math.round(bajos / animos.length * 100) : 0;

  return <section className="mt-5 grid gap-4 lg:grid-cols-2" aria-label="Gráficos del historial">
    <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">Tomas de los últimos 7 días</h2>
      <p className="mt-1 text-sm text-[#747970]">Verde: confirmadas · Ámbar: omitidas</p>
      <div className="mt-5 grid h-44 grid-cols-7 items-end gap-2">
        {dias.map((dia) => <div key={dia.etiqueta} className="flex h-full flex-col items-center justify-end gap-1" title={`${dia.etiqueta}: ${dia.tomadas} confirmadas, ${dia.omitidas} omitidas`}>
          <div className="flex w-full max-w-10 flex-col justify-end overflow-hidden rounded-t-lg" style={{ height: `${Math.max(5, (dia.tomadas + dia.omitidas) / maximo * 100)}%` }}>
            {dia.omitidas > 0 && <div className="bg-amber-400" style={{ flex: dia.omitidas }} />}
            {dia.tomadas > 0 && <div className="bg-[#2E7D32]" style={{ flex: dia.tomadas }} />}
          </div><span className="text-center text-xs">{dia.etiqueta}</span>
        </div>)}
      </div>
    </article>
    <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">Reportes de malestar</h2>
      <p className="mt-1 text-sm text-[#747970]">Proporción del período seleccionado</p>
      <div className="mt-5 flex items-center gap-5">
        <div role="img" aria-label={`${porcentaje}% de estados bajos`} title={`${bajos} de ${animos.length} registros`} className="grid h-36 w-36 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#D97706 ${porcentaje}%, #2E7D32 ${porcentaje}% 100%)` }}>
          <span className="grid h-24 w-24 place-items-center rounded-full bg-white text-2xl font-bold">{porcentaje}%</span>
        </div>
        <div className="text-sm"><p><span className="text-amber-600">●</span> Malestar: {bajos}</p><p className="mt-2"><span className="text-[#2E7D32]">●</span> Otros estados: {animos.length - bajos}</p></div>
      </div>
    </article>
  </section>;
}
