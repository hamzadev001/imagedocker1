"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaMapMarkerAlt, FaBell, FaEye, FaComment, FaTimes, FaRoute } from "react-icons/fa";
import PageLayout from "@/app/components/PageLayout";
import Link from "next/link";
import Map from "@/app/components/Map";
import { useEstablishments } from "@/app/contexts/EstablishmentContext";

interface Establishment {
  id: string;
  Etablissement: string;
  Commune: string;
  Directeur: string;
  Gestionnaire: string;
  "Nature etablissement": string;
  Localisation?: string;
  Adresse?: string;
  Telephone?: string;
  isInvestigated?: boolean;
}

interface Message {
  id: number;
  sender: 'user' | 'admin';
  content: string;
  timestamp: string;
}

interface InvestigationComment {
  status: string;
  nature: string;
  sponsor: string;
  event_datetime: string;
  comment: string;
  event_comment: string;
  admin_comment: string;
  image_path: string;
}

const ConversationPopup = ({ 
  establishment, 
  onClose 
}: { 
  establishment: Establishment; 
  onClose: () => void;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://hamzaepicness.atwebpages.com/get_data.php?name=${encodeURIComponent(establishment.Etablissement)}`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Raw response:', text); // Debug log
        
        if (!text.trim()) {
          throw new Error('Empty response from server');
        }
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('JSON Parse Error:', e);
          console.error('Invalid JSON response:', text);
          throw new Error('Invalid JSON response from server');
        }
        
        if (!Array.isArray(data)) {
          console.error('Unexpected data format:', data);
          throw new Error('Expected array response from server');
        }
        
        // Convert comments to messages with proper date handling
        const convertedMessages: Message[] = data.flatMap((comment: InvestigationComment, index: number) => {
          const messages: Message[] = [];
          const baseId = index * 1000;

          const parseDate = (dateStr: string | null | undefined): Date => {
            if (!dateStr) return new Date();
            
            // Try to parse the date in various formats
            const formats = [
              /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/,  // MySQL format
              /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/,        // French format
              /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/   // ISO format
            ];
            
            for (const format of formats) {
              const match = dateStr.match(format);
              if (match) {
                const [_, year, month, day, hour, minute, second] = match.map(Number);
                const date = new Date(year, month - 1, day, hour, minute, second || 0);
                if (!isNaN(date.getTime())) return date;
              }
            }
            
            return new Date();
          };

          if (comment.comment) {
            const userDate = parseDate(comment.event_datetime);
            messages.push({
              id: baseId,
              sender: 'user',
              content: comment.comment,
              timestamp: userDate.toISOString()
            });

            if (comment.admin_comment) {
              const adminResponses = comment.admin_comment.split('/').filter(response => response.trim());
              adminResponses.forEach((response, responseIndex) => {
                const adminDate = new Date(userDate.getTime() + (responseIndex + 1) * 1000);
                messages.push({
                  id: baseId + responseIndex + 1,
                  sender: 'admin',
                  content: response.trim(),
                  timestamp: adminDate.toISOString()
                });
              });
            }
          }

          return messages;
        });

        // Sort messages by date in descending order (most recent first)
        const sortedMessages = convertedMessages.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        if (sortedMessages.length === 0) {
          sortedMessages.push({
            id: 1,
            sender: 'admin',
            content: 'Aucune investigation n\'a encore été effectuée pour cet établissement.',
            timestamp: new Date().toISOString()
          });
        }

        setMessages(sortedMessages);
        setError(null);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError(`Erreur de chargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [establishment.Etablissement]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageToSend = {
      id: messages.length + 1,
      sender: 'user' as const,
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    try {
      // Send the message as a new comment
      const response = await fetch("http://hamzaepicness.atwebpages.com/submit_comment.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          etablissementName: establishment.Etablissement,
          comment: newMessage,
        }),
      });

      if (response.ok) {
        setMessages([...messages, messageToSend]);
        setNewMessage('');
        setError(null);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Impossible d\'envoyer le message. Veuillez réessayer.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-w-[90%] h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">{establishment.Etablissement}</h3>
            <p className="text-sm text-gray-500">{establishment["Nature etablissement"]} - {establishment.Commune}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-red-500 text-center">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-teal-500 hover:text-teal-600"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-teal-500 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.timestamp).toLocaleString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                {index < messages.length - 1 && (
                  <div className="border-b border-gray-200 my-4"></div>
                )}
              </div>
            ))
          )}
        </div>

        {/* New Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const InvestigationsContent = () => {
  const { establishments: contextEstablishments, loading: contextLoading, error: contextError } = useEstablishments();
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formSearchQuery, setFormSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedCommune, setSelectedCommune] = useState("Toutes");
  const [selectedType, setSelectedType] = useState("Tous");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    etablissement: '',
    comment: '',
    executionDate: '',
    isUrgent: false
  });
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | undefined>(undefined);

  useEffect(() => {
    if (contextEstablishments) {
      setFilteredEstablishments(contextEstablishments);
      setIsLoading(false);
    }
  }, [contextEstablishments]);

  useEffect(() => {
    if (contextError) {
      setErrorMessage(contextError);
      setIsLoading(false);
    }
  }, [contextError]);

  useEffect(() => {
    filterEstablishments();
  }, [searchQuery, selectedCategory, selectedCommune, selectedType, contextEstablishments]);

  const filterEstablishments = () => {
    if (!contextEstablishments) return;
    
    let filtered = contextEstablishments;

    if (searchQuery) {
      filtered = filtered.filter(est =>
        est.Etablissement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.Commune.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "Tous") {
      filtered = filtered.filter(est => est["Nature etablissement"] === selectedCategory);
    }

    if (selectedCommune !== "Toutes") {
      filtered = filtered.filter(est => est.Commune === selectedCommune);
    }

    if (selectedType !== "Tous") {
      filtered = filtered.filter(est => est["Nature etablissement"] === selectedType);
    }

    setFilteredEstablishments(filtered);
  };

  // Get unique communes and types for filters
  const uniqueCommunes = Array.from(new Set(contextEstablishments?.map(est => est.Commune) || [])).filter(Boolean);
  const uniqueTypes = Array.from(new Set(contextEstablishments?.map(est => est["Nature etablissement"]) || [])).filter(Boolean);

  const CategoryButton = ({ category }: { category: string }) => (
    <button
      onClick={() => setSelectedCategory(category)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        selectedCategory === category
          ? "bg-teal-500 text-white"
          : "bg-white/80 text-gray-800 hover:bg-white/90"
      }`}
    >
      {category}
    </button>
  );

  const CommuneButton = ({ commune }: { commune: string }) => (
    <button
      onClick={() => setSelectedCommune(commune)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        selectedCommune === commune
          ? "bg-teal-500 text-white"
          : "bg-white/80 text-gray-800 hover:bg-white/90"
      }`}
    >
      {commune}
    </button>
  );

  const TypeButton = ({ type }: { type: string }) => (
    <button
      onClick={() => setSelectedType(type)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        selectedType === type
          ? "bg-teal-500 text-white"
          : "bg-white/80 text-gray-800 hover:bg-white/90"
      }`}
    >
      {type}
    </button>
  );

  const EstablishmentCard = ({ establishment }: { establishment: Establishment }) => {
    const [showMap, setShowMap] = useState(false);
    const [showRoute, setShowRoute] = useState(false);
    const [userPosition, setUserPosition] = useState<[number, number] | undefined>(undefined);

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

    return (
      <div className="bg-white/80 rounded-xl shadow-lg p-6 relative">
        {/* Investigation Badge */}
        {establishment.isInvestigated && (
          <div className="absolute -top-2 -right-2 bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg z-10">
            Investigué
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{establishment.Etablissement}</h3>
            <p className="text-sm text-gray-600">{establishment.Commune}</p>
            <p className="text-sm text-gray-500">{establishment["Nature etablissement"]}</p>
          </div>
          {establishment.Localisation ? (
            <button 
              onClick={() => setShowMap(true)}
              className="text-teal-600 hover:text-teal-800 transition-colors"
              title="Voir la localisation"
            >
              <FaMapMarkerAlt className="text-lg" />
            </button>
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

        {/* Map Modal */}
        {showMap && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{establishment.Etablissement}</h2>
                  <p className="text-gray-600">{establishment.Commune}</p>
                  {establishment.isInvestigated && (
                    <span className="inline-block mt-2 bg-teal-500 text-white px-3 py-1 rounded-full text-sm">
                      Investigué
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowMap(false);
                    setShowRoute(false);
                    setUserPosition(undefined);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
              <div className="h-[400px] rounded-lg overflow-hidden shadow-lg">
                <Map 
                  position={(() => {
                    const coords = establishment.Localisation?.split(',').map(Number);
                    return coords?.length === 2 ? coords as [number, number] : undefined;
                  })()}
                  popupText={establishment.Etablissement}
                  showRoute={showRoute}
                  startPosition={userPosition}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading || contextLoading) {
    return (
      <PageLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (errorMessage || contextError) {
    return (
      <PageLayout title="Error">
        <div className="flex flex-col items-center justify-center h-64 bg-white/90 rounded-xl p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 text-lg mb-4">{errorMessage || contextError}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Investigations">
      <div className="relative min-h-screen">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/50 -z-10"></div>

        {/* Content */}
        <div className="p-4">
          {/* Success Message */}
          {successMessage && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              {errorMessage}
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des établissements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg bg-white/80 border-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <FaSearch className="absolute left-3 top-3 text-teal-500" />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <CategoryButton category="Tous" />
              {uniqueTypes.map((type) => (
                <TypeButton key={type} type={type} />
              ))}
            </div>

            {/* Commune Filters */}
            <div className="flex flex-wrap gap-2">
              <CommuneButton commune="Toutes" />
              {uniqueCommunes.map((commune) => (
                <CommuneButton key={commune} commune={commune} />
              ))}
            </div>
          </div>

          {/* Establishments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEstablishments.map((establishment) => (
              <EstablishmentCard key={establishment.id} establishment={establishment} />
            ))}
          </div>

          {filteredEstablishments.length === 0 && (
            <div className="text-center py-12 bg-white/80 rounded-xl">
              <p className="text-gray-500">Aucun établissement trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Modal */}
      {selectedEstablishment && (
        <ConversationPopup
          establishment={selectedEstablishment}
          onClose={() => setSelectedEstablishment(null)}
        />
      )}
    </PageLayout>
  );
};

export default function InvestigationsControleurPage() {
  return (
    <InvestigationsContent />
  );
} 