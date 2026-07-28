import { useEffect } from "react";
import { IoArrowUndoOutline } from "react-icons/io5";

// Aviso flotante con acción de deshacer. Se va solo a los 6 segundos.
const Toast = ({ mensaje, onDeshacer, onCerrar, duracion = 6000 }) => {
  useEffect(() => {
    const t = setTimeout(onCerrar, duracion);
    return () => clearTimeout(t);
  }, [onCerrar, duracion, mensaje]);

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[min(92vw,26rem)] animate-fadeIn"
    >
      <div className="bg-secondary text-white rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-sm flex-1 truncate">{mensaje}</span>
        {onDeshacer && (
          <button
            onClick={onDeshacer}
            className="text-accent font-semibold text-sm flex items-center gap-1 hover:text-white shrink-0"
          >
            <IoArrowUndoOutline size={16} /> Deshacer
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
