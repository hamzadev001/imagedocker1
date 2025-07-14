import { NextResponse } from 'next/server'
import { auth } from '@/auth.config'
import {
  createInvestigationNotification,
  createStatusChangeNotification,
  createCommentNotification,
} from '@/app/lib/notifications'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create some test notifications
    const notifications = []

    // Test investigation notification
    notifications.push(
      await createInvestigationNotification(
        'test-investigation-1',
        'Nouvelle investigation test',
        'Une nouvelle investigation test a été créée',
        session.user.id,
        'test-sender-id',
        'Investigation Test 1'
      )
    )

    // Test status change notification
    notifications.push(
      await createStatusChangeNotification(
        'test-investigation-1',
        'Statut mis à jour',
        'L\'investigation est maintenant en cours',
        session.user.id,
        'test-sender-id',
        'Investigation Test 1'
      )
    )

    // Test comment notification
    notifications.push(
      await createCommentNotification(
        'test-investigation-1',
        'test-comment-1',
        'Nouveau commentaire',
        'Un nouveau commentaire a été ajouté',
        session.user.id,
        'test-sender-id',
        'Investigation Test 1'
      )
    )

    return NextResponse.json({
      message: 'Test notifications created successfully',
      notifications,
    })
  } catch (error) {
    console.error('Error creating test notifications:', error)
    return NextResponse.json(
      { error: 'Error creating test notifications' },
      { status: 500 }
    )
  }
}
