import { PrismaClient, NotificationType } from '@prisma/client'

const prisma = new PrismaClient()

export async function createNotification({
  type,
  title,
  message,
  receiverId,
  senderId,
  investigationId,
  commentId,
}: {
  type: NotificationType
  title: string
  message: string
  receiverId: string
  senderId: string
  investigationId?: string
  commentId?: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        receiverId,
        senderId,
        investigationId,
        commentId,
      },
    })
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })
    return notification
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

export async function getUnreadNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
        investigation: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return notifications
  } catch (error) {
    console.error('Error fetching unread notifications:', error)
    throw error
  }
}

export async function getNotifications(userId: string, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: {
          receiverId: userId,
        },
        include: {
          sender: {
            select: {
              name: true,
            },
          },
          investigation: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: {
          receiverId: userId,
        },
      }),
    ])

    return {
      notifications,
      total,
      hasMore: skip + limit < total,
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
}
