'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Survey, Participant, Question, Media } from '@/payload-types'
import RichText from '@/components/RichText'
import { CountdownTimer } from './CountdownTimer'

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

interface ImageOption {
  id: string
  image: number | Media
  label?: string | null
}

interface FormElement {
  name: string
  label: string
  type: string
  required?: boolean | null
  placeholder?: string | null
  options?: Array<{ value: string; label: string; id?: string | null }> | null
}

interface ImageQuestionProps {
  question: Question
  response: QuestionResponse | null
  onResponse: (response: QuestionResponse) => void
  questionDisplayedAt: number | null
  onInitialSelection: (time: number) => void
  onReselection: (event: { timestampMs: number; selectedOptionId: string }) => void
}

interface FormQuestionProps {
  question: Question
  response: QuestionResponse | null
  onResponse: (response: QuestionResponse) => void
}

interface SurveyQuestionProps {
  questionId: number | string
  survey: Survey
  participant: Participant
  onResponse: (questionId: number | string, response: QuestionResponse) => void
  isLoading: boolean
}

export function SurveyQuestion({
  questionId,
  survey,
  participant: _participant,
  onResponse,
  isLoading,
}: SurveyQuestionProps) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [showQuestion, setShowQuestion] = useState(false)
  const [response, setResponse] = useState<QuestionResponse | null>(null)
  const [questionDisplayedAt, setQuestionDisplayedAt] = useState<number | null>(null)
  const [initialSelectionTime, setInitialSelectionTime] = useState<number | null>(null)
  const [reselectionEvents, setReselectionEvents] = useState<
    Array<{
      timestampMs: number
      selectedOptionId: string
    }>
  >([])

  useEffect(() => {
    // Fetch question data
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`/api/survey/questions/${questionId}`)
        if (res.ok) {
          const questionData = await res.json()
          setQuestion(questionData)
        }
      } catch (error) {
        console.error('Failed to fetch question:', error)
      }
    }

    fetchQuestion()
  }, [questionId])

  const handleCountdownComplete = () => {
    setShowQuestion(true)
    // Use performance.now() for maximum accuracy as per spec
    setQuestionDisplayedAt(performance.now())
  }

  const handleSubmitResponse = () => {
    if (!response || !questionDisplayedAt) return

    const finalSelectionTimeMs = performance.now() - questionDisplayedAt

    onResponse(questionId, {
      ...response,
      questionDisplayedAt: questionDisplayedAt,
      initialSelectionTimeMs: initialSelectionTime || null,
      finalSelectionTimeMs: Math.round(finalSelectionTimeMs),
      reselectionEvents: reselectionEvents.length > 0 ? reselectionEvents : undefined,
      clientTimestamp: new Date().toISOString(),
    })
  }

  if (!question) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading question...</p>
      </div>
    )
  }

  const countdownSeconds = question.countdownSeconds || survey.defaultCountdownSeconds

  return (
    <div className="space-y-6">
      {!showQuestion ? (
        <CountdownTimer seconds={countdownSeconds} onComplete={handleCountdownComplete} />
      ) : (
        <>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{question.title}</h2>
            {question.overrideInstructions && (
              <div className="prose prose-gray max-w-none mb-6">
                <RichText data={question.overrideInstructions as any} />
              </div>
            )}
          </div>

          <div className="max-w-2xl mx-auto">
            {question.type === '4_image' && (
              <ImageQuestion
                question={question}
                response={response}
                onResponse={setResponse}
                questionDisplayedAt={questionDisplayedAt}
                onInitialSelection={(time: number) => setInitialSelectionTime(time)}
                onReselection={(event: { timestampMs: number; selectedOptionId: string }) =>
                  setReselectionEvents((prev) => [...prev, event])
                }
              />
            )}
            {question.type === 'form' && (
              <FormQuestion question={question} response={response} onResponse={setResponse} />
            )}
          </div>

          <div className="text-center pt-6">
            <button
              onClick={handleSubmitResponse}
              disabled={!response || isLoading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Submitting...' : 'Next Question'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Image question component with precise reaction time tracking
function ImageQuestion({
  question,
  response,
  onResponse,
  questionDisplayedAt,
  onInitialSelection,
  onReselection,
}: ImageQuestionProps) {
  const handleImageClick = (imageOption: ImageOption) => {
    if (!questionDisplayedAt) return

    const currentTime = performance.now()
    const timeFromDisplay = currentTime - questionDisplayedAt

    // Check if this is the first selection
    if (!response?.selectedOptionId) {
      // First selection - record initial selection time
      onInitialSelection(Math.round(timeFromDisplay))
    } else if (response.selectedOptionId !== imageOption.id) {
      // Re-selection - record reselection event
      onReselection({
        timestampMs: Math.round(timeFromDisplay),
        selectedOptionId: imageOption.id.toString(),
      })
    }

    onResponse({
      questionDisplayedAt: questionDisplayedAt || 0,
      initialSelectionTimeMs: null,
      finalSelectionTimeMs: 0,
      selectedOptionId: imageOption.id,
      reselectionEvents: [],
      clientTimestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {question.images?.map((imageOption: ImageOption) => {
        const media = typeof imageOption.image === 'number' ? null : imageOption.image
        const imageUrl = typeof imageOption.image === 'number' ? '' : imageOption.image?.url

        return (
          <button
            key={imageOption.id}
            onClick={() => handleImageClick(imageOption)}
            className={`p-4 border-2 rounded-lg transition-colors ${
              response?.selectedOptionId === imageOption.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden relative">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={media?.alt || `Image ${imageOption.id}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="text-gray-400">No Image</div>
              )}
            </div>
            {imageOption.label && <p className="text-sm text-gray-700">{imageOption.label}</p>}
          </button>
        )
      })}
    </div>
  )
}

function FormQuestion({ question, response, onResponse }: FormQuestionProps) {
  return (
    <div className="space-y-4">
      {question.formElements?.map((element: FormElement) => (
        <div key={element.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {element.type === 'text' && (
            <input
              type="text"
              value={String((response?.formData as Record<string, unknown>)?.[element.name] || '')}
              onChange={(e) =>
                onResponse({
                  questionDisplayedAt: response?.questionDisplayedAt || 0,
                  initialSelectionTimeMs: response?.initialSelectionTimeMs || null,
                  finalSelectionTimeMs: response?.finalSelectionTimeMs || 0,
                  selectedOptionId: response?.selectedOptionId || '',
                  reselectionEvents: response?.reselectionEvents || [],
                  clientTimestamp: response?.clientTimestamp || new Date().toISOString(),
                  formData: {
                    ...response?.formData,
                    [element.name]: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={element.placeholder || undefined}
            />
          )}
          {element.type === 'textarea' && (
            <textarea
              value={String((response?.formData as Record<string, unknown>)?.[element.name] || '')}
              onChange={(e) =>
                onResponse({
                  questionDisplayedAt: response?.questionDisplayedAt || 0,
                  initialSelectionTimeMs: response?.initialSelectionTimeMs || null,
                  finalSelectionTimeMs: response?.finalSelectionTimeMs || 0,
                  selectedOptionId: response?.selectedOptionId || '',
                  reselectionEvents: response?.reselectionEvents || [],
                  clientTimestamp: response?.clientTimestamp || new Date().toISOString(),
                  formData: {
                    ...response?.formData,
                    [element.name]: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={element.placeholder || undefined}
              rows={4}
            />
          )}
          {/* Add more form element types as needed */}
        </div>
      ))}
    </div>
  )
}
