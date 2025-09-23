import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import constructionSiteService from '../../../services/constructionSiteService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/loading/Loading';
import Badge from '../../components/badge/Badge';
import { List, LayoutGrid } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface ConstructionSite {
  id: number;
  name: string;
  description: string;
  address: string;
  manager: string;
  status: string;
  startDate: string;
  endDate: string;
  image: string;
}

const GridView = ({ projects }: { projects: ConstructionSite[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {projects.map(project => (
      <div
        key={project.id}
        className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <img
          className="h-48 w-full object-cover rounded-md mb-4"
          src={project.image}
          alt={project.name}
          width={400}
          height={200}
        />
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 mr-2">{project.name}</h3>
          {['En cours', 'Terminé', 'Annulé', 'Prévu'].includes(project.status) && (
            <Badge status={project.status as 'En cours' | 'Terminé' | 'Annulé' | 'Prévu'} />
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4 flex-grow">{project.description}</p>
        <Link
          to={`/ConstructionDetails/${project.id}`}
          className="mt-auto inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 w-full"
        >
          Voir plus
        </Link>
      </div>
    ))}
  </div>
);

const ListView = ({ projects }: { projects: ConstructionSite[] }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left font-medium text-gray-600">Nom</th>
          <th className="px-6 py-3 text-left font-medium text-gray-600">Adresse</th>
          <th className="px-6 py-3 text-left font-medium text-gray-600">Chef de chantier</th>
          <th className="px-6 py-3 text-left font-medium text-gray-600">Statut</th>
          <th className="px-6 py-3 text-left font-medium text-gray-600"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {projects.map(project => (
          <tr key={project.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 font-semibold text-gray-900">{project.name}</td>
            <td className="px-6 py-4 text-gray-700">{project.address}</td>
            <td className="px-6 py-4 text-gray-700">{project.manager}</td>
            <td className="px-6 py-4">
              {['En cours', 'Terminé', 'Annulé', 'Prévu'].includes(project.status) && (
                <Badge status={project.status as 'En cours' | 'Terminé' | 'Annulé' | 'Prévu'} />
              )}
            </td>
            <td className="px-6 py-4 text-right">
              <Link
                to={`/ConstructionDetails/${project.id}`}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-8 px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Voir
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function Construction() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ConstructionSite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const isMobile = useMediaQuery('(max-width: 768px)');

  const statuses = ['Tous', 'En cours', 'Terminé', 'Annulé', 'Prévu'];

  useEffect(() => {
    if (isMobile) {
      setView('grid');
    }
  }, [isMobile]);

  useEffect(() => {
    const fetchConstructionSites = async () => {
      try {
        const data = await constructionSiteService.getAll();
        const formattedData = data.map(site => ({
          id: site.construction_site_id ?? 0,
          name: site.name ?? '',
          description: site.description ?? '',
          address: site.adresse ?? '',
          manager: String(site.chef_de_projet_id ?? ''),
          status: site.state ?? 'Prévu',
          startDate: site.start_date ?? '',
          endDate: site.end_date ?? '',
          image:
            site.image_url ||
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSANsddCLc_2TYdgSqBQVFNutn0FvR6qB7BQg&s',
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
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-dark hover:bg-orange-600 shadow-sm"
          >
            Ajouter un chantier
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <label htmlFor="searchQuery" className="sr-only">
          Rechercher un chantier
        </label>
        <input
          type="search"
          placeholder="Rechercher un chantier..."
          className="h-10 w-full md:w-1/3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <label htmlFor="statusFilter" className="sr-only">
          Filtrer les chantiers par statut
        </label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 w-full md:w-auto rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <button
            onClick={() => setView('grid')}
            aria-label="Afficher en grille"
            className={`p-2 cursor-pointer rounded-md ${view === 'grid' ? 'bg-orange-500 text-dark' : 'bg-gray-200 text-gray-700'}`}
          >
            <LayoutGrid size={20} />
          </button>

          <button
            onClick={() => setView('list')}
            aria-label="Afficher en liste"
            className={`p-2 cursor-pointer rounded-md ${view === 'list' ? 'bg-orange-500 text-dark' : 'bg-gray-200 text-gray-700'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        isMobile || view === 'grid' ? (
          <GridView projects={filteredProjects} />
        ) : (
          <ListView projects={filteredProjects} />
        )
      ) : (
        <p className="text-center text-gray-600 col-span-full py-10">
          Aucun chantier ne correspond à votre recherche.
        </p>
      )}
    </main>
  );
}
