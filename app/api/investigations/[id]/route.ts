import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth.config'
import { createStatusChangeNotification } from '@/app/lib/notifications'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const investigation = await prisma.investigation.findUnique({
      where: {
        id: params.id,
      },
      include: {
        requestedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        respondedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        establishment: {
          select: {
            name: true,
            commune: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!investigation) {
      return NextResponse.json(
        { error: 'Investigation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(investigation)
  } catch (error) {
    console.error('Error fetching investigation:', error)
    return NextResponse.json(
      { error: 'Error fetching investigation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Update the investigation
    const investigation = await prisma.investigation.update({
      where: {
        id: params.id,
      },
      data: {
        ...data,
        respondedById: session.user.id,
      },
      include: {
        requestedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        respondedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        establishment: {
          select: {
            name: true,
            commune: true,
          },
        },
      },
    })

    // If status is being updated, create a notification
    if (data.status) {
      const statusMessages = {
        PENDING: 'en attente',
        IN_PROGRESS: 'en cours',
        COMPLETED: 'terminée',
        REJECTED: 'rejetée',
      }

      await createStatusChangeNotification(
        params.id,
        'Statut de l\'investigation mis à jour',
        `L'investigation est maintenant ${statusMessages[data.status]}`,
        data.requestedById, // Send to the investigation requester
        session.user.id,
        data.title
      )
    }

    return NextResponse.json(investigation)
  } catch (error) {
    console.error('Error updating investigation:', error)
    return NextResponse.json(
      { error: 'Error updating investigation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.investigation.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting investigation:', error)
    return NextResponse.json(
      { error: 'Error deleting investigation' },
      { status: 500 }
    )
  }
}
