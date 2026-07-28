import { useRef, useState } from "react";
import {
  IoClose,
  IoDownloadOutline,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoLogoWhatsapp,
  IoCopyOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import {
  descargarRespaldo,
  descargarCSV,
  leerRespaldo,
  describirRespaldo,
} from "../lib/backup";
import { textoResumen, urlWhatsApp } from "../lib/compartir";
import { nombreMes } from "../lib/storage";
import { useModal } from "../hooks/useModal";

// Ajustes: respaldo, exportación y compartir. Todo lo que protege los datos
// vive acá para que sea fácil de encontrar.
const SettingsModal = ({
  estado,
  mesActivo,
  hogar,
  gastos,
  participantes,
  resumen,
  onRestaurar,
  onClose,
}) => {
  useModal(onClose);
  const inputArchivo = useRef(null);
  const [pendiente, setPendiente] = useState(null); // respaldo por confirmar
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);

  const elegirArchivo = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setError("");
    const lector = new FileReader();
    lector.onload = () => {
      const r = leerRespaldo(String(lector.result));
      if (!r.ok) {
        setError(r.error);
        setPendiente(null);
      } else {
        setPendiente({ estado: r.estado, resumen: describirRespaldo(r.estado) });
      }
    };
    lector.onerror = () => setError("No se pudo leer el archivo.");
    lector.readAsText(archivo);
    e.target.value = ""; // permite reelegir el mismo archivo
  };

  const copiarResumen = async () => {
    const texto = textoResumen(mesActivo, hogar, gastos, resumen);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setError("El navegador no dejó copiar. Usa el botón de WhatsApp.");
    }
  };

  const compartirWhatsApp = () => {
    const texto = textoResumen(mesActivo, hogar, gastos, resumen);
    window.open(urlWhatsApp(texto), "_blank", "noopener,noreferrer");
  };

  const cantidadMeses = Object.keys(estado.meses ?? {}).length;

  return (
    <div className="fixed inset-0 bg-secondary/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-secondary">Ajustes y respaldo</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-secondary">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* COMPARTIR */}
          <section>
            <h4 className="font-semibold text-secondary mb-1">
              Compartir el mes
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Manda el resumen de {nombreMes(mesActivo)} con quién le transfiere a quién.
            </p>
            <div className="flex gap-2">
              <button
                onClick={compartirWhatsApp}
                className="flex-1 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:brightness-95 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <IoLogoWhatsapp size={20} /> WhatsApp
              </button>
              <button
                onClick={copiarResumen}
                className="px-4 py-3 border border-gray-200 text-secondary font-semibold rounded-lg hover:border-primary transition flex items-center gap-2"
              >
                {copiado ? (
                  <>
                    <IoCheckmarkCircle size={20} className="text-primary" /> Copiado
                  </>
                ) : (
                  <>
                    <IoCopyOutline size={20} /> Copiar
                  </>
                )}
              </button>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* RESPALDO */}
          <section>
            <h4 className="font-semibold text-secondary mb-1">Respaldo</h4>
            <p className="text-xs text-gray-500 mb-3">
              Los datos viven solo en este dispositivo. Si limpias el navegador o
              cambias de teléfono, se pierden. Baja un respaldo de vez en cuando.
            </p>

            <div className="bg-accent/40 rounded-lg p-3 mb-3 text-xs text-secondary">
              Tienes <span className="font-semibold">{cantidadMeses}</span>{" "}
              {cantidadMeses === 1 ? "mes guardado" : "meses guardados"} y{" "}
              <span className="font-semibold">{participantes.length}</span> personas.
            </div>

            <div className="space-y-2">
              <button
                onClick={() => descargarRespaldo(estado)}
                className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <IoDownloadOutline size={20} /> Descargar respaldo
              </button>

              <button
                onClick={() => inputArchivo.current?.click()}
                className="w-full py-3 border border-gray-200 text-secondary font-semibold rounded-lg hover:border-primary transition flex items-center justify-center gap-2"
              >
                <IoCloudUploadOutline size={20} /> Restaurar desde archivo
              </button>
              <input
                ref={inputArchivo}
                type="file"
                accept="application/json,.json"
                onChange={elegirArchivo}
                className="hidden"
              />

              <button
                onClick={() => descargarCSV(mesActivo, gastos, participantes, resumen)}
                className="w-full py-3 border border-gray-200 text-secondary font-semibold rounded-lg hover:border-primary transition flex items-center justify-center gap-2"
              >
                <IoDocumentTextOutline size={20} /> Exportar el mes a Excel (CSV)
              </button>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                {error}
              </p>
            )}

            {/* Confirmación antes de pisar los datos actuales */}
            {pendiente && (
              <div className="mt-3 border border-amber-200 bg-amber-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <IoWarningOutline className="text-amber-600 shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-secondary">
                    <p className="font-semibold">Esto reemplaza todo lo que tienes ahora.</p>
                    <p className="text-xs text-gray-600 mt-1">
                      El respaldo trae {pendiente.resumen.personas} personas,{" "}
                      {pendiente.resumen.meses} meses y {pendiente.resumen.gastos} gastos
                      {pendiente.resumen.desde &&
                        ` (${pendiente.resumen.desde} a ${pendiente.resumen.hasta})`}
                      .
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      onRestaurar(pendiente.estado);
                      setPendiente(null);
                      onClose();
                    }}
                    className="flex-1 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700"
                  >
                    Sí, restaurar
                  </button>
                  <button
                    onClick={() => setPendiente(null)}
                    className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-white"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
