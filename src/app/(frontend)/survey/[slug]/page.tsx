import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SurveyPage } from '@/app/(frontend)/survey/[slug]/SurveyPage'

interface SurveySlugPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    token?: string
  }>
}

export default async function SurveySlugPage({ params, searchParams }: SurveySlugPageProps) {
  const { slug } = await params
  const { token } = await searchParams

  if (!slug || !token) {
    notFound()
  }

  const payload = await getPayload({ config })

  try {
    // Find survey by slug
    const surveys = await payload.find({
      collection: 'surveys',
      where: {
        slug: {
          equals: slug,
        },
        status: {
          equals: 'published',
        },
      },
      limit: 1,
    })

    if (surveys.docs.length === 0) {
      notFound()
    }

    const survey = surveys.docs[0]

    // Find participant by uniqueLinkToken
    const participants = await payload.find({
      collection: 'participants',
      where: {
        uniqueLinkToken: {
          equals: token,
        },
        currentSurvey: {
          equals: survey.id,
        },
      },
      limit: 1,
    })

    if (participants.docs.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Access</h1>
            <p className="text-gray-600">
              This survey link is invalid or you don&apos;t have access to this survey. Please
              contact the survey administrator.
            </p>
          </div>
        </div>
      )
    }

    const participant = participants.docs[0]

    return <SurveyPage participant={participant} survey={survey} token={token} />
  } catch (error) {
    console.error('Error loading survey:', error)
    notFound()
  }
}

export async function generateMetadata({
  params,
  searchParams: _searchParams,
}: SurveySlugPageProps) {
  const { slug } = await params

  try {
    const payload = await getPayload({ config })

    const surveys = await payload.find({
      collection: 'surveys',
      where: {
        slug: {
          equals: slug,
        },
        status: {
          equals: 'published',
        },
      },
      limit: 1,
    })

    if (surveys.docs.length > 0) {
      const survey = surveys.docs[0]
      return {
        title: survey.title,
        description: 'Participate in our wayfinding reaction time survey',
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: 'Survey',
    description: 'Participate in our wayfinding reaction time survey',
  }
}
