export default function HelpCenter() {
  const faqs = [
    {
      question: 'Comment puis-je réinitialiser mon mot de passe ?',
      answer:
        "Vous pouvez réinitialiser votre mot de passe en cliquant sur le lien 'Mot de passe oublié ?' sur la page de connexion.",
    },
    {
      question: 'Comment puis-je modifier les informations de mon profil ?',
      answer:
        "Accédez à votre page de profil en cliquant sur votre photo en haut à droite, puis cliquez sur le bouton 'Modifier le profil' pour mettre à jour vos informations.",
    },
    {
      question: 'Qui peut créer et assigner des missions ?',
      answer:
        "Les administrateurs et les managers peuvent créer de nouvelles missions et y assigner des employés. Les chefs de projet peuvent également avoir des droits d'assignation sur leurs chantiers respectifs.",
    },
    {
      question: 'Comment voir les détails d\'un chantier ?',
      answer:
        "Sur la page des chantiers, cliquez sur le bouton 'Voir plus' d'un chantier pour accéder à sa page de détails, où vous trouverez toutes les informations et les missions associées.",
    },
    {
      question: 'Comment filtrer la liste des missions ?',
      answer:
        "Sur la page des missions, vous pouvez utiliser la barre de recherche pour trouver une mission par son nom ou sa description, et utiliser le menu déroulant pour filtrer par statut.",
    },
    {
      question: 'Que signifient les différents statuts de mission ?',
      answer:
        "'Prévu': La mission est planifiée mais n'a pas encore commencé. 'En cours': La mission est actuellement en cours de réalisation. 'En attente de validation': La mission est terminée et attend la validation d'un manager. 'Terminé': La mission est terminée et validée. 'Annulé': La mission a été annulée.",
    },
  ];

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Centre d'aide</h1>
          <p className="text-lg text-gray-600">Réponses à vos questions les plus fréquentes.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{faq.question}</h2>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
