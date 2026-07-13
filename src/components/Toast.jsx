import React, { useState, useCallback, createContext, useContext } from 'react';

// ─── Context ────────────────────────────────────────────────────
const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

// ─── Ikon per tipe ───────────────────────────────────────────────
const icons = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
};

const styles = {
  success: { bg: 'bg-emerald-950/90', border: 'border-emerald-500/40', icon: 'text-emerald-400', text: 'text-emerald-100' },
  error:   { bg: 'bg-red-950/90',     border: 'border-red-500/40',     icon: 'text-red-400',     text: 'text-red-100' },
  info:    { bg: 'bg-indigo-950/90',  border: 'border-indigo-500/40',  icon: 'text-indigo-400',  text: 'text-indigo-100' },
  warning: { bg: 'bg-amber-950/90',   border: 'border-amber-500/40',   icon: 'text-amber-400',   text: 'text-amber-100' },
};

// ─── Single Toast ─────────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const s = styles[toast.type] || styles.info;
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-2xl backdrop-blur-sm
        ${s.bg} ${s.border} min-w-[280px] max-w-[360px]
        animate-[slideIn_0.3s_ease-out_forwards]`}
      style={{ animation: 'slideIn 0.3s ease-out forwards' }}
    >
      <span className={`flex-shrink-0 mt-0.5 ${s.icon}`}>{icons[toast.type]}</span>
      <p className={`text-sm font-medium flex-1 leading-relaxed ${s.text}`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-slate-500 hover:text-white transition ml-1 mt-0.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error',   dur),
    info:    (msg, dur) => addToast(msg, 'info',    dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Container pojok kanan bawah */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
