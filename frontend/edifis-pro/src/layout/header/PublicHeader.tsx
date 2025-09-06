import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.svg';

export default function PublicHeader() {
  return (
    <header className="sticky top-0 w-full h-16 border-b border-gray-200 bg-white/80 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-4 md:px-8">
            <Link
                to="/login"
                className="flex items-center align-center space-x-1.5 text-lg text-gray-900 font-semibold uppercase transition-colors"
                aria-label="Retour à la page de connexion"
            >
                <img src={logo} alt="Edifis Pro" className="h-5 w-5" />
                Edifis <span className="font-light">Pro</span>
            </Link>
        </div>
    </header>
  );
}
