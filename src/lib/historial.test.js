import { describe, it, expect } from "vitest";
import {
  serieMensual,
  estadisticas,
  compararConAnterior,
  porCategoria,
} from "./historial";

const g = (nombre, monto, categoria) => ({ id: nombre, nombre, monto, categoria });

const meses = {
  "2026-05": { gastos: [g("Luz", 30000, "basicos")] },
  "2026-06": { gastos: [g("Luz", 40000, "basicos"), g("Gatas", 20000, "mascotas")] },
  "2026-07": { gastos: [g("Luz", 50000, "basicos")] },
};

describe("serieMensual", () => {
  it("ordena de más viejo a más nuevo", () => {
    const s = serieMensual(meses);
    expect(s.map((m) => m.id)).toEqual(["2026-05", "2026-06", "2026-07"]);
    expect(s.map((m) => m.total)).toEqual([30000, 60000, 50000]);
  });

  it("recorta a los últimos N meses", () => {
    const s = serieMensual(meses, 2);
    expect(s.map((m) => m.id)).toEqual(["2026-06", "2026-07"]);
  });

  it("no se cae sin datos", () => {
    expect(serieMensual({})).toEqual([]);
    expect(serieMensual(undefined)).toEqual([]);
  });
});

describe("estadisticas", () => {
  it("calcula promedio, máximo y mínimo", () => {
    const e = estadisticas(meses);
    expect(e.totalHistorico).toBe(140000);
    expect(e.promedio).toBe(46667); // 140.000 / 3 redondeado
    expect(e.maximo.id).toBe("2026-06");
    expect(e.minimo.id).toBe("2026-05");
  });

  it("ignora los meses vacíos al promediar", () => {
    // un mes sin gastos no debe hundir el promedio
    const e = estadisticas({ ...meses, "2026-08": { gastos: [] } });
    expect(e.promedio).toBe(46667);
  });

  it("no se cae sin meses", () => {
    expect(estadisticas({})).toMatchObject({ promedio: 0, maximo: null });
  });
});

describe("compararConAnterior", () => {
  it("detecta que bajó el gasto", () => {
    const c = compararConAnterior(meses, "2026-07");
    expect(c.anterior).toBe(60000);
    expect(c.actual).toBe(50000);
    expect(c.porcentaje).toBe(-17);
    expect(c.subio).toBe(false);
  });

  it("detecta que subió el gasto", () => {
    const c = compararConAnterior(meses, "2026-06");
    expect(c.porcentaje).toBe(100); // 30.000 -> 60.000
    expect(c.subio).toBe(true);
  });

  it("no compara el primer mes", () => {
    expect(compararConAnterior(meses, "2026-05")).toBeNull();
  });

  it("no divide por cero si el mes anterior fue vacío", () => {
    const conVacio = { "2026-05": { gastos: [] }, "2026-06": { gastos: [g("Luz", 10000)] } };
    expect(compararConAnterior(conVacio, "2026-06")).toBeNull();
  });
});

describe("porCategoria", () => {
  it("agrupa y ordena de mayor a menor", () => {
    const r = porCategoria(meses["2026-06"].gastos);
    expect(r[0]).toMatchObject({ clave: "basicos", monto: 40000, porcentaje: 67 });
    expect(r[1]).toMatchObject({ clave: "mascotas", monto: 20000, porcentaje: 33 });
  });

  it("manda a otros lo que no tiene categoría válida", () => {
    const r = porCategoria([g("Raro", 5000, "inventada"), g("Sin", 5000, undefined)]);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ clave: "otros", monto: 10000 });
  });

  it("trae nombre y color para pintar el gráfico", () => {
    const [primero] = porCategoria(meses["2026-06"].gastos);
    expect(primero.nombre).toBe("Básicos");
    expect(primero.color).toMatch(/^#/);
  });

  it("no se cae con un mes vacío", () => {
    expect(porCategoria([])).toEqual([]);
  });
});
