'use client'

import { useState, useEffect, useRef } from 'react'
import { FaBell } from 'react-icons/fa'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  sender: {
    name: string
  }
  investigation?: {
    title: string
  }
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUnreadNotifications()
    const interval = setInterval(fetchUnreadNotifications, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?unreadOnly=true')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      setNotifications(data)
      setUnreadCount(data.length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
      })
      if (!response.ok) throw new Error('Failed to mark notification as read')
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'INVESTIGATION_CREATED':
      case 'INVESTIGATION_STATUS_CHANGED':
      case 'COMMENT_ADDED':
        return `/dashboard/investigations`
      case 'PROFILE_UPDATED':
        return `/dashboard/profile`
      default:
        return '#'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            <div className="px-4 py-2 text-sm text-gray-700 border-b">
              <span className="font-medium">Notifications</span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Aucune notification
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Link
                      href={getNotificationLink(notification)}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                      className="block"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <div className="mt-1 flex justify-between items-center text-xs text-gray-500">
                        <span>{notification.sender.name}</span>
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <Link
                href="/dashboard/notifications"
                className="block px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50 text-center border-t"
              >
                Voir toutes les notifications
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
