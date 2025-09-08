import { Link } from 'react-router-dom';

export default function Legal() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mentions Légales</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">1. Éditeur du site</h2>
            <p>
              <strong>Raison Sociale :</strong> Edifis Pro SAS
            </p>
            <p>
              <strong>Adresse du siège social :</strong> 10 Rue de la Paix, 75002 Paris, France
            </p>
            <p>
              <strong>Capital social :</strong> 100 000 €
            </p>
            <p>
              <strong>Numéro d’immatriculation :</strong> RCS Paris 123 456 789
            </p>
            <p>
              <strong>Numéro de TVA intracommunautaire :</strong> FR 00 123456789
            </p>
            <p>
              <strong>Directeur de la publication :</strong> Jean Dupont, Président
            </p>
            <p>
              <strong>Contact :</strong>{' '}
              <a href="mailto:contact@edifis-pro.com" className="text-orange-600 hover:underline">
                contact@edifis-pro.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">2. Hébergement du site</h2>
            <p>
              <strong>Hébergeur :</strong> Fictional Cloud Services
            </p>
            <p>
              <strong>Adresse :</strong> 123 Rue du Cloud, 75000 Paris, France
            </p>
            <p>
              <strong>Téléphone :</strong> +33 1 23 45 67 89
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              3. Protection des données personnelles
            </h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), nous nous
              engageons à protéger les données personnelles de nos utilisateurs.
            </p>
            <p className="mt-2">
              Notre Délégué à la Protection des Données (DPO) est joignable à l'adresse suivante
              pour toute question relative à la collecte et au traitement de vos données :{' '}
              <a href="mailto:dpo@edifis-pro.com" className="text-orange-600 hover:underline">
                dpo@edifis-pro.com
              </a>
              .
            </p>
            <p className="mt-2">
              Pour plus d'informations sur la gestion de vos données personnelles et pour exercer
              vos droits, veuillez consulter notre{' '}
              <Link to="/privacy" className="text-orange-600 hover:underline">
                Politique de Confidentialité
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              4. Propriété intellectuelle
            </h2>
            <p>
              L'ensemble de ce site relève de la législation française et internationale sur le
              droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont
              réservés, y compris pour les documents téléchargeables et les représentations
              iconographiques et photographiques.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
