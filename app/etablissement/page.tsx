"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaEye, FaMapMarkerAlt, FaBuilding, FaCity, FaComment, FaRoute, FaTimes, FaSearch } from "react-icons/fa";
import Sidebar from '@/app/components/Sidebar';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import PageLayout from '@/app/components/PageLayout';
import Link from 'next/link';

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(
  () => import('@/app/components/Map'),
  { ssr: false }
);

export default function EtablissementPage() {
  const [filter, setFilter] = useState("Tous");
  const [communeFilter, setCommuneFilter] = useState("Toutes les villes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstablishment, setSelectedEstablishment] = useState<any>(null);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('http://hamzaepicness.atwebpages.com/fetch_json3.php');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }
        
        setEstablishments(data);

        // Check if there's an establishment name in the URL
        const establishmentName = searchParams.get("name");
        if (establishmentName) {
          const establishment = data.find(
            (est: any) => est.Etablissement === decodeURIComponent(establishmentName)
          );
          if (establishment) {
            setSelectedEstablishment(establishment);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "Une erreur est survenue lors du chargement des établissements");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Get unique communes for filter
  const uniqueCommunes = ["Toutes les villes", ...new Set(establishments.map(est => est.Commune))];

  // Filtrer les établissements
  const filteredEstablishments = establishments.filter(est => {
    const matchesFilter = filter === "Tous" || est["Nature etablissement"] === filter;
    const matchesCommune = communeFilter === "Toutes les villes" || est.Commune === communeFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      est.Etablissement.toLowerCase().includes(searchLower) ||
      est.Commune.toLowerCase().includes(searchLower);
    return matchesFilter && matchesCommune && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch(type) {
      case "Centre social":
        return "bg-indigo-100 text-indigo-800";
      case "Sante":
        return "bg-emerald-100 text-emerald-800";
      case "Maison des Jeunes":
        return "bg-orange-100 text-orange-800";
      case "Complexe Sportif":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fonction pour obtenir la position actuelle de l'utilisateur
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
          setShowRoute(true);
        },
        (error) => {
          console.error("Erreur lors de la géolocalisation:", error);
          alert("Impossible d'obtenir votre position. Veuillez vérifier les paramètres de géolocalisation.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Chargement...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Erreur">
        <div className="flex flex-col items-center justify-center h-64 bg-white/90 rounded-xl p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
          >
            Réessayer
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Établissements">
      <div className="relative min-h-screen">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/50 -z-10"></div>

        {/* Content */}
        <div className="p-4">
          {/* Category filters */}
          <div className="flex flex-col space-y-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("Tous")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === "Tous"
                    ? "bg-teal-500 text-white"
                    : "bg-white/80 text-gray-800 hover:bg-white/90"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter("Sante")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === "Sante"
                    ? "bg-teal-500 text-white"
                    : "bg-white/80 text-gray-800 hover:bg-white/90"
                }`}
              >
                Santé
              </button>
              <button
                onClick={() => setFilter("Sport")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === "Sport"
                    ? "bg-teal-500 text-white"
                    : "bg-white/80 text-gray-800 hover:bg-white/90"
                }`}
              >
                Sport
              </button>
              <button
                onClick={() => setFilter("Education")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === "Education"
                    ? "bg-teal-500 text-white"
                    : "bg-white/80 text-gray-800 hover:bg-white/90"
                }`}
              >
                Education
              </button>
            </div>

            {/* Commune filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCommuneFilter("Toutes les villes")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  communeFilter === "Toutes les villes"
                    ? "bg-teal-500 text-white"
                    : "bg-white/80 text-gray-800 hover:bg-white/90"
                }`}
              >
                Toutes les villes
              </button>
              {uniqueCommunes.slice(1).map((commune) => (
                <button
                  key={commune}
                  onClick={() => setCommuneFilter(commune)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    communeFilter === commune
                      ? "bg-teal-500 text-white"
                      : "bg-white/80 text-gray-800 hover:bg-white/90"
                  }`}
                >
                  {commune}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des établissements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-full bg-white/80 border-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <FaSearch className="absolute left-3 top-3 text-teal-500" />
            </div>
          </div>

          {/* Establishments list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEstablishments.map((establishment, index) => (
              <div
                key={`${establishment.Etablissement}-${establishment.Commune}-${index}`}
                className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {establishment.Etablissement}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Commune:</span> {establishment.Commune}
                    </p>
                    <p className="text-sm text-gray-500">
                      {establishment["Nature etablissement"]}
                    </p>
                  </div>
                  {establishment.Localisation ? (
                    <FaMapMarkerAlt className="text-lg text-teal-600" title="Localisation disponible" />
                  ) : (
                    <FaMapMarkerAlt className="text-lg text-gray-400" title="Localisation non disponible" />
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedEstablishment(establishment)}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2"
                  >
                    <FaEye className="w-4 h-4" />
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Details Modal */}
          {selectedEstablishment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedEstablishment.Etablissement}</h2>
                  <button
                    onClick={() => {
                      setSelectedEstablishment(null);
                      setShowRoute(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Informations générales</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><span className="font-medium">Type:</span> {selectedEstablishment["Nature etablissement"]}</p>
                      <p><span className="font-medium">Commune:</span> {selectedEstablishment.Commune}</p>
                      <p><span className="font-medium">Gestionnaire:</span> {selectedEstablishment.Gestionnaire || 'Non spécifié'}</p>
                      <p><span className="font-medium">Directeur:</span> {selectedEstablishment.Directeur || 'Non spécifié'}</p>
                      <p><span className="font-medium">Contact:</span> {selectedEstablishment.Contact || selectedEstablishment.Telephone || 'Non spécifié'}</p>
                    </div>
                  </div>

                  {/* Map Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-700">Localisation</h3>
                      <div className="flex gap-3">
                        <Link
                          href={`/etablissement/submissions?name=${encodeURIComponent(selectedEstablishment.Etablissement)}`}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <FaComment className="text-lg" />
                          <span>Voir les soumissions</span>
                        </Link>
                        {selectedEstablishment.Localisation && (
                          <button
                            onClick={getUserLocation}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                          >
                            <FaRoute className="text-lg" />
                            {showRoute ? "Masquer l'itinéraire" : "Afficher l'itinéraire"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 shadow-inner">
                      <div className="h-[300px] mb-4 rounded-lg overflow-hidden shadow-lg">
                        <Map 
                          position={selectedEstablishment.Localisation ? selectedEstablishment.Localisation.split(',').map(Number) as [number, number] : undefined}
                          popupText={selectedEstablishment.Etablissement}
                          showRoute={showRoute}
                          startPosition={userPosition ?? undefined}
                        />
                      </div>
                      {selectedEstablishment.Localisation && (
                        <p className="text-sm text-gray-600">
                          Coordonnées : {selectedEstablishment.Localisation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
