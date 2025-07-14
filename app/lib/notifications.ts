import { addNotification } from './db'

export async function createInvestigationNotification(
  investigationId: string,
  title: string,
  message: string,
  receiverId: string,
  senderId: string,
  investigationTitle: string
) {
  return addNotification({
    type: 'INVESTIGATION_CREATED',
    title,
    message,
    receiverId,
    senderId,
    investigationId,
    isRead: false,
    sender: {
      name: 'System', // You can update this with actual sender name
    },
    investigation: {
      title: investigationTitle,
    },
  })
}

export async function createStatusChangeNotification(
  investigationId: string,
  title: string,
  message: string,
  receiverId: string,
  senderId: string,
  investigationTitle: string
) {
  return addNotification({
    type: 'INVESTIGATION_STATUS_CHANGED',
    title,
    message,
    receiverId,
    senderId,
    investigationId,
    isRead: false,
    sender: {
      name: 'System', // You can update this with actual sender name
    },
    investigation: {
      title: investigationTitle,
    },
  })
}

export async function createCommentNotification(
  investigationId: string,
  commentId: string,
  title: string,
  message: string,
  receiverId: string,
  senderId: string,
  investigationTitle: string
) {
  return addNotification({
    type: 'COMMENT_ADDED',
    title,
    message,
    receiverId,
    senderId,
    investigationId,
    commentId,
    isRead: false,
    sender: {
      name: 'System', // You can update this with actual sender name
    },
    investigation: {
      title: investigationTitle,
    },
  })
}

export async function createProfileUpdateNotification(
  title: string,
  message: string,
  receiverId: string,
  senderId: string
) {
  return addNotification({
    type: 'PROFILE_UPDATED',
    title,
    message,
    receiverId,
    senderId,
    isRead: false,
    sender: {
      name: 'System', // You can update this with actual sender name
    },
  })
}
