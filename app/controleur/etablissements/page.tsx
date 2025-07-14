"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaMapMarkerAlt, FaEye, FaTimes, FaSignOutAlt } from "react-icons/fa";
import PageLayout from "@/app/components/PageLayout";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Import dynamique de la carte pour éviter les erreurs SSR
const Map = dynamic(() => import('@/app/components/Map'), { ssr: false });

interface Establishment {
  Etablissement: string;
  Commune: string;
  "Nature etablissement": string;
  Directeur?: string;
  Gestionnaire?: string;
  Adresse?: string;
  Telephone?: string;
  Localisation?: string;
  [key: string]: string | undefined;
}

export default function EtablissementsPage() {
  const router = useRouter();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEtablissement, setSelectedEtablissement] = useState<Establishment | null>(null);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        const response = await fetch("http://hamzaepicness.atwebpages.com/fetch_json2.php");
        if (!response.ok) throw new Error("Failed to fetch establishments");
        const data = await response.json();
        setEstablishments(data);
      } catch (err) {
        setError("Error fetching establishments. Please try again later.");
        console.error("Error fetching establishments:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstablishments();
  }, []);

  // Filter establishments based on search and filters
  const filteredEstablishments = establishments.filter(establishment => {
    const matchesSearch = establishment.Etablissement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         establishment.Commune?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || establishment["Nature etablissement"] === selectedType;
    const matchesCommune = !selectedCommune || establishment.Commune === selectedCommune;
    return matchesSearch && matchesType && matchesCommune;
  });

  // Get unique types and communes for filters
  const types = Array.from(new Set(establishments.map(e => e["Nature etablissement"]))).filter(Boolean);
  const communes = Array.from(new Set(establishments.map(e => e.Commune))).filter(Boolean);

  if (isLoading) {
    return (
      <PageLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Error">
        <div className="flex flex-col items-center justify-center h-64 bg-white/90 rounded-xl p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 text-lg mb-4">{error}</p>
        </div>
      </PageLayout>
    );
  }

  const getTypeStyle = (type: string) => {
    switch(type) {
      case "Centre social":
        return "bg-indigo-100 text-indigo-800";
      case "Santé":
        return "bg-emerald-100 text-emerald-800";
      case "Maison des Jeunes":
        return "bg-orange-100 text-orange-800";
      case "Complexe Sportif":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <PageLayout title="Établissements">
      <div className="relative min-h-screen">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/50 -z-10"></div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Header with Logout Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Établissements</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              <span>Déconnexion</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:flex-1 relative">
                <input
                  type="text"
                  placeholder="Rechercher un établissement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500" />
              </div>
              <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 rounded-lg bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Tous les types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedCommune}
                  onChange={(e) => setSelectedCommune(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 rounded-lg bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Toutes les communes</option>
                  {communes.map((commune) => (
                    <option key={commune} value={commune}>
                      {commune}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Establishments List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEstablishments.map((establishment, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedEtablissement(establishment)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {establishment.Etablissement}
                    </h3>
                    <p className="text-sm text-gray-600">{establishment.Commune}</p>
                  </div>
                  {establishment.Localisation && (
                    <FaMapMarkerAlt className="text-teal-500 text-lg" />
                  )}
                </div>
                <div className="space-y-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeStyle(establishment["Nature etablissement"])}`}>
                    {establishment["Nature etablissement"]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredEstablishments.length === 0 && (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl">
              <p className="text-gray-500">Aucun établissement trouvé</p>
            </div>
          )}

          {/* Details Modal */}
          {selectedEtablissement && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedEtablissement.Etablissement}
                    </h2>
                    <p className="text-gray-600">{selectedEtablissement.Commune}</p>
                  </div>
                  <button
                    onClick={() => setSelectedEtablissement(null)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations générales</h3>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Type d'établissement</p>
                          <p className="font-medium">{selectedEtablissement["Nature etablissement"]}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Directeur</p>
                          <p className="font-medium">{selectedEtablissement.Directeur || 'Non spécifié'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Gestionnaire</p>
                          <p className="font-medium">{selectedEtablissement.Gestionnaire || 'Non spécifié'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <p className="font-medium">{selectedEtablissement.Telephone || 'Non spécifié'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Adresse</p>
                        <p className="font-medium">{selectedEtablissement.Adresse || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Map Section */}
                  {selectedEtablissement.Localisation && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Localisation</h3>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="h-[400px] rounded-lg overflow-hidden shadow-lg mb-4">
                          <Map establishments={[selectedEtablissement]} />
                        </div>
                        <p className="text-sm text-gray-600">
                          Coordonnées : {selectedEtablissement.Localisation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
} 