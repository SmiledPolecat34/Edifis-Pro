import { Link } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../assets/images/logo.svg';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      setSuccess(true);
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

  return (
    <main className="h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[400px] bg-white p-8 rounded-lg shadow-md border border-gray-200">
        {success ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={logo} alt="Logo Edifis Pro" className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Email envoyé !</h1>
            <p className="text-sm text-gray-600">
              Si un compte existe avec l'adresse email{' '}
              <span className="font-medium text-gray-800">{email}</span>, vous recevrez un lien pour
              réinitialiser votre mot de passe.
            </p>
            <p className="text-sm text-gray-600">Vérifiez votre boîte de réception et vos spams.</p>
            <Link
              to="/login"
              className="inline-block text-sm text-orange-600 hover:text-orange-700 hover:underline underline-offset-4 transition-colors font-medium"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <img src={logo} alt="Logo Edifis Pro" className="h-8 w-8" />
              <h1 className="text-2xl font-semibold text-gray-900">Mot de passe oublié</h1>
              <p className="text-sm text-gray-600">
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                  Adresse email
                </label>
                <input
                  id="email"
                  placeholder="nom@exemple.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-dark hover:bg-orange-600 disabled:opacity-50 shadow-sm"
                disabled={loading || !email}
                type="submit"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
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
