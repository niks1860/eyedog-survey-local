'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@payloadcms/ui'

type CopyLinkCellProps = {
  rowData?: {
    uniqueLinkToken?: string
    currentSurvey?:
      | {
          slug?: string
        }
      | string
  }
  field?: Record<string, unknown>
  path?: string
  permissions?: boolean
  readOnly?: boolean
  schemaPath?: string
}

export const CopyLinkCell: React.FC<CopyLinkCellProps> = (props) => {
  const [copySuccess, setCopySuccess] = useState(false)
  const [surveySlug, setSurveySlug] = useState<string>('survey')

  // Extract data from props - could be rowData for table cells or other props for form fields
  const { rowData, ..._otherProps } = props

  let uniqueLinkToken: string | undefined
  let currentSurveyId: string | number | undefined

  if (rowData) {
    // This is a table cell
    uniqueLinkToken = rowData.uniqueLinkToken

    // Handle currentSurvey - it could be an ID (string/number) or an object with slug
    if (typeof rowData.currentSurvey === 'string' || typeof rowData.currentSurvey === 'number') {
      currentSurveyId = rowData.currentSurvey
    } else if (
      rowData.currentSurvey &&
      typeof rowData.currentSurvey === 'object' &&
      'slug' in rowData.currentSurvey
    ) {
      // If it's already an object with slug, we don't need to fetch
      setSurveySlug(rowData.currentSurvey.slug || 'survey')
    }
  }

  // Fetch survey slug when currentSurveyId changes
  useEffect(() => {
    const fetchSurveySlug = async () => {
      if (currentSurveyId && (typeof currentSurveyId === 'string' || typeof currentSurveyId === 'number')) {
        try {
          const response = await fetch(`/api/surveys/${currentSurveyId}`)
          if (response.ok) {
            const survey = await response.json()
            setSurveySlug(survey.slug || 'survey')
          } else {
            setSurveySlug('survey')
          }
        } catch (_error) {
          console.error('Failed to fetch survey:', _error)
          setSurveySlug('survey')
        }
      } else {
        setSurveySlug('survey')
      }
    }

    // Only fetch if we're in the browser
    if (typeof window !== 'undefined') {
      fetchSurveySlug()
    }
  }, [currentSurveyId])

  const handleCopyLink = useCallback(async () => {
    if (!uniqueLinkToken) {
      alert('No token available to copy')
      return
    }

    // Build the survey URL using the fetched slug
    const baseUrl = window.location.origin
    const surveyUrl = `${baseUrl}/survey/${surveySlug}?token=${uniqueLinkToken}`

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
  }, [uniqueLinkToken, surveySlug])

  // Early returns after all hooks
  if (!rowData) {
    // This might be a form field or other context
    return <span style={{ color: '#999', fontSize: '12px' }}>No row data</span>
  }

  if (!uniqueLinkToken) {
    return <span style={{ color: '#999', fontSize: '12px' }}>No token</span>
  }

  // Show loading state during server-side rendering or when fetching survey data
  if (typeof window === 'undefined' || (currentSurveyId && surveySlug === 'survey')) {
    return <span style={{ color: '#999', fontSize: '12px' }}>Loading...</span>
  }

  return (
    <Button
      onClick={handleCopyLink}
      buttonStyle="secondary"
      size="small"
      disabled={!uniqueLinkToken}
    >
      {copySuccess ? 'Copied!' : 'Copy Link'}
    </Button>
  )
}
