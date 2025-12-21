import { useState } from "react";
import { useCurrencyFormatter } from "../hooks/useCurrencyFormatter";
import {
  IoPersonAddOutline,
  IoTrashOutline,
  IoReceiptOutline,
} from "react-icons/io5";
import InfoTooltip from "./InfoTooltip";

const Form = () => {
  const [participantes, setParticipantes] = useState([
    { id: 1, nombre: "", ingreso: "" },
    { id: 2, nombre: "", ingreso: "" },
  ]);
  const [cuentaTotal, setCuentaTotal] = useState("");
  const [resultados, setResultados] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const { formatearCLP, eliminarFormato } = useCurrencyFormatter();

  const handleAgregarParticipante = () => {
    setParticipantes([
      ...participantes,
      { id: Date.now(), nombre: "", ingreso: "" },
    ]);
  };

  const handleEliminarParticipante = (index) => {
    if (participantes.length > 1) {
      const nuevos = [...participantes];
      nuevos.splice(index, 1);
      setParticipantes(nuevos);
    }
  };

  const handleChangeParticipante = (index, campo, valor) => {
    const nuevos = [...participantes];
    if (campo === "ingreso") {
      nuevos[index][campo] = formatearCLP(Number(eliminarFormato(valor)));
    } else {
      nuevos[index][campo] = valor;
    }
    setParticipantes(nuevos);
  };

  const calcularResultado = (e) => {
    e.preventDefault();
    const totalDeuda = parseFloat(eliminarFormato(cuentaTotal));

    if (isNaN(totalDeuda) || totalDeuda <= 0) {
      alert("Por favor, ingresa un monto total válido.");
      return;
    }

    const datosProcesados = participantes.map((p) => ({
      nombre: p.nombre || `Persona ${participantes.indexOf(p) + 1}`,
      ingresoNumerico: parseFloat(eliminarFormato(p.ingreso)),
    }));

    if (datosProcesados.some((d) => isNaN(d.ingresoNumerico))) {
      alert("Por favor, rellena todos los ingresos.");
      return;
    }

    const sumaIngresos = datosProcesados.reduce(
      (acc, curr) => acc + curr.ingresoNumerico,
      0
    );

    if (sumaIngresos === 0) {
      alert("La suma de los ingresos no puede ser 0.");
      return;
    }

    const calculoFinal = datosProcesados.map((d) => {
      const porcentaje = d.ingresoNumerico / sumaIngresos;
      const montoAPagar = porcentaje * totalDeuda;
      return {
        nombre: d.nombre,
        porcentaje: (porcentaje * 100).toFixed(1),
        monto: montoAPagar,
      };
    });

    setResultados(calculoFinal);
    setMostrarModal(true);
  };

  return (
    <div className="w-full flex justify-center px-4">
      <section className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 my-10">
        {/* HEADER CON TEXTURA Y TOOLTIP */}
        <div className="bg-secondary relative rounded-t-2xl">
          <div className="absolute inset-0 overflow-hidden rounded-t-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          <div className="relative z-10 p-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide uppercase">
              DiviCuentas
            </h2>
            <p className="text-accent mt-2 text-sm font-light">
              La forma justa de compartir gastos
            </p>
            <div className="absolute right-4 top-4">
              <InfoTooltip />
            </div>
          </div>
        </div>

        <form onSubmit={calcularResultado} className="p-6 sm:p-8 space-y-8">
          {/* SECCIÓN 1 */}
          <div>
            <h3 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
              1. ¿Quiénes participan?
            </h3>

            <div className="space-y-3">
              {participantes.map((p, index) => (
                <div
                  key={p.id}
                  className="flex gap-3 items-center group animate-fadeIn"
                >
                  <div className="w-1/3">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={p.nombre}
                      onChange={(e) =>
                        handleChangeParticipante(
                          index,
                          "nombre",
                          e.target.value
                        )
                      }
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-gray-700 placeholder-gray-400 text-sm"
                    />
                  </div>
                  <div className="w-2/3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      $
                    </span>
                    <input
                      type="text"
                      placeholder="Ingreso mensual"
                      value={p.ingreso}
                      onChange={(e) =>
                        handleChangeParticipante(
                          index,
                          "ingreso",
                          e.target.value
                        )
                      }
                      className="w-full p-3 pl-7 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-gray-700 font-medium text-right"
                    />
                  </div>
                  {participantes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleEliminarParticipante(index)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Eliminar participante"
                    >
                      <IoTrashOutline size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAgregarParticipante}
              className="mt-4 text-sm font-medium text-primary hover:text-secondary flex items-center gap-2 transition-colors px-2 py-1 rounded-md hover:bg-accent"
            >
              <IoPersonAddOutline /> Agregar otra persona
            </button>
          </div>

          <hr className="border-gray-100" />

          {/* SECCIÓN 2 */}
          <div>
            <h3 className="text-primary font-semibold text-lg mb-4">
              2. ¿Cuánto hay que pagar?
            </h3>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                $
              </span>
              <input
                type="text"
                value={cuentaTotal}
                onChange={(e) =>
                  setCuentaTotal(
                    formatearCLP(Number(eliminarFormato(e.target.value)))
                  )
                }
                placeholder="0"
                className="w-full p-4 pl-8 text-2xl font-bold text-secondary bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            <IoReceiptOutline size={24} />
            Calcular División Justa
          </button>
        </form>
      </section>

      {/* MODAL RESULTADOS */}
      {mostrarModal && resultados && (
        <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-sm shadow-2xl relative overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoReceiptOutline size={24} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-secondary uppercase tracking-widest">
                  Resumen
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  División proporcional equitativa
                </p>
              </div>

              <div className="space-y-4">
                {resultados.map((res, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-end border-b border-gray-100 pb-2"
                  >
                    <div>
                      <p className="font-bold text-secondary text-lg">
                        {res.nombre}
                      </p>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        Aporta el {res.porcentaje}%
                      </span>
                    </div>
                    <p className="text-xl font-mono text-primary font-semibold">
                      {formatearCLP(res.monto)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Total Pagado</span>
                <span className="text-2xl font-bold text-secondary">
                  {cuentaTotal}
                </span>
              </div>

              <button
                onClick={() => setMostrarModal(false)}
                className="mt-8 w-full py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-accent transition-colors"
              >
                Cerrar Recibo
              </button>
            </div>
            <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-200 via-white to-white h-4 w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
