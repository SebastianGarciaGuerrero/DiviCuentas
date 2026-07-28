import { describe, it, expect } from "vitest";
import { repartirGasto, calcularResumen, liquidar } from "./calc";

const seba = { id: "s", nombre: "Seba", ingreso: 1200000 };
const javi = { id: "j", nombre: "Javi", ingreso: 800000 };
const dos = [seba, javi];

const gasto = (over = {}) => ({
  id: "g",
  nombre: "Luz",
  monto: 30000,
  pagadoPor: "s",
  reparto: "proporcional",
  ...over,
});

describe("repartirGasto", () => {
  it("reparte proporcional al ingreso", () => {
    // 1.200.000 vs 800.000 = 60/40
    const r = repartirGasto(gasto({ monto: 100000 }), dos);
    expect(r.s).toBe(60000);
    expect(r.j).toBe(40000);
  });

  it("reparte en partes iguales cuando corresponde", () => {
    const r = repartirGasto(gasto({ monto: 30000, reparto: "iguales" }), dos);
    expect(r.s).toBe(15000);
    expect(r.j).toBe(15000);
  });

  it("nunca pierde ni inventa pesos por redondeo", () => {
    // 33.333 entre 3 no es exacto: la suma igual debe cuadrar
    const tres = [...dos, { id: "t", nombre: "Tere", ingreso: 500000 }];
    for (const monto of [33333, 10, 7, 99999, 1]) {
      for (const reparto of ["proporcional", "iguales"]) {
        const r = repartirGasto(gasto({ monto, reparto }), tres);
        const suma = Object.values(r).reduce((a, b) => a + b, 0);
        expect(suma).toBe(monto);
      }
    }
  });

  it("cae a partes iguales si nadie declaró ingreso", () => {
    const sinIngreso = [
      { id: "a", nombre: "A", ingreso: 0 },
      { id: "b", nombre: "B", ingreso: 0 },
    ];
    const r = repartirGasto(gasto({ monto: 50000 }), sinIngreso);
    expect(r.a).toBe(25000);
    expect(r.b).toBe(25000);
  });

  it("no explota sin participantes ni con monto cero", () => {
    expect(repartirGasto(gasto(), [])).toEqual({});
    expect(repartirGasto(gasto({ monto: 0 }), dos)).toEqual({});
  });
});

describe("calcularResumen", () => {
  it("suma el total y calcula lo que le toca a cada uno", () => {
    const gastos = [
      gasto({ id: "1", monto: 100000, pagadoPor: "s" }),
      gasto({ id: "2", monto: 50000, pagadoPor: "j", reparto: "iguales" }),
    ];
    const r = calcularResumen(dos, gastos);
    expect(r.total).toBe(150000);

    const s = r.porPersona.find((p) => p.id === "s");
    const j = r.porPersona.find((p) => p.id === "j");
    expect(s.leToca).toBe(60000 + 25000);
    expect(j.leToca).toBe(40000 + 25000);
    expect(s.pago).toBe(100000);
    expect(j.pago).toBe(50000);
  });

  it("lo que le toca a todos suma exactamente el total", () => {
    const gastos = [
      gasto({ id: "1", monto: 33333 }),
      gasto({ id: "2", monto: 7, reparto: "iguales" }),
      gasto({ id: "3", monto: 12345 }),
    ];
    const r = calcularResumen(dos, gastos);
    const suma = r.porPersona.reduce((a, p) => a + p.leToca, 0);
    expect(suma).toBe(r.total);
  });

  it("el balance refleja quién puso de más", () => {
    // Seba paga todo, gasto dividido en partes iguales
    const gastos = [gasto({ monto: 40000, pagadoPor: "s", reparto: "iguales" })];
    const r = calcularResumen(dos, gastos);
    const s = r.porPersona.find((p) => p.id === "s");
    const j = r.porPersona.find((p) => p.id === "j");
    expect(s.balance).toBe(20000); // puso 40.000, le tocaba 20.000
    expect(j.balance).toBe(-20000);
  });

  it("cuenta lo que falta por pagar", () => {
    const gastos = [
      gasto({ id: "1", monto: 30000, pagado: true }),
      gasto({ id: "2", monto: 20000, pagado: false }),
      gasto({ id: "3", monto: 5000 }), // sin la marca = pendiente
    ];
    const r = calcularResumen(dos, gastos);
    expect(r.pagados).toBe(1);
    expect(r.pendientes).toBe(2);
    expect(r.montoPendiente).toBe(25000);
    expect(r.todoPagado).toBe(false);
  });

  it("avisa cuando ya está todo pagado", () => {
    const gastos = [gasto({ id: "1", monto: 30000, pagado: true })];
    expect(calcularResumen(dos, gastos).todoPagado).toBe(true);
  });

  it("un mes vacío no cuenta como todo pagado", () => {
    expect(calcularResumen(dos, []).todoPagado).toBe(false);
  });

  it("mes sin gastos no rompe nada", () => {
    const r = calcularResumen(dos, []);
    expect(r.total).toBe(0);
    expect(r.liquidacion).toEqual([]);
    expect(r.porPersona.every((p) => p.balance === 0)).toBe(true);
  });
});

describe("liquidar", () => {
  it("genera la transferencia que deja a ambos en cero", () => {
    const gastos = [gasto({ monto: 40000, pagadoPor: "s", reparto: "iguales" })];
    const { liquidacion } = calcularResumen(dos, gastos);
    expect(liquidacion).toHaveLength(1);
    expect(liquidacion[0]).toMatchObject({ de: "Javi", a: "Seba", monto: 20000 });
  });

  it("no genera transferencias si ya está todo parejo", () => {
    const gastos = [
      gasto({ id: "1", monto: 20000, pagadoPor: "s", reparto: "iguales" }),
      gasto({ id: "2", monto: 20000, pagadoPor: "j", reparto: "iguales" }),
    ];
    const { liquidacion } = calcularResumen(dos, gastos);
    expect(liquidacion).toEqual([]);
  });

  it("las transferencias saldan exactamente los balances", () => {
    const personas = [
      { id: "a", nombre: "A", balance: -30000 },
      { id: "b", nombre: "B", balance: -10000 },
      { id: "c", nombre: "C", balance: 40000 },
    ];
    const t = liquidar(personas);
    const recibeC = t.filter((x) => x.aId === "c").reduce((a, x) => a + x.monto, 0);
    expect(recibeC).toBe(40000);
    expect(t.filter((x) => x.deId === "a")[0].monto).toBe(30000);
  });
});
