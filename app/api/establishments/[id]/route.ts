import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/app/lib/auth'

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

    const establishment = await prisma.establishment.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!establishment) {
      return NextResponse.json(
        { error: 'Establishment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(establishment)
  } catch (error) {
    console.error('Error fetching establishment:', error)
    return NextResponse.json(
      { error: 'Error fetching establishment' },
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const establishment = await prisma.establishment.update({
      where: {
        id: params.id,
      },
      data,
    })

    return NextResponse.json(establishment)
  } catch (error) {
    console.error('Error updating establishment:', error)
    return NextResponse.json(
      { error: 'Error updating establishment' },
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

    await prisma.establishment.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting establishment:', error)
    return NextResponse.json(
      { error: 'Error deleting establishment' },
      { status: 500 }
    )
  }
}
