// Persistencia en localStorage. Toda la data del hogar vive acá hasta que
// enchufemos un backend (Supabase). La forma del estado está pensada para
// migrar directo a tablas: participantes, meses y gastos.

import { sugerirCategoria } from "./parseGastos";

const KEY = "divicuentas:v1";

export const mesId = (fecha = new Date()) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

export const nombreMes = (id) => {
  const [y, m] = id.split("-").map(Number);
  const nombre = new Date(y, m - 1, 1).toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
};

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Estado inicial vacío: sin datos inventados. `configurado: false` hace que
// la app muestre la pantalla de bienvenida y sea el usuario quien ingrese
// el nombre del hogar y quiénes viven ahí.
export const estadoInicial = () => {
  const actual = mesId();
  return {
    version: 1,
    configurado: false,
    hogar: { nombre: "" },
    participantes: [],
    mesActivo: actual,
    meses: { [actual]: { gastos: [] } },
  };
};

// Completa los datos guardados por versiones anteriores. Se ejecuta en cada
// carga, así que debe ser idempotente y no perder nada de lo que ya existe.
export const migrar = (estado) => {
  const s = { ...estado };

  // Antes no existía la bandera: quien ya tenía personas no debe ver la
  // pantalla de bienvenida otra vez.
  if (s.configurado === undefined) {
    s.configurado = (s.participantes?.length ?? 0) > 0;
  }

  // Los gastos viejos no tienen categoría ni estado de pago.
  s.meses = Object.fromEntries(
    Object.entries(s.meses ?? {}).map(([id, mes]) => [
      id,
      {
        ...mes,
        gastos: (mes.gastos ?? []).map((g) => ({
          ...g,
          categoria: g.categoria ?? sugerirCategoria(g.nombre ?? ""),
          pagado: g.pagado ?? false,
        })),
      },
    ])
  );

  return s;
};

export const cargar = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const guardado = JSON.parse(raw);
      return migrar(guardado);
    }
  } catch {
    /* dato corrupto: partimos de cero */
  }
  const inicial = estadoInicial();
  guardar(inicial);
  return inicial;
};

export const guardar = (estado) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(estado));
  } catch {
    /* almacenamiento lleno / bloqueado */
  }
};

export const resetear = () => {
  const inicial = estadoInicial();
  guardar(inicial);
  return inicial;
};
