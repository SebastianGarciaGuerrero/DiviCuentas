import { useEffect, useState } from "react";
import { IoClose, IoTrashOutline } from "react-icons/io5";
import MoneyInput from "./MoneyInput";

const EMOJIS = [
  "💡", "🚿", "🔥", "🌐", "📺", "🍿", "🐱", "🐶", "🧻", "🛒",
  "🍽️", "🏠", "🚗", "📱", "💊", "🎮", "☕", "🧼", "⚡", "💧",
];

const vacio = () => ({
  emoji: "🛒",
  nombre: "",
  monto: 0,
  pagadoPor: "",
  reparto: "proporcional",
  recurrente: true,
});

// Modal para crear/editar un gasto. Nombre libre (cada hogar tiene los suyos).
const ExpenseModal = ({ gasto, participantes, onGuardar, onEliminar, onClose }) => {
  const [form, setForm] = useState(vacio);

  useEffect(() => {
    if (gasto) setForm(gasto);
    else setForm({ ...vacio(), pagadoPor: participantes[0]?.id ?? "" });
  }, [gasto, participantes]);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onGuardar({ ...form, nombre: form.nombre.trim(), monto: Number(form.monto) || 0 });
  };

  return (
    <div className="fixed inset-0 bg-secondary/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-secondary">
            {gasto ? "Editar gasto" : "Nuevo gasto"}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-secondary">
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-5">
          {/* Nombre + emoji */}
          <div>
            <label className="text-sm font-medium text-gray-600">Nombre del gasto</label>
            <div className="flex gap-2 mt-1">
              <div className="flex items-center justify-center w-12 h-12 text-2xl bg-accent rounded-lg shrink-0">
                {form.emoji}
              </div>
              <input
                autoFocus
                type="text"
                placeholder="Luz, Comida gatas, Netflix…"
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-secondary"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => set("emoji", e)}
                  className={`w-9 h-9 rounded-lg text-lg transition ${
                    form.emoji === e ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-gray-100"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="text-sm font-medium text-gray-600">Monto</label>
            <div className="mt-1">
              <MoneyInput value={form.monto} onChange={(v) => set("monto", v)} className="text-lg text-right" />
            </div>
          </div>

          {/* Quién pagó */}
          <div>
            <label className="text-sm font-medium text-gray-600">¿Quién lo pagó?</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {participantes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set("pagadoPor", p.id)}
                  className={`p-3 rounded-lg border text-sm font-medium transition ${
                    form.pagadoPor === p.id
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-primary"
                  }`}
                >
                  {p.nombre || "Sin nombre"}
                </button>
              ))}
            </div>
          </div>

          {/* Cómo se divide */}
          <div>
            <label className="text-sm font-medium text-gray-600">¿Cómo se divide?</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => set("reparto", "proporcional")}
                className={`p-3 rounded-lg border text-sm transition ${
                  form.reparto === "proporcional"
                    ? "bg-secondary text-white border-secondary"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:border-secondary"
                }`}
              >
                <span className="font-semibold block">Según ingreso</span>
                <span className="text-xs opacity-80">Paga más quien gana más</span>
              </button>
              <button
                type="button"
                onClick={() => set("reparto", "iguales")}
                className={`p-3 rounded-lg border text-sm transition ${
                  form.reparto === "iguales"
                    ? "bg-secondary text-white border-secondary"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:border-secondary"
                }`}
              >
                <span className="font-semibold block">Partes iguales</span>
                <span className="text-xs opacity-80">Mitad y mitad</span>
              </button>
            </div>
          </div>

          {/* Recurrente */}
          <label className="flex items-center gap-3 p-3 bg-accent/40 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={form.recurrente}
              onChange={(e) => set("recurrente", e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <span className="text-sm text-secondary">
              <span className="font-semibold">Se repite cada mes</span>
              <span className="block text-xs text-gray-500">
                Aparece listo para el próximo mes (no lo reingresás)
              </span>
            </span>
          </label>

          <div className="flex gap-2 pt-1">
            {gasto && (
              <button
                type="button"
                onClick={() => onEliminar(gasto.id)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-lg border border-red-100"
                title="Eliminar gasto"
              >
                <IoTrashOutline size={20} />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 active:scale-95 transition"
            >
              {gasto ? "Guardar cambios" : "Agregar gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
