import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import competenceService, { Competence } from "../../../services/competenceService";
import Modal from "../../components/modal/Modal";

export function ManageCompetences() {
  const [list, setList] = useState<Competence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Competence | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    competenceService.getAllCompetences()
      .then(setList)
      .catch(() => setError("Impossible de charger les compétences."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette compétence ?")) return;
    try {
      await competenceService.deleteCompetence(id);
      setList(list.filter((c) => c.competence_id !== id));
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Compétences</h1>
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2 text-center mr-2"
          >
            Retour
          </button>
          <Link
            to="/competences/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Ajouter
          </Link>
        </div>
      </div>
      <ul className="bg-white shadow rounded-md p-4 space-y-2">
        {list.map((c) => (
          <li
            key={c.competence_id}
            className="flex justify-between items-center"
          >
            <span>{c.name}</span>
            <div className="space-x-2">
              <button
                onClick={() => setSelected(c)}
                className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                📄
              </button>
              <button
                onClick={() => navigate(`/competences/edit/${c.competence_id}`)}
                className="text-sm px-2 py-1 bg-yellow-200 rounded hover:bg-yellow-300"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(c.competence_id)}
                className="text-sm px-2 py-1 bg-red-200 rounded hover:bg-red-300"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal show={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <h2 className="text-xl font-bold mb-2">{selected.name}</h2>
            <p>{selected.description || "Aucune description fournie."}</p>
          </>
        )}
      </Modal>
    </main>
  );
}
