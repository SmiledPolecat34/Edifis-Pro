import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import constructionSiteService from '../../../services/constructionSiteService';

import { useAuth } from '../../context/AuthContext';

import Loading from '../../components/loading/Loading';
import Badge from '../../components/badge/Badge';

interface ConstructionSite {
  id: number;
  name: string;
  description: string;
  site: string;
  address: string;
  manager: string;
  status: string;
  startDate: string;
  endDate: string;
  image: string;
}

export default function Home() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ConstructionSite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous'); // State for status filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statuses = ['Tous', 'En cours', 'Terminé', 'Annulé', 'Prévu']; // Status options

  useEffect(() => {
    const fetchConstructionSites = async () => {
      try {
        const data = await constructionSiteService.getAll();

        const formattedData = data.map(site => ({
          id: site.construction_site_id ?? 0,
          name: site.name ?? '',
          description: site.description ?? '',
          site: site.adresse ?? '',
          address: site.adresse ?? '',
          manager: String(site.chef_de_projet_id ?? ''),
          status: site.state ?? 'Prévu',
          startDate: site.start_date ?? '',
          endDate: site.end_date ?? '',
          image:
            site.image_url ||
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSANsddCLc_2TYdgSqBQVFNutn0FvR6qB7BQg&s', // Image par défaut
        }));

        setProjects(formattedData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Une erreur est survenue.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConstructionSites();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'Tous' || project.status === statusFilter;
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100dvh-65px)] w-full p-8">
        <Loading />
      </div>
    );
  if (error) return <p className="text-center text-red-500">Erreur : {error}</p>;

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Chantiers</h1>
        {user && ['Admin', 'HR', 'Manager'].includes(user.role?.name) && (
          <Link
            to="/AddConstruction"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
          >
            Ajouter un chantier
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="search"
          placeholder="Rechercher un chantier..."
          className="h-10 w-full md:w-1/3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 w-full md:w-auto rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <img
                className="h-48 w-full object-cover rounded-md mb-4"
                src={project.image}
                alt={project.name}
              />
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900 mr-2">{project.name}</h3>
                {['En cours', 'Terminé', 'Annulé', 'Prévu'].includes(project.status) && (
                  <Badge status={project.status as 'En cours' | 'Terminé' | 'Annulé' | 'Prévu'} />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4 flex-grow">{project.description}</p>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Adresse</p>
                    <p className="text-sm text-gray-800">{project.address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Chef de chantier</p>
                    <p className="text-sm text-gray-800">{project.manager}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Début</p>
                    <p className="text-sm text-gray-800">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Fin</p>
                    <p className="text-sm text-gray-800">
                      {new Date(project.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to={`/ConstructionDetails/${project.id}`}
                className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 w-full"
              >
                Voir plus
              </Link>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full py-10">
            Aucun chantier ne correspond à votre recherche.
          </p>
        )}
      </div>
    </main>
  );
}
