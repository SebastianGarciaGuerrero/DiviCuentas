# DiviCuentas

App de gastos mensuales compartidos para parejas, roomies y familias. La idea:
una vez al mes se sientan 5 minutos, cargan las cuentas, y la app dice
**cuánto gastaron, cuánto le toca a cada uno y quién le transfiere a quién**.

En vivo: [divi-cuenta.vercel.app](https://divi-cuenta.vercel.app)

## Qué hace

- **Bienvenida al primer uso**: pide el nombre del hogar y quiénes lo comparten.
  La app parte vacía, sin datos de ejemplo.
- **Gastos con nombre libre** — cada hogar tiene los suyos: luz, agua, gas,
  internet, Netflix, Apple TV, comida gatas, arena, lo que sea. Con emoji.
- **Dos formas de dividir por gasto**: según ingreso (paga más quien gana más)
  o mitad y mitad. Se elige gasto por gasto.
- **Quién pagó qué** → la app calcula la liquidación mínima: "Fulano le
  transfiere $X a Mengano" y quedan a mano.
- **Historial por mes** con total y promedio mensual.
- **Gastos recurrentes**: las cuentas fijas se copian solas al mes siguiente.
  Los gastos variables (super, bencina) no, para que no arrastren montos viejos.
- **Pegar desde Excel**: se copian las celdas de la planilla y la app detecta
  nombre y monto, sugiere emoji y marca cuáles son fijos. Acepta tabs, `;`,
  `$`, puntos de miles, e ignora encabezados y filas "Total".

Los datos se guardan en el navegador (`localStorage`). Todavía no hay cuentas
de usuario ni sincronización entre dispositivos.

## Correr el proyecto

```bash
npm install
npm run dev      # http://localhost:5199
npm run build
npm run lint
```

## Estructura

```
src/
├── lib/
│   ├── calc.js          # motor de cálculo: reparto, balances y liquidación
│   ├── format.js        # formato de moneda CLP
│   ├── parseGastos.js   # parser de texto pegado (Excel) -> gastos
│   └── storage.js       # persistencia en localStorage
├── store/
│   └── useHogar.js      # estado global del hogar + acciones
└── components/
    ├── Welcome.jsx      # bienvenida / onboarding del primer uso
    ├── Dashboard.jsx    # pantalla principal
    ├── ExpenseModal.jsx # crear/editar gasto
    ├── ImportModal.jsx  # pegar desde Excel
    ├── PeopleModal.jsx  # hogar, integrantes e ingresos
    ├── HistoryModal.jsx # historial de meses
    └── MoneyInput.jsx   # input de moneda
```

### Notas de diseño

- Todos los montos se manejan en **pesos enteros**. El reparto ajusta el último
  participante para que la suma dé exacto al peso (sin perder ni inventar plata).
- El estado está modelado como `participantes / meses / gastos` pensando en
  migrarlo tal cual a tablas cuando haya backend.

## Pendiente

- Cuentas de usuario y sincronización (para que el hogar comparta los datos).
- Gráfico de evolución de gastos entre meses.
- Exportar el mes a Excel/PDF.
