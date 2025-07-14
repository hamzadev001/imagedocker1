"use client";

import { useState } from "react";
import { FaMapMarkerAlt, FaListAlt, FaComments, FaMap } from "react-icons/fa";
import PageLayout from "@/app/components/PageLayout";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Establishment {
  name: string;
  nature: string;
  commune: string;
  gestionnaire: string;
  directeur: string;
  contact: string;
  localisation: string;
}

export default function EstablishmentDetailsPage() {
  const params = useParams();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // In a real app, you would fetch the establishment details using the ID from params
  // For now, we'll use mock data
  useState(() => {
    // Simulate API call
    setTimeout(() => {
      setEstablishment({
        name: "Sample Establishment",
        nature: "Education",
        commune: "Sample Commune",
        gestionnaire: "Sample Gestionnaire",
        directeur: "Sample Directeur",
        contact: "123456789",
        localisation: "35.123,-7.456"
      });
      setIsLoading(false);
    }, 1000);
  });

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
          <Link href="/notifications" className="bg-red-500 text-white px-4 py-2 rounded-lg">
            Back
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (!establishment) {
    return (
      <PageLayout title="Not Found">
        <div className="flex flex-col items-center justify-center h-64 bg-white/90 rounded-xl p-6">
          <p className="text-gray-800 text-lg mb-4">Establishment not found</p>
          <Link href="/notifications" className="bg-red-500 text-white px-4 py-2 rounded-lg">
            Back
          </Link>
        </div>
      </PageLayout>
    );
  }

  const [latitude, longitude] = establishment.localisation.split(",").map(Number);

  return (
    <PageLayout title={establishment.name}>
      <div className="relative min-h-screen">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/50 -z-10"></div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Details Card */}
          <div className="bg-teal-800/80 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">{establishment.name}</h2>
            <div className="h-px bg-white/30 mb-4"></div>
            <div className="space-y-3">
              <DetailRow label="Commune" value={establishment.commune} />
              <DetailRow label="Nature" value={establishment.nature} />
              <DetailRow label="Gestionnaire" value={establishment.gestionnaire} />
              <DetailRow label="Directeur" value={establishment.directeur} />
              <DetailRow label="Contact" value={establishment.contact} />
            </div>
          </div>

          {/* Map Section */}
          {latitude && longitude && (
            <>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${latitude},${longitude}`}
                ></iframe>
              </div>

              <a
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaMap />
                <span>Voir sur Google Maps</span>
              </a>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <Link
              href={`/notifications/PhaseListPageee/${params.id}/submissions`}
              className="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <FaListAlt />
              <span>Voir les Soumissions</span>
            </Link>

            <Link
              href={`/notifications/PhaseListPageee/${params.id}/conversation`}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaComments />
              <span>Start Conversation</span>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="font-semibold w-32">{label}:</span>
      <span>{value}</span>
    </div>
  );
} 