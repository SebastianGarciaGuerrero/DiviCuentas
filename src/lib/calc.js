// Motor de cálculo de DiviCuentas.
//
// Modelo:
//  - participantes: [{ id, nombre, ingreso }]
//  - gastos: [{ id, nombre, monto, emoji, pagadoPor, reparto }]
//      reparto: "proporcional" (según ingreso) | "iguales" (mitad y mitad)
//      pagadoPor: id del participante que puso la plata (o "compartido")
//
// Devuelve, para un mes:
//  - total del mes
//  - por persona: cuánto le toca pagar y cuánto pagó -> balance
//  - liquidación: transferencias mínimas para dejar todo en cero.

// Reparte un gasto entre los participantes y devuelve { [participanteId]: monto }
export const repartirGasto = (gasto, participantes) => {
  const monto = Number(gasto.monto) || 0;
  const n = participantes.length;
  if (n === 0 || monto === 0) return {};

  const cuotas = {};

  if (gasto.reparto === "iguales") {
    const base = Math.floor(monto / n);
    participantes.forEach((p) => (cuotas[p.id] = base));
    // El resto (pesos sueltos) se lo carga el primero para que cuadre exacto
    cuotas[participantes[0].id] += monto - base * n;
    return cuotas;
  }

  // proporcional al ingreso
  const sumaIngresos = participantes.reduce(
    (acc, p) => acc + (Number(p.ingreso) || 0),
    0
  );

  // Si nadie declaró ingreso, cae a partes iguales para no dividir por cero
  if (sumaIngresos === 0) {
    return repartirGasto({ ...gasto, reparto: "iguales" }, participantes);
  }

  let repartido = 0;
  participantes.forEach((p, i) => {
    if (i === participantes.length - 1) {
      cuotas[p.id] = monto - repartido; // el último absorbe el redondeo
    } else {
      const cuota = Math.round((monto * (Number(p.ingreso) || 0)) / sumaIngresos);
      cuotas[p.id] = cuota;
      repartido += cuota;
    }
  });
  return cuotas;
};

// Resumen completo del mes
export const calcularResumen = (participantes, gastos) => {
  const total = gastos.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);

  const porPersona = participantes.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    ingreso: Number(p.ingreso) || 0,
    leToca: 0, // cuánto debería pagar en total
    pago: 0, // cuánto puso efectivamente
  }));
  const idx = Object.fromEntries(porPersona.map((p) => [p.id, p]));

  gastos.forEach((g) => {
    const cuotas = repartirGasto(g, participantes);
    Object.entries(cuotas).forEach(([pid, cuota]) => {
      if (idx[pid]) idx[pid].leToca += cuota;
    });
    if (idx[g.pagadoPor]) idx[g.pagadoPor].pago += Number(g.monto) || 0;
  });

  porPersona.forEach((p) => {
    p.balance = p.pago - p.leToca; // >0 le deben, <0 debe
    p.porcentaje = total > 0 ? Math.round((p.leToca / total) * 100) : 0;
  });

  // Avance del mes: cuántas cuentas quedan por pagar y cuánta plata falta
  const pendientes = gastos.filter((g) => !g.pagado);
  const montoPendiente = pendientes.reduce(
    (acc, g) => acc + (Number(g.monto) || 0),
    0
  );

  return {
    total,
    porPersona,
    liquidacion: liquidar(porPersona),
    pendientes: pendientes.length,
    pagados: gastos.length - pendientes.length,
    montoPendiente,
    todoPagado: gastos.length > 0 && pendientes.length === 0,
  };
};

// Algoritmo greedy de transferencias mínimas: empareja a quien más debe
// con quien más le deben, hasta saldar todo.
export const liquidar = (porPersona) => {
  const deudores = porPersona
    .filter((p) => p.balance < -0.5)
    .map((p) => ({ id: p.id, nombre: p.nombre, saldo: -p.balance }))
    .sort((a, b) => b.saldo - a.saldo);
  const acreedores = porPersona
    .filter((p) => p.balance > 0.5)
    .map((p) => ({ id: p.id, nombre: p.nombre, saldo: p.balance }))
    .sort((a, b) => b.saldo - a.saldo);

  const transferencias = [];
  let i = 0;
  let j = 0;
  while (i < deudores.length && j < acreedores.length) {
    const monto = Math.min(deudores[i].saldo, acreedores[j].saldo);
    if (monto > 0.5) {
      transferencias.push({
        de: deudores[i].nombre,
        deId: deudores[i].id,
        a: acreedores[j].nombre,
        aId: acreedores[j].id,
        monto: Math.round(monto),
      });
    }
    deudores[i].saldo -= monto;
    acreedores[j].saldo -= monto;
    if (deudores[i].saldo <= 0.5) i++;
    if (acreedores[j].saldo <= 0.5) j++;
  }
  return transferencias;
};
