"use client";

import { useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock } from 'react-icons/fa';

interface ProfileData {
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  zone: string;
}

export default function ProfilControleur() {
  const [profileData, setProfileData] = useState<ProfileData>({
    nom: "Mohammed Alami",
    email: "m.alami@example.com",
    telephone: "+212 6XX-XXXXXX",
    adresse: "123 Rue Hassan II",
    zone: "Casablanca-Settat"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileData>(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(profileData);
  };

  const handleSave = () => {
    setProfileData(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(profileData);
  };

  return (
    <div className="relative flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 ml-72">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Profil</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Informations personnelles
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      Modifier
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <FaUser className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Nom complet
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.nom}
                          onChange={(e) => setEditedData({ ...editedData, nom: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-800">{profileData.nom}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <FaEnvelope className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedData.email}
                          onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-800">{profileData.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <FaPhone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Téléphone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedData.telephone}
                          onChange={(e) => setEditedData({ ...editedData, telephone: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-800">{profileData.telephone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <FaMapMarkerAlt className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Adresse
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.adresse}
                          onChange={(e) => setEditedData({ ...editedData, adresse: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-800">{profileData.adresse}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <FaMapMarkerAlt className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Zone d'intervention
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.zone}
                          onChange={(e) => setEditedData({ ...editedData, zone: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-800">{profileData.zone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <FaLock className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Sécurité</h2>
                </div>

                <div className="space-y-4">
                  <button
                    className="w-full px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    Changer le mot de passe
                  </button>
                  <button
                    className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Activer l'authentification à deux facteurs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 