import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { createCommentNotification } from '@/app/lib/notifications'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        ...data,
        userId: session.user.id,
        investigationId: params.id,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    // Get the investigation details to determine who should receive the notification
    const investigation = await getInvestigation(params.id)
    if (!investigation) {
      return NextResponse.json({ error: 'Investigation not found' }, { status: 404 })
    }

    // Send notification to the other party (if admin comments, send to requester and vice versa)
    const receiverId = session.user.id === investigation.requestedById
      ? investigation.respondedById
      : investigation.requestedById

    if (receiverId && investigation.title) {
      await createCommentNotification(
        params.id,
        comment.id, // comment ID
        'Nouveau commentaire',
        'Un nouveau commentaire a été ajouté à l\'investigation',
        receiverId,
        session.user.id,
        investigation.title
      )
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Error creating comment' },
      { status: 500 }
    )
  }
}

// Helper function to get investigation details
async function getInvestigation(id: string) {
  try {
    const investigation = await prisma.investigation.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        requestedById: true,
        respondedById: true,
      },
    })
    return investigation
  } catch (error) {
    console.error('Error fetching investigation:', error)
    return null
  }
}
