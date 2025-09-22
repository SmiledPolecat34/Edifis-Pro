import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import competenceService, { Competence } from '../../../services/competenceService';
import Modal from '../../components/modal/Modal';

export function ManageCompetences() {
  const [list, setList] = useState<Competence[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); // State for search bar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Competence | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    competenceService
      .getAllCompetences()
      .then(setList)
      .catch(() => setError('Impossible de charger les compétences.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette compétence ?')) return;
    try {
      await competenceService.deleteCompetence(id);
      setList(list.filter(c => c.competence_id !== id));
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  const filteredList = list.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Compétences</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <Link
            to="/competences/add"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-dark hover:bg-orange-600 w-full md:w-auto shadow-sm"
          >
            Ajouter une compétence
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="search"
          placeholder="Rechercher par nom ou description..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {filteredList.length > 0 ? (
            filteredList.map(c => (
              <li
                key={c.competence_id}
                className="p-4 flex justify-between items-center flex-wrap gap-2"
              >
                <span className="text-base text-gray-800 font-medium">{c.name}</span>
                <div className="space-x-2 flex-shrink-0">
                  <button
                    onClick={() => setSelected(c)}
                    title="Détails"
                    aria-label={`Détails de la compétence ${c.name}`}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
                  >
                    📄
                  </button>
                  <button
                    onClick={() => navigate(`/competences/edit/${c.competence_id}`)}
                    title="Modifier"
                    aria-label={`Modifier la compétence ${c.name}`}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(c.competence_id)}
                    title="Supprimer"
                    aria-label={`Supprimer la compétence ${c.name}`}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors bg-red-500 text-dark hover:bg-red-600 cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500 p-6">
              Aucune compétence ne correspond à votre recherche.
            </p>
          )}
        </ul>
      </div>

      <Modal show={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <h2 className="text-xl font-bold mb-2 text-gray-900">{selected.name}</h2>
            <p className="text-base text-gray-700">
              {selected.description || 'Aucune description fournie.'}
            </p>
          </>
        )}
      </Modal>
    </main>
  );
}
