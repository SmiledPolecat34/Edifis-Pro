import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import competenceService, { Competence } from '../../../services/competenceService';
import Loading from '../../components/loading/Loading';

export default function EditCompetence() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCompetence() {
      try {
        const comp: Competence = await competenceService.getCompetenceById(Number(id));
        setName(comp.name);
        setDescription(comp.description ?? '');
      } catch (err) {
        console.error(err);
        setError('Impossible de charger la compétence.');
      } finally {
        setLoading(false);
      }
    }
    fetchCompetence();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await competenceService.updateCompetence(Number(id), {
        name,
        description,
      });
      navigate('/competences');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la mise à jour.');
    }
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="p-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
        >
          Retour
        </button>
      </div>
    );

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm mr-4  cursor-pointer"
          >
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Modifier la compétence</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Nom de la compétence</label>
              <input
                type="text"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="border-t border-gray-200 pt-6 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-5 py-2.5 bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
