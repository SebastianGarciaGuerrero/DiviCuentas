import { useState } from "react";
import { IoClose, IoPersonAddOutline, IoTrashOutline } from "react-icons/io5";
import MoneyInput from "./MoneyInput";
import { uid } from "../lib/storage";

// Configuración del hogar: nombre del hogar, integrantes y su ingreso mensual.
const PeopleModal = ({ hogar, participantes, onGuardar, onClose }) => {
  const [nombreHogar, setNombreHogar] = useState(hogar.nombre);
  const [lista, setLista] = useState(participantes.map((p) => ({ ...p })));

  const set = (i, campo, valor) =>
    setLista((l) => l.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)));

  const agregar = () =>
    setLista((l) => [...l, { id: uid(), nombre: "", ingreso: 0 }]);

  const quitar = (i) =>
    setLista((l) => (l.length > 1 ? l.filter((_, idx) => idx !== i) : l));

  const submit = (e) => {
    e.preventDefault();
    const limpia = lista
      .map((p) => ({ ...p, nombre: p.nombre.trim(), ingreso: Number(p.ingreso) || 0 }))
      .filter((p) => p.nombre);
    if (limpia.length === 0) return;
    onGuardar(nombreHogar.trim() || "Nuestro hogar", limpia);
  };

  return (
    <div className="fixed inset-0 bg-secondary/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-secondary">Hogar y personas</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-secondary">
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-600">Nombre del hogar</label>
            <input
              type="text"
              value={nombreHogar}
              onChange={(e) => setNombreHogar(e.target.value)}
              placeholder="Nuestro hogar"
              className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-secondary"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Integrantes e ingreso mensual
            </p>
            <p className="text-xs text-gray-400 mb-3">
              El ingreso se usa para dividir los gastos "según ingreso". Si prefieren
              mitad y mitad, igual funciona.
            </p>
            <div className="space-y-3">
              {lista.map((p, i) => (
                <div key={p.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={p.nombre}
                    onChange={(e) => set(i, "nombre", e.target.value)}
                    className="w-1/3 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-secondary text-sm"
                  />
                  <div className="flex-1">
                    <MoneyInput
                      value={p.ingreso}
                      onChange={(v) => set(i, "ingreso", v)}
                      placeholder="Ingreso"
                      className="text-right text-sm"
                    />
                  </div>
                  {lista.length > 1 && (
                    <button
                      type="button"
                      onClick={() => quitar(i)}
                      className="p-2 text-gray-300 hover:text-red-500"
                    >
                      <IoTrashOutline size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={agregar}
              className="mt-3 text-sm font-medium text-primary hover:text-secondary flex items-center gap-2"
            >
              <IoPersonAddOutline /> Agregar persona
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 active:scale-95 transition"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};

export default PeopleModal;
