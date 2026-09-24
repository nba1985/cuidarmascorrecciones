import { useState } from "react";
import type { MedicamentoApi } from "../services/api";

type Props = {
  value: string;
  catalogo: MedicamentoApi[];
  onChange: (value: string) => void;
  onSelect: (medicamento: MedicamentoApi) => void;
};

export function MedicamentoCombobox({ value, catalogo, onChange, onSelect }: Props) {
  const [abierto, setAbierto] = useState(false);
  const sugerencias = catalogo
    .filter((item) => item.nombre.toLocaleLowerCase("es-AR").includes(value.toLocaleLowerCase("es-AR")))
    .slice(0, 8);

  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-label="Nombre del medicamento"
        aria-autocomplete="list"
        aria-expanded={abierto}
        aria-controls="opciones-medicamentos"
        value={value}
        onChange={(event) => { onChange(event.target.value); setAbierto(true); }}
        onFocus={() => setAbierto(true)}
        onBlur={() => window.setTimeout(() => setAbierto(false), 150)}
        onKeyDown={(event) => { if (event.key === "Escape") setAbierto(false); }}
        placeholder="Buscar medicamento del catálogo"
        required
        className="w-full rounded-2xl border border-gray-300 p-3 outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10"
      />
      {abierto && sugerencias.length > 0 && (
        <div id="opciones-medicamentos" role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-gray-300 bg-white p-1 shadow-lg">
          {sugerencias.map((item) => (
            <button key={item.idMedicamento} type="button" role="option" aria-selected={value === item.nombre}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { onSelect(item); setAbierto(false); }}
              className="block w-full rounded-xl px-3 py-2 text-left hover:bg-[#E8F5E9] focus:bg-[#E8F5E9]">
              <span className="font-semibold">{item.nombre}</span>
              {item.presentacion && <span className="ml-2 text-sm text-gray-600">{item.presentacion}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
