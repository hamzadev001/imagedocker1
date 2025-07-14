'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

interface EstablishmentContextType {
  establishments: Establishment[];
  loading: boolean;
  error: string | null;
  refreshEstablishments: () => Promise<void>;
}

const EstablishmentContext = createContext<EstablishmentContextType | undefined>(undefined);

export function EstablishmentProvider({ children }: { children: React.ReactNode }) {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://hamzaepicness.atwebpages.com/get_establishments1.php');
      if (!response.ok) {
        throw new Error('Failed to fetch establishments');
      }
      const data = await response.json();
      setEstablishments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching establishments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

  return (
    <EstablishmentContext.Provider 
      value={{ 
        establishments, 
        loading, 
        error,
        refreshEstablishments: fetchEstablishments
      }}
    >
      {children}
    </EstablishmentContext.Provider>
  );
}

export function useEstablishments() {
  const context = useContext(EstablishmentContext);
  if (context === undefined) {
    throw new Error('useEstablishments must be used within an EstablishmentProvider');
  }
  return context;
}
