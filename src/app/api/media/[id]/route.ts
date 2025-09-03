import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('>>>>>>>>>>>', await params)
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    const media = await payload.findByID({
      collection: 'media',
      id: parseInt(id),
    })

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
