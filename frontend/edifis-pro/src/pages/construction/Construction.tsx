import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import constructionSiteService, {
    ConstructionSite,
} from "../../../services/constructionSiteService";

import { useAuth } from "../../context/AuthContext";

import Loading from "../../components/loading/Loading";
import Badge from "../../components/badge/Badge";

interface ConstructionSite {
    id: number;
    name: string;
    description: string;
    site: string;
    address: string;
    manager: string;
    status: string;
    startDate: string;
    endDate: string;
    image: string;
}

export default function Home() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<ConstructionSite[]>([]);
    const [searchQuery, setSearchQuery] = useState(""); // 🔍 State pour la recherche
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConstructionSites = async () => {
            try {
                const data = await constructionSiteService.getAll();

                const formattedData = data.map((site) => ({
                    id: site.construction_site_id,
                    name: site.name,
                    description: site.description,
                    site: site.adresse,
                    address: site.adresse,
                    manager: site.chefDeProjet
                        ? site.chefDeProjet.firstname + " " + site.chefDeProjet.lastname
                        : "Inconnu",
                    status: site.state,
                    startDate: site.start_date,
                    endDate: site.end_date,
                    image:
                        site.image_url ||
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSANsddCLc_2TYdgSqBQVFNutn0FvR6qB7BQg&s", // Image par défaut
                }));

                setProjects(formattedData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConstructionSites();
    }, []);

    const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-[calc(100dvh-65px)] w-full p-8">
                <Loading />
            </div>
        );
    if (error) return <p className="text-center text-red-500">Erreur : {error}</p>;

    return (
        <main className="min-h-[calc(100dvh-65px)] p-8 bg-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Chantiers</h1>
                {user?.role === "Admin" && (
                    <Link
                        to="/AddConstruction"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2"
                    >
                        Ajouter
                    </Link>
                )}
            </div>

            {/* 🔍 Input de recherche */}
            <input
                type="search"
                name="search"
                id="search"
                placeholder="Rechercher un chantier..."
                className="h-9 lg:max-w-1/3 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50 mb-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // 🔄 Mise à jour du state
            />

            <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-6">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                        <div key={project.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
                            <img
                                className="h-48 w-full object-cover rounded-md mb-3"
                                src={project.image}
                                alt={project.name}
                            />
                            <div className="flex justify-between items-center flex-wrap">
                                <h3 className="font-bold text-xl text-slate-900 mr-2">{project.name}</h3>
                                {project.status && <Badge status={project.status} />}
                            </div>
                            <p className="text-sm text-slate-700 mb-2">{project.description}</p>
                            <div className="my-2 border-b border-slate-200" />

                            <div className="flex flex-col space-y-2 flex-grow">
                                <div>
                                    <p className="text-sm font-medium text-slate-950">Adresse</p>
                                    <p className="text-sm text-slate-700">{project.address}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-950">Chef de chantier</p>
                                    <p className="text-sm text-slate-700">{project.manager}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-950">Début</p>
                                    <p className="text-sm text-slate-700">
                                        Le {new Date(project.startDate).toLocaleDateString()} à {new Date(project.startDate).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-950">Fin</p>
                                    <p className="text-sm text-slate-700">
                                        Le {new Date(project.endDate).toLocaleDateString()} à {new Date(project.endDate).toLocaleTimeString()}
                                    </p>
                                </div>
                                <Link
                                    to={`/ConstructionDetails/${project.id}`}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2 mt-auto"
                                >
                                    Voir plus
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-600 col-span-full">Aucun chantier ne correspond à la recherche.</p>
                )}
            </div>
        </main>
    );
}
