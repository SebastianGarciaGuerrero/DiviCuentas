// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { cargar, guardar, resetear, estadoInicial, mesId, nombreMes, uid } from "./storage";

const KEY = "divicuentas:v1";

beforeEach(() => localStorage.clear());

describe("cargar", () => {
  it("parte vacío y sin datos de ejemplo la primera vez", () => {
    const s = cargar();
    expect(s.configurado).toBe(false);
    expect(s.participantes).toEqual([]);
    expect(s.hogar.nombre).toBe("");
    // el mes actual existe pero sin gastos
    expect(s.meses[s.mesActivo].gastos).toEqual([]);
  });

  it("devuelve lo guardado tal cual", () => {
    const original = { ...estadoInicial(), configurado: true, hogar: { nombre: "Casa" } };
    guardar(original);
    expect(cargar().hogar.nombre).toBe("Casa");
  });

  it("no vuelve a mostrar la bienvenida a quien ya tenía datos", () => {
    // formato anterior: sin la bandera "configurado"
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        hogar: { nombre: "Casa Vieja" },
        participantes: [{ id: "a", nombre: "Ana", ingreso: 500000 }],
        mesActivo: "2026-07",
        meses: { "2026-07": { gastos: [] } },
      })
    );
    expect(cargar().configurado).toBe(true);
  });

  it("manda a la bienvenida si el dato viejo no tenía personas", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ version: 1, hogar: { nombre: "" }, participantes: [], meses: {} })
    );
    expect(cargar().configurado).toBe(false);
  });

  it("completa categoría y estado de pago en gastos viejos", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        configurado: true,
        hogar: { nombre: "Casa" },
        participantes: [{ id: "a", nombre: "Ana", ingreso: 500000 }],
        mesActivo: "2026-07",
        meses: {
          "2026-07": {
            gastos: [{ id: "g1", nombre: "Luz", monto: 30000, pagadoPor: "a" }],
          },
        },
      })
    );
    const [gasto] = cargar().meses["2026-07"].gastos;
    expect(gasto.categoria).toBe("basicos");
    expect(gasto.pagado).toBe(false);
    // no pisa lo que ya existía
    expect(gasto.monto).toBe(30000);
  });

  it("no pisa la categoría ni el pago si ya venían definidos", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        configurado: true,
        hogar: { nombre: "Casa" },
        participantes: [{ id: "a", nombre: "Ana", ingreso: 0 }],
        mesActivo: "2026-07",
        meses: {
          "2026-07": {
            gastos: [
              {
                id: "g1",
                nombre: "Luz",
                monto: 30000,
                pagadoPor: "a",
                categoria: "otros",
                pagado: true,
              },
            ],
          },
        },
      })
    );
    const [gasto] = cargar().meses["2026-07"].gastos;
    expect(gasto.categoria).toBe("otros");
    expect(gasto.pagado).toBe(true);
  });

  it("se recupera si el dato guardado está corrupto", () => {
    localStorage.setItem(KEY, "{no es json");
    const s = cargar();
    expect(s.configurado).toBe(false);
    expect(s.participantes).toEqual([]);
  });
});

describe("resetear", () => {
  it("deja el estado como recién instalado", () => {
    guardar({ ...estadoInicial(), configurado: true });
    const s = resetear();
    expect(s.configurado).toBe(false);
    expect(cargar().configurado).toBe(false);
  });
});

describe("utilidades de mes", () => {
  it("arma el id del mes con cero a la izquierda", () => {
    expect(mesId(new Date(2026, 0, 15))).toBe("2026-01");
    expect(mesId(new Date(2026, 11, 1))).toBe("2026-12");
  });

  it("muestra el mes en español con mayúscula inicial", () => {
    expect(nombreMes("2026-07")).toMatch(/^Julio/);
  });

  it("genera ids distintos", () => {
    const ids = new Set(Array.from({ length: 500 }, uid));
    expect(ids.size).toBe(500);
  });
});
