import React from 'react';

const roadmapData = [
  {
    status: "En développement",
    title: "Gestion Budgétaire & Suivi des Coûts",
    description: "Intégration d'outils pour suivre les budgets en temps réel, gérer les dépenses et générer des rapports de coûts détaillés par chantier."
  },
  {
    status: "Prévu",
    title: "Gestion des Stocks et Suivi des Matériaux",
    description: "Un système complet pour suivre les stocks de matériaux, gérer les commandes fournisseurs, et suivre les livraisons directement depuis la plateforme."
  },
  {
    status: "Prévu",
    title: "Portail Client",
    description: "Un accès dédié pour vos clients leur permettant de suivre l'avancement de leur projet, de voir des photos et de communiquer avec l'équipe."
  },
  {
    status: "Recherche",
    title: "Téléchargement et Suppression des Données (RGPD)",
    description: "Permettre aux utilisateurs de télécharger une archive de leurs données personnelles et de demander leur suppression complète, conformément au RGPD."
  },
  {
    status: "Recherche",
    title: "Rapports Analytiques Avancés",
    description: "Génération de rapports personnalisables sur la performance des projets, la productivité des équipes et la rentabilité."
  },
  {
    status: "Recherche",
    title: "Messagerie de Chantier Intégrée",
    description: "Un module de communication en temps réel pour faciliter les échanges entre les membres d'une équipe sur un chantier spécifique."
  }
];

const statusColors: { [key: string]: string } = {
  "En développement": "bg-blue-500",
  "Prévu": "bg-green-500",
  "Recherche": "bg-yellow-500",
};

export default function Roadmap() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Feuille de route</h1>
            <p className="text-lg text-gray-600">L'avenir d'Edifis Pro. Découvrez les fonctionnalités sur lesquelles nous travaillons.</p>
        </div>

        <div className="relative border-l-2 border-gray-300 ml-4">
          {roadmapData.map((item, index) => (
            <div key={index} className="mb-10 ml-8">
              <span className={`absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full text-white ${statusColors[item.status] || 'bg-gray-500'}`}>
                {/* Icon can go here */}
              </span>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-2">
                    <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white ${statusColors[item.status] || 'bg-gray-500'}`}>
                        {item.status}
                    </span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{item.title}</h2>
                <p className="text-gray-700">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
