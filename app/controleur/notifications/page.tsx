"use client";

import { useState } from 'react';
import { FaBell, FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import PageLayout from '@/app/components/PageLayout';

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  date: string;
  read: boolean;
  recent?: string;
}

export default function NotificationsControleurPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'info',
      title: 'Nouvelle investigation assignée',
      message: 'Une nouvelle investigation a été assignée au Centre Social Al Fath.',
      date: '2024-03-20 10:30',
      read: false,
      recent: 'Dernière mise à jour: 2024-03-20'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Investigation en attente',
      message: 'L\'investigation de la Maison des Jeunes Al Qods est en attente de validation.',
      date: '2024-03-19 15:45',
      read: true,
      recent: 'Dernière mise à jour: 2024-03-19'
    },
    {
      id: 3,
      type: 'success',
      title: 'Investigation terminée',
      message: 'L\'investigation du Complexe Sportif Al Amal a été terminée avec succès.',
      date: '2024-03-18 09:15',
      read: true,
      recent: 'Dernière mise à jour: 2024-03-18'
    }
  ]);

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'info':
        return <FaInfoCircle className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <FaCheck className="w-5 h-5 text-green-500" />;
      default:
        return <FaBell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <PageLayout title="Notifications">
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-xl shadow-sm p-6 border ${
              notification.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
            } hover:border-gray-300 transition-colors cursor-pointer`}
            onClick={() => setSelectedNotification(notification)}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {notification.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {notification.date}
                  </span>
                </div>
                <p className="text-gray-600">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Marquer comme lu
                </button>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">Aucune notification</p>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {getNotificationIcon(selectedNotification.type)}
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedNotification.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">{selectedNotification.message}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Date: {selectedNotification.date}</span>
                {selectedNotification.recent && (
                  <span>{selectedNotification.recent}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
} 