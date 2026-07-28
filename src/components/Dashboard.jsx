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
  IoEllipseOutline,
  IoEllipsisHorizontal,
  IoShareSocialOutline,
} from "react-icons/io5";
import { formatearCLP } from "../lib/format";
import { nombreMes } from "../lib/storage";
import ExpenseModal from "./ExpenseModal";
import PeopleModal from "./PeopleModal";
import HistoryModal from "./HistoryModal";
import ImportModal from "./ImportModal";
import SettingsModal from "./SettingsModal";
import Toast from "./Toast";

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
    restaurarGasto,
    alternarPagado,
    setParticipantes,
    setHogar,
    cambiarMes,
    nuevoMesConRecurrentes,
    traerRecurrentes,
    borrarMes,
    restaurar,
    estado,
  } = h;

  const [modalGasto, setModalGasto] = useState(null); // { gasto } | { nuevo:true } | null
  const [modalPersonas, setModalPersonas] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [modalAjustes, setModalAjustes] = useState(false);
  const [aviso, setAviso] = useState(null); // { mensaje, deshacer }

  // Borrar avisa y deja deshacer: un toque perdido no cuesta el dato.
  const borrarGasto = (id) => {
    const posicion = gastos.findIndex((g) => g.id === id);
    const gasto = gastos[posicion];
    eliminarGasto(id);
    setModalGasto(null);
    setAviso({
      mensaje: `"${gasto.nombre}" eliminado`,
      deshacer: () => {
        restaurarGasto(gasto, posicion);
        setAviso(null);
      },
    });
  };

  const nombrePorId = Object.fromEntries(
    participantes.map((p) => [p.id, p.nombre])
  );

  const posMes = meses.indexOf(mesActivo); // meses viene ordenado desc
  const hayMesAnterior = posMes < meses.length - 1;
  const irAnterior = () => hayMesAnterior && cambiarMes(meses[posMes + 1]);
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
            title="Personas y sueldos"
          >
            <IoPeopleOutline size={20} />
          </button>
          <button
            onClick={() => setModalAjustes(true)}
            className="p-2.5 rounded-lg bg-white border border-gray-100 text-secondary hover:text-primary shadow-sm"
            title="Ajustes, respaldo y compartir"
          >
            <IoEllipsisHorizontal size={20} />
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

        {/* Avance del mes: qué falta por pagar */}
        {gastos.length > 0 && (
          <div className="relative z-10 mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-accent">
                {resumen.pagados} de {gastos.length} pagadas
              </span>
              <span className={resumen.todoPagado ? "text-primary" : "text-white/70"}>
                {resumen.todoPagado
                  ? "¡Mes cerrado!"
                  : `faltan ${formatearCLP(resumen.montoPendiente)}`}
              </span>
            </div>
            <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(resumen.pagados / gastos.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* TARJETAS POR PERSONA */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {resumen.porPersona.map((p) => (
          <button
            key={p.id}
            onClick={() => setModalPersonas(true)}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left hover:border-primary/40 transition"
            title="Tocar para editar personas y sueldos"
          >
            <div className="flex items-center justify-between">
              <p className="font-bold text-secondary truncate">{p.nombre}</p>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
                {p.porcentaje}%
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {p.ingreso > 0 ? `Sueldo ${formatearCLP(p.ingreso)}` : "Sin sueldo definido"}
            </p>
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
          </button>
        ))}
      </div>

      {/* LIQUIDACIÓN */}
      <div className="mt-4 bg-primary/10 rounded-2xl p-5 border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IoArrowForward className="text-primary" />
            <h2 className="font-bold text-secondary">Para quedar a mano</h2>
          </div>
          {gastos.length > 0 && (
            <button
              onClick={() => setModalAjustes(true)}
              className="text-xs font-medium text-primary hover:text-secondary flex items-center gap-1"
              title="Compartir el resumen del mes"
            >
              <IoShareSocialOutline size={16} /> Compartir
            </button>
          )}
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
            {hayMesAnterior && (
              <button
                onClick={traerRecurrentes}
                className="text-xs font-medium text-primary hover:text-secondary flex items-center gap-1"
                title="Traer gastos recurrentes del mes anterior"
              >
                <IoRepeatOutline size={16} /> Traer recurrentes
              </button>
            )}
          </div>
        </div>

        {gastos.length === 0 ? (
          <div className="text-center py-10 px-6 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">Aún no hay gastos este mes.</p>
            <p className="text-sm text-gray-400 mt-1">
              {hayMesAnterior
                ? "Trae los del mes pasado, pega tu planilla o agrégalos uno a uno."
                : "Pega las cuentas desde tu planilla o agrégalas una a una."}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button
                onClick={() => setModalImportar(true)}
                className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 active:scale-95 transition flex items-center gap-1.5"
              >
                <IoSparkles size={16} /> Pegar del Excel
              </button>
              {hayMesAnterior && (
                <button
                  onClick={traerRecurrentes}
                  className="px-4 py-2.5 border border-primary text-primary text-sm font-semibold rounded-lg hover:bg-accent transition flex items-center gap-1.5"
                >
                  <IoRepeatOutline size={16} /> Traer los del mes pasado
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {gastos.map((g) => (
              <div
                key={g.id}
                className={`flex items-center gap-2 rounded-xl border shadow-sm transition ${
                  g.pagado
                    ? "bg-primary/5 border-primary/20"
                    : "bg-white border-gray-100 hover:border-primary/40"
                }`}
              >
                {/* Marcar como pagada: acción aparte para no abrir la edición */}
                <button
                  onClick={() => alternarPagado(g.id)}
                  className="pl-3 py-3 shrink-0"
                  aria-label={
                    g.pagado ? `Marcar ${g.nombre} como pendiente` : `Marcar ${g.nombre} como pagada`
                  }
                  aria-pressed={g.pagado}
                  title={g.pagado ? "Marcar como pendiente" : "Marcar como pagada"}
                >
                  {g.pagado ? (
                    <IoCheckmarkCircle className="text-primary" size={26} />
                  ) : (
                    <IoEllipseOutline className="text-gray-300 hover:text-primary" size={26} />
                  )}
                </button>

                <button
                  onClick={() => setModalGasto({ gasto: g })}
                  className="flex-1 flex items-center gap-3 py-3 pr-3 text-left min-w-0"
                >
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 ${
                      g.pagado ? "bg-primary/10" : "bg-accent"
                    }`}
                  >
                    {g.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold truncate ${
                        g.pagado ? "text-gray-400 line-through" : "text-secondary"
                      }`}
                    >
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
                  <p
                    className={`font-bold shrink-0 ${
                      g.pagado ? "text-gray-400" : "text-secondary"
                    }`}
                  >
                    {formatearCLP(g.monto)}
                  </p>
                </button>
              </div>
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
          onEliminar={borrarGasto}
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
      {aviso && (
        <Toast
          mensaje={aviso.mensaje}
          onDeshacer={aviso.deshacer}
          onCerrar={() => setAviso(null)}
        />
      )}

      {modalAjustes && (
        <SettingsModal
          estado={estado}
          mesActivo={mesActivo}
          hogar={hogar}
          gastos={gastos}
          participantes={participantes}
          resumen={resumen}
          onRestaurar={restaurar}
          onClose={() => setModalAjustes(false)}
        />
      )}
      {modalHistorial && (
        <HistoryModal
          estado={estado}
          mesActivo={mesActivo}
          onBorrarMes={borrarMes}
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
