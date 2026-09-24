import { Component, type ErrorInfo, type ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Error de interfaz", error, info); }
  render() {
    if (this.state.error) return <main className="min-h-screen bg-[#F5F5F5] grid place-items-center p-4"><section role="alert" className="max-w-lg rounded-3xl bg-white border border-gray-200 p-8 text-center shadow-sm"><h1 className="text-2xl font-bold">No pudimos mostrar esta pantalla</h1><p className="mt-3 text-[#747970]">Tus datos no se perdieron. Recargá la página para volver a intentarlo.</p><button onClick={() => window.location.reload()} className="mt-6 bg-[#2E7D32] text-white rounded-2xl px-6 py-3 font-bold">Recargar</button></section></main>;
    return this.props.children;
  }
}
