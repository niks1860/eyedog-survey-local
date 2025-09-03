'use client'
import React, { useCallback, useState, useEffect } from 'react'
import { UIFieldClientProps } from 'payload'
import { useField, Button } from '@payloadcms/ui'
import './CopyLinkComponent.scss'

type CopyLinkComponentProps = {
  surveyFieldPath?: string
  tokenFieldPath?: string
} & UIFieldClientProps

export const CopyLinkComponent: React.FC<CopyLinkComponentProps> = ({
  surveyFieldPath = 'currentSurvey',
  tokenFieldPath = 'uniqueLinkToken',
}) => {
  const { value: token } = useField<string>({ path: tokenFieldPath })
  const { value: surveyId } = useField<string>({ path: surveyFieldPath })

  const [surveySlug, setSurveySlug] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState(false)

  // Fetch survey data when survey ID changes
  useEffect(() => {
    const fetchSurveySlug = async () => {
      if (surveyId) {
        try {
          const response = await fetch(`/api/surveys/${surveyId}`)
          if (response.ok) {
            const survey = await response.json()
            setSurveySlug(survey.slug || 'survey')
          }
        } catch (error) {
          console.error('Failed to fetch survey:', error)
          setSurveySlug('survey')
        }
      } else {
        setSurveySlug('survey')
      }
    }

    fetchSurveySlug()
  }, [surveyId])

  const handleCopyLink = useCallback(
    async (e: React.MouseEvent<Element>) => {
      e.preventDefault()

      if (!token) {
        alert('No token available to copy')
        return
      }

      if (!surveySlug) {
        alert('No survey slug available to copy')
        return
      }

      // Build the survey URL using the fetched slug
      const baseUrl = window.location.origin
      const surveyUrl = `${baseUrl}/survey/${surveySlug}?token=${token}`

      try {
        await navigator.clipboard.writeText(surveyUrl)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (_err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = surveyUrl
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        } catch (_fallbackErr) {
          alert('Failed to copy link. Please copy manually: ' + surveyUrl)
        }
        document.body.removeChild(textArea)
      }
    },
    [token, surveySlug],
  )

  return (
    <div className="field-type copy-link-field-component">
      <label htmlFor={'copy-link-button'} className="field-label">
        &nbsp;
      </label>
      <Button
        id={'copy-link-button'}
        className="copy-link-button"
        buttonStyle="secondary"
        onClick={handleCopyLink}
        disabled={!token || !surveyId || !surveySlug}
      >
        {copySuccess ? 'Copied!' : 'Copy Link'}
      </Button>
    </div>
  )
}
