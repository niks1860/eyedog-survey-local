import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { responses, completedAt } = await request.json()
    const payload = await getPayload({ config })

    // Get participant to find their current survey
    const participant = await payload.findByID({
      collection: 'participants',
      id: parseInt(id),
    })

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    // Update participant status to completed
    await payload.update({
      collection: 'participants',
      id: parseInt(id),
      data: {
        status: 'completed',
        completedAt: completedAt,
      },
    })

    // Create response records for each question
    const responsePromises = Object.entries(responses).map(([questionId, responseData]) => {
      const data = responseData as {
        questionDisplayedAt: number
        initialSelectionTimeMs?: number | null
        finalSelectionTimeMs: number
        selectedOptionId?: string
        reselectionEvents?: Array<{ timestampMs: number; selectedOptionId: string }>
        formData?: Record<string, unknown>
        clientTimestamp: string
      }
      return payload.create({
        collection: 'responses',
        data: {
          participant: participant.id,
          survey: participant.currentSurvey || participant.id,
          question: parseInt(questionId),
          questionDisplayedAt: new Date(data.questionDisplayedAt).toISOString(),
          initialSelectionTimeMs: data.initialSelectionTimeMs,
          finalSelectionTimeMs: data.finalSelectionTimeMs,
          selectedOptionId: data.selectedOptionId,
          reselectionEvents: data.reselectionEvents,
          formData: data.formData,
          clientTimestamp: new Date(data.clientTimestamp).toISOString(),
          serverTimestamp: new Date().toISOString(),
        },
      })
    })

    await Promise.all(responsePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing survey:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
