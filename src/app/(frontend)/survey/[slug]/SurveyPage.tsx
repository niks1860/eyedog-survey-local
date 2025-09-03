'use client'

import { useState, useEffect } from 'react'
import type { Participant, Survey } from '@/payload-types'

interface QuestionResponse {
  questionDisplayedAt: number
  initialSelectionTimeMs: number | null
  finalSelectionTimeMs: number
  selectedOptionId: string
  reselectionEvents?: Array<{
    timestampMs: number
    selectedOptionId: string
  }>
  formData?: Record<string, unknown>
  clientTimestamp: string
}
import { SurveyInstructions } from './components/SurveyInstructions'
import { SurveyQuestion } from './components/SurveyQuestion'
import { SurveyThankYou } from './components/SurveyThankYou'
import { SurveyProgress } from './components/SurveyProgress'

interface SurveyPageProps {
  participant: Participant
  survey: Survey
  token: string
}

export function SurveyPage({ participant, survey, token: _token }: SurveyPageProps) {
  const [currentStep, setCurrentStep] = useState<'instructions' | 'question' | 'thankyou'>(
    'instructions',
  )
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine starting point based on participant status
  useEffect(() => {
    if (participant.status === 'completed') {
      setCurrentStep('thankyou')
    } else if (participant.status === 'in_progress' && participant.lastCompletedQuestion) {
      // Find the index of the last completed question
      const lastCompletedIndex =
        survey.questions?.findIndex(
          (q) =>
            (typeof q === 'number' ? q : q.id) ===
            (typeof participant.lastCompletedQuestion === 'number'
              ? participant.lastCompletedQuestion
              : participant.lastCompletedQuestion?.id),
        ) ?? -1
      if (lastCompletedIndex >= 0) {
        setCurrentQuestionIndex(lastCompletedIndex + 1)
        setCurrentStep('question')
      } else {
        setCurrentStep('instructions')
      }
    } else {
      setCurrentStep('instructions')
    }
  }, [participant, survey])

  const handleStartSurvey = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Update participant status to in_progress and set startedAt
      const response = await fetch(`/api/survey/participants/${participant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'in_progress',
          startedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start survey')
      }

      setCurrentStep('question')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start survey')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestionResponse = async (
    questionId: number | string,
    response: QuestionResponse,
  ) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: response,
    }))

    // Move to next question or complete survey
    const nextIndex = currentQuestionIndex + 1
    if (nextIndex >= (survey.questions?.length ?? 0)) {
      await handleCompleteSurvey()
    } else {
      setCurrentQuestionIndex(nextIndex)
    }
  }

  const handleCompleteSurvey = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Submit all responses
      const response = await fetch(`/api/survey/participants/${participant.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses,
          completedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete survey')
      }

      setCurrentStep('thankyou')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete survey')
    } finally {
      setIsLoading(false)
    }
  }

  const currentQuestion = survey.questions?.[currentQuestionIndex]

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Survey Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
            {currentStep === 'question' && (
              <SurveyProgress
                current={currentQuestionIndex + 1}
                total={survey.questions?.length ?? 0}
              />
            )}
          </div>

          {/* Survey Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {currentStep === 'instructions' && (
              <SurveyInstructions
                survey={survey}
                onStart={handleStartSurvey}
                isLoading={isLoading}
              />
            )}

            {currentStep === 'question' && currentQuestion && (
              <SurveyQuestion
                questionId={
                  typeof currentQuestion === 'number' ? currentQuestion : currentQuestion.id
                }
                survey={survey}
                participant={participant}
                onResponse={handleQuestionResponse}
                isLoading={isLoading}
              />
            )}

            {currentStep === 'thankyou' && (
              <SurveyThankYou survey={survey} participant={participant} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
