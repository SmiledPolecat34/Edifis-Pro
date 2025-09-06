import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { House, Construction, Hammer, UserRound, LogOut, UserSearch } from 'lucide-react';
import clsx from 'clsx';
import logo from '../../assets/images/logo.svg';

const routes = [
  { to: '/', label: 'Accueil', Icon: House },
  { to: '/missions', label: 'Missions', Icon: Hammer },
  { to: '/construction', label: 'Chantiers', Icon: Construction },
  { to: '/workers', label: 'Employés', Icon: UserRound },
  { to: '/competences', label: 'Compétences', Icon: UserSearch },
];

interface SideBarProps {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (isOpen: boolean) => void;
}

export default function SideBar({ isMobileNavOpen, setIsMobileNavOpen }: SideBarProps) {
  const { logout } = useAuth();

  const handleLinkClick = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 flex flex-col justify-between h-dvh w-[250px] bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out z-40',
        {
          'translate-x-0': isMobileNavOpen,
          '-translate-x-full': !isMobileNavOpen,
        },
        'md:translate-x-0', // Always visible on medium screens and up
      )}
    >
      <div>
        <div className="flex items-center space-x-4 h-16 border-b border-slate-200 px-4">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="flex items-center align-center space-x-1.5 text-lg text-slate-950 font-semibold uppercase transition-colors"
          >
            <img src={logo} alt="Edifis Pro" className="h-4 w-4" />
            Edifis <span className="font-light">Pro</span>
          </Link>
        </div>
        <ul className="flex flex-col space-y-1.5 p-4">
          {routes.map(({ to, label, Icon }, index) => (
            <NavLink
              to={to}
              key={index}
              onClick={handleLinkClick} // Close nav on link click
              className="rounded-md cursor-pointer bg-transparent transition-colors hover:bg-slate-200"
            >
              <li className="flex items-center space-x-2 h-8 px-2.5">
                <Icon size={18} />
                <span className="text-slate-950 text-sm">{label}</span>
              </li>
            </NavLink>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center p-4 space-y-4">
        <button
          onClick={() => {
            logout();
            handleLinkClick(); // Also close nav on logout
          }}
          aria-label="Se déconnecter de votre compte"
          className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 w-full shadow-sm"
        >
          <span>Se déconnecter</span>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
