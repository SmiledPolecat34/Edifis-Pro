import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../assets/images/logo.svg';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (title: string, message: string, linkText: string, linkTo: string) => (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <img src={logo} alt="Logo Edifis Pro" className="h-10 w-10" loading="lazy" />
      </div>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-600">{message}</p>
      <Link
        to={linkTo}
        className="inline-block text-sm text-orange-600 hover:text-orange-700 hover:underline underline-offset-4 transition-colors font-medium"
      >
        {linkText}
      </Link>
    </div>
  );

  return (
    <main className="h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[400px] bg-white p-8 rounded-lg shadow-md border border-gray-200">
        {!token ? (
          renderMessage(
            'Lien invalide',
            'Le lien de réinitialisation est invalide ou a expiré.',
            'Demander un nouveau lien',
            '/forgot-password',
          )
        ) : success ? (
          renderMessage(
            'Mot de passe réinitialisé !',
            'Vous allez être redirigé vers la page de connexion...',
            'Se connecter maintenant',
            '/login',
          )
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <img src={logo} alt="Logo Edifis Pro" className="h-8 w-8" loading="lazy" />
              <h1 className="text-2xl font-semibold text-gray-900">
                Réinitialiser le mot de passe
              </h1>
              <p className="text-sm text-gray-600">Entrez votre nouveau mot de passe.</p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="newPassword">
                  Nouveau mot de passe
                </label>
                <input
                  id="newPassword"
                  placeholder="••••••••"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="confirmNewPassword">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmNewPassword"
                  placeholder="••••••••"
                  type="password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-dark hover:bg-orange-600 disabled:opacity-50 shadow-sm cursor-pointer"
                disabled={loading || !formData.newPassword || !formData.confirmNewPassword}
                type="submit"
              >
                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </button>
            </form>
            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors"
              >
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
