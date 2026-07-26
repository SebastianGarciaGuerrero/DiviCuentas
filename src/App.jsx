import { IoWalletOutline } from "react-icons/io5";
import { useHogar } from "./store/useHogar";
import Dashboard from "./components/Dashboard";
import Welcome from "./components/Welcome";

const App = () => {
  const hogar = useHogar();

  // Primera vez: pedimos hogar y personas antes de mostrar el dashboard
  if (!hogar.configurado) {
    return <Welcome onListo={hogar.completarOnboarding} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Barra superior minimalista */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-2">
          <div className="bg-accent p-2 rounded-lg text-primary">
            <IoWalletOutline size={20} />
          </div>
          <span className="font-bold text-lg text-secondary tracking-tight">
            DiviCuentas
          </span>
        </div>
      </header>

      <main className="flex-grow">
        <Dashboard {...hogar} />
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        DiviCuentas · la forma justa de compartir gastos
      </footer>
    </div>
  );
};

export default App;
