export default function Privacy() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Politique de Confidentialité</h1>

        <div className="space-y-6 text-gray-700">
          <p>Dernière mise à jour : 6 septembre 2025</p>

          <p>
            Edifis Pro s'engage à protéger la vie privée de ses utilisateurs. Cette politique de
            confidentialité explique comment nous collectons, utilisons, divulguons et protégeons
            vos informations lorsque vous utilisez notre plateforme.
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              1. Collecte de vos informations
            </h2>
            <p>
              Nous collectons des informations personnelles vous concernant lorsque vous vous
              inscrivez sur le site, utilisez nos services, ou communiquez avec nous. Les
              informations collectées incluent, sans s'y limiter : votre nom, prénom, adresse email,
              numéro de téléphone, rôle professionnel, et les compétences associées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              2. Utilisation de vos informations
            </h2>
            <p>Les informations que nous collectons sont utilisées pour :</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Fournir, opérer et maintenir nos services.</li>
              <li>Améliorer, personnaliser et étendre nos services.</li>
              <li>Comprendre et analyser comment vous utilisez notre plateforme.</li>
              <li>Gérer l'assignation des tâches et le suivi des chantiers.</li>
              <li>Communiquer avec vous, y compris pour le service client et les mises à jour.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              3. Conformité avec le RGPD
            </h2>
            <p>
              Edifis Pro traite vos données en conformité avec le{' '}
              <strong>
                Règlement Général sur la Protection des Données (RGPD) - (UE) 2016/679
              </strong>
              . Nous nous engageons à respecter les principes fondamentaux du traitement des
              données.
            </p>
            <p className="mt-2">
              Conformément au RGPD, vous disposez des droits suivants concernant vos données
              personnelles :
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>
                <strong>Droit d'accès (Article 15 RGPD) :</strong> Le droit d'obtenir la
                confirmation que vos données sont traitées et d'y avoir accès.
              </li>
              <li>
                <strong>Droit de rectification (Article 16 RGPD) :</strong> Le droit de demander la
                correction d'informations inexactes.
              </li>
              <li>
                <strong>Droit à l'effacement ou "droit à l'oubli" (Article 17 RGPD) :</strong> Le
                droit de demander la suppression de vos données.
              </li>
              <li>
                <strong>Droit à la limitation du traitement (Article 18 RGPD) :</strong> Le droit de
                restreindre le traitement de vos données.
              </li>
              <li>
                <strong>Droit à la portabilité des données (Article 20 RGPD) :</strong> Le droit de
                recevoir vos données dans un format structuré et de les transmettre à un autre
                responsable du traitement.
              </li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, veuillez nous contacter à l'adresse{' '}
              <a href="mailto:dpo@edifis-pro.com" className="text-orange-600 hover:underline">
                dpo@edifis-pro.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">4. Sécurité des données</h2>
            <p>
              Nous utilisons des mesures de sécurité administratives, techniques et physiques pour
              protéger vos informations personnelles. Bien que nous ayons pris des mesures
              raisonnables pour sécuriser les informations que vous nous fournissez, sachez que
              malgré nos efforts, aucune mesure de sécurité n'est parfaite ou impénétrable.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
