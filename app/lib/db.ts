import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialize notifications file if it doesn't exist
if (!fs.existsSync(NOTIFICATIONS_FILE)) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify({ notifications: [] }))
}

export interface Notification {
  id: string
  type: 'INVESTIGATION_CREATED' | 'INVESTIGATION_STATUS_CHANGED' | 'COMMENT_ADDED' | 'PROFILE_UPDATED'
  title: string
  message: string
  isRead: boolean
  receiverId: string
  senderId: string
  investigationId?: string
  commentId?: string
  createdAt: string
  sender: {
    name: string
  }
  investigation?: {
    title: string
  }
}

export interface NotificationsData {
  notifications: Notification[]
}

export function getNotifications(): NotificationsData {
  const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8')
  return JSON.parse(data)
}

export function saveNotifications(data: NotificationsData) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(data, null, 2))
}

export function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
  const data = getNotifications()
  const newNotification: Notification = {
    ...notification,
    id: Math.random().toString(36).substring(2) + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  }
  data.notifications.unshift(newNotification)
  saveNotifications(data)
  return newNotification
}

export function markNotificationAsRead(notificationId: string, userId: string) {
  const data = getNotifications()
  const notification = data.notifications.find(
    n => n.id === notificationId && n.receiverId === userId
  )
  if (notification) {
    notification.isRead = true
    saveNotifications(data)
    return notification
  }
  return null
}

export function getUserNotifications(userId: string, page = 1, limit = 10) {
  const data = getNotifications()
  const userNotifications = data.notifications.filter(n => n.receiverId === userId)
  const start = (page - 1) * limit
  const end = start + limit
  
  return {
    notifications: userNotifications.slice(start, end),
    total: userNotifications.length,
    hasMore: end < userNotifications.length
  }
}

export function getUnreadNotifications(userId: string) {
  const data = getNotifications()
  return data.notifications.filter(n => n.receiverId === userId && !n.isRead)
}
