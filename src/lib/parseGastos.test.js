import { describe, it, expect } from "vitest";
import {
  parsearTexto,
  sugerirEmoji,
  esRecurrente,
  sugerirCategoria,
} from "./parseGastos";

describe("parsearTexto", () => {
  it("lee el formato con tabulaciones que pega Excel", () => {
    const r = parsearTexto("Luz\t32000\nAgua\t18500");
    expect(r).toHaveLength(2);
    expect(r[0]).toMatchObject({ nombre: "Luz", monto: 32000 });
    expect(r[1]).toMatchObject({ nombre: "Agua", monto: 18500 });
  });

  it("entiende montos con puntos, signo peso y sufijos", () => {
    const r = parsearTexto("Internet $26.990\nNetflix 7.490 CLP\nGas;25000");
    expect(r.map((g) => g.monto)).toEqual([26990, 7490, 25000]);
    expect(r.map((g) => g.nombre)).toEqual(["Internet", "Netflix", "Gas"]);
  });

  it("acepta nombres de varias palabras", () => {
    const r = parsearTexto("Comida gatas\t42000\nGastos comunes  55000");
    expect(r[0]).toMatchObject({ nombre: "Comida gatas", monto: 42000 });
    expect(r[1]).toMatchObject({ nombre: "Gastos comunes", monto: 55000 });
  });

  it("ignora encabezados y filas de total", () => {
    const r = parsearTexto("Gasto\tMonto\nLuz\t32000\nTotal\t32000");
    expect(r).toHaveLength(1);
    expect(r[0].nombre).toBe("Luz");
  });

  it("descarta líneas vacías o sin monto", () => {
    const r = parsearTexto("\nLuz\t32000\n\nesto no tiene monto\n   \n");
    expect(r).toHaveLength(1);
  });

  it("no se cae con entrada vacía o nula", () => {
    expect(parsearTexto("")).toEqual([]);
    expect(parsearTexto(null)).toEqual([]);
    expect(parsearTexto(undefined)).toEqual([]);
  });

  it("entrega cada gasto listo para usar", () => {
    const [g] = parsearTexto("Netflix\t7490");
    expect(g).toMatchObject({
      nombre: "Netflix",
      monto: 7490,
      emoji: "📺",
      categoria: "streaming",
      reparto: "proporcional",
      recurrente: true,
      pagado: false,
    });
  });
});

describe("sugerirCategoria", () => {
  it("agrupa las cuentas de servicios en básicos", () => {
    expect(sugerirCategoria("Luz")).toBe("basicos");
    expect(sugerirCategoria("Aguas Andinas")).toBe("basicos");
    expect(sugerirCategoria("Internet")).toBe("basicos");
  });

  it("separa hogar de básicos", () => {
    expect(sugerirCategoria("Gastos comunes")).toBe("hogar");
    expect(sugerirCategoria("Arriendo")).toBe("hogar");
    expect(sugerirCategoria("Gas")).toBe("basicos");
  });

  it("reconoce las demás categorías", () => {
    expect(sugerirCategoria("Netflix")).toBe("streaming");
    expect(sugerirCategoria("Comida gatas")).toBe("mascotas");
    expect(sugerirCategoria("Arena")).toBe("mascotas");
    expect(sugerirCategoria("Bencina")).toBe("transporte");
    expect(sugerirCategoria("Farmacia")).toBe("salud");
    expect(sugerirCategoria("Jumbo")).toBe("mercado");
  });

  it("cae en otros cuando no reconoce el gasto", () => {
    expect(sugerirCategoria("Regalo cumpleaños")).toBe("otros");
  });
});

describe("sugerirEmoji", () => {
  it("reconoce cuentas y proveedores chilenos", () => {
    expect(sugerirEmoji("Luz")).toBe("💡");
    expect(sugerirEmoji("Enel")).toBe("💡");
    expect(sugerirEmoji("Aguas Andinas")).toBe("🚿");
    expect(sugerirEmoji("Lipigas")).toBe("🔥");
    expect(sugerirEmoji("Jumbo")).toBe("🛒");
  });

  it("no confunde gastos comunes con gas", () => {
    expect(sugerirEmoji("Gastos comunes")).toBe("🏢");
    expect(sugerirEmoji("Gas")).toBe("🔥");
  });

  it("usa un emoji neutro cuando no reconoce el gasto", () => {
    expect(sugerirEmoji("Cosa rara")).toBe("🛒");
  });
});

describe("esRecurrente", () => {
  it("marca como fijas las cuentas de todos los meses", () => {
    expect(esRecurrente("Luz")).toBe(true);
    expect(esRecurrente("Netflix")).toBe(true);
    expect(esRecurrente("Arriendo")).toBe(true);
  });

  it("deja variables los gastos que cambian mes a mes", () => {
    // no deben arrastrarse al mes siguiente con un monto viejo
    expect(esRecurrente("Supermercado")).toBe(false);
    expect(esRecurrente("Bencina")).toBe(false);
    expect(esRecurrente("Farmacia")).toBe(false);
  });
});
