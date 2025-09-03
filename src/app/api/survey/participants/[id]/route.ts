import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const payload = await getPayload({ config })

    const participant = await payload.update({
      collection: 'participants',
      id: parseInt(id),
      data: body,
    })

    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error updating participant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

