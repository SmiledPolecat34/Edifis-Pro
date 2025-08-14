import { useState } from "react";
import { useNavigate } from "react-router-dom";
import competenceService from "../../../services/competenceService";

export default function AddCompetence() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await competenceService.create({ name, description });
      navigate("/competences");
    } catch {
      setError("Erreur à l’enregistrement.");
    }
  };

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2 text-center"
      >
        Retour
      </button>
      <h1 className="text-2xl font-bold mb-4">Ajouter une compétence</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Enregistrer
        </button>
      </form>
    </main>
  );
}
