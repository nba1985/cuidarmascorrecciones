import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { History, Moon, Sun } from "lucide-react";

import iconoCasa from "../../assets/svg/home.svg";
import recordatorioIcon from "../../assets/svg/recordatorio.svg";
import perfilIcon from "../../assets/svg/perfil.svg";
import recetaIcon from "../../assets/svg/receta.svg";
import logo from "../../assets/img/logo.png";
import logoModoOscuro from "../../assets/img/logo-modo-oscuro.png";
import pastillasIcon from "../../assets/img/pastillas-ok.png";
import pastillasIconModoOscuro from "../../assets/img/pastillas-ok-modo-oscuro.png";
import { resolverUrlArchivo, type UsuarioApi } from "../../services/api";
import { RecordatorioAlarma } from "../RecordatorioAlarma";

export function Layouts() {
  const guardado = localStorage.getItem("cuidarPlusUsuario");
  const usuario = guardado ? (JSON.parse(guardado) as UsuarioApi) : null;
  const fotoPerfil = resolverUrlArchivo(usuario?.foto) || "https://i.pravatar.cc/80";
  const [textoGrande, setTextoGrande] = useState(() => localStorage.getItem("cuidarPlusTextoGrande") === "true");
  const [modoOscuro, setModoOscuro] = useState(() => localStorage.getItem("cuidarPlusModoOscuro") === "true");

  useEffect(() => {
    document.documentElement.classList.toggle("texto-grande", textoGrande);
    localStorage.setItem("cuidarPlusTextoGrande", String(textoGrande));
    return () => document.documentElement.classList.remove("texto-grande");
  }, [textoGrande]);

  useEffect(() => {
    document.documentElement.classList.toggle("modo-oscuro", modoOscuro);
    localStorage.setItem("cuidarPlusModoOscuro", String(modoOscuro));
    return () => document.documentElement.classList.remove("modo-oscuro");
  }, [modoOscuro]);

  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `mobile-bottom-nav-link ${isActive ? "is-active" : ""}`;

  return (
    <div className="min-h-screen max-w-full overflow-x-clip bg-[#F5F5F5] text-[#212121] flex flex-col">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white px-4 py-3">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* LOGO */}
          <Link to="/app" className="shrink-0">
            <img
              src={modoOscuro ? logoModoOscuro : logo}
              alt="Cuidar+"
              className="h-14 w-auto object-contain sm:h-16 xl:h-20"
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
            <button
              type="button"
              onClick={() => setModoOscuro((activo) => !activo)}
              aria-pressed={modoOscuro}
              aria-label={modoOscuro ? "Usar modo claro" : "Usar modo oscuro"}
              title={modoOscuro ? "Usar modo claro" : "Usar modo oscuro"}
              className={`grid h-10 min-w-10 place-items-center rounded-full border px-2 text-sm font-bold transition ${modoOscuro ? "border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32]" : "border-gray-200 bg-white"}`}
            >
              {modoOscuro ? <Sun size={18} /> : <Moon size={18} />}
            </button>
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

      {/* FOOTER INSTITUCIONAL */}
      <footer className="app-footer px-3 pb-32 pt-2 md:px-4 xl:pb-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-3xl border border-gray-200 bg-white px-5 py-5 text-sm text-[#747970] shadow-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-base font-bold text-[#2E7D32]">CUIDAR+</p>
            <p className="mt-1">Acompañamiento digital para tratamientos, recetas y recordatorios.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1 lg:justify-end">
            <span>Versión 1.0</span>
            <span>© 2026 CUIDAR+</span>
            <span className="max-w-xl">Ante dudas médicas, consultá siempre con un profesional.</span>
          </div>
        </div>
      </footer>

      {/* FOOTER MOBILE */}
      <footer className="mobile-bottom-nav xl:hidden fixed bottom-0 left-0 right-0 w-full max-w-full overflow-hidden bg-white border-t border-gray-200 shadow-lg z-50">

        <ul className="mobile-bottom-nav-list grid grid-cols-6 items-end px-1">

          {/* INICIO */}
          <li className="min-w-0">
            <NavLink
              end
              to="/app"
              className={mobileNavClass}
            >

              <img
                src={iconoCasa}
                alt="Inicio"
                className="mobile-bottom-nav-icon object-contain"
              />

              <span className="mobile-bottom-nav-label">Inicio</span>

            </NavLink>
          </li>

          {/* MEDICAMENTOS */}
          <li className="min-w-0">
            <NavLink
              to="/app/medicamentos"
              className={mobileNavClass}
            >
              <img
                src={modoOscuro ? pastillasIconModoOscuro : pastillasIcon}
                alt="Medicamentos"
                className="mobile-bottom-nav-icon mobile-bottom-nav-icon-medicamentos object-contain"
              />

              <span className="mobile-bottom-nav-label text-center" aria-label="Medicamentos">Medic.</span>
            </NavLink>
          </li>

          {/* RECORDATORIOS */}
          <li className="min-w-0">
            <NavLink
              to="/app/recordatorios"
              className={mobileNavClass}
            >
              <img
                src={recordatorioIcon}
                alt="Recordatorios"
                className="mobile-bottom-nav-icon object-contain"
              />

              <span className="mobile-bottom-nav-label text-center" aria-label="Recordatorios">Avisos</span>
            </NavLink>
          </li>

          {/* RECETAS */}
          <li className="min-w-0">
            <NavLink
              to="/app/recetas"
              className={mobileNavClass}
            >
              <img
                src={recetaIcon}
                alt="Recetas"
                className="mobile-bottom-nav-icon object-contain"
              />

              <span className="mobile-bottom-nav-label">Recetas</span>
            </NavLink>
          </li>

          {/* HISTORIAL */}
          <li className="min-w-0">
            <NavLink
              to="/app/historial"
              className={mobileNavClass}
            >
              <History aria-hidden="true" className="mobile-bottom-nav-icon" strokeWidth={1.9} />
              <span className="mobile-bottom-nav-label">Historial</span>
            </NavLink>
          </li>

          {/* PERFIL */}
          <li className="min-w-0">
            <NavLink
              to="/app/perfil"
              className={mobileNavClass}
            >
              <img
                src={perfilIcon}
                alt="Perfil"
                className="mobile-bottom-nav-icon object-contain"
              />

              <span className="mobile-bottom-nav-label">Perfil</span>
            </NavLink>
          </li>

        </ul>

      </footer>
    </div>
  );
}
