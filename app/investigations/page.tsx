"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaMapMarkerAlt, FaBell, FaEye } from "react-icons/fa";
import PageLayout from "@/app/components/PageLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://hamzaepicness.atwebpages.com/fetch_conversation.php?name=${encodeURIComponent(establishment.name)}`
      );
      if (!response.ok) throw new Error('Failed to fetch investigation data');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch data');
      }

      const convertedMessages: Message[] = data.data.map((item: any, index: number) => ({
        id: index + 1,
        sender: item.sender,
        content: item.comment,
        timestamp: item.datetime || item.created_at
      }));

      setMessages(convertedMessages);
      setError(null);
    } catch (error) {
      setError('Impossible de charger les commentaires. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [establishment.name]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-w-[90%] h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">{establishment.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-red-500 text-center">
                <p>{error}</p>
                <button onClick={fetchMessages} className="mt-2 text-teal-500 hover:text-teal-600">Réessayer</button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Aucune conversation disponible</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-2xl px-4 py-2 max-w-[70%] shadow-md ${message.sender === 'admin' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {message.sender === 'admin' && (
                          <span className="inline-block bg-emerald-700 text-white text-xs px-2 py-0.5 rounded-full mr-2">ADMIN</span>
                        )}
                        <span>{message.content}</span>
                      </div>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {new Date(message.timestamp).toLocaleString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function InvestigationsPage() {
  const router = useRouter();
  const [establishments, setEstablishments] = useState<string[]>([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    etablissement: '',
    comment: '',
    executionDate: '',
    isUrgent: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);

  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        const response = await fetch('http://hamzaepicness.atwebpages.com/get_establishments1.php');
        if (!response.ok) throw new Error('Failed to fetch establishments');
        const data = await response.json();
        setEstablishments(data);
        setFilteredEstablishments(data);
      } catch (error) {
        setErrorMessage("Failed to load establishments");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEstablishments();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilteredEstablishments(
      establishments.filter(est => est.toLowerCase().includes(query.toLowerCase()))
    );
  };

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
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        setShowForm(false);
        setFormData({
          etablissement: '',
          comment: '',
          executionDate: '',
          isUrgent: false
        });
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      setErrorMessage("Erreur lors de la création de l'investigation");
    }
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
          {showSuccessMessage && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              L'investigation a été créée avec succès!
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

          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for establishments..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-full bg-white/80 border-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <FaSearch className="absolute left-3 top-3 text-teal-500" />
            </div>
          </div>

          {/* Establishments list */}
          <div className="space-y-4">
            {filteredEstablishments.map((establishment, index) => (
              <div key={`${establishment}-${index}`}>
                <div
                  className="bg-white/80 rounded-xl shadow-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{establishment}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedEstablishment({
                          name: establishment,
                          nature: "Non spécifié",
                          commune: "Non spécifié",
                          gestionnaire: "Non spécifié",
                          directeur: "Non spécifié",
                          contact: "Non spécifié",
                          localisation: "",
                          isInvestigated: false
                        })}
                        className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
                        onClick={() => router.push(`/etablissement?name=${encodeURIComponent(establishment)}`)}
                      >
                        <FaMapMarkerAlt />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Rechercher un établissement..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredEstablishments.map((est) => (
                      <div
                        key={est}
                        className="p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setFormData({ ...formData, etablissement: est })}
                      >
                        {est}
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