import { describe, it, expect } from "vitest";
import { textoResumen, urlWhatsApp } from "./compartir";
import { calcularResumen } from "./calc";

const participantes = [
  { id: "s", nombre: "Seba", ingreso: 1200000 },
  { id: "j", nombre: "Javi", ingreso: 800000 },
];

const gastos = [
  {
    id: "1",
    emoji: "💡",
    nombre: "Luz",
    monto: 30000,
    pagadoPor: "s",
    reparto: "iguales",
    pagado: true,
  },
  {
    id: "2",
    emoji: "🌐",
    nombre: "Internet",
    monto: 20000,
    pagadoPor: "s",
    reparto: "iguales",
    pagado: false,
  },
];

const texto = () =>
  textoResumen(
    "2026-07",
    { nombre: "Depto Ñuñoa" },
    gastos,
    calcularResumen(participantes, gastos)
  );

describe("textoResumen", () => {
  it("encabeza con el hogar y el mes", () => {
    expect(texto()).toContain("Depto Ñuñoa — Julio de 2026");
  });

  it("lista los gastos marcando cuáles están pagados", () => {
    const t = texto();
    expect(t).toContain("✅ 💡 Luz: $30.000");
    expect(t).toContain("⬜ 🌐 Internet: $20.000");
  });

  it("muestra el total y lo que le toca a cada uno", () => {
    const t = texto();
    expect(t).toContain("Total: $50.000");
    expect(t).toContain("Seba: le toca $25.000 (puso $50.000)");
    expect(t).toContain("Javi: le toca $25.000 (puso $0)");
  });

  it("incluye la transferencia para quedar a mano", () => {
    expect(texto()).toContain("Javi → Seba: $25.000");
  });

  it("avisa lo que falta por pagar", () => {
    expect(texto()).toContain("Faltan 1 por pagar ($20.000)");
  });

  it("dice que está cuadrado cuando nadie debe", () => {
    const parejo = [
      { ...gastos[0], pagadoPor: "s", monto: 20000 },
      { ...gastos[1], pagadoPor: "j", monto: 20000, pagado: true },
    ];
    const t = textoResumen(
      "2026-07",
      { nombre: "Casa" },
      parejo,
      calcularResumen(participantes, parejo)
    );
    expect(t).toContain("Todo cuadrado");
  });

  it("no se cae con un mes vacío", () => {
    const t = textoResumen(
      "2026-07",
      { nombre: "Casa" },
      [],
      calcularResumen(participantes, [])
    );
    expect(t).toContain("Total: $0");
  });
});

describe("urlWhatsApp", () => {
  it("arma el link con el texto escapado", () => {
    const url = urlWhatsApp("Hola & chao\nsegunda línea");
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(url).toContain("%26"); // &
    expect(url).toContain("%0A"); // salto de línea
  });
});
