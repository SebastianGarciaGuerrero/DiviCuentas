/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // 1. Paleta de Colores Centralizada
      colors: {
        primary: "#629584", // Tu verde principal (botones, destacados)
        secondary: "#243642", // El color oscuro (texto, headers)
        accent: "#E2F1E7", // El verde muy claro (fondos suaves)
        background: "#F9FAFB", // Un gris muy muy claro para el fondo de la web (mejor que blanco puro)
      },
      // 2. Tipografía Global
      fontFamily: {
        sans: ['"Titillium Web"', "sans-serif"], // Sobrescribe la fuente por defecto de Tailwind
      },
      // 3. Animaciones personalizadas
      animation: {
        fadeIn: "fadeIn 0.8s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
