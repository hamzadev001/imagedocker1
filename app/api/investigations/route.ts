import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { createInvestigationNotification } from '@/app/lib/notifications'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const investigations = await prisma.investigation.findMany({
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
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(investigations)
  } catch (error) {
    console.error('Error fetching investigations:', error)
    return NextResponse.json(
      { error: 'Error fetching investigations' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Create the investigation
    const investigation = await prisma.investigation.create({
      data: {
        ...data,
        status: 'PENDING',
        requestedById: session.user.id,
      },
      include: {
        requestedBy: {
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

    // Create notification for admin users
    await createInvestigationNotification(
      investigation.id, // investigation ID
      'Nouvelle demande d\'investigation',
      `Une nouvelle demande d'investigation a été créée pour l'établissement ${investigation.establishment.name}`,
      'admin-user-id', // You'll need to get the admin user ID
      session.user.id,
      investigation.title
    )

    return NextResponse.json(investigation)
  } catch (error) {
    console.error('Error creating investigation:', error)
    return NextResponse.json(
      { error: 'Error creating investigation' },
      { status: 500 }
    )
  }
}
