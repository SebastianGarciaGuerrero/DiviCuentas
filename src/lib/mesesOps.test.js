// @vitest-environment jsdom
// Cubre las operaciones sobre meses que hace el store (borrar mes, restaurar
// respaldo con mes activo inválido). La lógica se replica acá tal como está
// en useHogar para poder probarla sin montar React.
import { describe, it, expect } from "vitest";
import { migrar } from "./storage";

const borrarMes = (s, id) => {
  const ids = Object.keys(s.meses ?? {});
  if (ids.length <= 1 || !s.meses[id]) return s;
  const meses = { ...s.meses };
  delete meses[id];
  const restantes = Object.keys(meses).sort();
  return {
    ...s,
    meses,
    mesActivo: s.mesActivo === id ? restantes[restantes.length - 1] : s.mesActivo,
  };
};

const base = () => ({
  version: 1,
  configurado: true,
  hogar: { nombre: "Casa" },
  participantes: [{ id: "a", nombre: "Ana", ingreso: 0 }],
  mesActivo: "2026-07",
  meses: {
    "2026-06": { gastos: [{ id: "g", nombre: "Luz", monto: 1000 }] },
    "2026-07": { gastos: [] },
  },
});

describe("borrarMes", () => {
  it("elimina el mes y mueve el activo al más reciente que queda", () => {
    const r = borrarMes(base(), "2026-07");
    expect(Object.keys(r.meses)).toEqual(["2026-06"]);
    expect(r.mesActivo).toBe("2026-06");
  });

  it("no cambia el mes activo si borra otro", () => {
    const r = borrarMes(base(), "2026-06");
    expect(r.mesActivo).toBe("2026-07");
  });

  it("no deja al usuario sin ningún mes", () => {
    const s = { ...base(), meses: { "2026-07": { gastos: [] } } };
    expect(borrarMes(s, "2026-07")).toBe(s);
  });

  it("ignora un mes que no existe", () => {
    const s = base();
    expect(borrarMes(s, "2020-01")).toBe(s);
  });
});

describe("migrar sobre un respaldo restaurado", () => {
  it("completa los campos nuevos sin perder los gastos", () => {
    const viejo = {
      participantes: [{ id: "a", nombre: "Ana", ingreso: 100 }],
      mesActivo: "2026-07",
      meses: { "2026-07": { gastos: [{ id: "g", nombre: "Netflix", monto: 7490 }] } },
    };
    const r = migrar(viejo);
    expect(r.configurado).toBe(true);
    expect(r.meses["2026-07"].gastos[0]).toMatchObject({
      nombre: "Netflix",
      monto: 7490,
      categoria: "streaming",
      pagado: false,
    });
  });

  it("es idempotente: correrla dos veces da lo mismo", () => {
    const una = migrar(base());
    const dos = migrar(una);
    expect(dos).toEqual(una);
  });

  it("no se cae si el respaldo no trae meses", () => {
    const r = migrar({ participantes: [], meses: undefined });
    expect(r.meses).toEqual({});
  });
});
