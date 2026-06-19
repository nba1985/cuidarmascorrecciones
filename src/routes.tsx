import {
  createBrowserRouter,
  ScrollRestoration,
} from "react-router-dom";

import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Medicamentos } from "./pages/Medicamentos";
import { Perfil } from "./pages/Perfil";
import { Recordatorios } from "./pages/Recordatorios";
import { Recetas } from "./pages/Recetas";
import { HistorialAnimo } from "./pages/HistorialdeAnimo";
import { Historial } from "./pages/Historial";
import { Nuevacuenta } from "./pages/Nuevacuenta";

import { Layouts } from "./components/layouts/Layouts";
import { RutaProtegida } from "./components/RutaProtegida";

export const router = createBrowserRouter([

  // LOGIN
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/nuevacuenta",
    element: <Nuevacuenta />,
  },

  // APP
  {
    element: <RutaProtegida />,
    children: [{
    path: "/app",
    element: (
      <>
        <ScrollRestoration />
        <Layouts />
      </>
    ),

    children: [

      // HOME
      {
        index: true,
        element: <Home />,
      },

      // MEDICAMENTOS
      {
        path: "medicamentos",
        element: <Medicamentos />,
      },

      // PERFIL
      {
        path: "perfil",
        element: <Perfil />,
      },

      // RECORDATORIOS
      {
        path: "recordatorios",
        element: <Recordatorios />,
      },

      // RECETAS
      {
        path: "recetas",
        element: <Recetas />,
      },

      // ESTADO DE ÁNIMO
      {
        path: "historial-animo",
        element: <HistorialAnimo />,
      },
      {
        path: "historial",
        element: <Historial />,
      },
      {
        path: "nuevacuenta",
        element: <Nuevacuenta />,
      },

    ],
  }],
  },
]);
