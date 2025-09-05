import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { House, Construction, Hammer, UserRound, LogOut, UserSearch } from 'lucide-react';

const routes = [
  { to: '/', label: 'Accueil', Icon: House },
  { to: '/missions', label: 'Missions', Icon: Hammer },
  { to: '/construction', label: 'Chantiers', Icon: Construction },
  { to: '/workers', label: 'Employés', Icon: UserRound },
  { to: '/competences', label: 'Compétences', Icon: UserSearch },
];

export default function SideBar() {
  const { logout, user } = useAuth();

  return (
    <aside className="fixed top-0 left-0 flex flex-col justify-between h-dvh w-[250px] bg-white border-r border-slate-200 pt-16 md:transform md:translate-x-0 transform -translate-x-full">
      <ul className="flex flex-col space-y-1.5 p-4">
        {routes.map(({ to, label, Icon }, index) => (
          <NavLink
            to={to}
            key={index}
            className="rounded-md cursor-pointer bg-transparent transition-colors hover:bg-slate-200"
          >
            <li className="flex items-center space-x-2 h-8 px-2.5">
              <Icon size={18} />
              <span className="text-slate-950 text-sm">{label}</span>
            </li>
          </NavLink>
        ))}
      </ul>

      <div className="flex flex-col items-center p-4 space-y-4">
        {/* Bouton de déconnexion */}
        <button
          onClick={logout}
          className="inline-flex items-center justify-between whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-transparent text-slate-950 hover:bg-slate-200 h-9 w-full px-4 py-2 cursor-pointer"
        >
          Se déconnecter
          <LogOut size={18} className="ml-2" />
        </button>
      </div>
    </aside>
  );
}
