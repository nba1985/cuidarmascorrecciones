import { Navigate, Outlet, useLocation } from "react-router-dom";

export function RutaProtegida() {
  const location = useLocation();
  return localStorage.getItem("cuidarPlusUsuario")
    ? <Outlet />
    : <Navigate to="/" replace state={{ desde: location.pathname }} />;
}
