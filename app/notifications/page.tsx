"use client";

import { FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";
import PageLayout from "@/app/components/PageLayout";
import Link from "next/link";

export default function NotificationsPage() {
  return (
    <PageLayout title="Notifications">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Urgent Card */}
        <Link href="/notifications/PhaseListPage" className="group">
          <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-600 rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
            <div className="absolute top-4 right-4">
              <div className="bg-white text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                5
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <FaExclamationTriangle className="text-white text-4xl mb-4" />
              <h3 className="text-white text-xl font-bold">Urgent</h3>
              <p className="text-white/80 text-sm mt-2">Urgent items pending!</p>
            </div>
          </div>
        </Link>

        {/* Pending Review Card */}
        <Link href="/notifications/PhaseListPagee" className="group">
          <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-600 rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
            <div className="absolute top-4 right-4">
              <div className="bg-white text-orange-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                3
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <FaClock className="text-white text-4xl mb-4" />
              <h3 className="text-white text-xl font-bold">Pending Review</h3>
              <p className="text-white/80 text-sm mt-2">Pending reviews available</p>
            </div>
          </div>
        </Link>

        {/* Reviewed Card */}
        <Link href="/notifications/PhaseListPageee" className="group">
          <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-600 rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
            <div className="absolute top-4 right-4">
              <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                8
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <FaCheckCircle className="text-white text-4xl mb-4" />
              <h3 className="text-white text-xl font-bold">Reviewed</h3>
              <p className="text-white/80 text-sm mt-2">Recently reviewed items</p>
            </div>
          </div>
        </Link>
      </div>
    </PageLayout>
  );
}
