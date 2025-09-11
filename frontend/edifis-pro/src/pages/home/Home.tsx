import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SiteTaskChart from '../../components/siteTaskChart/SiteTaskChart';
import Badge from '../../components/badge/Badge';
import StatCard from '../../components/statCard/StatCard';
import taskService, { Task } from '../../../services/taskService';
import constructionSiteService, {
  ConstructionSite,
} from '../../../services/constructionSiteService';
import userService, { User } from '../../../services/userService';
import { Building, Users, ListChecks } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const userRole = user.role?.name;
        const canViewAllSites = userRole && ['Admin', 'Manager', 'HR'].includes(userRole);
        const canViewAllWorkers = userRole && ['Admin', 'Manager', 'HR'].includes(userRole);

        const promises = [];
        promises.push(
          userRole === 'Admin' ? taskService.getAll() : taskService.getByUserId(user.user_id!),
        );
        if (canViewAllSites) {
          promises.push(constructionSiteService.getAll());
        } else {
          promises.push(Promise.resolve([]));
        }
        if (canViewAllWorkers) {
          promises.push(userService.getDirectory());
        } else {
          promises.push(Promise.resolve([]));
        }

        const [tasksData, sitesData, workersData] = await Promise.all(promises);

        setTasks(tasksData as Task[]);
        setSites(sitesData as ConstructionSite[]);
        setWorkers(workersData as User[]);
      } catch (err) {
        console.error('[Home] Erreur API:', err);
        setError('Erreur lors du chargement du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Calculate stats
  const activeSites = sites.filter(s => s.state === 'En cours').length;
  const totalWorkers = workers.length;
  const tasksToDo = tasks.filter(t => t.status === 'Prévu' || t.status === 'En cours').length;

  const siteTaskCounts = sites.map(site => ({
    name: site.name,
    taskCount: tasks.filter(task => task.construction_site?.construction_site_id === site.construction_site_id).length,
  }));

  const canViewStats = user?.role?.name && ['Admin', 'Manager', 'HR'].includes(user.role.name);

  if (loading) return <p className="text-center text-gray-500 py-10">Chargement...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

  if (!user) {
    return <p className="text-center text-gray-500 py-10">Chargement utilisateur...</p>;
  }

  return (
    <main className="p-4 md:p-8 bg-gray-100">
      {/* --- Header --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenue, {user.firstname} !</h1>
        <p className="text-base text-gray-600">Voici un aperçu de votre activité sur Edifis Pro.</p>
      </div>

      {/* --- Stat Cards (The new part) --- */}
      {canViewStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Building size={24} className="text-white" />}
            title="Chantiers en cours"
            value={activeSites}
            color="bg-blue-500"
            to="/construction"
          />
          <StatCard
            icon={<Users size={24} className="text-white" />}
            title="Employés actifs"
            value={totalWorkers}
            color="bg-green-500"
            to="/workers"
          />
          <StatCard
            icon={<ListChecks size={24} className="text-white" />}
            title="Tâches à faire"
            value={tasksToDo}
            color="bg-orange-500"
            to="/missions"
          />
        </div>
      )}

      {/* --- Original Layout Structure --- */}
      <div className="grid xl:grid-cols-[7fr_3fr] grid-cols-1 gap-8 h-full">
        <div className="flex flex-col min-h-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tâches par chantier</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex-grow">
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center pt-10">
                Aucune mission pour le moment.
              </p>
            ) : (
              <SiteTaskChart sites={siteTaskCounts} />
            )}
          </div>
        </div>
        <div className="flex flex-col min-h-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Vos missions récentes</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-y-auto max-h-96">
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-sm text-center pt-10">
                  Aucune mission pour le moment.
                </p>
              ) : (
                tasks.map(task => (
                  <div key={task.task_id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-center flex-wrap mb-2 gap-2">
                      <h3 className="font-semibold text-gray-900">{task.name}</h3>
                      {task.status && (
                        <Badge
                          status={
                            task.status === 'En attente de validation'
                              ? 'Prévu'
                              : (task.status as 'En cours' | 'Terminé' | 'Annulé' | 'Prévu')
                          }
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
