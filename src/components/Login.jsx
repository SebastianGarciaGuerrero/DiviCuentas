const Login = () => {
  return (
    <div className="max-w-md mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-secondary mb-2">
          Bienvenido de nuevo
        </h2>
        <p className="text-gray-500 mb-8 text-sm">
          Guarda tus historiales y gestiona grupos recurrentes.
        </p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors shadow-md mt-4">
            Ingresar
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400">
          ¿No tienes cuenta?{" "}
          <a href="#" className="text-primary font-bold hover:underline">
            Regístrate gratis
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
