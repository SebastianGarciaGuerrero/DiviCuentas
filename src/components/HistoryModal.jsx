import { IoClose, IoCalendarOutline } from "react-icons/io5";
import { formatearCLP } from "../lib/format";
import { nombreMes } from "../lib/storage";

// Historial: todos los meses guardados con su total. Tap para ir a ese mes.
const HistoryModal = ({ estado, mesActivo, onSeleccionar, onClose }) => {
  const meses = Object.keys(estado.meses)
    .sort()
    .reverse()
    .map((id) => {
      const gastos = estado.meses[id]?.gastos ?? [];
      const total = gastos.reduce((a, g) => a + (Number(g.monto) || 0), 0);
      return { id, total, cantidad: gastos.length };
    });

  const promedio =
    meses.length > 0
      ? Math.round(meses.reduce((a, m) => a + m.total, 0) / meses.length)
      : 0;

  return (
    <div className="fixed inset-0 bg-secondary/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-secondary">Historial de meses</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-secondary">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-accent/50 rounded-xl p-4 mb-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Promedio mensual
            </p>
            <p className="text-2xl font-bold text-secondary">{formatearCLP(promedio)}</p>
          </div>

          <div className="space-y-2">
            {meses.map((m) => (
              <button
                key={m.id}
                onClick={() => onSeleccionar(m.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition text-left ${
                  m.id === mesActivo
                    ? "border-primary bg-primary/5"
                    : "border-gray-100 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primary">
                    <IoCalendarOutline size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">{nombreMes(m.id)}</p>
                    <p className="text-xs text-gray-400">{m.cantidad} gastos</p>
                  </div>
                </div>
                <p className="font-bold text-secondary">{formatearCLP(m.total)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
