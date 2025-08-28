import React, {
  useState,
  useEffect,
  ChangeEvent,
  FocusEvent,
  MouseEvent,
} from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import constructionSiteService, {
  ConstructionSite,
} from "../../../services/constructionSiteService";
import userService, { User } from "../../../services/userService";
import Loading from "../../components/loading/Loading";
import Badge from "../../components/badge/Badge";
import { useNavigate } from "react-router-dom";

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

  // 1) Chargement initial du chantier + pré-remplissage du chef de projet
  useEffect(() => {
    async function fetchConstruction() {
  console.log("[ConstructionDetails] Chargement chantier id=", id);
  try {
    const data = await constructionSiteService.getById(Number(id));
    console.log("[ConstructionDetails] Chantier reçu:", data);
    setConstruction(data);
    setInitialConstruction(data);

    if (data.chef_de_projet_id) {
      console.log("[ConstructionDetails] Chef de projet id:", data.chef_de_projet_id);
      const m = await userService.getById(data.chef_de_projet_id);
      console.log("[ConstructionDetails] Manager reçu:", m);
      setManager(m);
      setManagerInput(`${m.user_id} - ${m.firstname} ${m.lastname} (${m.email})`);
    }
  } catch (err) {
    console.error("[ConstructionDetails] Erreur API chantier:", err);
    setError("Erreur lors du chargement du chantier.");
  } finally {
    console.log("[ConstructionDetails] Fin fetch chantier");
    setLoading(false);
  }
}

    fetchConstruction();
  }, [id]);

  // 2) Chargement des managers pour l'autocomplete dès qu'on passe en édition
  useEffect(() => {
    if (!isEditing) return;
    async function fetchUsers() {
      try {
        const users = await userService.getAllManagers();
        setAllUsers(users);
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs :", err);
      }
    }
    fetchUsers();
  }, [isEditing]);

  // 3) À chaque changement de chef_de_projet_id, on recharge ses infos
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

  // Annuler les modifications et restaurer l'état initial
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

  // Sauvegarder les modifications
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

  // Gestion de la saisie dans le champ « Chef de projet »
  const onManagerInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManagerInput(value);
    const q = value.trim().toLowerCase();

    // 1) Extraction d'un préfixe numérique => on met à jour l'ID directement
    const idMatch = q.match(/^(\d+)/);
    if (idMatch) {
      const idNum = Number(idMatch[1]);
      setConstruction((prev) =>
        prev ? { ...prev, chef_de_projet_id: idNum } : prev
      );
      setFilteredUsers([]);
      return;
    }

    // 2) Sinon on filtre la liste des managers par nom/prénom/email
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

  // Masquer la liste de suggestions après le blur (laisser passer le clic)
  const onManagerBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTimeout(() => setFilteredUsers([]), 100);
  };

  // Affichage selon l'état de chargement ou d'erreur
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

  // Pour la Badge
  const rawState = construction.state ?? "Prevu";
  const mappedState =
    rawState === "Prevu"
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
          {(user?.role === "Admin" || user?.role === "Manager") && (
            <div className="flex space-x-2">
              {isEditing && (
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-red-200 text-red-950 hover:bg-red-300 h-9 px-4 py-2"
                >
                  Annuler
                </button>
              )}
              <button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2"
              >
                {isEditing ? "Enregistrer" : "Modifier"}
              </button>
            </div>
          )}

        </div>

        {user?.role === "Admin" && !isEditing && (
          <button
            onClick={async () => {
              if (window.confirm("Supprimer ce chantier ?")) {
                await constructionSiteService.delete(Number(id));
                navigate("/constructions"); // retour liste
              }
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 h-9 px-4 py-2"
          >
            Supprimer
          </button>
        )}


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

          <div className="relative flex flex-col gap-1">
            <label className="text-sm font-medium">Chef de projet</label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  placeholder="Tapez le nom du chef de projet"
                  className="h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950"
                  value={managerInput}
                  onChange={onManagerInputChange}
                  onBlur={onManagerBlur}
                />
                {filteredUsers.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-md border border-slate-200 bg-white shadow-sm">
                    {filteredUsers.map((u) => (
                      <li
                        key={u.user_id}
                        className="cursor-pointer px-3 py-2 hover:bg-slate-100"
                        onMouseDown={(e: MouseEvent) => {
                          setConstruction((prev) =>
                            prev
                              ? { ...prev, chef_de_projet_id: u.user_id }
                              : prev
                          );
                          setManagerInput(`${u.firstname} ${u.lastname}`);
                          setFilteredUsers([]);
                        }}
                      >
                        {u.firstname} {u.lastname} — {u.email}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : construction.chef_de_projet_id ? (
              <p className="text-sm text-slate-700">
                {construction.chef_de_projet_id}
              </p>
            ) : (
              <p className="text-sm text-slate-500">Non spécifié</p>
            )}
            {managerError && (
              <p className="text-xs text-red-500">{managerError}</p>
            )}
          </div>

          <div className="mt-2">
            <label className="text-sm font-medium">
              Détails du chef de projet: <br />
              
            </label>
            {manager ? (
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
        </div>
      </div>
    </main>
  );
}
