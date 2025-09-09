import { randomUUID } from 'node:crypto'
import { Media } from '@/payload-types'
import type { Payload } from 'payload'

interface Data {
  images: Media[]
}

// Simple survey seed data that works with Payload CMS
export const createSurveySeedData = async (payload: Payload, { images }: Data) => {
  try {
    // Create first survey
    const survey1 = await payload.create({
      collection: 'surveys',
      data: {
        title: 'Wayfinding Study Q3 2025',
        description: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'A comprehensive study on wayfinding preferences and reaction times in museum environments.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        slug: 'wayfinding-study-q3-2025',
        instructions: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Welcome to our wayfinding study! You will be presented with various navigation scenarios. Please respond as quickly and accurately as possible.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        thankYouMessage: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Thank you for participating in our wayfinding study! Your responses will help us improve navigation systems.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        defaultCountdownSeconds: 3,
        status: 'published',
      },
    })

    console.log(`Created survey: ${survey1.title}`)

    // Create second survey
    const survey2 = await payload.create({
      collection: 'surveys',
      data: {
        title: 'User Experience Study - Mobile App',
        description: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'A study focused on mobile app user experience and interface design preferences.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        slug: 'ux-study-mobile-app',
        instructions: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Welcome to our mobile app UX study! You will be shown different interface designs. Please select the option that feels most intuitive to you.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        thankYouMessage: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Thank you for participating in our UX study! Your feedback will help us create better mobile experiences.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        defaultCountdownSeconds: 5,
        status: 'published',
      },
    })

    console.log(`Created survey: ${survey2.title}`)

    // Create questions for first survey (Wayfinding)
    const questions1 = []
    for (let i = 1; i <= 3; i++) {
      const question = await payload.create({
        collection: 'questions',
        data: {
          title: `Q${i} - Wayfinding Scenario ${i}`,
          type: '4_image',
          order: i,
          countdownSeconds: 3,
          images: images.slice(0, 4).map((image, i) => ({
            id: `${image.id}-${randomUUID()}`,
            image: image.id,
            label: `Option ${i + 1}`,
          })),
        },
      })
      questions1.push(question)
      console.log(`Created question: ${question.title}`)
    }

    // Create questions for second survey (UX Mobile App)
    const questions2 = []
    for (let i = 1; i <= 2; i++) {
      const question = await payload.create({
        collection: 'questions',
        data: {
          title: `Q${i} - Mobile Interface ${i}`,
          type: '4_image',
          order: i,
          countdownSeconds: 5,
          images: images.slice(0, 4).map((image, i) => ({
            id: `${image.id}-${randomUUID()}`,
            image: image.id,
            label: `Option ${i + 1}`,
          })),
        },
      })
      questions2.push(question)
      console.log(`Created question: ${question.title}`)
    }

    // Update surveys with their questions
    await payload.update({
      collection: 'surveys',
      id: survey1.id,
      data: {
        questions: questions1.map((q) => q.id),
      },
    })

    await payload.update({
      collection: 'surveys',
      id: survey2.id,
      data: {
        questions: questions2.map((q) => q.id),
      },
    })

    console.log(`Updated surveys with questions`)

    // Create participants
    const participants = []
    for (let i = 1; i <= 3; i++) {
      const participant = await payload.create({
        collection: 'participants',
        data: {
          participantId: `P00${i}`,
          uniqueLinkToken: `token_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 8)}`,
          currentSurvey: survey1.id,
          status: i === 1 ? 'completed' : i === 2 ? 'in_progress' : 'new',
          metadata: {
            age: 25 + i * 7,
            gender: i === 1 ? 'female' : i === 2 ? 'male' : 'other',
            group: i % 2 === 0 ? 'experimental' : 'control',
            experience:
              i === 1 ? 'frequent_visitor' : i === 2 ? 'occasional_visitor' : 'first_time_visitor',
          },
        },
      })
      participants.push(participant)
      console.log(`Created participant: ${participant.participantId}`)
    }

    console.log(`Created ${participants.length} participants`)
    return {
      surveys: [survey1, survey2],
      questions: [...questions1, ...questions2],
      participants,
    }
  } catch (error) {
    console.error('Error creating survey seed data:', error)
    throw error
  }
}
