import { useEffect } from "react";

// Comportamiento común de los modales: cerrar con Escape y bloquear el scroll
// del fondo mientras están abiertos.
export const useModal = (onClose) => {
  useEffect(() => {
    const alPresionar = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", alPresionar);

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alPresionar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onClose]);
};
