import React from 'react';

export default function ContactUs() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.");
    // Here you would typically handle form submission, e.g., send data to an API.
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contactez-nous</h1>
            <p className="text-lg text-gray-600">Une question ? Une suggestion ? N'hésitez pas à nous écrire.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Nos coordonnées</h2>
                <div className="space-y-4 text-gray-700">
                    <p><strong>Adresse :</strong> 10 Rue de la Paix, 75002 Paris, France</p>
                    <p><strong>Email :</strong> <a href="mailto:contact@edifis-pro.com" className="text-orange-600 hover:underline">contact@edifis-pro.com</a></p>
                    <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Envoyer un message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Nom complet</label>
                        <input type="text" id="name" required className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" required className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                        <label htmlFor="message" className="text-sm font-medium text-gray-700">Votre message</label>
                        <textarea id="message" required rows={5} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"></textarea>
                    </div>
                    <div className="text-right">
                        <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-5 py-2.5 bg-orange-500 text-white hover:bg-orange-600 shadow-sm">
                            Envoyer
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </main>
  );
}
