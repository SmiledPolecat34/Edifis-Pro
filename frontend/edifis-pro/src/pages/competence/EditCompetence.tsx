import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import competenceService, { Competence } from "../../../services/competenceService";
import Loading from "../../components/loading/Loading";

export default function EditCompetence() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCompetence() {
      try {
        const comp: Competence = await competenceService.getCompetenceById(
          Number(id)
        );
        setName(comp.name);
        setDescription(comp.description ?? "");
      } catch (err) {
        console.error(err);
        setError("Impossible de charger la compétence.");
      } finally {
        setLoading(false);
      }
    }
    fetchCompetence();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await competenceService.updateCompetence(Number(id), {
        name,
        description,
      });
      navigate("/competences");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour.");
    }
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="p-8">
        <p className="text-red-500">{error}</p>
        <Link to="/competences" className="text-blue-600 underline">
          ← Retour à la liste
        </Link>
      </div>
    );

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Modifier une compétence</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-between items-center">
            <Link
              to="/competences"
              className="text-sm text-gray-600 hover:underline"
            >
              ← Annuler
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
