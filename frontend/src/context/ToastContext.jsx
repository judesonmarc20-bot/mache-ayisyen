// =========================================================================
// ToastContext.jsx — Ti notifikasyon "toast" ki parèt yon ti moman epi disparèt
// =========================================================================
// Nou bati sa nou menm (san lib apa) pou n pa ajoute yon nouvo depandans --
// se jis yon Context ki kenbe yon lis mesaj, ak yon konpozan ki afiche yo
// nan yon kwen ekran an, chak youn disparèt otomatikman apre kèk segond.
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, { type = 'success', duration = 3000 } = {}) => {
      const id = ++idCounter;
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-slide-in-right flex items-center gap-2 rounded-xl px-4 py-3 shadow-lift text-sm font-medium text-white ${
              t.type === 'error'
                ? 'bg-red-600'
                : t.type === 'info'
                  ? 'bg-brand-700'
                  : 'bg-emerald-600'
            }`}
          >
            <span className="text-base leading-none">
              {t.type === 'error' ? '⚠️' : t.type === 'info' ? 'ℹ️' : '✅'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
