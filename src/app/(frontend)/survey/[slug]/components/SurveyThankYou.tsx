'use client'

import type { Survey, Participant } from '@/payload-types'
import RichText from '@/components/RichText'

interface SurveyThankYouProps {
  survey: Survey
  participant: Participant
}

export function SurveyThankYou({ survey, participant }: SurveyThankYouProps) {
  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900">Thank You!</h2>

      <div className="prose prose-gray max-w-none">
        <RichText data={survey.thankYouMessage} />
      </div>

      <div className="pt-6">
        <p className="text-sm text-gray-500">Your responses have been recorded successfully.</p>
        {participant.totalTimeMs && (
          <p className="text-sm text-gray-500 mt-1">
            Total time: {Math.round(participant.totalTimeMs / 1000 / 60)} minutes
          </p>
        )}
      </div>
    </div>
  )
}
