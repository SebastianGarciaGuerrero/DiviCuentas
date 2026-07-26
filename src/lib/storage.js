// Persistencia en localStorage. Toda la data del hogar vive acá hasta que
// enchufemos un backend (Supabase). La forma del estado está pensada para
// migrar directo a tablas: participantes, meses y gastos.

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

// Estado inicial de ejemplo: se ve vivo al primer ingreso, todo editable.
const estadoDemo = () => {
  const p1 = uid();
  const p2 = uid();
  const actual = mesId();
  return {
    version: 1,
    hogar: { nombre: "Nuestro hogar" },
    participantes: [
      { id: p1, nombre: "Yo", ingreso: 900000 },
      { id: p2, nombre: "Mi polola", ingreso: 700000 },
    ],
    mesActivo: actual,
    meses: {
      [actual]: {
        gastos: [
          g("💡", "Luz", 32000, p1, "proporcional", true),
          g("🚿", "Agua", 18000, p2, "proporcional", true),
          g("🔥", "Gas", 25000, p1, "proporcional", true),
          g("🌐", "Internet", 26990, p2, "iguales", true),
          g("📺", "Netflix", 7490, p1, "iguales", true),
          g("🍿", "Apple TV", 5990, p2, "iguales", true),
          g("🐱", "Comida gatas", 42000, p1, "iguales", true),
          g("🧻", "Arena", 12990, p2, "iguales", true),
        ],
      },
    },
  };
};

const g = (emoji, nombre, monto, pagadoPor, reparto, recurrente) => ({
  id: uid(),
  emoji,
  nombre,
  monto,
  pagadoPor,
  reparto,
  recurrente,
});

export const cargar = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* corrupto: reseteamos a demo */
  }
  const demo = estadoDemo();
  guardar(demo);
  return demo;
};

export const guardar = (estado) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(estado));
  } catch {
    /* almacenamiento lleno / bloqueado */
  }
};

export const resetear = () => {
  const demo = estadoDemo();
  guardar(demo);
  return demo;
};
