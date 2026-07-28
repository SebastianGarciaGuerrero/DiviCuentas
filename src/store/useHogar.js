// Store del hogar: estado global + acciones, persistido en localStorage.
// Un solo hook para toda la app; fácil de reemplazar por llamadas a Supabase
// más adelante (misma forma de datos).
import { useCallback, useEffect, useMemo, useState } from "react";
import { cargar, guardar, mesId, uid, resetear, migrar } from "../lib/storage";
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

  // Reinserta un gasto en su posición original (para deshacer un borrado)
  const restaurarGasto = useCallback(
    (gasto, posicion) =>
      setGastos((list) => {
        const copia = [...list];
        copia.splice(Math.min(posicion, copia.length), 0, gasto);
        return copia;
      }),
    [setGastos]
  );

  const alternarPagado = useCallback(
    (id) =>
      setGastos((list) =>
        list.map((g) => (g.id === id ? { ...g, pagado: !g.pagado } : g))
      ),
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

  // Cierra la pantalla de bienvenida con los datos que ingresó el usuario
  const completarOnboarding = useCallback(
    (nombreHogar, lista) =>
      setEstado((s) => ({
        ...s,
        configurado: true,
        hogar: { ...s.hogar, nombre: nombreHogar },
        participantes: lista,
      })),
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

  // Borra un mes completo. No permite quedarse sin ninguno.
  const borrarMes = useCallback((id) => {
    setEstado((s) => {
      const ids = Object.keys(s.meses ?? {});
      if (ids.length <= 1 || !s.meses[id]) return s;
      const meses = { ...s.meses };
      delete meses[id];
      const restantes = Object.keys(meses).sort();
      return {
        ...s,
        meses,
        mesActivo:
          s.mesActivo === id ? restantes[restantes.length - 1] : s.mesActivo,
      };
    });
  }, []);

  const resetTodo = useCallback(() => setEstado(resetear()), []);

  // Reemplaza todo con lo que venga de un respaldo, pasándolo por la misma
  // migración que los datos locales (puede venir de una versión anterior).
  const restaurar = useCallback((estadoNuevo) => {
    const migrado = migrar(estadoNuevo);
    // Si el respaldo apunta a un mes que no existe, caemos en el más reciente
    if (!migrado.meses?.[migrado.mesActivo]) {
      const ids = Object.keys(migrado.meses ?? {}).sort();
      migrado.mesActivo = ids[ids.length - 1] ?? mesId();
      if (!migrado.meses) migrado.meses = {};
      if (!migrado.meses[migrado.mesActivo]) {
        migrado.meses[migrado.mesActivo] = { gastos: [] };
      }
    }
    setEstado(migrado);
  }, []);

  return {
    estado,
    configurado: estado.configurado,
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
    restaurarGasto,
    alternarPagado,
    setParticipantes,
    setHogar,
    completarOnboarding,
    cambiarMes,
    nuevoMesConRecurrentes,
    traerRecurrentes,
    borrarMes,
    resetTodo,
    restaurar,
  };
};
