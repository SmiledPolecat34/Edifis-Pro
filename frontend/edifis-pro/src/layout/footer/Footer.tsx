import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.svg';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-8 py-10">
        <div className="md:col-span-1">
          <Link
            to="/"
            className="flex items-center align-center space-x-1.5 text-lg text-gray-900 font-semibold uppercase transition-colors"
          >
            <img src={logo} alt="Edifis Pro" className="h-5 w-5" />
            Edifis <span className="font-light">Pro</span>
          </Link>
          <p className="text-gray-600 text-sm mt-2">Construisons l'avenir, ensemble.</p>
        </div>
        <div>
          <h3 className="text-gray-900 font-semibold text-base">À propos</h3>
          <ul className="mt-4 space-y-2">
            <li><Link to="/careers" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">Carrières</Link></li>
            <li><Link to="/roadmap" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">Feuille de route</Link></li>
            <li><Link to="/" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">Annonces</Link></li>
            <li>
              <Link
                to="/legal"
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Juridique
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Conditions d'utilisation
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Confidentialité
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-gray-900 font-semibold text-base">Entreprise</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Demande pour les marchands P2P
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Postuler au listing
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Services institutionnels et VIP
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Labs
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-gray-900 font-semibold text-base">Services</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                to="/help"
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Centre d'aide
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Statut du système
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Contactez-nous
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4 md:px-8 px-4 py-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Edifis Pro. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
