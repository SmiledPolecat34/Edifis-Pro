import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../../services/apiService';
import logo from '../../assets/images/logo.svg';

interface Role {
  role_id: number;
  name: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    numberphone: '',
    role: '',
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await apiService.get<Role[]>('/roles');
        setRoles(res);
      } catch (err) {
        setError('Erreur lors de la récupération des rôles');
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const isDisabled = () => {
    return !formData.email || !formData.password || !formData.role || !formData.firstname || !formData.lastname || !formData.numberphone || loading;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      await apiService.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-dvh md:p-8 w-full">
      <div className="relative grid h-full flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative h-full flex-col lg:flex hidden p-8 rounded-xl overflow-hidden">
          <Link to="/" className="relative flex items-center text-sm text-white sm:text-lg font-medium uppercase z-10">
            <img src={logo} alt="Edifis Pro" className="h-4.5 w-4.5 mr-2" />
            Edifis <span className="font-light">Pro</span>
          </Link>
          <h1 className="relative xl:text-7xl text-5xl font-bold uppercase text-white mt-auto z-10">
            Construisons ensemble l'avenir, solide et durable.
          </h1>
          <img
            className="absolute inset-0 object-cover w-full h-full brightness-60"
            src="https://images.unsplash.com/photo-1626885930974-4b69aa21bbf9?q=80&w=1946&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Chantier"
          />
        </div>
        <div className="p-4 lg:p-8">
          <div className="mx-auto flex max-w-[350px] w-full flex-col justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <img src={logo} alt="Edifis Pro" className="h-8 w-8" />
              <Link to="/" className="flex justify-center items-center text-2xl font-semibold text-slate-950 uppercase">
                Edifis <span className="font-light">Pro</span>
              </Link>
              <p className="text-sm text-slate-500">Créez votre compte pour commencer</p>
            </div>
            <div className="grid gap-6">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <label className="sr-only" htmlFor="firstname">Prénom</label>
                  <input
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    id="firstname"
                    placeholder="Prénom"
                    type="text"
                    value={formData.firstname}
                    onChange={handleChange}
                  />
                  <label className="sr-only" htmlFor="lastname">Nom</label>
                  <input
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    id="lastname"
                    placeholder="Nom"
                    type="text"
                    value={formData.lastname}
                    onChange={handleChange}
                  />
                   <label className="sr-only" htmlFor="numberphone">Téléphone</label>
                  <input
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    id="numberphone"
                    placeholder="Téléphone"
                    type="text"
                    value={formData.numberphone}
                    onChange={handleChange}
                  />
                  <label className="sr-only" htmlFor="email">Email</label>
                  <input
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    id="email"
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <label className="sr-only" htmlFor="password">Mot de passe</label>
                  <input
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    id="password"
                    placeholder="Mot de passe"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <label className="sr-only" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    id="confirmPassword"
                    placeholder="Confirmer le mot de passe"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <label className="sr-only" htmlFor="role">Rôle</label>
                  <select
                    id="role"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Sélectionnez un rôle</option>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 shadow-sm"
                    disabled={isDisabled()}
                  >
                    {loading ? 'Création...' : 'Créer un compte'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

