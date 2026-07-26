// Utilidades de formato de moneda (CLP). Única fuente de verdad:
// tanto el hook useCurrencyFormatter como los componentes usan esto.

export const formatearCLP = (valor) => {
  const n = Number(valor);
  if (!Number.isFinite(n) || n === 0) return "$0";
  return n.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
};

// Deja solo dígitos: "$1.234" -> 1234 (número)
export const soloNumeros = (valor) => {
  if (typeof valor === "number") return valor;
  const limpio = String(valor ?? "").replace(/\D/g, "");
  return limpio ? Number(limpio) : 0;
};

// Versión para inputs: mientras se escribe, muestra "$1.234" sin el "$0" molesto
export const formatearInput = (valor) => {
  const n = soloNumeros(valor);
  return n ? n.toLocaleString("es-CL") : "";
};
