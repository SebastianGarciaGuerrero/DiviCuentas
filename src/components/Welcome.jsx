import { useState } from "react";
import {
  IoWalletOutline,
  IoPersonAddOutline,
  IoTrashOutline,
  IoArrowForward,
  IoArrowBack,
} from "react-icons/io5";
import MoneyInput from "./MoneyInput";
import { uid } from "../lib/storage";

// Bienvenida en dos pasos: primero quiénes son, después cómo dividen.
// No hay datos precargados: todo lo ingresa el usuario.
const Welcome = ({ onListo }) => {
  const [paso, setPaso] = useState(1);
  const [nombreHogar, setNombreHogar] = useState("");
  const [personas, setPersonas] = useState([
    { id: uid(), nombre: "", ingreso: 0 },
    { id: uid(), nombre: "", ingreso: 0 },
  ]);

  const set = (i, campo, valor) =>
    setPersonas((l) => l.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)));

  const agregar = () =>
    setPersonas((l) => [...l, { id: uid(), nombre: "", ingreso: 0 }]);

  const quitar = (i) =>
    setPersonas((l) => (l.length > 2 ? l.filter((_, idx) => idx !== i) : l));

  const conNombre = personas.filter((p) => p.nombre.trim());
  const puedeSeguir = conNombre.length >= 2;
  const algunIngreso = conNombre.some((p) => Number(p.ingreso) > 0);

  const terminar = () =>
    onListo(
      nombreHogar.trim() || "Nuestro hogar",
      conNombre.map((p) => ({
        id: p.id,
        nombre: p.nombre.trim(),
        ingreso: Number(p.ingreso) || 0,
      }))
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md">
        {/* Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl text-primary mb-4">
            <IoWalletOutline size={32} />
          </div>
          <h1 className="text-3xl font-bold text-secondary">DiviCuentas</h1>
          <p className="text-gray-500 mt-2">
            Ordenen las cuentas del mes en cinco minutos.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {/* Indicador de paso */}
          <div className="flex gap-2 mb-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  paso >= n ? "bg-primary" : "bg-gray-100"
                }`}
              />
            ))}
          </div>

          {paso === 1 ? (
            <>
              <h2 className="text-xl font-bold text-secondary">¿Quiénes viven ahí?</h2>
              <p className="text-sm text-gray-500 mt-1 mb-5">
                Los nombres de quienes comparten los gastos.
              </p>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Nombre del hogar
                  <span className="text-gray-400 font-normal"> (opcional)</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={nombreHogar}
                  onChange={(e) => setNombreHogar(e.target.value)}
                  placeholder="Nuestra casa, Depto Ñuñoa…"
                  className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-secondary"
                />
              </div>

              <div className="mt-5 space-y-2">
                {personas.map((p, i) => (
                  <div key={p.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={p.nombre}
                      onChange={(e) => set(i, "nombre", e.target.value)}
                      placeholder={`Nombre ${i + 1}`}
                      className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-secondary"
                    />
                    {personas.length > 2 && (
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
                <IoPersonAddOutline /> Agregar otra persona
              </button>

              <button
                type="button"
                disabled={!puedeSeguir}
                onClick={() => setPaso(2)}
                className="w-full mt-6 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                Continuar <IoArrowForward />
              </button>
              {!puedeSeguir && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  Escribe al menos dos nombres.
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-secondary">
                ¿Cuánto gana cada uno?
              </h2>
              <p className="text-sm text-gray-500 mt-1 mb-5">
                Sirve para repartir los gastos según lo que gana cada quien. Si
                prefieren ir mitad y mitad, sáltalo: se puede elegir gasto por gasto.
              </p>

              <div className="space-y-3">
                {conNombre.map((p) => {
                  const i = personas.findIndex((x) => x.id === p.id);
                  return (
                    <div key={p.id}>
                      <label className="text-sm font-medium text-gray-600">
                        {p.nombre}
                      </label>
                      <div className="mt-1">
                        <MoneyInput
                          value={p.ingreso}
                          onChange={(v) => set(i, "ingreso", v)}
                          placeholder="Ingreso mensual"
                          className="text-right"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {!algunIngreso && (
                <p className="text-xs text-gray-500 bg-accent/50 rounded-lg p-3 mt-4">
                  Sin ingresos, los gastos se reparten en partes iguales. Puedes
                  agregarlos después desde el menú de personas.
                </p>
              )}

              <button
                type="button"
                onClick={terminar}
                className="w-full mt-6 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 active:scale-95 transition"
              >
                Empezar
              </button>
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="w-full mt-2 py-2 text-gray-500 text-sm hover:text-secondary flex items-center justify-center gap-1"
              >
                <IoArrowBack size={16} /> Volver
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Los datos se guardan solo en este dispositivo.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
