import { IoLogoGithub, IoLogoLinkedin } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="bg-[#1a262f] text-white py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h4 className="font-bold text-lg text-primary">DiviCuentas</h4>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Sebastián García. Valparaíso, Chile.
          </p>
        </div>

        <div className="flex gap-4">
          {/* Puedes poner tus links reales aquí */}
          <a
            href="https://github.com/SebastianGarciaGuerrero"
            target="_blank"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoLogoGithub size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/sebastiangarciaguerrero/"
            target="_blank"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoLogoLinkedin size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
