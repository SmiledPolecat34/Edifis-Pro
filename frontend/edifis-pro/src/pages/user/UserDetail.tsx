import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import userService, { User } from "../../../services/userService";
import Loading from "../../components/loading/Loading";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getById(Number(id));
        setUser(data);
      } catch (err) {
        setError("Erreur lors du chargement de l'utilisateur.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!user) return <p className="text-center text-slate-500">Utilisateur non trouvé</p>;

  return (
    <main className="min-h-[calc(100dvh-65px)] p-8 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          {user.firstname} {user.lastname}
        </h1>
        <p className="mb-2">
          <strong>Email :</strong> {user.email}
        </p>
        <p className="mb-2">
          <strong>Téléphone :</strong> {user.numberphone}
        </p>
        <p className="mb-2">
          <strong>Rôle :</strong> {user.role}
        </p>
        {user.competences && user.competences.length > 0 && (
          <div className="mt-4">
            <strong>Compétences :</strong>
            <ul className="list-disc list-inside">
              {user.competences.map((c) => (
                <li key={c.competence_id}>{c.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
