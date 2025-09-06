import React from 'react';

import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Conditions d'utilisation</h1>
        
        <div className="space-y-6 text-gray-700">
          <p>Dernière mise à jour : 6 septembre 2025</p>
          
          <p>
            Bienvenue sur Edifis Pro. En accédant à notre site web et en utilisant nos services, vous acceptez de vous conformer et d'être lié par les présentes conditions d'utilisation. Veuillez les lire attentivement.
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">1. Utilisation de nos services</h2>
            <p>
              Vous devez utiliser nos services conformément aux lois en vigueur et aux présentes conditions. Vous êtes responsable de votre conduite et de votre contenu sur la plateforme. Il est interdit d'utiliser nos services à des fins illégales ou non autorisées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">2. Compte utilisateur</h2>
            <p>
              Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable de la sécurité de votre mot de passe et de toutes les activités qui se déroulent sous votre compte. Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">3. Propriété intellectuelle</h2>
            <p>
              Le service et son contenu original, ses caractéristiques et ses fonctionnalités sont et resteront la propriété exclusive d'Edifis Pro et de ses concédants de licence. Notre marque et notre habillage commercial ne peuvent être utilisés en relation avec un produit ou un service sans le consentement écrit préalable d'Edifis Pro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">4. Limitation de responsabilité</h2>
            <p>
              En aucun cas Edifis Pro, ni ses directeurs, employés, partenaires, agents, fournisseurs ou affiliés, ne seront responsables des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, y compris, sans limitation, la perte de profits, de données, d'utilisation, de clientèle ou d'autres pertes intangibles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">5. Modification des conditions</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. Si une révision est importante, nous nous efforcerons de fournir un préavis d'au moins 30 jours avant l'entrée en vigueur des nouvelles conditions. Ce qui constitue un changement important sera déterminé à notre seule discrétion.
            </p>
          </section>

           <p>
              Pour toute question concernant ces conditions, veuillez nous contacter via notre <Link to="/contact" className="text-orange-600 hover:underline">page de contact</Link>.
            </p>
        </div>
      </div>
    </main>
  );
}
