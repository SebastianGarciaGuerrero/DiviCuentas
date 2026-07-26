// Store del hogar: estado global + acciones, persistido en localStorage.
// Un solo hook para toda la app; fácil de reemplazar por llamadas a Supabase
// más adelante (misma forma de datos).
import { useCallback, useEffect, useMemo, useState } from "react";
import { cargar, guardar, mesId, uid, resetear } from "../lib/storage";
import { calcularResumen } from "../lib/calc";

export const useHogar = () => {
  const [estado, setEstado] = useState(cargar);

  useEffect(() => {
    guardar(estado);
  }, [estado]);

  const mesActivo = estado.mesActivo;
  const meses = useMemo(
    () => Object.keys(estado.meses).sort().reverse(),
    [estado.meses]
  );
  const gastos = useMemo(
    () => estado.meses[mesActivo]?.gastos ?? [],
    [estado.meses, mesActivo]
  );
  const { participantes } = estado;

  const resumen = useMemo(
    () => calcularResumen(participantes, gastos),
    [participantes, gastos]
  );

  // --- helpers internos ---
  const setGastos = useCallback(
    (fn) =>
      setEstado((s) => ({
        ...s,
        meses: {
          ...s.meses,
          [s.mesActivo]: {
            ...(s.meses[s.mesActivo] ?? {}),
            gastos: fn(s.meses[s.mesActivo]?.gastos ?? []),
          },
        },
      })),
    []
  );

  // --- acciones sobre gastos ---
  const agregarGasto = useCallback(
    (gasto) =>
      setGastos((list) => [...list, { ...gasto, id: uid() }]),
    [setGastos]
  );

  // Importación masiva (pegar desde Excel)
  const agregarVarios = useCallback(
    (lista) =>
      setGastos((actuales) => [
        ...actuales,
        ...lista.map((g) => ({ ...g, id: uid() })),
      ]),
    [setGastos]
  );

  const editarGasto = useCallback(
    (id, cambios) =>
      setGastos((list) =>
        list.map((g) => (g.id === id ? { ...g, ...cambios } : g))
      ),
    [setGastos]
  );

  const eliminarGasto = useCallback(
    (id) => setGastos((list) => list.filter((g) => g.id !== id)),
    [setGastos]
  );

  // --- participantes ---
  const setParticipantes = useCallback(
    (lista) => setEstado((s) => ({ ...s, participantes: lista })),
    []
  );

  const setHogar = useCallback(
    (nombre) => setEstado((s) => ({ ...s, hogar: { ...s.hogar, nombre } })),
    []
  );

  // --- meses ---
  const cambiarMes = useCallback(
    (id) => setEstado((s) => ({ ...s, mesActivo: id })),
    []
  );

  // Crea el mes siguiente al más reciente y copia los gastos recurrentes
  // (con su último monto) -> el gran anti-paja: no reingresás Netflix, luz, etc.
  const nuevoMesConRecurrentes = useCallback(() => {
    setEstado((s) => {
      const ids = Object.keys(s.meses).sort();
      const ultimo = ids[ids.length - 1];
      const [y, m] = ultimo.split("-").map(Number);
      const sig = mesId(new Date(y, m, 1)); // mes siguiente
      if (s.meses[sig]) return { ...s, mesActivo: sig };
      const recurrentes = (s.meses[ultimo]?.gastos ?? [])
        .filter((g) => g.recurrente)
        .map((g) => ({ ...g, id: uid() }));
      return {
        ...s,
        mesActivo: sig,
        meses: { ...s.meses, [sig]: { gastos: recurrentes } },
      };
    });
  }, []);

  // Trae al mes activo los recurrentes del mes anterior que aún no estén
  const traerRecurrentes = useCallback(() => {
    setEstado((s) => {
      const ids = Object.keys(s.meses).sort();
      const pos = ids.indexOf(s.mesActivo);
      const anterior = pos > 0 ? ids[pos - 1] : null;
      if (!anterior) return s;
      const actuales = s.meses[s.mesActivo]?.gastos ?? [];
      const nombresActuales = new Set(
        actuales.map((g) => g.nombre.toLowerCase())
      );
      const nuevos = (s.meses[anterior]?.gastos ?? [])
        .filter(
          (g) => g.recurrente && !nombresActuales.has(g.nombre.toLowerCase())
        )
        .map((g) => ({ ...g, id: uid() }));
      return {
        ...s,
        meses: {
          ...s.meses,
          [s.mesActivo]: { gastos: [...actuales, ...nuevos] },
        },
      };
    });
  }, []);

  const resetTodo = useCallback(() => setEstado(resetear()), []);

  return {
    estado,
    hogar: estado.hogar,
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
    resetTodo,
  };
};
