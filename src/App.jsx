import Navbar from "./components/navbar/Navbar";
import Form from "./components/Form"; // Asumo que Form está aquí o en components/Form
import About from "./components/About";
import Login from "./components/Login";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      {/* Navbar fija arriba */}
      <Navbar />

      <main className="flex-grow">
        {/* SECCIÓN 1: INICIO (El Formulario es el Héroe) */}
        {/* Agregamos pt-10 para darle aire respecto al navbar */}
        <div id="inicio" className="pt-10 pb-20">
          <div className="text-center mb-8 px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Divide tus gastos,{" "}
              <span className="text-primary">multiplica la armonía</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              La herramienta definitiva para parejas y roomies. Olvida el "mitad
              y mitad", empieza a pagar lo que realmente es justo.
            </p>
          </div>
          <Form />
        </div>

        {/* SECCIÓN 2: SOBRE NOSOTROS */}
        <div id="nosotros" className="bg-white py-20 border-t border-gray-100">
          <About />
        </div>

        {/* SECCIÓN 3: INICIAR SESIÓN */}
        <div id="login" className="bg-secondary py-20">
          <Login />
        </div>
      </main>

      {/* Footer al final */}
      <Footer />
    </div>
  );
};

export default App;
