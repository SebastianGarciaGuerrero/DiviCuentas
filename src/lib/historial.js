// Análisis del historial: series por mes, comparación y desglose por categoría.
import { CATEGORIAS } from "./parseGastos";

const totalDe = (gastos) =>
  (gastos ?? []).reduce((a, g) => a + (Number(g.monto) || 0), 0);

// Serie ordenada de meses viejo -> nuevo, para graficar
export const serieMensual = (meses, limite = 12) => {
  const ids = Object.keys(meses ?? {}).sort();
  return ids.slice(-limite).map((id) => ({
    id,
    total: totalDe(meses[id]?.gastos),
    cantidad: (meses[id]?.gastos ?? []).length,
  }));
};

export const estadisticas = (meses) => {
  const serie = serieMensual(meses, 1000);
  if (serie.length === 0) {
    return { promedio: 0, maximo: null, minimo: null, totalHistorico: 0 };
  }
  const totalHistorico = serie.reduce((a, m) => a + m.total, 0);
  const conGasto = serie.filter((m) => m.total > 0);
  return {
    promedio: conGasto.length
      ? Math.round(totalHistorico / conGasto.length)
      : 0,
    maximo: conGasto.length
      ? conGasto.reduce((a, b) => (b.total > a.total ? b : a))
      : null,
    minimo: conGasto.length
      ? conGasto.reduce((a, b) => (b.total < a.total ? b : a))
      : null,
    totalHistorico,
  };
};

// Variación del mes contra el anterior. null si no hay con qué comparar.
export const compararConAnterior = (meses, mesId) => {
  const ids = Object.keys(meses ?? {}).sort();
  const pos = ids.indexOf(mesId);
  if (pos <= 0) return null;

  const actual = totalDe(meses[mesId]?.gastos);
  const anterior = totalDe(meses[ids[pos - 1]]?.gastos);
  if (anterior === 0) return null;

  const diferencia = actual - anterior;
  return {
    anteriorId: ids[pos - 1],
    anterior,
    actual,
    diferencia,
    porcentaje: Math.round((diferencia / anterior) * 100),
    subio: diferencia > 0,
  };
};

// Desglose por categoría de un mes, ordenado de mayor a menor
export const porCategoria = (gastos) => {
  const acumulado = {};
  (gastos ?? []).forEach((g) => {
    const cat = g.categoria && CATEGORIAS[g.categoria] ? g.categoria : "otros";
    acumulado[cat] = (acumulado[cat] ?? 0) + (Number(g.monto) || 0);
  });

  const total = Object.values(acumulado).reduce((a, b) => a + b, 0);

  return Object.entries(acumulado)
    .map(([clave, monto]) => ({
      clave,
      ...CATEGORIAS[clave],
      monto,
      porcentaje: total > 0 ? Math.round((monto / total) * 100) : 0,
    }))
    .sort((a, b) => b.monto - a.monto);
};
