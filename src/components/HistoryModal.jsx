import {
  IoClose,
  IoTrendingUp,
  IoTrendingDown,
  IoTrashOutline,
} from "react-icons/io5";
import { formatearCLP } from "../lib/format";
import { nombreMes } from "../lib/storage";
import {
  serieMensual,
  estadisticas,
  compararConAnterior,
  porCategoria,
} from "../lib/historial";
import { useModal } from "../hooks/useModal";

// Etiqueta corta para el eje: "Jul", "Ago"…
const mesCorto = (id) => {
  const [y, m] = id.split("-").map(Number);
  return new Date(y, m - 1, 1)
    .toLocaleDateString("es-CL", { month: "short" })
    .replace(".", "");
};

// Gráfico de barras en SVG: sin librerías, escala al máximo de la serie.
const GraficoBarras = ({ serie, mesActivo, onSeleccionar }) => {
  const maximo = Math.max(...serie.map((m) => m.total), 1);
  const alto = 120;

  return (
    <div className="flex items-end gap-1.5 h-[150px]" role="group" aria-label="Gasto por mes">
      {serie.map((m) => {
        const altura = Math.max((m.total / maximo) * alto, m.total > 0 ? 4 : 2);
        const activo = m.id === mesActivo;
        return (
          <button
            key={m.id}
            onClick={() => onSeleccionar(m.id)}
            className="flex-1 flex flex-col items-center justify-end gap-1 group min-w-0"
            title={`${nombreMes(m.id)}: ${formatearCLP(m.total)}`}
          >
            <span
              className={`text-[9px] font-medium truncate w-full text-center ${
                activo ? "text-primary" : "text-gray-400 opacity-0 group-hover:opacity-100"
              } transition-opacity`}
            >
              {m.total >= 1000 ? `${Math.round(m.total / 1000)}k` : m.total}
            </span>
            <div
              className={`w-full rounded-t transition-all ${
                activo ? "bg-primary" : "bg-primary/30 group-hover:bg-primary/60"
              }`}
              style={{ height: `${altura}px` }}
            />
            <span
              className={`text-[10px] ${
                activo ? "text-primary font-semibold" : "text-gray-400"
              }`}
            >
              {mesCorto(m.id)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// Barra apilada horizontal con el peso de cada categoría
const DesgloseCategorias = ({ categorias }) => {
  if (categorias.length === 0) return null;

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden mb-3">
        {categorias.map((c) => (
          <div
            key={c.clave}
            style={{ width: `${c.porcentaje}%`, backgroundColor: c.color }}
            title={`${c.nombre}: ${formatearCLP(c.monto)}`}
          />
        ))}
      </div>
      <div className="space-y-1.5">
        {categorias.map((c) => (
          <div key={c.clave} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: c.color }}
            />
            <span className="text-secondary flex-1 truncate">
              {c.emoji} {c.nombre}
            </span>
            <span className="text-gray-400 text-xs">{c.porcentaje}%</span>
            <span className="font-semibold text-secondary tabular-nums">
              {formatearCLP(c.monto)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HistoryModal = ({ estado, mesActivo, onSeleccionar, onBorrarMes, onClose }) => {
  useModal(onClose);
  const serie = serieMensual(estado.meses, 12);
  const stats = estadisticas(estado.meses);
  const comparacion = compararConAnterior(estado.meses, mesActivo);
  const categorias = porCategoria(estado.meses[mesActivo]?.gastos);
  const mesesDesc = [...serie].reverse();

  return (
    <div className="fixed inset-0 bg-secondary/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-secondary">Historial</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-secondary">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {serie.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              Todavía no hay meses guardados.
            </p>
          ) : (
            <>
              {/* COMPARACIÓN CON EL MES ANTERIOR */}
              {comparacion && (
                <div
                  className={`rounded-xl p-4 flex items-center gap-3 ${
                    comparacion.subio ? "bg-red-50" : "bg-primary/10"
                  }`}
                >
                  {comparacion.subio ? (
                    <IoTrendingUp className="text-red-500 shrink-0" size={28} />
                  ) : (
                    <IoTrendingDown className="text-primary shrink-0" size={28} />
                  )}
                  <div className="text-sm">
                    <p className="font-semibold text-secondary">
                      {comparacion.subio ? "Gastaron" : "Gastaron"}{" "}
                      {Math.abs(comparacion.porcentaje)}%{" "}
                      {comparacion.subio ? "más" : "menos"} que en{" "}
                      {nombreMes(comparacion.anteriorId).split(" ")[0]}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatearCLP(comparacion.anterior)} →{" "}
                      {formatearCLP(comparacion.actual)} (
                      {comparacion.subio ? "+" : "−"}
                      {formatearCLP(Math.abs(comparacion.diferencia))})
                    </p>
                  </div>
                </div>
              )}

              {/* GRÁFICO POR MES */}
              <section>
                <h4 className="font-semibold text-secondary mb-3">Gasto por mes</h4>
                <GraficoBarras
                  serie={serie}
                  mesActivo={mesActivo}
                  onSeleccionar={onSeleccionar}
                />
              </section>

              {/* NÚMEROS GRUESOS */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-accent/40 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Promedio
                  </p>
                  <p className="font-bold text-secondary text-sm mt-0.5">
                    {formatearCLP(stats.promedio)}
                  </p>
                </div>
                <div className="bg-accent/40 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Mes más caro
                  </p>
                  <p className="font-bold text-secondary text-sm mt-0.5">
                    {stats.maximo ? formatearCLP(stats.maximo.total) : "—"}
                  </p>
                  {stats.maximo && (
                    <p className="text-[10px] text-gray-400">
                      {mesCorto(stats.maximo.id)}
                    </p>
                  )}
                </div>
                <div className="bg-accent/40 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Total histórico
                  </p>
                  <p className="font-bold text-secondary text-sm mt-0.5">
                    {formatearCLP(stats.totalHistorico)}
                  </p>
                </div>
              </div>

              {/* DESGLOSE DEL MES ACTIVO */}
              {categorias.length > 0 && (
                <section>
                  <h4 className="font-semibold text-secondary mb-1">
                    En qué se va la plata
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">{nombreMes(mesActivo)}</p>
                  <DesgloseCategorias categorias={categorias} />
                </section>
              )}

              {/* LISTA DE MESES */}
              <section>
                <h4 className="font-semibold text-secondary mb-3">Todos los meses</h4>
                <div className="space-y-2">
                  {mesesDesc.map((m) => (
                    <div
                      key={m.id}
                      className={`flex items-center rounded-xl border transition ${
                        m.id === mesActivo
                          ? "border-primary bg-primary/5"
                          : "border-gray-100 hover:border-primary/40"
                      }`}
                    >
                      <button
                        onClick={() => onSeleccionar(m.id)}
                        className="flex-1 flex items-center justify-between p-3 text-left min-w-0"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-secondary text-sm truncate">
                            {nombreMes(m.id)}
                          </p>
                          <p className="text-xs text-gray-400">{m.cantidad} gastos</p>
                        </div>
                        <p className="font-bold text-secondary shrink-0">
                          {formatearCLP(m.total)}
                        </p>
                      </button>
                      {/* Solo dejamos borrar meses vacíos: los que tienen
                          gastos son historial y no se botan por accidente. */}
                      {serie.length > 1 && m.cantidad === 0 && (
                        <button
                          onClick={() => onBorrarMes(m.id)}
                          className="px-3 py-3 text-gray-300 hover:text-red-500 shrink-0"
                          title="Borrar este mes vacío"
                          aria-label={`Borrar ${nombreMes(m.id)}`}
                        >
                          <IoTrashOutline size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
