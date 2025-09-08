import { useEffect, useState } from 'react';
import taskService, { Task, TaskStatus } from '../../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/badge/Badge';
import { Link } from 'react-router-dom';

const statusPriority: Record<string, number> = {
  'En attente de validation': 1,
  'En cours': 2,
  Prévu: 3,
  Terminé: 4,
  Annulé: 5,
};

export default function Missions() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
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

  const handleStatusUpdate = async (task: Task, status: TaskStatus) => {
    try {
      const updatedTask: Task = { ...task, status };
      await taskService.update(task.task_id, updatedTask);
      setTasks(prev => prev.map(t => (t.task_id === task.task_id ? updatedTask : t)));
    } catch (err) {
      console.error(`Erreur lors du changement de statut vers ${status} :`, err);
      setError('Erreur lors de la mise à jour de la mission.');
    }
  };

  const handleRequestValidation = (task: Task) => {
    if (window.confirm('Êtes-vous sûr de vouloir demander la validation pour cette mission ?')) {
      handleStatusUpdate(task, 'En attente de validation');
    }
  };

  const handleConfirmValidation = (task: Task) => {
    if (window.confirm('Êtes-vous sûr de vouloir confirmer la fin de cette mission ?')) {
      handleStatusUpdate(task, 'Terminé');
    }
  };

  const handleRejectValidation = (task: Task) => {
    if (window.confirm('Êtes-vous sûr de vouloir rejeter la demande de fin de cette mission ?')) {
      handleStatusUpdate(task, 'En cours');
    }
  };

  if (loading) return <p className="text-center text-gray-500">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const canCreateTask =
    user?.role?.name && ['Admin', 'Manager', 'Project_Chief'].includes(user.role.name);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Missions</h1>
        {canCreateTask && (
          <Link
            to="/addamission"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 shadow-sm w-full md:w-auto"
          >
            Ajouter une mission
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher une mission..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-10 w-full md:w-1/3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as TaskStatus | '')}
          className="h-10 w-full md:w-auto rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Tous statuts</option>
          <option value="En cours">En cours</option>
          <option value="En attente de validation">En attente de validation</option>
          <option value="Prévu">Prévu</option>
          <option value="Terminé">Terminé</option>
          <option value="Annulé">Annulé</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Vous n'avez pas encore de missions.</p>
      ) : filteredTasks.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Aucune mission trouvée.</p>
      ) : (
        <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6">
          {filteredTasks.map(task => {
            const cs = task.construction_site;
            const isEditing = editingTaskId === task.task_id;

            return (
              <div
                key={task.task_id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col"
              >
                {isEditing ? (
                  <div className="flex flex-col h-full">
                    <input
                      type="text"
                      name="name"
                      value={editedTask?.name || ''}
                      onChange={handleChange}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm mb-2"
                    />
                    <textarea
                      name="description"
                      value={editedTask?.description || ''}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm mb-2 flex-grow"
                    />
                    <select
                      name="status"
                      value={editedTask?.status || ''}
                      onChange={handleChange}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm mb-4"
                    >
                      <option value="En cours">En cours</option>
                      <option value="En attente de validation">En attente de validation</option>
                      <option value="Prévu">Prévu</option>
                      <option value="Terminé">Terminé</option>
                      <option value="Annulé">Annulé</option>
                    </select>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={handleSave}
                        aria-label="Sauvegarder les modifications de la mission"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => {
                          setEditingTaskId(null);
                          setEditedTask(null);
                        }}
                        aria-label="Annuler la modification"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{task.name}</h2>
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
                    <p className="text-gray-700 mb-4 flex-grow">{task.description}</p>

                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                      <p>
                        <strong>Début :</strong>{' '}
                        {task.start_date ? new Date(task.start_date).toLocaleString() : 'N/A'}
                      </p>
                      <p>
                        <strong>Fin :</strong>{' '}
                        {task.end_date ? new Date(task.end_date).toLocaleString() : 'N/A'}
                      </p>
                    </div>

                    <div className="mb-4">
                      <strong className="text-sm text-gray-800">Assignée à :</strong>
                      {!task.users || task.users.length === 0 ? (
                        <p className="text-sm text-gray-600 italic">Personne</p>
                      ) : (
                        <ul className="text-sm list-disc list-inside text-gray-600">
                          {task.users.map(u => (
                            <li key={u.user_id}>
                              {u.firstname} {u.lastname}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {cs && (
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-500">Chantier:</p>
                        <Link
                          to={`/ConstructionDetails/${cs.construction_site_id}`}
                          className="font-semibold text-orange-600 hover:underline"
                        >
                          {cs.name}
                        </Link>
                      </div>
                    )}

                    <div className="flex-grow"></div>

                    {/* --- BOUTONS D'ACTION --- */}
                    <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4">
                      {user?.role?.name === 'Worker' && task.status === 'En cours' && (
                        <button
                          onClick={() => handleRequestValidation(task)}
                          aria-label={`Demander la validation pour la mission ${task.name}`}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                        >
                          Terminer (demande de validation)
                        </button>
                      )}

                      {(user?.role?.name === 'Admin' ||
                        user?.role?.name === 'Manager' ||
                        user?.role?.name === 'Project_Chief') && (
                        <>
                          {task.status === 'En attente de validation' && (
                            <>
                              <button
                                onClick={() => handleConfirmValidation(task)}
                                aria-label={`Confirmer la mission ${task.name}`}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-green-500 text-white hover:bg-green-600 shadow-sm"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => handleRejectValidation(task)}
                                aria-label={`Rejeter la mission ${task.name}`}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm"
                              >
                                Rejeter
                              </button>
                            </>
                          )}

                          {task.status !== 'Terminé' &&
                            task.status !== 'Annulé' &&
                            task.status !== 'En attente de validation' && (
                              <button
                                onClick={() => handleStatusUpdate(task, 'Terminé')}
                                aria-label={`Terminer la mission ${task.name}`}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-green-500 text-white hover:bg-green-600 shadow-sm"
                              >
                                Terminer
                              </button>
                            )}

                          <button
                            onClick={() => {
                              setEditingTaskId(task.task_id);
                              setEditedTask(task);
                            }}
                            aria-label={`Modifier la mission ${task.name}`}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(task.task_id)}
                            aria-label={`Supprimer la mission ${task.name}`}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-4 py-2 bg-red-500 text-white hover:bg-red-600 shadow-sm"
                          >
                            Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
