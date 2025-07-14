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
}

export default function PhaseListPageee() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  useEffect(() => {
    fetchEstablishments();
  }, []);

  useEffect(() => {
    filterEstablishments();
  }, [searchQuery, selectedCategory, establishments]);

  const fetchEstablishments = async () => {
    try {
      const response = await fetch("http://hamzaepicness.atwebpages.com/fetch_json2.php");
      if (!response.ok) throw new Error("Failed to load data");
      
      const data = await response.json();
      const mappedData = data.map((item: any) => ({
        name: item.Etablissement || "Unknown",
        nature: item["Nature etablissement"] || "Unknown",
        commune: item.Commune || "Unknown",
        gestionnaire: item.Gestionnaire || "Unknown",
        directeur: item.Directeur || "Unknown",
        contact: item.Contact || "Unknown",
        localisation: item.Localisation || "",
      }));

      setEstablishments(mappedData);
      setFilteredEstablishments(mappedData);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage("There is no etablissement here.");
      setIsLoading(false);
    }
  };

  const filterEstablishments = () => {
    let filtered = establishments;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(est => 
        est.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== "Tous") {
      filtered = filtered.filter(est => 
        est.nature.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    setFilteredEstablishments(filtered);
  };

  const CategoryButton = ({ category }: { category: string }) => (
    <button
      onClick={() => setSelectedCategory(category)}
      className={`px-4 py-2 rounded-full border-2 ${
        selectedCategory === category
          ? "bg-green-400 text-white border-green-400"
          : "bg-transparent text-green-600 border-gray-300"
      }`}
    >
      {category}
    </button>
  );

  const EstablishmentCard = ({ establishment }: { establishment: Establishment }) => {
    return (
      <Link
        href={`/etablissement?name=${encodeURIComponent(establishment.name)}`}
        className="block bg-gradient-to-r from-teal-600 to-green-500 rounded-xl shadow-lg p-4 mb-4 hover:opacity-90 transition-opacity"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-white text-lg font-semibold">{establishment.name}</h3>
            <p className="text-white/70">Nature: {establishment.nature}</p>
          </div>
          <div className="flex items-center space-x-4">
            <FaMapMarkerAlt className="text-red-300" />
            <FaBell className="text-red-300" />
          </div>
        </div>
      </Link>
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
          <Link href="/notifications" className="bg-red-500 text-white px-4 py-2 rounded-lg">
            Back
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Reviewed Phase">
      <div className="relative min-h-screen">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/50 -z-10"></div>

        {/* Content */}
        <div className="p-4">
          {/* Category filters */}
          <div className="flex justify-center space-x-2 mb-4">
            <CategoryButton category="Tous" />
            <CategoryButton category="Sante" />
            <CategoryButton category="Sport" />
            <CategoryButton category="Education" />
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
              <EstablishmentCard key={index} establishment={establishment} />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 