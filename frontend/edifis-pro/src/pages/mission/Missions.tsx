import { useEffect, useState } from 'react';
import taskService, { Task } from '../../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/badge/Badge';
import { Link } from 'react-router-dom';

const statusPriority: Record<string, number> = {
  'En cours': 1,
  Prévu: 2,
  Terminé: 3,
  Annulé: 4,
};

export default function Missions() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 👇 States édition
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchTasks() {
      try {
        let data: Task[] = [];
        if (user?.role?.name === 'Admin') {
          data = await taskService.getAll();
        } else if (user) {
          data = await taskService.getByUserId(user.user_id);
        }
        setTasks(data);
      } catch (err) {
        console.error('[Missions] Erreur API:', err);
        setError('Erreur lors du chargement des missions.');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [user]);

  useEffect(() => {
    let results = tasks.filter(t => {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    });
    if (filterStatus) {
      results = results.filter(t => t.status === filterStatus);
    }
    results.sort((a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99));
    setFilteredTasks(results);
  }, [search, tasks, filterStatus]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    if (!editedTask) return;
    setEditedTask({ ...editedTask, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!editedTask) return;
    try {
      await taskService.update(editedTask.task_id, editedTask);
      setTasks(prev => prev.map(t => (t.task_id === editedTask.task_id ? editedTask : t)));
      setEditingTaskId(null);
      setEditedTask(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde :', err);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      try {
        await taskService.delete(taskId);
        setTasks(prev => prev.filter(t => t.task_id !== taskId));
      } catch (err) {
        console.error('Erreur lors de la suppression :', err);
        setError('Erreur lors de la suppression de la mission.');
      }
    }
  };

  if (loading) return <p className="text-center text-gray-500">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-bold text-gray-900">Missions</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher une mission..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg shadow-sm"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg shadow-sm"
        >
          <option value="">Tous statuts</option>
          <option value="En cours">En cours</option>
          <option value="Prévu">Prévu</option>
          <option value="Terminé">Terminé</option>
          <option value="Annulé">Annulé</option>
        </select>
      </div>
      <Link
        to="/AddTask"
        className="ml-2 inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Ajouter une mission
      </Link>

      {filteredTasks.length === 0 ? (
        <p className="text-center text-gray-500">Aucune mission trouvée.</p>
      ) : (
        <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6">
          {filteredTasks.map(task => {
            const cs = task.construction_site;
            const isEditing = editingTaskId === task.task_id;

            return (
              <div
                key={task.task_id}
                className="bg-white border border-gray-200 rounded-lg shadow-lg p-5 relative"
              >
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={editedTask?.name || ''}
                      onChange={handleChange}
                      className="w-full border p-2 mb-2 rounded"
                    />
                    <textarea
                      name="description"
                      value={editedTask?.description || ''}
                      onChange={handleChange}
                      className="w-full border p-2 mb-2 rounded"
                    />
                    <select
                      name="status"
                      value={editedTask?.status || ''}
                      onChange={handleChange}
                      className="w-full border p-2 mb-2 rounded"
                    >
                      <option value="En cours">En cours</option>
                      <option value="Prévu">Prévu</option>
                      <option value="Terminé">Terminé</option>
                      <option value="Annulé">Annulé</option>
                    </select>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleSave}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => {
                          setEditingTaskId(null);
                          setEditedTask(null);
                        }}
                        className="bg-gray-300 px-4 py-2 rounded"
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-semibold text-gray-900">{task.name}</h2>
                      {task.status && <Badge status={task.status} />}
                    </div>
                    <p className="text-gray-700">{task.description}</p>

                    <p className="text-sm text-gray-600 mt-2">
                      <strong>📅 Début :</strong>{' '}
                      {task.start_date ? new Date(task.start_date).toLocaleString() : 'Non défini'}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>⏳ Fin :</strong>{' '}
                      {task.end_date ? new Date(task.end_date).toLocaleString() : 'Non défini'}
                    </p>

                    <div className="mt-2">
                      <strong className="text-gray-800">👥 Assignée à :</strong>
                      {!task.users || task.users.length === 0 ? (
                        <p className="text-gray-600 italic">Aucune assignation pour le moment...</p>
                      ) : (
                        <ul className="text-gray-800">
                          {task.users.map(u => (
                            <li key={u.user_id}>
                              – {u.firstname} {u.lastname}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {cs && (
                      <div className="mt-4">
                        <h3 className="text-gray-700">
                          <strong>Nom :</strong> {cs.name}
                        </h3>
                        <p className="text-xl font-semibold text-gray-900">
                          <Link
                            to={`/ConstructionDetails/${cs.construction_site_id}`}
                            className="italic hover:underline text-sm text-gray-500"
                          >
                            Détails du chantier
                          </Link>
                        </p>
                      </div>
                    )}

                    {(user?.role?.name === 'Admin' ||
                      (user?.role?.name === 'Manager' && task.createdBy === user.user_id) ||
                      (user?.role?.name === 'Project_Chief' &&
                        task.assignedBy === user.user_id)) && (
                      <div className="mt-4 flex gap-2">
                        <Link
                          to={`/editmission/${task.task_id}`}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(task.task_id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
