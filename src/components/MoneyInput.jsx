import { formatearInput, soloNumeros } from "../lib/format";

// Input de moneda CLP: muestra "1.234" mientras se escribe y entrega el número.
const MoneyInput = ({ value, onChange, className = "", ...props }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      $
    </span>
    <input
      type="text"
      inputMode="numeric"
      value={formatearInput(value)}
      onChange={(e) => onChange(soloNumeros(e.target.value))}
      className={`w-full p-3 pl-7 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-secondary font-medium ${className}`}
      {...props}
    />
  </div>
);

export default MoneyInput;
