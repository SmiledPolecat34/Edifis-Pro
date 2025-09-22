export default function Careers() {
  const jobOpenings = [
    {
      title: 'Chef de Chantier Expérimenté',
      location: 'Paris, France',
      type: 'Temps plein',
      description:
        'Nous recherchons un chef de chantier expérimenté pour superviser nos projets de construction à Paris. Vous serez responsable de la gestion des équipes, du respect des délais et de la sécurité sur le site.',
    },
    {
      title: 'Développeur Full-Stack (React/Node.js)',
      location: 'Télétravail',
      type: 'Temps plein',
      description:
        'Rejoignez notre équipe technique pour développer et maintenir la plateforme Edifis Pro. Maîtrise de React, Node.js, et des bases de données SQL requise.',
    },
    {
      title: 'Responsable des Ressources Humaines',
      location: 'Lyon, France',
      type: 'Temps partiel',
      description:
        "Nous cherchons un professionnel des RH pour gérer le recrutement, l'intégration et le suivi de nos collaborateurs sur la région lyonnaise.",
    },
  ];

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Carrières chez Edifis Pro</h1>
          <p className="text-lg text-gray-600">
            Rejoignez une équipe passionnée et construisons l'avenir ensemble.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {jobOpenings.map((job, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                  <p className="text-sm text-gray-500">
                    {job.location} • {job.type}
                  </p>
                </div>
                <a
                  href="mailto:recrutement@edifis-pro.com?subject=Candidature pour le poste de ${job.title}"
                  className="mt-4 md:mt-0 inline-block whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-5 py-2.5 bg-orange-500 text-dark hover:bg-orange-600 shadow-sm"
                >
                  Postuler
                </a>
              </div>
              <p className="text-gray-700 mt-4">{job.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
