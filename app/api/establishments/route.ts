import { NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const establishments = await prisma.establishment.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(establishments)
  } catch (error) {
    console.error('Error fetching establishments:', error)
    return NextResponse.json(
      { error: 'Error fetching establishments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const establishment = await prisma.establishment.create({
      data,
    })

    return NextResponse.json(establishment)
  } catch (error) {
    console.error('Error creating establishment:', error)
    return NextResponse.json(
      { error: 'Error creating establishment' },
      { status: 500 }
    )
  }
}
