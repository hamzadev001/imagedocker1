"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useEstablishments } from '../contexts/EstablishmentContext';
import PageLayout from '@/app/components/PageLayout';
import { FaTimes } from 'react-icons/fa';

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(
  () => import('@/app/components/Map'),
  { ssr: false }
);

interface Comment {
  id: number;
  author: string;
  role: 'controleur' | 'administrateur';
  message: string;
  timestamp: string;
}

interface HistoryEntry {
  id: number;
  uuid: string;
  etablissement: string;
  type: string[];
  action: string;
  date: string;
  controleur: string;
  details: string;
  status: 'completed' | 'pending';
  localisation: string;
  commune: string;
  comments: Comment[];
}

interface InvestigationForm {
  etablissements: string[];
  type: string;
  date: string;
  controleur: string;
  message: string;
  priorite: 'basse' | 'moyenne' | 'haute';
  dateLimite: string;
  commune: string;
}

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const generateUniqueKey = (id: number, name: string, type: string, index: number, date: string) => {
  // Create a more unique hash using multiple factors
  const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const typeHash = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const dateHash = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Combine all factors with a separator that won't appear in the data
  return `key_${id}_${nameHash}_${typeHash}_${dateHash}_${index}`;
};

export default function HistoriquePage() {
  const router = useRouter();
  const { establishments } = useEstablishments();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedEtablissement, setSelectedEtablissement] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>([]);
  const [formData, setFormData] = useState<InvestigationForm>({
    etablissements: [],
    type: '',
    date: new Date().toISOString().split('T')[0],
    controleur: '',
    message: '',
    priorite: 'moyenne',
    dateLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    commune: ''
  });

  // Example history entries (you would typically fetch these from an API)
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [showConversation, setShowConversation] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [userRole] = useState<'controleur' | 'administrateur'>('administrateur');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState<any>(null);

  // Générer des investigations basées sur les établissements réels
  useEffect(() => {
    if (establishments.length > 0) {
      const shuffled = [...establishments].sort(() => 0.5 - Math.random());
      const selectedEstablishments = shuffled.slice(0, 3);

      const controleurs = [
        "Mohammed Alami",
        "Fatima Benali",
        "Ahmed Tazi",
        "Karim Idrissi",
        "Sara El Fassi"
      ];

      const realEntries = selectedEstablishments.map((est, index) => {
        const timestamp = Date.now() + index;
        const dueDate = new Date(timestamp + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const isCompleted = Math.random() > 0.5;
        const controleur = controleurs[Math.floor(Math.random() * controleurs.length)];

        // Generate example conversation
        const comments: Comment[] = [
          {
            id: timestamp + 1,
            author: controleur,
            role: 'controleur',
            message: `J'ai programmé une visite pour ${est.Etablissement}. Je vais vérifier les points critiques mentionnés.`,
            timestamp: new Date(timestamp - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: timestamp + 2,
            author: 'Admin System',
            role: 'administrateur',
            message: `Merci de bien vouloir documenter vos observations lors de la visite.`,
            timestamp: new Date(timestamp - 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: timestamp + 3,
            author: controleur,
            role: 'controleur',
            message: isCompleted 
              ? `Visite effectuée. Tous les critères sont conformes aux normes requises.`
              : `Visite planifiée. J'attends la confirmation de l'établissement.`,
            timestamp: new Date(timestamp - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        return {
          id: timestamp,
          uuid: generateUUID(),
          etablissement: est.Etablissement,
          type: [est["Nature etablissement"]],
          action: isCompleted ? "Inspection réalisée" : "Visite programmée",
          date: new Date(timestamp - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          controleur: controleur,
          details: isCompleted 
            ? `Inspection annuelle complétée avec succès. Tous les critères sont conformes.`
            : `Visite de suivi planifiée pour vérifier les améliorations demandées. Date limite: ${dueDate}`,
          status: isCompleted ? 'completed' as const : 'pending' as const,
          localisation: est.Localisation || "33.5731104,-7.5898434",
          commune: est.Commune,
          comments: comments
        };
      });

      setHistoryEntries(realEntries);
    }
  }, [establishments]);

  // Get unique communes from establishments
  const communes = [...new Set(establishments.map(est => est.Commune))];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntries = formData.etablissements.map((etablissement, index) => {
      const timestamp = Date.now() + index;
      const est = establishments.find(e => e.Etablissement === etablissement);
      return {
        id: timestamp,
        uuid: generateUUID(),
        etablissement: etablissement,
        type: [est?.["Nature etablissement"] || ''],
        action: "Nouvelle investigation",
        date: formData.date,
        controleur: formData.controleur,
        details: formData.message,
        status: 'pending' as const,
        localisation: est?.Localisation || "33.5731104,-7.5898434",
        commune: est?.Commune || '',
        comments: []
      };
    });
    setHistoryEntries([...newEntries, ...historyEntries]);
    setShowForm(false);
    setFormData({
      etablissements: [],
      type: '',
      date: new Date().toISOString().split('T')[0],
      controleur: '',
      message: '',
      priorite: 'moyenne',
      dateLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      commune: ''
    });
  };

  const handleViewLocation = (entry: HistoryEntry) => {
    setSelectedLocation(entry.localisation);
    setSelectedEtablissement(entry.etablissement);
  };

  const handleViewEstablishment = (entry: HistoryEntry) => {
    const establishment = establishments.find(est => est.Etablissement === entry.etablissement);
    if (establishment) {
      // Vérifier si les coordonnées sont valides
      const coordinates = establishment.Localisation ? establishment.Localisation.split(',').map(Number) : [33.5731104, -7.5898434];
      if (coordinates.length !== 2 || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
        establishment.Localisation = "33.5731104,-7.5898434";
      }
      setSelectedEstablishment(establishment);
      setShowDetailsModal(true);
    }
  };

  const handleAddComment = (entry: HistoryEntry) => {
    if (!newComment.trim()) return;

    const timestamp = Date.now();
    const comment: Comment = {
      id: timestamp,
      author: userRole === 'controleur' ? entry.controleur : 'Admin System',
      role: userRole,
      message: newComment.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedEntry = {
      ...entry,
      comments: [...entry.comments, comment]
    };

    setHistoryEntries(historyEntries.map(e => 
      e.id === entry.id ? updatedEntry : e
    ));

    setNewComment('');
  };

  const filteredEntries = historyEntries.filter(entry => {
    const matchesSearch = entry.etablissement.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.controleur.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || entry.status === filterStatus;
    const matchesType = filterType === "all" || entry.type.some(t => selectedTypes.includes(t));
    const matchesCommune = selectedCommunes.length === 0 || selectedCommunes.includes(entry.commune);
    return matchesSearch && matchesStatus && matchesType && matchesCommune;
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const conversationModal = showConversation && selectedEntry && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Investigation - {selectedEntry.etablissement}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                Contrôleur: {selectedEntry.controleur}
              </p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedEntry.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedEntry.status === 'completed' ? 'Complété' : 'En attente'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setShowConversation(false);
              setSelectedEntry(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Dossier d'investigation</h3>
              <span className="text-sm text-gray-500">Ref: INV-{selectedEntry.id}</span>
            </div>
            <div className="space-y-4">
              {selectedEntry.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`bg-white rounded-lg border border-l-4 ${
                    comment.role === 'controleur'
                      ? 'border-l-blue-500'
                      : 'border-l-green-500'
                  } p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        comment.role === 'controleur'
                          ? 'text-blue-700'
                          : 'text-green-700'
                      }`}>
                        {comment.role === 'controleur' ? 'Contrôleur' : 'Administration'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {comment.author}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-700 text-sm font-mono">
                    {comment.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrivez votre message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddComment(selectedEntry);
                }
              }}
            />
          </div>
          <button
            onClick={() => handleAddComment(selectedEntry)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );

  const detailsModal = showDetailsModal && selectedEstablishment && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {selectedEstablishment.Etablissement}
            </h2>
          </div>
          <button
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedEstablishment(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Informations générales</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Commune:</span> {selectedEstablishment.Commune}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Type:</span> {selectedEstablishment["Nature etablissement"]}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Directeur:</span> {selectedEstablishment.Directeur || "Non spécifié"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Gestionnaire:</span> {selectedEstablishment.Gestionnaire || "Non spécifié"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Localisation</h3>
            <div className="h-[300px] w-full rounded-lg overflow-hidden">
              {selectedEstablishment.Localisation && (
                <Map 
                  position={selectedEstablishment.Localisation.split(',').map(Number)} 
                  popupText={selectedEstablishment.Etablissement} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout title="Historique des investigations">
      <div className="space-y-4">
        {/* Map View */}
        {selectedLocation && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Localisation de {selectedEtablissement}
              </h2>
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <div className="h-[400px] w-full rounded-lg overflow-hidden">
              <Map 
                position={selectedLocation.split(',').map(Number)} 
                popupText={selectedEtablissement || ''} 
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Rechercher par établissement ou contrôleur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complétés</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>

        {/* History Entries */}
        <div className="space-y-3">
          {filteredEntries.map((entry, index) => (
            <div
              key={entry.uuid}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {entry.etablissement}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Contrôleur: {entry.controleur} | Date: {entry.date}
                  </p>
                </div>
                <div className="flex gap-2">
                  {entry.type.map((type, typeIndex) => (
                    <span
                      key={`${entry.uuid}-type-${typeIndex}`}
                      className={`px-3 py-1 rounded-full text-sm ${getTypeStyle(type)}`}
                    >
                      {type}
                    </span>
                  ))}
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(entry.status)}`}
                  >
                    {entry.status === 'completed' ? 'Complété' : 'En attente'}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-3">{entry.details}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedEntry(entry);
                    setShowConversation(true);
                  }}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Voir la conversation
                </button>
                <button
                  onClick={() => handleViewEstablishment(entry)}
                  className="text-sm text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Voir détails
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      {detailsModal}
      
      {/* Conversation Modal */}
      {conversationModal}
    </PageLayout>
  );
}
