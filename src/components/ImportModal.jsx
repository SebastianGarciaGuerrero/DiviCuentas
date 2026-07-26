import { useMemo, useState } from "react";
import {
  IoClose,
  IoSparkles,
  IoTrashOutline,
  IoRepeatOutline,
} from "react-icons/io5";
import { parsearTexto } from "../lib/parseGastos";
import { formatearCLP } from "../lib/format";

const EJEMPLO = `Luz\t32000
Agua\t18500
Internet\t26990
Netflix\t7490
Comida gatas\t42000`;

// Pegar desde Excel / WhatsApp / notas -> lista de gastos lista para revisar.
const ImportModal = ({ participantes, onImportar, onClose }) => {
  const [texto, setTexto] = useState("");
  const [pagadoPor, setPagadoPor] = useState(participantes[0]?.id ?? "");
  const [descartados, setDescartados] = useState(() => new Set());

  const detectados = useMemo(() => parsearTexto(texto), [texto]);
  const finales = detectados.filter((_, i) => !descartados.has(i));
  const total = finales.reduce((a, g) => a + g.monto, 0);

  const toggle = (i) =>
    setDescartados((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const confirmar = () => {
    if (finales.length === 0) return;
    onImportar(finales.map((g) => ({ ...g, pagadoPor })));
  };

  return (
    <div className="fixed inset-0 bg-secondary/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <IoSparkles className="text-primary" size={20} />
            <h3 className="text-lg font-bold text-secondary">Pegar desde Excel</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-secondary">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500">
            Copia las celdas de la planilla (nombre y monto) y pégalas acá. También
            sirve una lista escrita a mano, una por línea.
          </p>

          <textarea
            autoFocus
            rows={7}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={EJEMPLO}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-secondary text-sm font-mono resize-y"
          />

          {texto.trim() && detectados.length === 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              No pude reconocer gastos. Revisa que cada línea tenga un nombre y un
              monto, por ejemplo: <span className="font-mono">Luz 32000</span>
            </p>
          )}

          {detectados.length > 0 && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  ¿Quién pagó estos gastos?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {participantes.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPagadoPor(p.id)}
                      className={`p-2.5 rounded-lg border text-sm font-medium transition ${
                        pagadoPor === p.id
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-primary"
                      }`}
                    >
                      {p.nombre || "Sin nombre"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Después puedes cambiar quién pagó cada uno tocándolo en la lista.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Detecté {detectados.length} gastos
                </p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {detectados.map((g, i) => {
                    const fuera = descartados.has(i);
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm ${
                          fuera
                            ? "border-gray-100 bg-gray-50 opacity-50"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <span className="text-lg">{g.emoji}</span>
                        <span
                          className={`flex-1 truncate text-secondary ${
                            fuera ? "line-through" : ""
                          }`}
                        >
                          {g.nombre}
                          {g.recurrente && (
                            <IoRepeatOutline
                              className="inline ml-1.5 text-gray-300 align-middle"
                              size={13}
                              title="Se repite cada mes"
                            />
                          )}
                        </span>
                        <span className="font-semibold text-secondary">
                          {formatearCLP(g.monto)}
                        </span>
                        <button
                          onClick={() => toggle(i)}
                          className="p-1 text-gray-300 hover:text-red-500"
                          title={fuera ? "Volver a incluir" : "Descartar"}
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
                <span className="text-sm text-gray-500">
                  {finales.length} gastos a importar
                </span>
                <span className="font-bold text-secondary">{formatearCLP(total)}</span>
              </div>
            </>
          )}

          <button
            onClick={confirmar}
            disabled={finales.length === 0}
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Importar {finales.length > 0 ? `${finales.length} gastos` : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
