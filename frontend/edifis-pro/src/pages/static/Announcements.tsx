export default function Announcements() {
  const announcements = [
    {
      title: "Lancement de l'application mobile Edifis Pro",
      date: '1er septembre 2025',
      content:
        'Gérez vos chantiers et vos missions où que vous soyez grâce à notre nouvelle application mobile, disponible sur iOS et Android.',
    },
    {
      title: 'Maintenance programmée le 15 septembre',
      date: '28 août 2025',
      content:
        'Une maintenance de nos serveurs est prévue le 15 septembre de 2h00 à 4h00 du matin. Une brève interruption de service est à prévoir.',
    },
  ];

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Annonces</h1>
          <p className="text-lg text-gray-600">Dernières nouvelles de la plateforme Edifis Pro.</p>
        </div>

        <div className="space-y-6">
          {announcements.map((announcement, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-1">{announcement.title}</h2>
              <p className="text-sm text-gray-500 mb-3">{announcement.date}</p>
              <p className="text-gray-700">{announcement.content}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
