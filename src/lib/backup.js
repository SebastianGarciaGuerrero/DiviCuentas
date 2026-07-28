// Respaldo y exportación.
//
// localStorage se puede perder (limpiar datos del navegador, cambiar de
// teléfono). Estas funciones permiten bajar todo el historial a un archivo
// y volver a cargarlo, y sacar el mes a CSV para abrirlo en Excel.

import { CATEGORIAS } from "./parseGastos";
import { nombreMes } from "./storage";

// --- descarga genérica ---
const descargar = (contenido, nombreArchivo, tipo) => {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const hoy = () => new Date().toISOString().slice(0, 10);

// --- respaldo completo ---
export const descargarRespaldo = (estado) => {
  const contenido = JSON.stringify(
    { app: "DiviCuentas", exportado: new Date().toISOString(), estado },
    null,
    2
  );
  descargar(contenido, `divicuentas-respaldo-${hoy()}.json`, "application/json");
};

// Valida que el archivo sea un respaldo nuestro antes de pisar los datos.
// Devuelve { ok, estado } o { ok: false, error }.
export const leerRespaldo = (texto) => {
  let data;
  try {
    data = JSON.parse(texto);
  } catch {
    return { ok: false, error: "El archivo no es un respaldo válido." };
  }

  // Aceptamos tanto el archivo con envoltorio como el estado pelado
  const estado = data?.estado ?? data;

  if (!estado || typeof estado !== "object") {
    return { ok: false, error: "El archivo no tiene datos de DiviCuentas." };
  }
  if (!Array.isArray(estado.participantes) || typeof estado.meses !== "object") {
    return { ok: false, error: "El respaldo está incompleto o es de otra app." };
  }

  return { ok: true, estado };
};

// Resumen de lo que trae un respaldo, para confirmar antes de restaurar
export const describirRespaldo = (estado) => {
  const meses = Object.keys(estado.meses ?? {});
  const gastos = meses.reduce(
    (a, m) => a + (estado.meses[m]?.gastos?.length ?? 0),
    0
  );
  return {
    personas: estado.participantes?.length ?? 0,
    meses: meses.length,
    gastos,
    desde: meses.length ? nombreMes(meses.sort()[0]) : null,
    hasta: meses.length ? nombreMes(meses.sort().slice(-1)[0]) : null,
  };
};

// --- CSV para Excel ---
// Separador ";" y BOM porque es lo que Excel en español abre bien de una.
const celda = (v) => {
  const s = String(v ?? "");
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const descargarCSV = (mesId, gastos, participantes, resumen) => {
  const nombrePorId = Object.fromEntries(
    participantes.map((p) => [p.id, p.nombre])
  );

  const filas = [
    ["Gasto", "Categoría", "Monto", "Pagó", "División", "Pagado"],
    ...gastos.map((g) => [
      g.nombre,
      CATEGORIAS[g.categoria]?.nombre ?? "Otros",
      g.monto,
      nombrePorId[g.pagadoPor] ?? "",
      g.reparto === "iguales" ? "Partes iguales" : "Según ingreso",
      g.pagado ? "Sí" : "No",
    ]),
    [],
    ["Total", "", resumen.total],
    [],
    ["Persona", "Le toca", "Puso", "Balance"],
    ...resumen.porPersona.map((p) => [p.nombre, p.leToca, p.pago, p.balance]),
  ];

  const csv = filas.map((f) => f.map(celda).join(";")).join("\r\n");
  descargar(
    "﻿" + csv,
    `divicuentas-${mesId}.csv`,
    "text/csv;charset=utf-8"
  );
};
