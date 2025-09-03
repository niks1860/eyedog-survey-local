'use client'

import type { Survey } from '@/payload-types'
import RichText from '@/components/RichText'

interface SurveyInstructionsProps {
  survey: Survey
  onStart: () => void
  isLoading: boolean
}

// Helper function to extract text from Lexical editor content
function extractTextFromLexical(content: any): string {
  if (!content || !content.root || !content.root.children) {
    return ''
  }

  const extractTextFromNode = (node: any): string => {
    if (node.type === 'text') {
      return node.text || ''
    }

    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractTextFromNode).join('')
    }

    return ''
  }

  return content.root.children.map(extractTextFromNode).join('')
}

export function SurveyInstructions({ survey, onStart, isLoading }: SurveyInstructionsProps) {
  const descriptionText = extractTextFromLexical(survey.description)
  const instructionsText = extractTextFromLexical(survey.instructions)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Survey Instructions</h2>
      </div>

      {/* Survey Description */}
      {survey.description && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">About This Survey</h3>
          <div className="prose prose-blue max-w-none">
            {descriptionText ? (
              <p className="text-blue-800">{descriptionText}</p>
            ) : (
              <RichText data={survey.description as any} />
            )}
          </div>
        </div>
      )}

      {/* Survey Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
        <div className="prose prose-gray max-w-none">
          {instructionsText ? (
            <p className="text-gray-700">{instructionsText}</p>
          ) : survey.instructions ? (
            <RichText data={survey.instructions as any} />
          ) : (
            <div className="text-gray-600">
              <p>Please follow the on-screen instructions for each question.</p>
              <ul className="mt-4 space-y-2">
                <li>• Read each question carefully before responding</li>
                <li>• Take your time to make your selection</li>
                <li>• You can change your answer before clicking &quot;Next&quot;</li>
                <li>• The survey will automatically save your progress</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Important:</p>
            <p>
              Please read all instructions carefully before starting. You can pause and resume this
              survey at any time using the same link.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-6">
        <button
          onClick={onStart}
          disabled={isLoading}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Starting...' : 'Start Survey'}
        </button>
      </div>
    </div>
  )
}
