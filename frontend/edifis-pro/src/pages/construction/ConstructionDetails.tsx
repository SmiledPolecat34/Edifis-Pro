import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import constructionSiteService from "../../../services/constructionSiteService";
import userService from "../../../services/userService";
import Loading from "../../components/loading/Loading";
import Badge from "../../components/badge/Badge";

function sanitizeInput(field: string, value: string): string {
    if (field === "description") {
        return value.replace(/[<>]/g, "");
    }
    if (field === "name") {
        return value.replace(/[^a-zA-Z0-9\s\-_]/g, "");
    }
    if (field === "adresse") {
        return value.replace(/[^a-zA-Z0-9\s,\-_]/g, "");
    }
    return value;
}

export default function ConstructionDetails() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [construction, setConstruction] = useState<ConstructionSite | null>(null);
    const [initialConstruction, setInitialConstruction] = useState<ConstructionSite | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConstruction = async () => {
            try {
                const data = await constructionSiteService.getById(Number(id));
                setConstruction(data);
                setInitialConstruction(data);
            } catch (err) {
                setError("Erreur lors du chargement du chantier.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchConstruction();
    }, [id]);

    const handleCancel = () => {
        setConstruction(initialConstruction);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await constructionSiteService.update(Number(id), construction);
            setInitialConstruction(construction);
            setIsEditing(false);
        } catch (err) {
            setError("Erreur lors de la mise à jour du chantier.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100dvh-65px)] w-full p-8">
                <Loading />
            </div>
        );
    }
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!construction) return <p className="text-center text-slate-500">Chantier non trouvé</p>;

    return (
        <main className="min-h-[calc(100dvh-65px)] p-8 bg-gray-100">
            <div className="flex flex-col gap-4 bg-white p-8 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center">
                    <Link
                        to="/construction"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2 block text-center"
                    >
                        Retour à la liste
                    </Link>

                    {user?.role === "Admin" && (
                        <div className="flex space-x-2">
                            {isEditing && (
                                <button
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-red-200 text-red-950 hover:bg-red-300 h-9 px-4 py-2 block text-center cursor-pointer"
                                    onClick={handleCancel}
                                >
                                    Annuler
                                </button>
                            )}
                            <button
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2 block text-center cursor-pointer"
                                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                            >
                                {isEditing ? "Enregistrer" : "Modifier"}
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={construction.name}
                                    onChange={(e) =>
                                        setConstruction({ ...construction, name: e.target.value })
                                    }
                                    placeholder="Nom du chantier"
                                    className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            ) : (
                                construction.name
                            )}
                        </h1>
                        <Badge status={construction.state} />
                    </div>
                    <p className="text-gray-700">
                        {isEditing ? (
                            <textarea
                                name="description"
                                value={construction.description}
                                onChange={(e) =>
                                    setConstruction({
                                        ...construction,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Description"
                                className="flex h-36 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
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
                                value={construction.adresse}
                                onChange={(e) =>
                                    setConstruction({ ...construction, adresse: e.target.value })
                                }
                                placeholder="Adresse"
                                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
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
                                value={construction.start_date}
                                onChange={(e) =>
                                    setConstruction({
                                        ...construction,
                                        start_date: e.target.value,
                                    })
                                }
                                placeholder="Date de début"
                                className="flex rounded-md border border-slate-200 bg-transparent px-3 py-1 text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        ) : (
                            construction.start_date
                        )}
                    </p>
                    <p>
                        <strong>Fin</strong>{" "}
                        {isEditing ? (
                            <input
                                type="date"
                                name="end_date"
                                value={construction.end_date}
                                onChange={(e) =>
                                    setConstruction({
                                        ...construction,
                                        end_date: e.target.value,
                                    })
                                }
                                placeholder="Date de fin"
                                className="flex rounded-md border border-slate-200 bg-transparent px-3 py-1 text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        ) : (
                            construction.end_date
                        )}
                    </p>
                    <p className="flex items-center gap-2">
                        <strong>Horaires</strong>{" "}
                        {isEditing ? (
                            <>
                                <input
                                    type="time"
                                    name="open_time"
                                    value={construction.open_time}
                                    onChange={(e) =>
                                        setConstruction({
                                            ...construction,
                                            open_time: e.target.value,
                                        })
                                    }
                                    className="flex rounded-md border border-slate-200 bg-transparent px-3 py-1 text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                />{" "}
                                -{" "}
                                <input
                                    type="time"
                                    name="end_time"
                                    value={construction.end_time}
                                    onChange={(e) =>
                                        setConstruction({
                                            ...construction,
                                            end_time: e.target.value,
                                        })
                                    }
                                    className="flex rounded-md border border-slate-200 bg-transparent px-3 py-1 text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </>
                        ) : (
                            `${construction.open_time} - ${construction.end_time}`
                        )}
                    </p>
                    <p>
                        <strong>Chef de projet :</strong>{" "}
                        {construction.chefDeProjet
                            ? `${construction.chefDeProjet.firstname} ${construction.chefDeProjet.lastname}`
                            : "Non spécifié"}
                    </p>
                    <p>
                        <strong>Email :</strong>{" "}
                        {construction.chefDeProjet?.email || "Non spécifié"}
                    </p>
                    <p>
                        <strong>Date de création :</strong>{" "}
                        {construction.date_creation || "Non spécifiée"}
                    </p>
                </div>
            </div>
        </main>
    );
}