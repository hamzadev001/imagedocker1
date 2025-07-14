"use client";

import { useState, useEffect } from "react";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import PageLayout from "@/app/components/PageLayout";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Submission {
  id: string;
  title: string;
  date: string;
  status: string;
  description: string;
}

export default function DisplayPage() {
  const params = useParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [searchQuery, submissions]);

  const fetchSubmissions = async () => {
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`http://hamzaepicness.atwebpages.com/fetch_submissions.php?etablissement=${params.id}`);
      if (!response.ok) throw new Error("Failed to load submissions");
      
      const data = await response.json();
      setSubmissions(data);
      setFilteredSubmissions(data);
      setIsLoading(false);
    } catch (error) {
      setError("Failed to load submissions");
      setIsLoading(false);
    }
  };

  const filterSubmissions = () => {
    if (!searchQuery) {
      setFilteredSubmissions(submissions);
      return;
    }

    const filtered = submissions.filter(submission =>
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSubmissions(filtered);
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

  if (error) {
    return (
      <PageLayout title="Error">
        <div className="flex flex-col items-center justify-center h-64 bg-white/90 rounded-xl p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 text-lg mb-4">{error}</p>
          <Link href={`/notifications/PhaseListPageee/${params.id}`} className="bg-red-500 text-white px-4 py-2 rounded-lg">
            Back
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Submissions">
      <div className="relative min-h-screen">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/50 -z-10"></div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Back button */}
          <Link
            href={`/notifications/PhaseListPageee/${params.id}`}
            className="flex items-center gap-2 text-white hover:text-teal-300 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Details</span>
          </Link>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-full bg-white/80 border-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <FaSearch className="absolute left-3 top-3 text-teal-500" />
          </div>

          {/* Submissions list */}
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center text-white py-8">
                No submissions found
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-teal-800/80 rounded-xl shadow-lg p-6 text-white"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{submission.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      submission.status === "Completed" 
                        ? "bg-green-500" 
                        : submission.status === "Pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-white/70 mb-2">{submission.description}</p>
                  <p className="text-white/50 text-sm">Date: {submission.date}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 