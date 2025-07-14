"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";
import PageLayout from "@/app/components/PageLayout";

interface Establishment {
  name: string;
}

export default function AdminRequestForm() {
  const [selectedEtablissement, setSelectedEtablissement] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [executionDate, setExecutionDate] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [etablissements, setEtablissements] = useState<string[]>([]);
  const [filteredEtablissements, setFilteredEtablissements] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEtablissements();
  }, []);

  const fetchEtablissements = async () => {
    try {
      const response = await fetch("http://hamzaepicness.atwebpages.com/get_establishments1.php");
      if (!response.ok) throw new Error('Failed to load establishments');
      const data = await response.json();
      setEtablissements(data);
      setFilteredEtablissements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEtablissements = (query: string) => {
    setSearchQuery(query);
    setFilteredEtablissements(
      etablissements.filter(etablissement => 
        etablissement.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEtablissement || !comment || !executionDate) {
      setError("Veuillez remplir tous les champs requis");
      return;
    }

    try {
      const response = await fetch("http://hamzaepicness.atwebpages.com/insert_request.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          etablissement: selectedEtablissement,
          comment: comment,
          execution_date: executionDate,
          is_urgent: isUrgent ? "1" : "0",
        }),
      });

      if (!response.ok) throw new Error('Failed to submit request');
      
      // Reset form
      setSelectedEtablissement(null);
      setComment("");
      setExecutionDate("");
      setIsUrgent(false);
      setError(null);
      
      // Show success message
      alert("Formulaire soumis avec succès!");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Formulaire de Demande">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Formulaire de Demande">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center text-teal-700 mb-6">
            Formulaire de Demande Admin
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Establishment Display */}
            {selectedEtablissement && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex justify-between items-center">
                <span className="font-medium">{selectedEtablissement}</span>
                <button
                  type="button"
                  onClick={() => setSelectedEtablissement(null)}
                  className="text-teal-700 hover:text-teal-900"
                >
                  <FaExclamationTriangle />
                </button>
              </div>
            )}

            {/* Search and Selection */}
            {!selectedEtablissement && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => filterEtablissements(e.target.value)}
                    placeholder="Rechercher un établissement"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>

                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  {filteredEtablissements.map((etablissement) => (
                    <div
                      key={etablissement}
                      onClick={() => setSelectedEtablissement(etablissement)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      {etablissement}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                required
              />
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'exécution
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={executionDate}
                  onChange={(e) => setExecutionDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Priority Switch */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Priorité de la demande:
              </span>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isUrgent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isUrgent ? 'Urgent' : 'Normal'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
            >
              Soumettre
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
} 