import { useEffect } from "react";
import { Toaster, toast } from "sonner";

window.alert = (mensaje?: unknown) => toast(String(mensaje ?? ""), { duration: 4500 });

export function NotificacionesGlobales() {
  useEffect(() => {
    const aviso = sessionStorage.getItem("cuidarPlusAviso");
    if (aviso) {
      sessionStorage.removeItem("cuidarPlusAviso");
      toast.warning(aviso);
    }
  }, []);

  return <Toaster position="top-right" richColors closeButton toastOptions={{ style: { borderRadius: "18px", border: "1px solid #dfe8df", boxShadow: "0 14px 36px rgba(33,33,33,.12)", fontFamily: "inherit" } }} />;
}
