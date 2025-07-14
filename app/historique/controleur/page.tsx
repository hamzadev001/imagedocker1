"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useEstablishments } from '../../contexts/EstablishmentContext';

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

export default function HistoriqueControleurPage() {
  const router = useRouter();
  const { establishments } = useEstablishments();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedEtablissement, setSelectedEtablissement] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [showConversation, setShowConversation] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [userRole] = useState<'controleur' | 'administrateur'>('controleur');
  const [currentControleur] = useState("Mohammed Alami"); // À remplacer par l'authentification réelle

  // Example history entries (you would typically fetch these from an API)
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  // Générer des investigations basées sur les établissements réels
  useEffect(() => {
    if (establishments.length > 0) {
      const shuffled = [...establishments].sort(() => 0.5 - Math.random());
      const selectedEstablishments = shuffled.slice(0, 5);

      const realEntries = selectedEstablishments.map((est, index) => {
        const dueDate = new Date(Date.now() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const isCompleted = Math.random() > 0.5;

        const comments: Comment[] = [
          {
            id: 1,
            author: currentControleur,
            role: 'controleur',
            message: `J'ai programmé une visite pour ${est.Etablissement}. Je vais vérifier les points critiques mentionnés.`,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            author: 'Admin System',
            role: 'administrateur',
            message: `Merci de bien vouloir documenter vos observations lors de la visite.`,
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        return {
          id: index + 1,
          etablissement: est.Etablissement,
          type: [est["Nature etablissement"]],
          action: isCompleted ? "Inspection réalisée" : "Visite programmée",
          date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          controleur: currentControleur,
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
  }, [establishments, currentControleur]);

  const handleViewLocation = (entry: HistoryEntry) => {
    setSelectedLocation(entry.localisation);
    setSelectedEtablissement(entry.etablissement);
  };

  const handleViewEstablishment = (entry: HistoryEntry) => {
    const searchParams = new URLSearchParams();
    searchParams.set('search', entry.etablissement);
    searchParams.set('filter', entry.type.join(','));
    router.push(`/etablissement?${searchParams.toString()}`);
  };

  const handleAddComment = (entry: HistoryEntry) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: entry.comments.length + 1,
      author: currentControleur,
      role: 'controleur',
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

  const handleUpdateStatus = (entry: HistoryEntry, newStatus: 'completed' | 'pending') => {
    const updatedEntry = {
      ...entry,
      status: newStatus,
      action: newStatus === 'completed' ? "Inspection réalisée" : "Visite programmée",
      details: newStatus === 'completed' 
        ? `Inspection complétée le ${new Date().toLocaleDateString()}`
        : entry.details
    };

    setHistoryEntries(historyEntries.map(e => 
      e.id === entry.id ? updatedEntry : e
    ));
  };

  const filteredEntries = historyEntries.filter(entry => {
    const matchesSearch = entry.etablissement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || entry.status === filterStatus;
    const matchesType = filterType === "all" || entry.type.includes(filterType);
    return matchesSearch && matchesStatus && matchesType;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Conversation - {selectedEntry.etablissement}</h2>
          <button
            onClick={() => {
              setShowConversation(false);
              setSelectedEntry(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-4">
          {selectedEntry.comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex flex-col ${
                comment.role === userRole ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  comment.role === userRole
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="font-medium text-sm mb-1">{comment.author}</div>
                <p className="text-sm">{comment.message}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(comment.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddComment(selectedEntry);
              }
            }}
          />
          <button
            onClick={() => handleAddComment(selectedEntry)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="p-4 sm:p-6 md:p-8 ml-0 md:ml-64">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mes Investigations</h1>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="completed">Complétés</option>
                  <option value="pending">En attente</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tous les types</option>
                  <option value="Centre social">Centre social</option>
                  <option value="Santé">Santé</option>
                  <option value="Maison des Jeunes">Maison des Jeunes</option>
                  <option value="Complexe Sportif">Complexe Sportif</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {entry.etablissement}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Date: {entry.date}
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getTypeStyle(entry.type[0])}`}>
                        {entry.type.join(', ')}
                      </span>
                      <button
                        onClick={() => handleUpdateStatus(entry, entry.status === 'completed' ? 'pending' : 'completed')}
                        className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(entry.status)} hover:opacity-80 transition-opacity`}
                      >
                        {entry.status === 'completed' ? 'Complété' : 'En attente'}
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{entry.details}</p>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button
                      onClick={() => handleViewLocation(entry)}
                      className="w-full sm:w-auto text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center sm:justify-start gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Voir la localisation
                    </button>
                    <button
                      onClick={() => handleViewEstablishment(entry)}
                      className="w-full sm:w-auto text-sm text-emerald-600 hover:text-emerald-800 font-medium flex items-center justify-center sm:justify-start gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Voir l'établissement
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEntry(entry);
                        setShowConversation(true);
                      }}
                      className="w-full sm:w-auto text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center justify-center sm:justify-start gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Voir la conversation
                      {entry.comments.length > 0 && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          {entry.comments.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {filteredEntries.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-500">Aucune investigation assignée</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <div className="h-[400px] sm:h-[600px] w-full bg-gray-100 rounded overflow-hidden">
                {selectedLocation ? (
                  <Map
                    position={selectedLocation.split(',').map(Number)}
                    popupText={selectedEtablissement || ''}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-500 text-center px-4">
                    Sélectionnez un établissement pour voir sa localisation
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {conversationModal}
    </div>
  );
} 