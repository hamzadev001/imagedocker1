'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EstablishmentsPage() {
  const router = useRouter();

  useEffect(() => {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='));
    
    if (!userCookie) {
      router.push('/login');
    }
  }, [router]);

  const establishments = [
    { id: 1, name: 'École Primaire Hassan II', type: 'École', address: 'Tit Mellil', status: 'Actif' },
    { id: 2, name: 'Collège Al Farabi', type: 'Collège', address: 'Médiouna', status: 'Actif' },
    { id: 3, name: 'Lycée Mohammed V', type: 'Lycée', address: 'Tit Mellil', status: 'En inspection' },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Établissements</h1>
        <button
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
          onClick={() => router.push('/dashboard/establishments/new')}
        >
          Ajouter un établissement
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {establishments.map((establishment) => (
              <tr key={establishment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {establishment.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {establishment.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {establishment.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    establishment.status === 'Actif'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {establishment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => router.push(`/dashboard/establishments/${establishment.id}`)}
                    className="text-emerald-600 hover:text-emerald-900"
                  >
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
