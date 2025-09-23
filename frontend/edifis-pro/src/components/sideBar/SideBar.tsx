import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { House, Construction, Hammer, UserRound, LogOut, UserSearch } from 'lucide-react';
import clsx from 'clsx';
import logo from '../../assets/images/logo.svg';
import { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';

const allRoutes = [
  {
    to: '/',
    label: 'Accueil',
    Icon: House,
    roles: ['Admin', 'Manager', 'HR', 'Project_Chief', 'Worker'],
  },
  {
    to: '/missions',
    label: 'Missions',
    Icon: Hammer,
    roles: ['Admin', 'Manager', 'Project_Chief', 'Worker'],
  },
  {
    to: '/construction',
    label: 'Chantiers',
    Icon: Construction,
    roles: ['Admin', 'Manager', 'Project_Chief'],
  },
  { to: '/workers', label: 'Employés', Icon: UserRound, roles: ['Admin', 'Manager', 'HR'] },
  { to: '/competences', label: 'Compétences', Icon: UserSearch, roles: ['Admin', 'Manager', 'HR'] },
];

interface SideBarProps {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (isOpen: boolean) => void;
}

export default function SideBar({ isMobileNavOpen, setIsMobileNavOpen }: SideBarProps) {
  const { user, logout } = useAuth();
  const [isMaintenance, setIsMaintenance] = useState(false);

  const routes = allRoutes.filter(route => user?.role && route.roles.includes(user.role.name));

  useEffect(() => {
    apiService
      .get<{ maintenance_mode: boolean }>('/status')
      .then(response => setIsMaintenance(response.maintenance_mode))
      .catch(err => console.error('Failed to fetch maintenance status', err));
  }, []);

  const handleLinkClick = () => {
    setIsMobileNavOpen(false);
  };

  const handleToggleMaintenance = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir changer le mode de maintenance ?')) {
      try {
        const response = await apiService.post<{ maintenance_mode: boolean }>('/status/toggle', {});
        setIsMaintenance(response.maintenance_mode);
        alert(`Mode maintenance ${response.maintenance_mode ? 'activé' : 'désactivé'}`);
      } catch (err) {
        alert('Erreur lors du changement de mode de maintenance.');
        console.error(err);
      }
    }
  };

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 flex flex-col justify-between h-dvh w-[250px] bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-40',
        {
          'translate-x-0': isMobileNavOpen,
          '-translate-x-full': !isMobileNavOpen,
        },
        'md:translate-x-0',
      )}
    >
      <div>
        <div className="flex items-center space-x-4 h-16 border-b border-gray-200 px-4">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="flex items-center align-center space-x-1.5 text-lg text-gray-900 font-semibold uppercase transition-colors"
          >
            <img src={logo} alt="Logo Edifis Pro" className="h-4 w-4" />
            Edifis <span className="font-light">Pro</span>
          </Link>
        </div>
        <ul className="flex flex-col space-y-1.5 p-4">
          {routes.map(({ to, label, Icon }, index) => (
            <NavLink
              to={to}
              key={index}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 h-9 px-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors',
                  { 'bg-gray-100 font-semibold': isActive },
                )
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center p-4 space-y-2 border-t border-gray-200">
        {user?.role?.name === 'Admin' && (
          <div className="w-full p-2 rounded-lg bg-gray-100 text-center">
            <p className="text-xs font-medium text-gray-600">Mode Maintenance</p>
            <p className={`text-sm font-bold ${isMaintenance ? 'text-red-600' : 'text-green-600'}`}>
              {isMaintenance ? 'Activé' : 'Désactivé'}
            </p>
            <button
              onClick={handleToggleMaintenance}
              className="text-xs text-orange-600 hover:underline mt-1 cursor-pointer"
            >
              Changer
            </button>
          </div>
        )}
        <button
          onClick={() => {
            logout();
            handleLinkClick();
          }}
          aria-label="Se déconnecter de votre compte"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 w-full shadow-sm cursor-pointer"
        >
          <LogOut size={18} />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}
