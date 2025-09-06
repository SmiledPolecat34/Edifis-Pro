import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';

export default function SystemStatus() {
  const [isMaintenance, setIsMaintenance] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await apiService.get<{ maintenance_mode: boolean }>('/status');
        setIsMaintenance(response.maintenance_mode);
      } catch (err) {
        setError('Impossible de récupérer le statut du système. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const StatusIndicator = () => {
    if (loading) {
      return <p className="text-lg text-gray-600">Vérification en cours...</p>;
    }
    if (error) {
      return <p className="text-lg text-red-600">{error}</p>;
    }
    if (isMaintenance) {
      return (
        <div className="flex items-center gap-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="text-yellow-600">⚠️</div>
          <div>
            <h2 className="text-xl font-bold text-yellow-800">Système en Maintenance</h2>
            <p className="text-yellow-700">
              Nos services sont actuellement en cours de maintenance. Certaines fonctionnalités
              peuvent être limitées. Nous nous excusons pour la gêne occasionnée.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-4 p-4 bg-green-50 border-l-4 border-green-400">
        <div className="text-green-600">✅</div>
        <div>
          <h2 className="text-xl font-bold text-green-800">Tous les systèmes sont fonctionnels</h2>
          <p className="text-green-700">Aucun problème à signaler sur nos services.</p>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Statut du système</h1>
          <p className="text-lg text-gray-600">Consultez l'état actuel de nos services.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <StatusIndicator />
        </div>
      </div>
    </main>
  );
}
