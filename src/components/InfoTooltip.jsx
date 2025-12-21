import { useState, useRef, useEffect } from "react";
import { IoInformationCircleOutline, IoClose } from "react-icons/io5";

const InfoTooltip = () => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center justify-center text-accent hover:text-white transition-colors focus:outline-none"
        aria-label="Más información"
      >
        <IoInformationCircleOutline className="text-2xl sm:text-3xl" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-fadeIn origin-top-right p-5"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="absolute top-0 right-3 -mt-2 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-secondary text-sm uppercase tracking-wide">
                ¿Cómo funciona?
              </h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-red-500 md:hidden"
              >
                <IoClose size={20} />
              </button>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              No dividimos la cuenta en partes iguales, sino en
              <span className="font-bold text-primary"> partes justas</span>.
            </p>

            <div className="bg-accent/50 p-3 rounded-lg border border-accent">
              <p className="text-xs text-secondary">
                <strong>Ejemplo:</strong> Si ganas el doble que tu amigo,
                pagarás el doble de la cuenta. Equidad financiera real.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
