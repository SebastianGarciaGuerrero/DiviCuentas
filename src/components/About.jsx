import {
  IoHeartOutline,
  IoCalculatorOutline,
  IoHappyOutline,
} from "react-icons/io5";

const About = () => {
  const features = [
    {
      icon: <IoCalculatorOutline size={40} />,
      title: "Matemática Justa",
      desc: "Calculamos los porcentajes basados en los ingresos reales. Quien gana más, aporta más.",
    },
    {
      icon: <IoHeartOutline size={40} />,
      title: "Cuida tus Relaciones",
      desc: "El dinero es la causa #1 de estrés en parejas. Eliminamos la fricción financiera.",
    },
    {
      icon: <IoHappyOutline size={40} />,
      title: "Simple y Rápido",
      desc: "Sin registros complicados ni excel. Ingresa, calcula y transfiere.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-secondary uppercase tracking-wider">
          ¿Por qué DiviCuentas?
        </h2>
        <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {features.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-accent/30 transition-colors"
          >
            <div className="text-primary mb-4 bg-accent p-4 rounded-full">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">
              {item.title}
            </h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
