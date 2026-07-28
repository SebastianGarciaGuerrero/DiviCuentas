// Arma el mensaje de cierre de mes para mandar por WhatsApp.
import { formatearCLP } from "./format";
import { nombreMes } from "./storage";

export const textoResumen = (mesId, hogar, gastos, resumen) => {
  const lineas = [];

  lineas.push(`*${hogar?.nombre || "Cuentas"} — ${nombreMes(mesId)}*`);
  lineas.push(`Total: ${formatearCLP(resumen.total)}`);
  lineas.push("");

  gastos.forEach((g) => {
    const marca = g.pagado ? "✅" : "⬜";
    lineas.push(`${marca} ${g.emoji ?? ""} ${g.nombre}: ${formatearCLP(g.monto)}`.trim());
  });

  lineas.push("");
  resumen.porPersona.forEach((p) => {
    lineas.push(
      `${p.nombre}: le toca ${formatearCLP(p.leToca)} (puso ${formatearCLP(p.pago)})`
    );
  });

  if (resumen.liquidacion.length > 0) {
    lineas.push("");
    lineas.push("*Para quedar a mano:*");
    resumen.liquidacion.forEach((t) => {
      lineas.push(`${t.de} → ${t.a}: ${formatearCLP(t.monto)}`);
    });
  } else if (resumen.total > 0) {
    lineas.push("");
    lineas.push("Todo cuadrado, nadie debe nada.");
  }

  if (gastos.length > 0 && resumen.pendientes > 0) {
    lineas.push("");
    lineas.push(
      `Faltan ${resumen.pendientes} por pagar (${formatearCLP(resumen.montoPendiente)})`
    );
  }

  return lineas.join("\n");
};

export const urlWhatsApp = (texto) =>
  `https://wa.me/?text=${encodeURIComponent(texto)}`;
