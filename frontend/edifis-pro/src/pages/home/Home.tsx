import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TimelineChart from "../../components/timelineChart/TimelineChart";
import Badge from "../../components/badge/Badge";
import taskService, { Task } from "../../../services/taskService";

export default function Home() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let data;
        if (user.role === "Admin") {
          data = await taskService.getAll();
        } else {
          data = await taskService.getByUserId(user.user_id);
        }
        console.log(data);
        setTasks(data);
      } catch (err) {
        setError("Erreur lors du chargement des missions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  if (loading)
    return <p className="text-center text-gray-500">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <main className="grid xl:grid-cols-[7fr_3fr] grid-cols-1 gap-8 xl:max-h-[calc(100dvh-65px)] h-full bg-gray-100 md:p-8 p-4 overflow-hidden">
      <div className="flex flex-col min-h-0">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-950">
            Bienvenue, {user.firstname} {user.lastname}
          </h1>
          <p className="text-sm text-slate-500">
            {user.role === "Admin"
              ? "Administrateur"
              : user.role === "Manager"
              ? "Chef de projet"
              : user.role === "Worker"
              ? "Ouvrier"
              : "Rôle inconnu"}
          </p>
        </div>
        <TimelineChart tasks={tasks} />
      </div>
      <div className="flex flex-col min-h-0 h-full overflow-y-auto space-y-4 scrollbar-thin">
        <h2 className="text-xl font-semibold text-slate-950">Vos missions</h2>
        {tasks.length === 0 && <p className="text-slate-500">Aucune mission pour le moment.</p>}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border border-slate-200 rounded-xl p-4"
          >
            <div className="flex justify-between items-center flex-wrap mb-2">
              <h3 className="font-semibold text-slate-900 mr-2">{task.name}</h3>
              {task.status && <Badge status={task.status} />}
            </div>

            <p className="text-sm text-slate-700 mb-2">{task.description}</p>

            <div className="my-2 border-b border-slate-200" />

            {task.start_date && task.end_date && (
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">
                  Début → {new Date(task.start_date).toLocaleDateString()} -{" "}
                  {new Date(task.start_date).toLocaleTimeString()}
                </span>
                <span className="text-xs text-slate-500">
                  Fin → {new Date(task.end_date).toLocaleDateString()} à{" "}
                  {new Date(task.end_date).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
