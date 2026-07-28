// Parser de texto pegado -> gastos.
//
// Objetivo: que copiar y pegar desde el Excel (o escribir a mano rápido) sea
// suficiente para cargar el mes. Acepta formatos variados porque cada planilla
// es distinta:
//   Luz	32000            (tab, típico de Excel)
//   Luz  32.000
//   Luz;32000
//   Luz,32000
//   Luz $32.990
//   Netflix 7.490 CLP
//   💡 Luz 32000

// Palabras que suelen venir en encabezados de planilla y hay que ignorar
const ENCABEZADOS = [
  "gasto", "gastos", "concepto", "detalle", "descripcion", "descripción",
  "item", "ítem", "monto", "valor", "total", "precio", "cuenta", "cuentas",
  "mes", "fecha",
];

// Emoji sugerido según el nombre del gasto: evita elegirlo a mano.
const REGLAS_EMOJI = [
  // "gastos comunes" va antes que "gas" para que no se lo lleve el 🔥
  [/gastos? comun|conserj|edificio/i, "🏢"],
  [/luz|electric|enel|cge/i, "💡"],
  [/agua|aguas|sanitar/i, "🚿"],
  [/\bgas\b|lipigas|abastible|metrogas/i, "🔥"],
  [/internet|wifi|fibra|mundo|vtr|movistar|entel|claro/i, "🌐"],
  [/netflix/i, "📺"],
  [/apple|itunes|icloud/i, "🍿"],
  [/spotify|music/i, "🎵"],
  [/disney|hbo|max|prime|star/i, "🎬"],
  [/gata|gato|michi|felin/i, "🐱"],
  [/perr|can\b|dog/i, "🐶"],
  [/arena|litter/i, "🧻"],
  [/super|feria|comida|almuerzo|mercado|jumbo|lider|tottus|unimarc/i, "🛒"],
  [/arriendo|renta|dividendo|hipotec/i, "🏠"],
  [/auto|bencina|combustible|copec|shell|petrobras|estacion/i, "🚗"],
  [/celular|plan|telefon/i, "📱"],
  [/farmacia|remedio|salud|isapre|fonasa/i, "💊"],
  [/aseo|limpieza|detergente/i, "🧼"],
  [/gimnasio|gym|deporte/i, "🏋️"],
  [/seguro/i, "🛡️"],
];

export const sugerirEmoji = (nombre) => {
  const regla = REGLAS_EMOJI.find(([re]) => re.test(nombre));
  return regla ? regla[1] : "🛒";
};

// Categorías para el desglose del historial. El orden importa: gana la primera
// que calce, por eso "gastos comunes" va antes que "gas".
export const CATEGORIAS = {
  basicos: { nombre: "Básicos", emoji: "💡", color: "#629584" },
  hogar: { nombre: "Hogar", emoji: "🏠", color: "#243642" },
  streaming: { nombre: "Streaming", emoji: "📺", color: "#8AAFA1" },
  mercado: { nombre: "Mercado", emoji: "🛒", color: "#C08457" },
  mascotas: { nombre: "Mascotas", emoji: "🐱", color: "#A67B9A" },
  transporte: { nombre: "Transporte", emoji: "🚗", color: "#5B8FA8" },
  salud: { nombre: "Salud", emoji: "💊", color: "#B5654F" },
  otros: { nombre: "Otros", emoji: "📦", color: "#9CA3AF" },
};

const REGLAS_CATEGORIA = [
  [/gastos? comun|conserj|edificio|arriendo|renta|dividendo|hipotec|aseo|limpieza|detergente|seguro/i, "hogar"],
  [/luz|electric|enel|cge|agua|sanitar|\bgas\b|lipigas|abastible|metrogas|internet|wifi|fibra|vtr|movistar|entel|claro|celular|plan|telefon/i, "basicos"],
  [/netflix|spotify|disney|hbo|max|prime|star|apple|itunes|icloud|music/i, "streaming"],
  [/gata|gato|michi|felin|perr|dog|arena|litter|veterinar/i, "mascotas"],
  [/super|feria|comida|almuerzo|mercado|jumbo|lider|tottus|unimarc/i, "mercado"],
  [/auto|bencina|combustible|copec|shell|petrobras|estacion|metro|micro|uber/i, "transporte"],
  [/farmacia|remedio|salud|isapre|fonasa|medic|dentista|gimnasio|gym/i, "salud"],
];

export const sugerirCategoria = (nombre) => {
  const regla = REGLAS_CATEGORIA.find(([re]) => re.test(nombre));
  return regla ? regla[1] : "otros";
};

// Cuentas fijas que se repiten todos los meses. Los gastos variables
// (super, bencina, farmacia) NO se marcan recurrentes para que no se
// arrastren al mes siguiente con un monto que ya no corresponde.
const RE_FIJO =
  /luz|electric|enel|cge|agua|sanitar|\bgas\b|lipigas|abastible|metrogas|internet|wifi|fibra|netflix|spotify|disney|hbo|max|prime|apple|icloud|arriendo|dividendo|gastos? comun|conserj|seguro|plan|celular|gimnasio|gym/i;

export const esRecurrente = (nombre) => RE_FIJO.test(nombre);

// Extrae el monto de una línea. Devuelve { nombre, monto } o null.
const parsearLinea = (linea) => {
  const limpia = linea.trim();
  if (!limpia) return null;

  // Separadores explícitos primero (tab, ;, |). La coma se trata aparte
  // porque en Chile también es separador decimal/miles.
  let nombre = null;
  let montoTexto = null;

  const porSeparador = limpia.split(/\t|;|\|/);
  if (porSeparador.length >= 2) {
    // Tomamos la última columna que tenga dígitos como monto
    for (let i = porSeparador.length - 1; i >= 1; i--) {
      if (/\d/.test(porSeparador[i])) {
        montoTexto = porSeparador[i];
        nombre = porSeparador.slice(0, i).join(" ");
        break;
      }
    }
  }

  // Si no hubo separador, buscamos el último número de la línea
  if (montoTexto === null) {
    const m = limpia.match(/^(.*?)[\s,:$]*(\$?\s*[\d][\d.,]*)\s*(clp|pesos|\$)?\.?$/i);
    if (!m) return null;
    nombre = m[1];
    montoTexto = m[2];
  }

  const monto = Number(String(montoTexto).replace(/\D/g, ""));
  const nombreLimpio = String(nombre)
    .replace(/^[\s\-•*·>]+/, "")
    .replace(/[\s:,-]+$/, "")
    .trim();

  if (!nombreLimpio || !monto) return null;
  // Descarta filas de encabezado / totales
  const bajo = nombreLimpio.toLowerCase();
  if (ENCABEZADOS.some((h) => bajo === h)) return null;
  if (/^totales?$/i.test(bajo)) return null;

  return { nombre: nombreLimpio, monto };
};

// Parsea un bloque de texto completo.
export const parsearTexto = (texto) =>
  String(texto || "")
    .split(/\r?\n/)
    .map(parsearLinea)
    .filter(Boolean)
    .map((g) => ({
      ...g,
      emoji: sugerirEmoji(g.nombre),
      categoria: sugerirCategoria(g.nombre),
      reparto: "proporcional",
      recurrente: esRecurrente(g.nombre),
      pagado: false,
    }));
