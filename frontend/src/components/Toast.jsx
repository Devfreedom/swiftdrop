// Toast notifications: success/error popups. Wrap the app once, use anywhere.
import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const ToastCtx = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((type, message) => {
    const id = nextId++;
    setToasts((t) => [...t.slice(-2), { id, type, message }]);
    setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);
  const success = useCallback((m) => push("ok", m), [push]);
  const error = useCallback((m) => push("err", m), [push]);
  const info = useCallback((m) => push("info", m), [push]);

  const icons = { ok: CheckCircle2, err: AlertCircle, info: Info };

  return (
    <ToastCtx.Provider value={{ success, error, info }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => {
          const Icon = icons[t.type] || AlertCircle;
          return (
            <div key={t.id} className={`toast ${t.type}`} role="status">
              <Icon size={18} aria-hidden="true" />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
