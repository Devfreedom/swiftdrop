// Toast notifications: success/error popups. Wrap the app once, use anywhere.
import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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

  return (
    <ToastCtx.Provider value={{ success, error }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`} role="status">
            {t.type === "ok" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
