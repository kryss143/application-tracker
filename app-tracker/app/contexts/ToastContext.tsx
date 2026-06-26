// app/context/ToastContext.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random()}`;

      setToasts((prev) => [...prev, { id, type, message }]);
      timers.current[id] = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-200 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                role="status"
                className={[
                  "pointer-events-auto flex items-center gap-2.5 min-w-72 max-w-sm",
                  "rounded-xl border px-4 py-3 shadow-card-hover backdrop-blur-sm",
                  "animate-fade-slide-up",
                  toast.type === "success"
                    ? "bg-ink-900/95 border-emerald-500/30 text-ink-100"
                    : "bg-ink-900/95 border-red-500/30 text-ink-100",
                ].join(" ")}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4.5 h-4.5 text-red-400 shrink-0" />
                )}
                <p className="text-sm flex-1">{toast.message}</p>
                <button
                  onClick={() => dismiss(toast.id)}
                  className="text-ink-500 hover:text-ink-200 transition-colors shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
