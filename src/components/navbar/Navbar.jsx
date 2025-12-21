import { useState } from "react";
import { IoMenu, IoClose, IoWalletOutline } from "react-icons/io5";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="bg-accent p-2 rounded-lg text-primary">
              <IoWalletOutline size={24} />
            </div>
            <a
              href="#"
              className="font-bold text-2xl text-secondary tracking-tight"
            >
              DiviCuentas
            </a>
          </div>

          {/* MENU ESCRITORIO */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#inicio"
              className="text-gray-600 hover:text-primary font-medium transition-colors"
            >
              Inicio
            </a>
            <a
              href="#nosotros"
              className="text-gray-600 hover:text-primary font-medium transition-colors"
            >
              Sobre Nosotros
            </a>

            <a
              href="#login"
              className="px-5 py-2.5 bg-secondary text-white font-medium rounded-lg hover:bg-primary transition-all transform hover:-translate-y-0.5 shadow-md"
            >
              Iniciar Sesión
            </a>
          </div>

          {/* BOTÓN MÓVIL */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary hover:text-primary focus:outline-none p-2"
              aria-label="Abrir menú"
            >
              {isOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg animate-fadeIn">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            <a
              href="#inicio"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-accent/50"
            >
              Inicio
            </a>
            <a
              href="#nosotros"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-accent/50"
            >
              Sobre Nosotros
            </a>
            <a
              href="#login"
              onClick={() => setIsOpen(false)}
              className="block mt-4 px-3 py-3 rounded-md text-base font-bold text-center bg-secondary text-white hover:bg-primary"
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
