"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaComment, FaCalendarAlt, FaUser, FaImage, FaPaperPlane, FaRegLightbulb } from "react-icons/fa";
import PageLayout from "@/app/components/PageLayout";

interface Submission {
  id: string;
  status: string;
  nature: string;
  sponsor: string;
  event_datetime: string;
  comment: string;
  event_comment: string;
  admin_comment: string;
  image_path: string;
}

export default function SubmissionsDisplayPage() {
  const searchParams = useSearchParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const etablissementName = searchParams.get("name") || "Unknown";

  // Fetch submissions like Flutter does
  const fetchSubmissions = async () => {
    try {
      const response = await fetch(
        `http://hamzaepicness.atwebpages.com/get_data.php?name=${encodeURIComponent(etablissementName)}`
      );
      
      if (!response.ok) throw new Error("Failed to load submissions");
      
      const jsonData = await response.json();

      // Deduplicate and cast
      const uniqueData = Array.from(new Set(jsonData.map((e: any) => JSON.stringify(e)))).map((item) =>
        JSON.parse(item as string)
      );

      setSubmissions(uniqueData);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error loading submissions");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit comment like Flutter
  const submitComment = async (comment: string) => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("http://hamzaepicness.atwebpages.com/submit_comment.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          etablissementName: etablissementName,
          comment: comment,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit comment");

      const responseBody = await response.json();

      if (responseBody.success) {
        setNewComment("");
        fetchSubmissions(); // Refresh
      } else {
        setError(`Failed to submit comment: ${responseBody.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("Error submitting comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [etablissementName]);

  const hasAdminComment = (item: Submission) => {
    return !!(item.admin_comment && item.admin_comment.trim());
  };

  if (isLoading) {
    return (
      <PageLayout title={`Soumissions - ${etablissementName}`}>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement des soumissions...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title={`Soumissions - ${etablissementName}`}>
        <div className="flex flex-col items-center justify-center h-64 bg-white/90 rounded-xl p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Soumissions - ${etablissementName}`}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaRegLightbulb className="text-yellow-500" />
              Soumissions - {etablissementName}
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-teal-400 to-cyan-500 mt-2"></div>
          </div>

          {/* Card Container */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            {/* Messages Section */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {submissions.length === 0 ? (
                <div className="text-center py-10">
                  <FaComment className="text-gray-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Aucune soumission trouvée.</p>
                </div>
              ) : (
                submissions.map((item, index) => {
                  const showAdminComment = hasAdminComment(item);

                  return (
                    <div key={index} className="mb-8">
                      {/* Status Badge */}
                      <div className="mb-4">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                          item.status === "Completed" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : item.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {item.status || "En attente"}
                        </span>
                      </div>

                      {/* Submission Details Card */}
                      <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl mb-4 shadow-md border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoRow label="Nature" value={item.nature || "N/A"} />
                          <InfoRow label="Sponsor" value={item.sponsor || "N/A"} />
                          <InfoRow label="Date de l'événement" value={item.event_datetime || "N/A"} />
                          <InfoRow label="Commentaire événement" value={item.event_comment || "N/A"} />
                        </div>

                        <div className="mt-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="text-sm font-semibold text-gray-500">💬 Commentaire utilisateur:</span>
                            <p className="mt-1 text-gray-800">{item.comment || "Aucun commentaire"}</p>
                          </div>
                        </div>

                        {/* Admin Comment */}
                        {showAdminComment && (
                          <div className="mt-4">
                            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                              <span className="text-sm font-semibold text-orange-600">🧑‍💻 Commentaire Admin:</span>
                              <p className="mt-1 text-orange-800">{item.admin_comment}</p>
                            </div>
                          </div>
                        )}

                        {/* Image Preview */}
                        {item.image_path && (
                          <div className="mt-4 rounded-lg overflow-hidden">
                            <img
                              src={item.image_path}
                              alt="Image soumise"
                              className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                      </div>

                      {/* Admin Reply Section */}
                      {!showAdminComment && (
                        <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100">
                          <h3 className="font-medium text-gray-700 mb-3">Répondre à cette soumission:</h3>
                          
                          <div className="relative">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Écrivez votre réponse..."
                              className="w-full p-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-all duration-200"
                              rows={3}
                            />
                            <FaComment className="absolute left-3 top-3 text-gray-400" />
                          </div>

                          <button
                            onClick={() => submitComment(newComment)}
                            disabled={isSubmitting || !newComment.trim()}
                            className={`
                              mt-3 px-5 py-2 rounded-lg
                              flex items-center gap-2 font-medium
                              text-white bg-gradient-to-r from-teal-500 to-cyan-500
                              hover:from-teal-600 hover:to-cyan-600
                              disabled:opacity-50 disabled:cursor-not-allowed
                              transform hover:scale-[1.02] active:scale-[0.98]
                              transition-all duration-200
                            `}
                          >
                            <FaPaperPlane /> {isSubmitting ? 'Envoi en cours...' : 'Envoyer la réponse'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// Helper Component: Info Row
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <div className="text-gray-800 font-medium">{value}</div>
    </div>
  );
}