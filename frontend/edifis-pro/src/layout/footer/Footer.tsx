import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.svg";

export default function Footer() {
    return (
        <footer className="w-full border-t border-slate-200">
            <div className="flex gap-12 md:p-8 p-4">
                <div>
                    <h3 className="text-slate-950 font-semibold text-lg">
                        À propos
                    </h3>
                    <ul className="mt-4 space-y-2">
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Carrières
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Annonces
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Juridique
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Condition d'utilisation
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Confidentialité
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-slate-950 font-semibold text-lg">
                        Entreprise
                    </h3>
                    <ul className="mt-4 space-y-2">
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Demande pour les marchands P2P
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Postuler au listing
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Services institutionnels et VIP
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Labs
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-slate-950 font-semibold text-lg">
                        Services
                    </h3>
                    <ul className="mt-4 space-y-2">
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Centre d'aide
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Statut du système
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/"
                                className="text-slate-950/60 text-sm hover:text-slate-950/100 transition-colors"
                            >
                                Contactez-nous
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="flex justify-between items-center flex-wrap gap-4 w-full border-t border-slate-200 md:p-8 p-4">
                <Link
                    to="/"
                    className="flex items-center align-center space-x-1.5 text-sm text-slate-950 font-semibold uppercase transition-colors"
                >
                    <img src={logo} alt="Edifis Pro" className="h-4 w-4" />
                    Edifis <span className="font-light">Pro</span>
                </Link>
                <p className="text-slate-950 text-sm">
                    © {new Date().getFullYear()} Edifis Pro. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
