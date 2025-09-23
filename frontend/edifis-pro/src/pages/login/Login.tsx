import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import authService from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
import { LoginData } from '../../../model/Auth';
import logo from '../../assets/images/logo.svg';

import { useAuth } from '../../context/AuthContext';
import Footer from '../../layout/footer/Footer'; // Import Footer

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const isDisabled = () => {
    return !formData.email || !formData.password || loading;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { token } = await authService.login(formData);
      login(token);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow md:p-8 w-full">
        <div className="relative grid h-full flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div className="relative h-full flex-col lg:flex hidden p-8 rounded-xl overflow-hidden">
            <Link
              to="/"
              className="relative flex items-center text-sm text-dark sm:text-lg font-medium uppercase z-10"
            >
              <img src={logo} alt="Logo Edifis Pro" className="h-4.5 w-4.5 mr-2" />
              Edifis <span className="font-light">Pro</span>
            </Link>
            <h1 className="relative xl:text-6xl text-5xl font-bold uppercase text-dark mt-auto z-10">
              Construisons ensemble l'avenir, solide et durable.
            </h1>
            <img
              className="absolute inset-0 object-cover w-full h-full brightness-60"
              src="https://images.unsplash.com/photo-1626885930974-4b69aa21bbf9?w=1200&q=70&auto=format&fit=crop"
              alt="Chantier de construction"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <div className="p-4 lg:p-8">
            <div className="mx-auto flex max-w-[350px] w-full flex-col justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <img src={logo} alt="Logo Edifis Pro" className="h-8 w-8" />
                <Link
                  to="/"
                  className="flex justify-center items-center text-2xl font-semibold text-slate-950 uppercase"
                >
                  Edifis <span className="font-light">Pro</span>
                </Link>
                <p className="text-sm text-slate-500">
                  Entrez vos identifiants pour vous connecter
                </p>
              </div>
              <div className="grid gap-6">
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <label className="sr-only" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      id="email"
                      placeholder="Email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <label className="sr-only" htmlFor="password">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        id="password"
                        placeholder="Mot de passe"
                        autoCapitalize="none"
                        autoComplete="password"
                        autoCorrect="off"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-dark hover:bg-orange-600 disabled:opacity-50 shadow-sm cursor-pointer"
                      disabled={isDisabled()}
                    >
                      {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                    <div className="text-center flex justify-between">
                      {/* <Link 
                                                to="/register" 
                                                className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors"
                                            >
                                                Créer un compte
                                            </Link> */}
                      <Link
                        to="/forgot-password"
                        className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
              <p className="px-8 text-center text-sm text-slate-500 ">
                En cliquant "Se connecter", vous acceptez{' '}
                <a
                  className="underline underline-offset-4 hover:text-slate-950 transition-colors"
                  href="/terms"
                >
                  nos conditions d'utilisation
                </a>{' '}
                et{' '}
                <a
                  className="underline underline-offset-4 hover:text-slate-950 transition-colors"
                  href="/privacy"
                >
                  notre politique de confidentialité
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
