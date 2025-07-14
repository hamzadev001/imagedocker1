"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { useEstablishments } from '../contexts/EstablishmentContext';
import { BsClipboardCheck, BsClockHistory, BsCheckCircle } from 'react-icons/bs';
import { FaBuilding } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';

interface DashboardCard {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  route: string;
}

interface GestionnaireCount {
  [key: string]: number;
}

export default function ControleurDashboard() {
  const router = useRouter();
  const { establishments } = useEstablishments();
  const [currentControleur] = useState("Mohammed Alami");
  const [dashboardData, setDashboardData] = useState<DashboardCard[]>([]);

  useEffect(() => {
    const data: DashboardCard[] = [
      {
        title: "Investigations en cours",
        value: 5,
        description: "Investigations nécessitant votre attention",
        icon: <BsClockHistory className="h-6 w-6 text-yellow-600" />,
        route: "/controleur/investigations"
      },
      {
        title: "Investigations complétées",
        value: 12,
        description: "Investigations terminées ce mois",
        icon: <BsClipboardCheck className="h-6 w-6 text-green-600" />,
        route: "/controleur/investigations"
      },
      {
        title: "Établissements assignés",
        value: establishments.length,
        description: "Établissements sous votre supervision",
        icon: <FaBuilding className="h-6 w-6 text-blue-600" />,
        route: "/controleur/etablissements"
      },
      {
        title: "Taux de conformité",
        value: 85,
        description: "Moyenne de conformité des établissements",
        icon: <BsCheckCircle className="h-6 w-6 text-emerald-600" />,
        route: "/controleur/etablissements"
      }
    ];
    setDashboardData(data);
  }, [establishments]);

  // Calculer les statistiques pour le contrôleur
  const controleurStats = {
    totalInvestigations: 17, // 5 en cours + 12 complétées
    tauxCompletion: (12 / 17) * 100,
    etablissementsParType: establishments.reduce((acc: { [key: string]: number }, establishment) => {
      const type = establishment["Nature etablissement"] || 'Non spécifié';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}),
    etablissementsParCommune: establishments.reduce((acc: { [key: string]: number }, establishment) => {
      const commune = establishment.Commune || 'Non spécifié';
      acc[commune] = (acc[commune] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <div className="relative flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 ml-72">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de Bord</h1>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardData.map((card, index) => (
              <div
                key={index}
                onClick={() => router.push(card.route)}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100 min-h-[140px] flex items-center cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center w-full">
                  <div className={`p-3 ${
                    index === 0 ? 'bg-yellow-100' :
                    index === 1 ? 'bg-green-100' :
                    index === 2 ? 'bg-blue-100' :
                    'bg-emerald-100'
                  } rounded-full`}>
                    {card.icon}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistiques d'Investigations */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Statistiques d'Investigations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Statistiques principales */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Total des investigations</span>
                    <span className="text-lg font-semibold text-blue-600">{controleurStats.totalInvestigations}</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-lg border border-emerald-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Investigations complétées</span>
                    <span className="text-lg font-semibold text-emerald-600">12</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full" 
                      style={{ width: '70%' }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-lg border border-yellow-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Investigations en cours</span>
                    <span className="text-lg font-semibold text-yellow-600">5</span>
                  </div>
                  <div className="w-full bg-yellow-100 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: '30%' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Détails et tendances */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Taux de complétion</span>
                    <span className="text-lg font-semibold text-purple-600">{controleurStats.tauxCompletion.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${controleurStats.tauxCompletion}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-lg border border-red-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Investigations en attente</span>
                    <span className="text-lg font-semibold text-red-600">3</span>
                  </div>
                  <div className="w-full bg-red-100 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: '18%' }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-lg border border-indigo-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Moyenne de traitement</span>
                    <span className="text-lg font-semibold text-indigo-600">4.2 jours</span>
                  </div>
                  <div className="w-full bg-indigo-100 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: '84%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gestionnaire */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Gestionnaire
                </h2>
                <p className="text-sm text-gray-500 mt-1">Direction Provinciale de la Jeunesse, de la culture et de la communication</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm text-gray-500 block">Établissements</span>
                  <span className="text-lg font-semibold text-gray-800">{establishments.length}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 block">Taux de conformité</span>
                  <span className="text-lg font-semibold text-emerald-600">85%</span>
                </div>
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* État des Établissements */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">État des Établissements</h3>
                <div className="space-y-8">
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">Total des Établissements</p>
                    <p className="text-4xl font-bold text-gray-800">{establishments.length}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 mb-2">Nombre de Communes</p>
                    <p className="text-4xl font-bold text-emerald-600">
                      {Object.keys(controleurStats.etablissementsParCommune).length}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 mb-4">État de Géolocalisation</p>
                    <p className="text-4xl font-bold text-blue-600 mb-4">
                      {establishments.filter(e => e.Localisation).length} / {establishments.length}
                    </p>
                    <div className="flex justify-center gap-8 text-sm">
                      <div>
                        <p className="text-gray-500">Localisés</p>
                        <p className="text-lg font-semibold text-gray-700">
                          {establishments.filter(e => e.Localisation).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Non localisés</p>
                        <p className="text-lg font-semibold text-gray-700">
                          {establishments.filter(e => !e.Localisation).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Répartition par Type */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Répartition par Type</h3>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                  {Object.entries(controleurStats.etablissementsParType).map(([type, count], index) => (
                    <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-gray-600">{type}</span>
                      <div className="flex items-center">
                        <span className="font-semibold">{count}</span>
                        <div 
                          className="ml-2 w-2 h-2 rounded-full" 
                          style={{ 
                            backgroundColor: [
                              "rgba(16, 185, 129, 0.8)",
                              "rgba(59, 130, 246, 0.8)",
                              "rgba(251, 191, 36, 0.8)",
                              "rgba(239, 68, 68, 0.8)",
                              "rgba(139, 92, 246, 0.8)",
                              "rgba(236, 72, 153, 0.8)"
                            ][index % 6]
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-gray-50 rounded-lg mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total</span>
                      <span className="font-semibold text-lg">{establishments.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Établissements par Commune */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Établissements par Commune</h3>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                  {Object.entries(controleurStats.etablissementsParCommune).map(([commune, count], index) => (
                    <div key={commune} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-gray-600">{commune}</span>
                      <div className="flex items-center">
                        <span className="font-semibold">{count}</span>
                        <div 
                          className="ml-2 w-2 h-2 rounded-full" 
                          style={{ 
                            backgroundColor: [
                              "rgba(16, 185, 129, 0.8)",
                              "rgba(59, 130, 246, 0.8)",
                              "rgba(251, 191, 36, 0.8)",
                              "rgba(239, 68, 68, 0.8)",
                              "rgba(139, 92, 246, 0.8)",
                              "rgba(236, 72, 153, 0.8)"
                            ][index % 6]
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-gray-50 rounded-lg mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total</span>
                      <span className="font-semibold text-lg">{establishments.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des établissements récents */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Établissements récents</h3>
              <div className="space-y-2">
                {establishments.slice(0, 5).map((establishment) => (
                  <div key={establishment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <span className="font-medium text-gray-800 block">{establishment.Etablissement}</span>
                      <span className="text-sm text-gray-500">{establishment.Commune}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-800 block">{establishment["Nature etablissement"]}</span>
                      <span className="text-xs text-gray-500">Dernière inspection: 15/03/2024</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 