# DiviCuentas

App de gastos mensuales compartidos para parejas, roomies y familias. La idea:
una vez al mes se sientan 5 minutos, cargan las cuentas, las pagan, y la app
dice **cuánto gastaron, cuánto le toca a cada uno y quién le transfiere a quién**.

En vivo: [divicuentas.vercel.app](https://divicuentas.vercel.app)

## Qué hace

- **Bienvenida al primer uso**: pide el nombre del hogar y quiénes lo comparten.
  La app parte vacía, sin datos de ejemplo.
- **Gastos con nombre libre** — cada hogar tiene los suyos: luz, agua, gas,
  internet, Netflix, Apple TV, comida gatas, arena, lo que sea. Con emoji y
  categoría sugeridos automáticamente al escribir el nombre.
- **Dos formas de dividir por gasto**: según ingreso (paga más quien gana más)
  o mitad y mitad. Se elige gasto por gasto.
- **Quién pagó qué** → la app calcula la liquidación mínima: "Fulano le
  transfiere $X a Mengano" y quedan a mano.
- **Marcar cuentas como pagadas**, con barra de avance del mes y cuánta plata
  falta por pagar.
- **Historial con gráficos**: barras por mes, comparación contra el mes anterior
  ("gastaron 12% menos que en junio") y desglose de en qué se va la plata.
- **Gastos recurrentes**: las cuentas fijas se copian solas al mes siguiente.
  Los gastos variables (super, bencina) no, para que no arrastren montos viejos.
- **Pegar desde Excel**: se copian las celdas de la planilla y la app detecta
  nombre y monto, sugiere emoji y marca cuáles son fijos. Acepta tabs, `;`,
  `$`, puntos de miles, e ignora encabezados y filas "Total".
- **Compartir por WhatsApp** el resumen del mes, o copiarlo al portapapeles.
- **Respaldo**: descargar todo el historial a un archivo y restaurarlo después.
  También exporta el mes a CSV para abrirlo en Excel.
- **Instalable en el teléfono** (PWA) y funciona sin conexión.

Los datos se guardan en el navegador (`localStorage`), o sea **viven solo en ese
dispositivo**. Por eso conviene bajar un respaldo de vez en cuando: si se limpian
los datos del navegador, se pierden. Todavía no hay cuentas de usuario ni
sincronización entre dispositivos.

## Correr el proyecto

```bash
npm install
npm run dev      # http://localhost:5199
npm run build
npm run lint
npm test         # vitest
```

## Estructura

```
src/
├── lib/
│   ├── calc.js          # motor de cálculo: reparto, balances y liquidación
│   ├── format.js        # formato de moneda CLP
│   ├── parseGastos.js   # parser de texto pegado (Excel), emojis y categorías
│   ├── historial.js     # series por mes, comparaciones y desglose
│   ├── backup.js        # respaldo JSON y exportación CSV
│   ├── compartir.js     # texto del resumen para WhatsApp
│   └── storage.js       # persistencia en localStorage + migraciones
├── store/
│   └── useHogar.js      # estado global del hogar + acciones
├── hooks/
│   └── useModal.js      # cerrar con Escape y bloquear el scroll de fondo
└── components/
    ├── Welcome.jsx      # bienvenida / onboarding del primer uso
    ├── Dashboard.jsx    # pantalla principal
    ├── ExpenseModal.jsx # crear/editar gasto
    ├── ImportModal.jsx  # pegar desde Excel
    ├── PeopleModal.jsx  # hogar, integrantes e ingresos
    ├── HistoryModal.jsx # historial con gráficos
    ├── SettingsModal.jsx# respaldo, exportar y compartir
    ├── Toast.jsx        # aviso con deshacer
    └── MoneyInput.jsx   # input de moneda
```

### Notas de diseño

- Todos los montos se manejan en **pesos enteros**. El reparto ajusta el último
  participante para que la suma dé exacto al peso (sin perder ni inventar plata).
  Hay tests que lo verifican con montos que no dividen exacto.
- El estado está modelado como `participantes / meses / gastos` pensando en
  migrarlo tal cual a tablas cuando haya backend.
- `migrar()` en `storage.js` completa los campos que agregan las versiones
  nuevas sobre datos ya guardados. Es idempotente y corre en cada carga, también
  al restaurar un respaldo viejo.
- Borrar un gasto se puede deshacer; los meses con gastos no se pueden borrar
  (solo los vacíos), para no perder historial por accidente.

## Pendiente

- **Cuentas de usuario y sincronización** para que el hogar comparta los datos
  entre teléfonos (la idea es Supabase: el modelo de datos ya calza con tablas).
- Montos variables: al traer los recurrentes, marcar los que suelen cambiar
  (luz, agua) para revisarlos en vez de arrastrar el monto del mes pasado.
- Iconos PWA en 192px y 512px (hoy se usa el logo de 500x500 para todo).
