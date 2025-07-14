import { NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth'
import { markNotificationAsRead } from '@/app/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedNotification = markNotificationAsRead(params.id, session.user.id)
    
    if (!updatedNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Error updating notification' },
      { status: 500 }
    )
  }
}
