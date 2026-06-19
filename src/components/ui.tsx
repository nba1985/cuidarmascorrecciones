import { LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";

export function Button({ loading, children, disabled, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return <button disabled={disabled || loading} aria-busy={loading} className={`rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`} {...props}>
    <span className="flex items-center justify-center gap-2">{loading && <LoaderCircle className="animate-spin" size={18} />}{children}</span>
  </button>;
}

export function Field({ label, error, hint, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const id = props.id || props.name;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return <label className="grid gap-1.5 text-sm font-semibold text-[#212121]">
    {label}
    <input id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={`border rounded-2xl p-3.5 font-normal outline-none focus:ring-4 focus:ring-[#2E7D32]/10 ${error ? "border-red-500" : "border-gray-300 focus:border-[#2E7D32]"} ${className}`} {...props} />
    {error ? <span id={`${id}-error`} role="alert" className="text-xs text-red-600">{error}</span> : hint ? <span id={`${id}-hint`} className="text-xs text-[#747970]">{hint}</span> : null}
  </label>;
}

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between gap-4"><h2 id="modal-title" className="text-2xl font-bold text-[#2E7D32]">{title}</h2><button type="button" onClick={onClose} aria-label="Cerrar" className="w-10 h-10 rounded-full hover:bg-gray-100">×</button></div>
      {children}
    </section>
  </div>;
}

export function LoadingState({ label = "Cargando…" }: { label?: string }) { return <div role="status" className="rounded-3xl bg-white border border-gray-200 p-8 text-center text-[#747970]"><LoaderCircle className="mx-auto mb-3 animate-spin text-[#2E7D32]" />{label}</div>; }
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) { return <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800"><p>{message}</p>{onRetry && <Button onClick={onRetry} className="mt-4 px-4 py-2 bg-white border border-red-200"><RotateCcw size={17} /> Reintentar</Button>}</div>; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="rounded-3xl bg-white border border-gray-200 p-8 text-center"><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 text-[#747970]">{description}</p>{action && <div className="mt-5">{action}</div>}</div>; }

export function ConfirmDialog({ open, title, description, onCancel, onConfirm, loading }: { open: boolean; title: string; description: string; onCancel: () => void; onConfirm: () => void; loading?: boolean }) {
  return <Modal open={open} title={title} onClose={onCancel}><p className="mt-4 text-[#747970]">{description}</p><div className="flex flex-col-reverse sm:flex-row gap-3 mt-6"><Button onClick={onCancel} className="flex-1 border border-gray-300 py-3">Cancelar</Button><Button onClick={onConfirm} loading={loading} className="flex-1 bg-red-600 text-white py-3">Confirmar</Button></div></Modal>;
}
