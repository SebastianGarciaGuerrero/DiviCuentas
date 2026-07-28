// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { leerRespaldo, describirRespaldo } from "./backup";

const estadoValido = {
  version: 1,
  configurado: true,
  hogar: { nombre: "Casa" },
  participantes: [{ id: "a", nombre: "Ana", ingreso: 500000 }],
  mesActivo: "2026-07",
  meses: {
    "2026-06": { gastos: [{ id: "g0", nombre: "Luz", monto: 30000 }] },
    "2026-07": {
      gastos: [
        { id: "g1", nombre: "Agua", monto: 15000 },
        { id: "g2", nombre: "Gas", monto: 20000 },
      ],
    },
  },
};

describe("leerRespaldo", () => {
  it("acepta el archivo que genera la app", () => {
    const archivo = JSON.stringify({
      app: "DiviCuentas",
      exportado: "2026-07-28T00:00:00.000Z",
      estado: estadoValido,
    });
    const r = leerRespaldo(archivo);
    expect(r.ok).toBe(true);
    expect(r.estado.hogar.nombre).toBe("Casa");
  });

  it("acepta también el estado sin envoltorio", () => {
    const r = leerRespaldo(JSON.stringify(estadoValido));
    expect(r.ok).toBe(true);
    expect(r.estado.participantes).toHaveLength(1);
  });

  it("rechaza un archivo que no es JSON", () => {
    const r = leerRespaldo("esto no es json {{{");
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/no es un respaldo válido/i);
  });

  it("rechaza un JSON de otra app", () => {
    const r = leerRespaldo(JSON.stringify({ cualquier: "cosa" }));
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/incompleto o es de otra app/i);
  });

  it("rechaza un respaldo sin la estructura mínima", () => {
    const r = leerRespaldo(JSON.stringify({ participantes: [], noHayMeses: true }));
    expect(r.ok).toBe(false);
  });

  it("no acepta null ni texto vacío", () => {
    expect(leerRespaldo("null").ok).toBe(false);
    expect(leerRespaldo("").ok).toBe(false);
  });
});

describe("describirRespaldo", () => {
  it("cuenta lo que trae el respaldo para confirmarlo antes de restaurar", () => {
    const d = describirRespaldo(estadoValido);
    expect(d.personas).toBe(1);
    expect(d.meses).toBe(2);
    expect(d.gastos).toBe(3);
    expect(d.desde).toMatch(/Junio/);
    expect(d.hasta).toMatch(/Julio/);
  });

  it("no se cae con un respaldo vacío", () => {
    const d = describirRespaldo({ participantes: [], meses: {} });
    expect(d).toMatchObject({ personas: 0, meses: 0, gastos: 0, desde: null });
  });
});
