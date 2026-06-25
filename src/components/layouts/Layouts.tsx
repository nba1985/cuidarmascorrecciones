import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { History } from "lucide-react";

import iconoCasa from "../../assets/svg/home.svg";
import recordatorioIcon from "../../assets/svg/recordatorio.svg";
import medicamentoIcon from "../../assets/svg/pastillas.png";
import perfilIcon from "../../assets/svg/perfil.svg";
import recetaIcon from "../../assets/svg/receta.svg";
import logo from "../../assets/img/logo.png";
import { resolverUrlArchivo, type UsuarioApi } from "../../services/api";
import { RecordatorioAlarma } from "../RecordatorioAlarma";

export function Layouts() {
  const guardado = localStorage.getItem("cuidarPlusUsuario");
  const usuario = guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
  const fotoPerfil = resolverUrlArchivo(usuario?.foto) || "https://i.pravatar.cc/80";
  const [textoGrande, setTextoGrande] = useState(() => localStorage.getItem("cuidarPlusTextoGrande") === "true");

  useEffect(() => {
    document.documentElement.classList.toggle("texto-grande", textoGrande);
    localStorage.setItem("cuidarPlusTextoGrande", String(textoGrande));
    return () => document.documentElement.classList.remove("texto-grande");
  }, [textoGrande]);

  return (
    <div className="min-h-screen max-w-full overflow-x-clip bg-[#F5F5F5] text-[#212121] flex flex-col">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white px-4 py-3">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* LOGO */}
          <Link to="/app" className="shrink-0">
            <img
              src={logo}
              alt="Logo"
              className="h-14 w-auto sm:h-16 xl:h-20"
            />
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden xl:flex min-w-0 items-center gap-5 2xl:gap-8 text-lg 2xl:text-xl">

            <Link
              to="/app"
              className="hover:text-[#2E7D32] transition"
            >
              Inicio
            </Link>

            <Link
              to="/app/medicamentos"
              className="hover:text-[#2E7D32] transition"
            >
              Medicamentos
            </Link>

            <Link
              to="/app/recordatorios"
              className="hover:text-[#2E7D32] transition"
            >
              Recordatorios
            </Link>

            <Link
              to="/app/recetas"
              className="hover:text-[#2E7D32] transition"
            >
              Recetas
            </Link>

            <Link
              to="/app/historial"
              className="hover:text-[#2E7D32] transition"
            >
              Historial
            </Link>

            <Link
              to="/app/perfil"
              className="hover:text-[#2E7D32] transition"
            >
              Perfil
            </Link>

          </nav>

          {/* PERFIL */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => setTextoGrande((activo) => !activo)} aria-pressed={textoGrande} aria-label={textoGrande ? "Usar tamaño de texto normal" : "Usar texto grande"} title="Cambiar tamaño de texto" className={`grid h-10 min-w-10 place-items-center rounded-full border px-2 text-sm font-bold transition ${textoGrande ? "border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32]" : "border-gray-200 bg-white"}`}>A+</button>
            <RecordatorioAlarma />
            <Link to="/app/perfil">
              <img
                src={fotoPerfil}
                alt="perfil"
                className="
                w-9
                h-9
                sm:w-10
                sm:h-10
                rounded-full
                object-cover
                cursor-pointer
                hover:scale-105
                transition
                border-2
                border-transparent
                hover:border-[#2E7D32]/30
                "
              />
            </Link>
          </div>

        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 min-w-0 w-full max-w-full overflow-x-clip px-3 md:px-4 pb-28 xl:pb-6">
        <Outlet />
      </main>

      {/* FOOTER MOBILE */}
      <footer className="xl:hidden fixed bottom-0 left-0 right-0 w-full max-w-full overflow-hidden bg-white border-t border-gray-200 shadow-lg z-50">

        <ul className="grid grid-cols-6 items-end py-2 px-1">

          {/* INICIO */}
          <li className="min-w-0">
            <Link
              to="/app"
              className="flex min-w-0 flex-col items-center justify-center gap-1 text-[8px] sm:text-[9px]"
            >

              <img
                src={iconoCasa}
                alt="Inicio"
                className="w-6 h-6 object-contain"
              />

              <span>Inicio</span>

            </Link>
          </li>

          {/* MEDICAMENTOS */}
          <li className="min-w-0">
            <Link
              to="/app/medicamentos"
              className="flex min-w-0 flex-col items-center justify-center gap-1 text-[8px] sm:text-[9px]"
            >
              <img
                src={medicamentoIcon}
                alt="Medicamentos"
                className="w-7 h-7 object-contain"
              />

              <span className="text-center leading-tight" aria-label="Medicamentos">Medic.</span>
            </Link>
          </li>

          {/* RECORDATORIOS */}
          <li className="min-w-0">
            <Link
              to="/app/recordatorios"
              className="flex min-w-0 flex-col items-center justify-center gap-1 text-[8px] sm:text-[9px]"
            >
              <img
                src={recordatorioIcon}
                alt="Recordatorios"
                className="w-7 h-7 object-contain"
              />

              <span className="text-center leading-tight" aria-label="Recordatorios">Avisos</span>
            </Link>
          </li>

          {/* RECETAS */}
          <li className="min-w-0">
            <Link
              to="/app/recetas"
              className="flex min-w-0 flex-col items-center justify-center gap-1 text-[8px] sm:text-[9px]"
            >
              <img
                src={recetaIcon}
                alt="Recetas"
                className="w-7 h-7 object-contain"
              />

              <span>Recetas</span>
            </Link>
          </li>

          {/* HISTORIAL */}
          <li className="min-w-0">
            <Link
              to="/app/historial"
              className="flex min-w-0 flex-col items-center justify-center gap-1 text-[8px] sm:text-[9px]"
            >
              <History aria-hidden="true" className="h-7 w-7" strokeWidth={1.8} />
              <span>Historial</span>
            </Link>
          </li>

          {/* PERFIL */}
          <li className="min-w-0">
            <Link
              to="/app/perfil"
              className="flex min-w-0 flex-col items-center justify-center gap-1 text-[8px] sm:text-[9px]"
            >
              <img
                src={perfilIcon}
                alt="Perfil"
                className="w-7 h-7 object-contain"
              />

              <span>Perfil</span>
            </Link>
          </li>

        </ul>

      </footer>
    </div>
  );
}
