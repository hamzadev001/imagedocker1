"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import Link from 'next/link';
import { FaComment } from 'react-icons/fa';

// Déclarer le module pour TypeScript
declare module 'leaflet-routing-machine' {
  export function control(options: any): any;
}

// Créer une icône personnalisée
const customIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Establishment {
  id: number;
  etablissement?: string;
  Etablissement?: string;
  commune?: string;
  Commune?: string;
  localisation?: string;
  Localisation?: string;
}

interface MapProps {
  establishments?: Establishment[];
  position?: [number, number];
  popupText?: string;
  showRoute?: boolean;
  startPosition?: [number, number];
}

export default function Map({ establishments, position, popupText, showRoute = false, startPosition }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routingControlRef = useRef<any>(null);
  const [showRouting, setShowRouting] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialiser la carte
    mapRef.current = L.map(mapContainerRef.current).setView([33.5731, -7.5898], 13);

    // Ajouter le fond de carte OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Si une position est fournie, centrer la carte sur cette position
    if (position) {
      mapRef.current.setView(position, 13);
      L.marker(position, { icon: customIcon })
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-lg">${popupText || 'Localisation'}</h3>
            <p class="text-sm text-gray-600">Latitude: ${position[0].toFixed(6)}</p>
            <p class="text-sm text-gray-600">Longitude: ${position[1].toFixed(6)}</p>
          </div>
        `)
        .addTo(mapRef.current);

      // Si showRoute est true et qu'on a une position de départ, afficher l'itinéraire
      if (showRoute && startPosition && showRouting) {
        if (routingControlRef.current) {
          routingControlRef.current.remove();
        }

        routingControlRef.current = (L as any).Routing.control({
          waypoints: [
            L.latLng(startPosition[0], startPosition[1]),
            L.latLng(position[0], position[1])
          ],
          routeWhileDragging: true,
          show: true,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: false,
          language: 'fr',
          formatter: new (window as any).L.Routing.Formatter({ language: 'fr', units: 'metric', narrative: false }),
          createMarker: function(i: number, waypoint: any, n: number) {
            return L.marker(waypoint.latLng, {
              icon: customIcon
            });
          }
        }).addTo(mapRef.current);
      }
    }
    // Sinon, si des établissements sont fournis, ajouter leurs marqueurs
    else if (establishments) {
      establishments.forEach(establishment => {
        const location = establishment.localisation || establishment.Localisation;
        if (location) {
          const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            const name = establishment.etablissement || establishment.Etablissement || 'Établissement';
            const commune = establishment.commune || establishment.Commune || 'Non spécifié';
            
            L.marker([lat, lng], { icon: customIcon })
              .bindPopup(`
                <div class="p-2">
                  <h3 class="font-semibold text-lg">${name}</h3>
                  <p class="text-sm text-gray-600">${commune}</p>
                  <p class="text-sm text-gray-600">Latitude: ${lat.toFixed(6)}</p>
                  <p class="text-sm text-gray-600">Longitude: ${lng.toFixed(6)}</p>
                </div>
              `)
              .addTo(mapRef.current!);
          }
        }
      });
    }

    // Nettoyer la carte lors du démontage du composant
    return () => {
      if (routingControlRef.current) {
        routingControlRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [establishments, position, popupText, showRoute, startPosition, showRouting]);

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      className={showInstructions ? '' : 'hide-routing-instructions'}
    >
      {showRoute && showRouting && (
        <button
          onClick={() => setShowRouting(false)}
          style={{
            position: 'absolute',
            zIndex: 1200,
            right: 20,
            top: 20,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 6,
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
          }}
        >
          Fermer l'itinéraire
        </button>
      )}
      {showRoute && showRouting && showInstructions && (
        <>
          <style>{`
            .close-instructions-btn {
              position: absolute;
              top: 12px;
              right: 16px;
              z-index: 1300;
              background: linear-gradient(135deg, #2563eb 60%, #22d3ee 100%);
              color: #fff;
              border: none;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.25rem;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 4px 16px rgba(34, 211, 238, 0.18), 0 2px 8px rgba(37,99,235,0.10);
              transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
              outline: none;
              border: 2px solid #fff;
            }
            .close-instructions-btn:hover {
              background: linear-gradient(135deg, #22d3ee 60%, #2563eb 100%);
              transform: scale(1.13) rotate(8deg);
              box-shadow: 0 6px 24px rgba(34, 211, 238, 0.28), 0 4px 16px rgba(37,99,235,0.18);
            }
            .close-instructions-btn:active {
              transform: scale(0.97);
            }
            .leaflet-routing-container { position: relative; }
          `}</style>
          <button
            className="close-instructions-btn"
            title="Fermer les instructions"
            onClick={() => setShowInstructions(false)}
            aria-label="Fermer les instructions"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L14 14M14 6L6 14" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </>
      )}
      {showRoute && !showRouting && (
        <button
          onClick={() => {
            setShowRouting(true);
            setShowInstructions(true);
          }}
          style={{
            position: 'absolute',
            zIndex: 1200,
            right: 20,
            top: 20,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
          }}
        >
          Afficher l'itinéraire
        </button>
      )}
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
    </div>
  );
} 