"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BsBuildings, BsHouseDoor } from "react-icons/bs";
import { RiHealthBookLine, RiTeamLine } from "react-icons/ri";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, ArcElement, LineElement } from "chart.js";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import Sidebar from '@/app/components/Sidebar'
import pptxgen from 'pptxgenjs';
import * as htmlToImage from 'html-to-image';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  PointElement,
  ArcElement,
  LineElement
);

interface Establishment {
  Commune: string;
  Etablissement: string;
  "Nature etablissement": string;
  Gestionnaire: string;
  Directeur: string;
  Contact: string;
  Localisation: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("Tous");
  const [timeFilter, setTimeFilter] = useState("Mois");
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const chartsRef = useRef([]);

  const exportToPowerPoint = async () => {
    try {
      // Create a new PowerPoint presentation
      const pres = new pptxgen();

      // Function to create slide with chart
      const createSlideWithChart = async (chartRef, title) => {
        if (!chartRef) return;
        
        // Convert chart to image
        const dataUrl = await htmlToImage.toPng(chartRef, {
          quality: 1.0,
          pixelRatio: 2
        });
        
        // Create a new slide
        const slide = pres.addSlide();
        
        // Add title
        slide.addText(title, {
          x: 0.5,
          y: 0.5,
          fontSize: 24,
          bold: true,
          color: '363636'
        });
        
        // Add chart image
        slide.addImage({
          data: dataUrl,
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 4.5
        });
      };

      // Create slides for each chart
      const chartTitles = [
        'État des Établissements',
        'Répartition par Type',
        'Établissements par Commune',
        'Distribution par Gestionnaire',
        'État des Contacts',
        'Évolution des Établissements'
      ];

      // Process each chart
      for (let i = 0; i < chartsRef.current.length; i++) {
        if (chartsRef.current[i]) {
          await createSlideWithChart(chartsRef.current[i], chartTitles[i]);
        }
      }

      // Save the presentation
      await pres.writeFile({ fileName: 'Statistiques_Etablissements.pptx' });
    } catch (error) {
      console.error('Error exporting to PowerPoint:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://hamzaepicness.atwebpages.com/fetch_json3.php');
        const data = await response.json();
        setEstablishments(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics from real data
  const stats = {
    total: establishments.length,
    socialCenters: establishments.filter(e => e["Nature etablissement"].toLowerCase().includes("social")).length,
    healthCenters: establishments.filter(e => e["Nature etablissement"].toLowerCase() === "sante").length,
    youthCenters: establishments.filter(e => e["Nature etablissement"].toLowerCase().includes("jeunes")).length,
    withDirector: establishments.filter(e => e.Directeur !== "").length,
    withoutDirector: establishments.filter(e => e.Directeur === "").length,
    withLocation: establishments.filter(e => e.Localisation !== "").length,
    withoutLocation: establishments.filter(e => e.Localisation === "").length
  };

  // Group establishments by type for the doughnut chart
  const establishmentTypes = Array.from(new Set(establishments.map(e => e["Nature etablissement"])));
  const typeCount = establishmentTypes.map(type => 
    establishments.filter(e => e["Nature etablissement"] === type).length
  );

  // Group establishments by commune for the bar chart
  const communes = Array.from(new Set(establishments.map(e => e.Commune)));
  const communeCount = communes.map(commune => 
    establishments.filter(e => e.Commune === commune).length
  );

  // Chart data
  const barChartData = {
    labels: communes,
    datasets: [
      {
        label: "Établissements par commune",
        data: communeCount,
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleCardClick = (type: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('filter', type);
    router.push(`/etablissement?${searchParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 ml-72">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de Bord</h1>
          

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100 min-h-[140px] flex items-center cursor-pointer hover:shadow-xl transition-all"
              onClick={() => router.push('/etablissement')}
            >
              <div className="flex items-center w-full">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <BsBuildings className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Établissements</p>
                  <p className="text-2xl font-semibold text-gray-800">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100 min-h-[140px] flex items-center cursor-pointer hover:shadow-xl transition-all"
              onClick={() => handleCardClick('Centre social')}
            >
              <div className="flex items-center w-full">
                <div className="p-3 bg-blue-100 rounded-full">
                  <BsHouseDoor className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Centres Sociaux</p>
                  <p className="text-2xl font-semibold text-gray-800">{stats.socialCenters}</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100 min-h-[140px] flex items-center cursor-pointer hover:shadow-xl transition-all"
              onClick={() => handleCardClick('Sante')}
            >
              <div className="flex items-center w-full">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <RiHealthBookLine className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Centres de Santé</p>
                  <p className="text-2xl font-semibold text-gray-800">{stats.healthCenters}</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100 min-h-[140px] flex items-center cursor-pointer hover:shadow-xl transition-all"
              onClick={() => handleCardClick('Maison des Jeunes')}
            >
              <div className="flex items-center w-full">
                <div className="p-3 bg-red-100 rounded-full">
                  <RiTeamLine className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Maisons des Jeunes</p>
                  <p className="text-2xl font-semibold text-gray-800">{stats.youthCenters}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div ref={el => chartsRef.current[0] = el} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100 min-h-[450px]">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">État des Établissements</h3>
              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Total des Établissements</p>
                  <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-2">Nombre de Communes</p>
                  <p className="text-4xl font-bold text-emerald-600">{communes.length}</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">État de Géolocalisation</p>
                  <p className="text-4xl font-bold text-blue-600 mb-4">{stats.withLocation} / {stats.total}</p>
                  <div className="flex justify-center gap-8 text-sm">
                    <div>
                      <p className="text-gray-500">Localisés</p>
                      <p className="text-lg font-semibold text-gray-700">{stats.withLocation}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Non localisés</p>
                      <p className="text-lg font-semibold text-gray-700">{stats.withoutLocation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div ref={el => chartsRef.current[1] = el} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100 min-h-[450px]">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Répartition par Type</h3>
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                {establishmentTypes.map((type, index) => (
                  <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-gray-600">{type}</span>
                    <div className="flex items-center">
                      <span className="font-semibold">{typeCount[index]}</span>
                      <div 
                        className="ml-2 w-2 h-2 rounded-full" 
                        style={{ 
                          backgroundColor: [
                            "rgba(16, 185, 129, 0.8)",
                            "rgba(59, 130, 246, 0.8)",
                            "rgba(251, 191, 36, 0.8)",
                            "rgba(239, 68, 68, 0.8)",
                            "rgba(139, 92, 246, 0.8)",
                            "rgba(236, 72, 153, 0.8)"
                          ][index % 6]
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-gray-50 rounded-lg mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total</span>
                    <span className="font-semibold text-lg">{stats.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div ref={el => chartsRef.current[2] = el} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100 min-h-[450px]">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Établissements par Commune</h3>
              <div className="h-[380px]">
                <Bar data={barChartData} options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    }
                  }
                }} />
              </div>
            </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Distribution par Gestionnaire */}
            <div ref={el => chartsRef.current[3] = el} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100 min-h-[500px] col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Distribution par Gestionnaire</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[420px]">
                  <Pie 
                    data={{
                      labels: Array.from(new Set(establishments.map(e => e.Gestionnaire || 'Non spécifié'))),
                      datasets: [{
                        data: Array.from(new Set(establishments.map(e => e.Gestionnaire || 'Non spécifié')))
                          .map(gestionnaire => 
                            establishments.filter(e => (e.Gestionnaire || 'Non spécifié') === gestionnaire).length
                          ),
                        backgroundColor: [
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(251, 191, 36, 0.8)',
                          'rgba(239, 68, 68, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
                          'rgba(236, 72, 153, 0.8)'
                        ]
                      }]
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            boxWidth: 12,
                            font: {
                              size: 11
                            },
                            padding: 15
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                  {Array.from(new Set(establishments.map(e => e.Gestionnaire || 'Non spécifié')))
                    .map((gestionnaire, index) => {
                      const count = establishments.filter(e => (e.Gestionnaire || 'Non spécifié') === gestionnaire).length;
                      const percentage = ((count / establishments.length) * 100).toFixed(1);
                      return (
                        <div key={gestionnaire} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-800">{gestionnaire}</span>
                            <div className="flex items-center">
                              <span className="text-lg font-semibold text-gray-700">{count}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: [
                                  'rgba(16, 185, 129, 0.8)',
                                  'rgba(59, 130, 246, 0.8)',
                                  'rgba(251, 191, 36, 0.8)',
                                  'rgba(239, 68, 68, 0.8)',
                                  'rgba(139, 92, 246, 0.8)',
                                  'rgba(236, 72, 153, 0.8)'
                                ][index % 6]
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <button
              onClick={exportToPowerPoint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exporter vers PowerPoint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}