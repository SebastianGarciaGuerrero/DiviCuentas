import { useState } from "react";
import {
  IoAdd,
  IoChevronBack,
  IoChevronForward,
  IoPeopleOutline,
  IoTimeOutline,
  IoArrowForward,
  IoRepeatOutline,
  IoCheckmarkCircle,
  IoSparkles,
} from "react-icons/io5";
import { formatearCLP } from "../lib/format";
import { nombreMes } from "../lib/storage";
import ExpenseModal from "./ExpenseModal";
import PeopleModal from "./PeopleModal";
import HistoryModal from "./HistoryModal";
import ImportModal from "./ImportModal";

const Dashboard = (h) => {
  const {
    hogar,
    participantes,
    gastos,
    mesActivo,
    meses,
    resumen,
    agregarGasto,
    agregarVarios,
    editarGasto,
    eliminarGasto,
    setParticipantes,
    setHogar,
    cambiarMes,
    nuevoMesConRecurrentes,
    traerRecurrentes,
    estado,
  } = h;

  const [modalGasto, setModalGasto] = useState(null); // { gasto } | { nuevo:true } | null
  const [modalPersonas, setModalPersonas] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);

  const nombrePorId = Object.fromEntries(
    participantes.map((p) => [p.id, p.nombre])
  );

  const posMes = meses.indexOf(mesActivo); // meses viene ordenado desc
  const irAnterior = () => posMes < meses.length - 1 && cambiarMes(meses[posMes + 1]);
  const irSiguiente = () => {
    if (posMes > 0) cambiarMes(meses[posMes - 1]);
    else nuevoMesConRecurrentes();
  };

  const guardarGasto = (g) => {
    if (modalGasto?.gasto) editarGasto(modalGasto.gasto.id, g);
    else agregarGasto(g);
    setModalGasto(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-28">
      {/* ENCABEZADO: hogar + navegación de mes */}
      <div className="flex items-center justify-between pt-6 pb-2">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">{hogar.nombre}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={irAnterior}
              disabled={posMes >= meses.length - 1}
              className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"
            >
              <IoChevronBack size={22} />
            </button>
            <h1 className="text-xl font-bold text-secondary min-w-[9rem] text-center">
              {nombreMes(mesActivo)}
            </h1>
            <button
              onClick={irSiguiente}
              className="p-1 text-gray-400 hover:text-primary"
              title={posMes > 0 ? "Mes siguiente" : "Crear próximo mes"}
            >
              <IoChevronForward size={22} />
            </button>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setModalHistorial(true)}
            className="p-2.5 rounded-lg bg-white border border-gray-100 text-secondary hover:text-primary shadow-sm"
            title="Historial"
          >
            <IoTimeOutline size={20} />
          </button>
          <button
            onClick={() => setModalPersonas(true)}
            className="p-2.5 rounded-lg bg-white border border-gray-100 text-secondary hover:text-primary shadow-sm"
            title="Personas"
          >
            <IoPeopleOutline size={20} />
          </button>
        </div>
      </div>

      {/* TARJETA TOTAL DEL MES */}
      <div className="bg-secondary rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <p className="text-accent text-sm relative z-10">Total gastos del mes</p>
        <p className="text-4xl font-bold text-white mt-1 relative z-10">
          {formatearCLP(resumen.total)}
        </p>
        <p className="text-gray-400 text-xs mt-1 relative z-10">
          {gastos.length} gastos · {participantes.length} personas
        </p>
      </div>

      {/* TARJETAS POR PERSONA */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {resumen.porPersona.map((p) => (
          <div key={p.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-bold text-secondary truncate">{p.nombre}</p>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {p.porcentaje}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Le toca</p>
            <p className="text-lg font-bold text-secondary">{formatearCLP(p.leToca)}</p>
            <div className="flex justify-between text-xs mt-2 pt-2 border-t border-gray-50">
              <span className="text-gray-400">Puso {formatearCLP(p.pago)}</span>
              <span
                className={
                  p.balance > 0
                    ? "text-primary font-semibold"
                    : p.balance < 0
                    ? "text-red-500 font-semibold"
                    : "text-gray-400"
                }
              >
                {p.balance > 0 ? "le deben" : p.balance < 0 ? "debe" : "al día"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* LIQUIDACIÓN */}
      <div className="mt-4 bg-primary/10 rounded-2xl p-5 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <IoArrowForward className="text-primary" />
          <h2 className="font-bold text-secondary">Para quedar a mano</h2>
        </div>
        {resumen.liquidacion.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <IoCheckmarkCircle className="text-primary" size={20} />
            Todo cuadrado, nadie debe nada.
          </div>
        ) : (
          <div className="space-y-2">
            {resumen.liquidacion.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white rounded-lg px-4 py-3 text-sm"
              >
                <span className="text-secondary">
                  <span className="font-semibold">{t.de}</span> le transfiere a{" "}
                  <span className="font-semibold">{t.a}</span>
                </span>
                <span className="font-bold text-primary">{formatearCLP(t.monto)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LISTA DE GASTOS */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-secondary">Gastos del mes</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalImportar(true)}
              className="text-xs font-medium text-primary hover:text-secondary flex items-center gap-1"
              title="Pegar gastos desde Excel"
            >
              <IoSparkles size={16} /> Pegar del Excel
            </button>
            <button
              onClick={traerRecurrentes}
              className="text-xs font-medium text-primary hover:text-secondary flex items-center gap-1"
              title="Traer gastos recurrentes del mes anterior"
            >
              <IoRepeatOutline size={16} /> Traer recurrentes
            </button>
          </div>
        </div>

        {gastos.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <p>Aún no hay gastos este mes.</p>
            <div className="flex justify-center gap-4 mt-2">
              <button
                onClick={traerRecurrentes}
                className="text-primary font-medium text-sm hover:underline"
              >
                Traer los del mes pasado
              </button>
              <button
                onClick={() => setModalImportar(true)}
                className="text-primary font-medium text-sm hover:underline"
              >
                Pegar del Excel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {gastos.map((g) => (
              <button
                key={g.id}
                onClick={() => setModalGasto({ gasto: g })}
                className="w-full flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-primary/40 shadow-sm transition text-left"
              >
                <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center text-xl shrink-0">
                  {g.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-secondary truncate">
                    {g.nombre}
                    {g.recurrente && (
                      <IoRepeatOutline
                        className="inline ml-1.5 text-gray-300 align-middle"
                        size={14}
                      />
                    )}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Pagó {nombrePorId[g.pagadoPor] ?? "—"} ·{" "}
                    {g.reparto === "iguales" ? "mitad y mitad" : "según ingreso"}
                  </p>
                </div>
                <p className="font-bold text-secondary shrink-0">{formatearCLP(g.monto)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* BOTÓN FLOTANTE AGREGAR */}
      <button
        onClick={() => setModalGasto({ nuevo: true })}
        className="fixed bottom-6 right-6 sm:right-[calc(50%-19rem)] w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-primary/90 active:scale-95 transition z-30"
        title="Agregar gasto"
      >
        <IoAdd size={32} />
      </button>

      {/* MODALES */}
      {modalGasto && (
        <ExpenseModal
          gasto={modalGasto.gasto}
          participantes={participantes}
          onGuardar={guardarGasto}
          onEliminar={(id) => {
            eliminarGasto(id);
            setModalGasto(null);
          }}
          onClose={() => setModalGasto(null)}
        />
      )}
      {modalPersonas && (
        <PeopleModal
          hogar={hogar}
          participantes={participantes}
          onGuardar={(nombre, lista) => {
            setHogar(nombre);
            setParticipantes(lista);
            setModalPersonas(false);
          }}
          onClose={() => setModalPersonas(false)}
        />
      )}
      {modalImportar && (
        <ImportModal
          participantes={participantes}
          onImportar={(lista) => {
            agregarVarios(lista);
            setModalImportar(false);
          }}
          onClose={() => setModalImportar(false)}
        />
      )}
      {modalHistorial && (
        <HistoryModal
          estado={estado}
          mesActivo={mesActivo}
          onSeleccionar={(id) => {
            cambiarMes(id);
            setModalHistorial(false);
          }}
          onClose={() => setModalHistorial(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
