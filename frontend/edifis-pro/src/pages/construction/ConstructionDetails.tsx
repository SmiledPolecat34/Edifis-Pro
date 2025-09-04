import React, {
  useState,
  useEffect,
  ChangeEvent,
  FocusEvent,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import constructionSiteService, {
  ConstructionSite,
} from "../../../services/constructionSiteService";
import userService, { User } from "../../../services/userService";
import Loading from "../../components/loading/Loading";
import Badge from "../../components/badge/Badge";

export default function ConstructionDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [construction, setConstruction] =
    useState<ConstructionSite | null>(null);
  const [initialConstruction, setInitialConstruction] =
    useState<ConstructionSite | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [manager, setManager] = useState<User | null>(null);
  const [managerError, setManagerError] = useState<string | null>(null);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [managerInput, setManagerInput] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const canEdit = user && user.role && ["Admin", "HR", "Manager"].includes(user.role.name) && construction && !["Annulé", "Terminé"].includes(construction.state || "");
  const canDelete = user && user.role && ["Admin", "HR"].includes(user.role.name);

  console.log("user", user);
  console.log("construction", construction);
  console.log("canEdit", canEdit);
  console.log("canDelete", canDelete);

  useEffect(() => {
    async function fetchConstruction() {
      try {
        const data = await constructionSiteService.getById(Number(id));
        setConstruction(data);
        setInitialConstruction(data);

        if (data.chef_de_projet_id) {
          const m = await userService.getById(data.chef_de_projet_id);
          setManager(m);
          setManagerInput(`${m.user_id} - ${m.firstname} ${m.lastname} (${m.email})`);
        }
      } catch (err) {
        setError("Erreur lors du chargement du chantier.");
      } finally {
        setLoading(false);
      }
    }
    fetchConstruction();
  }, [id]);

  useEffect(() => {
    if (!isEditing) return;
    async function fetchUsers() {
      try {
        const users = await userService.getAllProjectChiefs();
        setAllUsers(users);
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs :", err);
      }
    }
    fetchUsers();
  }, [isEditing]);

  useEffect(() => {
    async function fetchManager() {
      if (!construction?.chef_de_projet_id) {
        setManager(null);
        return;
      }
      try {
        const userData = await userService.getById(
          construction.chef_de_projet_id
        );
        setManager(userData);
      } catch (err) {
        console.error(err);
        setManagerError("Impossible de charger les infos du chef de projet.");
      }
    }
    fetchManager();
  }, [construction?.chef_de_projet_id]);

  const handleCancel = () => {
    if (initialConstruction) {
      setConstruction(initialConstruction);
      if (initialConstruction.chef_de_projet_id) {
        userService
          .getById(initialConstruction.chef_de_projet_id)
          .then((m) => {
            setManager(m);
            setManagerInput(
              `${m.user_id} - ${m.firstname} ${m.lastname} (${m.email})`
            );
          })
          .catch(() => {
            setManager(null);
            setManagerInput("");
          });
      } else {
        setManager(null);
        setManagerInput("");
      }
    }
    setIsEditing(false);
    setManagerError(null);
  };

  const handleSave = async () => {
    if (!construction) return;
    try {
      setLoading(true);
      await constructionSiteService.update(Number(id), construction);
      setInitialConstruction(construction);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour du chantier.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProject = async () => {
    if (!construction) return;
    if (window.confirm("Êtes-vous sûr de vouloir annuler ce chantier ?")) {
      try {
        setLoading(true);
        const updatedConstruction = { ...construction, state: "Annulé" as const };
        await constructionSiteService.update(Number(id), updatedConstruction);
        setConstruction(updatedConstruction);
        setInitialConstruction(updatedConstruction);
        setIsEditing(false);
      } catch (err) {
        console.error(err);
        setError("Erreur lors de l'annulation du chantier.");
      } finally {
        setLoading(false);
      }
    }
  };

  const onManagerInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManagerInput(value);
    const q = value.trim().toLowerCase();

    const idMatch = q.match(/^(\d+)/);
    if (idMatch) {
      const idNum = Number(idMatch[1]);
      setConstruction((prev) =>
        prev ? { ...prev, chef_de_projet_id: idNum } : prev
      );
      setFilteredUsers([]);
      return;
    }

    if (q.length > 0) {
      setFilteredUsers(
        allUsers.filter((u) => {
          const fullName = `${u.firstname} ${u.lastname}`.toLowerCase();
          const email = u.email.toLowerCase();
          return fullName.includes(q) || email.includes(q);
        })
      );
    } else {
      setFilteredUsers([]);
    }
  };

  const onManagerBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTimeout(() => setFilteredUsers([]), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100dvh-65px)] w-full p-8">
        <Loading />
      </div>
    );
  }
  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }
  if (!construction) {
    return <p className="text-center text-slate-500">Chantier non trouvé</p>;
  }

  const rawState = construction.state ?? "Prévu";
  const mappedState =
    rawState === "Prévu"
      ? "Prévu"
      : (rawState as "En cours" | "Terminé" | "Annulé" | "Prévu");

  return (
    <main className="min-h-[calc(100dvh-65px)] p-8 bg-gray-100">
      <div className="flex flex-col gap-4 bg-white p-8 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2 text-center"
          >
            Retour
          </button>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-gray-200 text-gray-950 hover:bg-gray-300 h-9 px-4 py-2"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 h-9 px-4 py-2"
                >
                  Valider les modifications
                </button>
              </>
            ) : (
              <>
                {canEdit && (
                  <button
                    onClick={handleCancelProject}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-yellow-400 text-yellow-950 hover:bg-yellow-500 h-9 px-4 py-2"
                  >
                    Annuler le projet
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2"
                  >
                    Modifier
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={construction.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConstruction({ ...construction, name: e.target.value })
                  }
                  placeholder="Nom du chantier"
                  className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : (
                construction.name
              )}
            </h1>
            <Badge status={mappedState} />
          </div>

          <p className="text-gray-700">
            {isEditing ? (
              <textarea
                name="description"
                value={construction.description ?? ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setConstruction({
                    ...construction,
                    description: e.target.value,
                  })
                }
                placeholder="Description"
                className="h-36 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              />
            ) : (
              construction.description
            )}
          </p>

          <p className="text-sm text-slate-500">
            {isEditing ? (
              <input
                type="text"
                name="adresse"
                value={construction.adresse ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConstruction({ ...construction, adresse: e.target.value })
                }
                placeholder="Adresse"
                className="h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              />
            ) : (
              construction.adresse
            )}
          </p>

          <p>
            <strong>Début :</strong>{" "}
            {isEditing ? (
              <input
                type="date"
                name="start_date"
                value={construction.start_date ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConstruction({
                    ...construction,
                    start_date: e.target.value,
                  })
                }
                placeholder="Date de début"
                className="rounded-md border border-slate-200 bg-transparent px-3 py-1 text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              />
            ) : (
              construction.start_date
            )}
          </p>

          <p>
            <strong>Fin :</strong>{" "}
            {isEditing ? (
              <input
                type="date"
                name="end_date"
                value={construction.end_date ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConstruction({
                    ...construction,
                    end_date: e.target.value,
                  })
                }
                placeholder="Date de fin"
                className="rounded-md border border-slate-200 bg-transparent px-3 py-1 text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              />
            ) : (
              construction.end_date
            )}
          </p>
          <div className="mt-2">
            <label className="text-sm font-medium">
              Détails du chef de projet: <br />
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={managerInput}
                  onChange={onManagerInputChange}
                  onBlur={onManagerBlur}
                  placeholder="Rechercher un chef de projet..."
                  className="h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {filteredUsers.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                    {filteredUsers.map((u) => (
                      <li
                        key={u.user_id}
                        className="cursor-pointer p-2 hover:bg-gray-100"
                        onClick={() => {
                          if(construction) {
                            setConstruction({ ...construction, chef_de_projet_id: u.user_id });
                            setManager(u);
                            setManagerInput(`${u.user_id} - ${u.firstname} ${u.lastname} (${u.email})`);
                            setFilteredUsers([]);
                          }
                        }}
                      >
                        {u.firstname} {u.lastname} ({u.email})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : manager ? (
              <Link
                to={`/user/${manager.user_id}`}
                className="text-blue-600 hover:underline"
              >
                {manager.firstname} {manager.lastname} — {manager.email}
              </Link>
            ) : (
              <p className="text-sm text-slate-500">
                {construction.chef_de_projet_id
                  ? "Chargement en cours..."
                  : "Aucun chef de projet assigné"}
              </p>
            )}
          </div>

          <p className="mt-4">
            <strong>Date de création :</strong>{" "}
            {construction.start_date ?? "Non spécifiée"}
          </p>

          <p>
            <strong>Date de mise à jour :</strong>{" "}
            {construction.updated_at ?? "Non spécifiée"}
          </p>
        </div>
      </div>
    </main>
  );
}