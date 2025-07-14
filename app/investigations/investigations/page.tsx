"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaMapMarkerAlt, FaBell, FaEye } from "react-icons/fa";
import PageLayout from "@/app/components/PageLayout";
import Link from "next/link";

interface Establishment {
  name: string;
  nature: string;
  commune: string;
  gestionnaire: string;
  directeur: string;
  contact: string;
  localisation: string;
  isInvestigated: boolean;
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
          `http://hamzaepicness.atwebpages.com/get_data.php?name=${encodeURIComponent(establishment.name)}`
        );
        if (!response.ok) throw new Error('Failed to fetch investigation data');
        
        const data = await response.json();
        
        // Convertir les commentaires en messages
        const convertedMessages: Message[] = data.flatMap((comment: InvestigationComment, index: number) => {
          const messages: Message[] = [];
          const baseId = index * 1000;

          // Fonction utilitaire pour obtenir une date valide
          const getValidDate = (dateStr: string | null | undefined): Date => {
            if (!dateStr) return new Date();
            
            try {
              const parsedDate = new Date(dateStr);
              // Vérifier si la date est valide
              if (isNaN(parsedDate.getTime())) {
                return new Date();
              }
              return parsedDate;
            } catch (error) {
              return new Date();
            }
          };

          // Message principal (commentaire utilisateur)
          if (comment.comment) {
            const userDate = getValidDate(comment.event_datetime);
            messages.push({
              id: baseId,
              sender: 'user',
              content: comment.comment,
              timestamp: userDate.toISOString()
            });

            // Message admin (commentaire admin) - chaque réponse séparément
            if (comment.admin_comment) {
              const adminResponses = comment.admin_comment.split('/').filter(response => response.trim());
              // Pour les réponses admin, on ajoute une petite différence de temps (1 seconde) après le message utilisateur
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

        // Trier les messages par date en ordre décroissant (plus récent en premier)
        const sortedMessages = convertedMessages.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        // Ajouter un message de bienvenue si aucun commentaire n'existe
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
        setError('Impossible de charger les commentaires. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [establishment.name]);

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
      // Envoyer le message comme un nouveau commentaire
      const response = await fetch("http://hamzaepicness.atwebpages.com/submit_comment.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          etablissementName: establishment.name,
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
            <h3 className="text-lg font-semibold">{establishment.name}</h3>
            <p className="text-sm text-gray-500">{establishment.nature} - {establishment.commune}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
      </div>
    </div>
  );
};

export default function InvestigationsPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
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

  useEffect(() => {
    const fetchAllEstablishmentsForForm = async () => {
      try {
        // Récupérer les établissements investigués
        const investigatedResponse = await fetch("http://hamzaepicness.atwebpages.com/fetch_json2.php");
        if (!investigatedResponse.ok) throw new Error("Failed to load investigated data");
        const investigatedData = await investigatedResponse.json();
        
        // Récupérer tous les établissements
        const allResponse = await fetch("http://hamzaepicness.atwebpages.com/get_establishments1.php");
        if (!allResponse.ok) throw new Error("Failed to load all data");
        const allData = await allResponse.json();

        // Mapper les établissements investigués
        const mappedInvestigated = investigatedData.map((item: any) => ({
          name: item.Etablissement || "Unknown",
          nature: item["Nature etablissement"] || "Unknown",
          commune: item.Commune || "Unknown",
          gestionnaire: item.Gestionnaire || "Unknown",
          directeur: item.Directeur || "Unknown",
          contact: item.Contact || "Unknown",
          localisation: item.Localisation || "",
          isInvestigated: true
        }));

        // Mapper les établissements non investigués
        const nonInvestigatedNames = allData.filter(
          (name: string) => !mappedInvestigated.some((inv: Establishment) => inv.name === name)
        );

        const mappedNonInvestigated = nonInvestigatedNames.map((name: string) => ({
          name: name,
          nature: "Non spécifié",
          commune: "Non spécifié",
          gestionnaire: "Non spécifié",
          directeur: "Non spécifié",
          contact: "Non spécifié",
          localisation: "",
          isInvestigated: false
        }));

        // Combiner tous les établissements pour le formulaire
        const allEstablishments = [...mappedInvestigated, ...mappedNonInvestigated];
        setEstablishments(allEstablishments);

        // Pour l'affichage principal, garder uniquement les investigués
        setFilteredEstablishments(mappedInvestigated);
        setIsLoading(false);
      } catch (error) {
        setErrorMessage("Failed to load establishments");
        setIsLoading(false);
      }
    };

    fetchAllEstablishmentsForForm();
  }, []);

  useEffect(() => {
    filterEstablishments();
  }, [searchQuery, selectedCategory, selectedCommune, selectedType, establishments]);

  const filterEstablishments = () => {
    let filtered = establishments;

    if (searchQuery) {
      filtered = filtered.filter(est =>
        est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.commune.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "Tous") {
      filtered = filtered.filter(est => est.nature === selectedCategory);
    }

    if (selectedCommune !== "Toutes") {
      filtered = filtered.filter(est => est.commune === selectedCommune);
    }

    if (selectedType !== "Tous") {
      filtered = filtered.filter(est => est.nature === selectedType);
    }

    setFilteredEstablishments(filtered);
  };

  // Get unique communes and types for filters
  const uniqueCommunes = Array.from(new Set(establishments.map(est => est.commune))).filter(Boolean);
  const uniqueTypes = Array.from(new Set(establishments.map(est => est.nature))).filter(Boolean);

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

  const EstablishmentCard = ({ establishment }: { establishment: Establishment }) => (
    <div className="bg-white/80 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{establishment.name}</h3>
          <p className="text-gray-600">{establishment.nature}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedEstablishment(establishment)}
            className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
          >
            <FaEye />
          </button>
          <button className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors">
            <FaMapMarkerAlt />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-gray-600"><span className="font-semibold">Commune:</span> {establishment.commune}</p>
        <p className="text-gray-600"><span className="font-semibold">Gestionnaire:</span> {establishment.gestionnaire}</p>
        <p className="text-gray-600"><span className="font-semibold">Directeur:</span> {establishment.directeur}</p>
        <p className="text-gray-600"><span className="font-semibold">Contact:</span> {establishment.contact}</p>
        {establishment.isInvestigated && (
          <p className="text-emerald-600 font-medium">Déjà investigué</p>
        )}
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('etablissement', formData.etablissement);
    formDataToSend.append('comment', formData.comment);
    formDataToSend.append('execution_date', formData.executionDate);
    formDataToSend.append('is_urgent', formData.isUrgent ? '1' : '0');

    try {
      const response = await fetch('http://hamzaepicness.atwebpages.com/insert_request.php', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          etablissement: '',
          comment: '',
          executionDate: '',
          isUrgent: false
        });
        setSuccessMessage("L'investigation a été créée avec succès!");
        setTimeout(() => setSuccessMessage(""), 3000);
        
        // Refresh the establishments list
        const fetchAllEstablishmentsForForm = async () => {
          try {
            // Récupérer les établissements investigués
            const investigatedResponse = await fetch("http://hamzaepicness.atwebpages.com/fetch_json2.php");
            if (!investigatedResponse.ok) throw new Error("Failed to load investigated data");
            const investigatedData = await investigatedResponse.json();
            
            // Récupérer tous les établissements
            const allResponse = await fetch("http://hamzaepicness.atwebpages.com/get_establishments1.php");
            if (!allResponse.ok) throw new Error("Failed to load all data");
            const allData = await allResponse.json();

            // Mapper les établissements investigués
            const mappedInvestigated = investigatedData.map((item: any) => ({
              name: item.Etablissement || "Unknown",
              nature: item["Nature etablissement"] || "Unknown",
              commune: item.Commune || "Unknown",
              gestionnaire: item.Gestionnaire || "Unknown",
              directeur: item.Directeur || "Unknown",
              contact: item.Contact || "Unknown",
              localisation: item.Localisation || "",
              isInvestigated: true
            }));

            // Mapper les établissements non investigués
            const nonInvestigatedNames = allData.filter(
              (name: string) => !mappedInvestigated.some((inv: Establishment) => inv.name === name)
            );

            const mappedNonInvestigated = nonInvestigatedNames.map((name: string) => ({
              name: name,
              nature: "Non spécifié",
              commune: "Non spécifié",
              gestionnaire: "Non spécifié",
              directeur: "Non spécifié",
              contact: "Non spécifié",
              localisation: "",
              isInvestigated: false
            }));

            // Combiner tous les établissements pour le formulaire
            const allEstablishments = [...mappedInvestigated, ...mappedNonInvestigated];
            setEstablishments(allEstablishments);

            // Pour l'affichage principal, garder uniquement les investigués
            setFilteredEstablishments(mappedInvestigated);
          } catch (error) {
            console.error('Error refreshing establishments:', error);
          }
        };

        fetchAllEstablishmentsForForm();
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage("Erreur lors de la création de l'investigation");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Nouvelle fonction pour filtrer les établissements dans le formulaire
  const getFilteredFormEstablishments = () => {
    if (!formSearchQuery) return establishments;
    
    return establishments.filter(est =>
      est.name.toLowerCase().includes(formSearchQuery.toLowerCase()) ||
      est.nature.toLowerCase().includes(formSearchQuery.toLowerCase()) ||
      est.commune.toLowerCase().includes(formSearchQuery.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <PageLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (errorMessage) {
    return (
      <PageLayout title="Error">
        <div className="flex flex-col items-center justify-center h-64 bg-white/90 rounded-xl p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 text-lg mb-4">{errorMessage}</p>
          <Link href="/investigations" className="bg-red-500 text-white px-4 py-2 rounded-lg">
            Back
          </Link>
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

        {/* Add New Investigation Button */}
          <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Nouvelle Investigation
          </button>
        </div>

          {/* Category filters */}
          <div className="flex flex-col space-y-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <CategoryButton category="Tous" />
              <CategoryButton category="Sante" />
              <CategoryButton category="Sport" />
              <CategoryButton category="Education" />
                  </div>

            {/* Commune filters */}
            <div className="flex flex-wrap gap-2">
              <CommuneButton commune="Toutes" />
              {uniqueCommunes.map((commune) => (
                <CommuneButton key={commune} commune={commune} />
              ))}
                </div>

            {/* Type filters */}
            <div className="flex flex-wrap gap-2">
              <TypeButton type="Tous" />
              {uniqueTypes.map((type) => (
                <TypeButton key={type} type={type} />
              ))}
              </div>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for establishments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-full bg-white/80 border-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <FaSearch className="absolute left-3 top-3 text-teal-500" />
            </div>
          </div>

          {/* Establishments list */}
          <div className="space-y-4">
            {filteredEstablishments.map((establishment, index) => (
              <EstablishmentCard key={`${establishment.name}-${index}`} establishment={establishment} />
            ))}
          </div>
        </div>

        {/* Conversation Popup */}
        {selectedEstablishment && (
          <ConversationPopup
            establishment={selectedEstablishment}
            onClose={() => setSelectedEstablishment(null)}
          />
        )}
      </div>

      {/* New Investigation Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90%] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Nouvelle Investigation</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected Establishment Display */}
              {formData.etablissement && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{formData.etablissement}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, etablissement: '' })}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Search and Select Establishment */}
              {!formData.etablissement && (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      value={formSearchQuery}
                      onChange={(e) => setFormSearchQuery(e.target.value)}
                      placeholder="Rechercher un établissement..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {getFilteredFormEstablishments().map((est, index) => (
                      <div
                        key={`${est.name}-${index}-${est.isInvestigated ? 'inv' : 'non-inv'}`}
                        className="p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setFormData({ ...formData, etablissement: est.name });
                          setFormSearchQuery(""); // Réinitialiser la recherche après sélection
                        }}
                      >
                        <div className="font-medium">{est.name}</div>
                        <div className="text-sm text-gray-500">
                          {est.nature} - {est.commune}
                          {est.isInvestigated && (
                            <span className="ml-2 text-emerald-600">(Déjà investigué)</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Comment Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  required
                />
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'exécution
                </label>
                <input
                  type="date"
                  value={formData.executionDate}
                  onChange={(e) => setFormData({ ...formData, executionDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Priority Switch */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Priorité:</span>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    formData.isUrgent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {formData.isUrgent ? 'Urgent' : 'Normal'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Soumettre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
} 