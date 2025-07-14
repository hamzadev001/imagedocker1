'use client'

import { useState, useEffect } from 'react'
import { FaBell, FaSpinner } from 'react-icons/fa'
import NotificationDropdown from '@/app/components/NotificationDropdown'
import Sidebar from '@/app/components/Sidebar'

export default function TestNotificationsPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const createTestNotifications = async () => {
    try {
      setLoading(true)
      setMessage('')

      const response = await fetch('/api/test-notifications', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create test notifications')
      }

      const data = await response.json()
      setMessage('Test notifications created successfully!')
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error creating test notifications')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 py-12 ml-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">
                Test Notifications
              </h1>
              <NotificationDropdown />
            </div>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-2">
                  Create Test Notifications
                </h2>
                <p className="text-gray-600 mb-4">
                  Click the button below to create some test notifications. This will
                  create:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                  <li>A new investigation notification</li>
                  <li>A status change notification</li>
                  <li>A comment notification</li>
                </ul>
                <button
                  onClick={createTestNotifications}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    'Create Test Notifications'
                  )}
                </button>
                {message && (
                  <p
                    className={`mt-2 text-sm ${
                      message.includes('Error')
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {message}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Testing Instructions
                </h2>
                <ol className="list-decimal list-inside text-gray-600 space-y-3">
                  <li className="bg-gray-50 p-3 rounded-lg">
                    Click the &quot;Create Test Notifications&quot; button above to
                    generate test notifications
                  </li>
                  <li className="bg-gray-50 p-3 rounded-lg">
                    Check the notification bell icon in the top-right corner - it
                    should show a badge with the number of unread notifications
                  </li>
                  <li className="bg-gray-50 p-3 rounded-lg">
                    Click the bell icon to open the notification dropdown and view
                    your notifications
                  </li>
                  <li className="bg-gray-50 p-3 rounded-lg">
                    Click on a notification to mark it as read - the unread count
                    should decrease
                  </li>
                  <li className="bg-gray-50 p-3 rounded-lg">
                    Visit the{' '}
                    <a
                      href="/dashboard/notifications"
                      className="text-emerald-600 hover:text-emerald-700 underline"
                    >
                      notifications page
                    </a>{' '}
                    to view all notifications with pagination
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
