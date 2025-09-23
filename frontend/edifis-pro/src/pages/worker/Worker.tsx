import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService, { User } from '../../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/loading/Loading';
import { Competence } from '../../../services/competenceService';

const DEFAULT_IMAGE = 'https://www.capcampus.com/img/u/1/job-etudiant-batiment.jpg';

export default function Workers() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tous'); // State for role filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canCreate = ['Admin', 'HR', 'Manager'].includes(user?.role?.name ?? '');

  const roles = ['Tous', 'Admin', 'Worker', 'Manager', 'Project_Chief', 'HR'];
  const roleTranslations: { [key: string]: string } = {
    Admin: 'Administrateur',
    Worker: 'Ouvrier',
    Manager: 'Manager',
    Project_Chief: 'Chef de projet',
    HR: 'Ressources Humaines',
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet employé ?')) return;

    try {
      await userService.delete(id);
      setWorkers(prev => prev.filter(w => w.user_id !== id)); // mise à jour de la liste
      alert('Employé supprimé avec succès.');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Impossible de supprimer l’employé.');
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchWorkers() {
      try {
        const data = await userService.getDirectory();
        if (!cancelled) setWorkers(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWorkers();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredWorkers = workers.filter(worker => {
    const matchesRole = roleFilter === 'Tous' || worker.role === roleFilter;

    const fullName = `${worker.firstname} ${worker.lastname}`.toLowerCase();
    const competences = (
      worker.competences?.map((c: Competence) => c.name).join(', ') || ''
    ).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || competences.includes(query);

    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100dvh-65px)] w-full p-8">
        <Loading />
      </div>
    );
  }
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Employés</h1>
        {canCreate && (
          <Link
            to="/workers/add"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-dark hover:bg-orange-600 shadow-sm"
          >
            Ajouter un employé
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <label htmlFor="searchQuery" className="sr-only">
          Rechercher par nom, compétences...
        </label>
        <input
          type="text"
          placeholder="Rechercher par nom, compétences..."
          className="h-10 w-full md:w-1/3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <label htmlFor="roleFilter" className="sr-only">
          Filtrer les employés par rôle
        </label>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="h-10 w-full md:w-auto rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
        >
          {roles.map(role => (
            <option key={role} value={role}>
              {roleTranslations[role] || role}
            </option>
          ))}
        </select>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>Aucun employé ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorkers.map(worker => (
            <div
              key={worker.user_id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <Link to={`/workers/${worker.user_id}`} className="w-full">
                <img
                  src={worker.profile_picture?.replace('/api', '') || DEFAULT_IMAGE}
                  alt={`Photo de ${worker.firstname}`}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h2 className="text-lg font-semibold text-gray-900">
                  {worker.firstname} {worker.lastname}
                </h2>
              </Link>
              <p className="text-sm font-medium text-orange-600 mb-2">
                {typeof worker.role === 'object'
                  ? roleTranslations[worker.role?.name] || worker.role?.name
                  : roleTranslations[worker.role] || worker.role}
              </p>

              <p className="text-xs text-gray-500 mb-3 px-2 py-1 bg-gray-100 rounded-full">
                {worker.competences && worker.competences.length > 0
                  ? worker.competences.map((c: Competence) => c.name).join(', ')
                  : 'Aucune compétence'}
              </p>
              <div className="flex-grow"></div>
              {canCreate && (
                <div className="mt-4 w-full flex gap-2">
                  <Link
                    to={`/workers/edit/${worker.user_id}`}
                    aria-label={`Modifier le profil de ${worker.firstname} ${worker.lastname}`}
                    className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(worker.user_id!)}
                    className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-red-600 text-dark hover:bg-red-700 cursor-pointer"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
