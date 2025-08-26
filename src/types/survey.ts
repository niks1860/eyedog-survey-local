// Survey-related type definitions
// This file exports all the types used in the survey collections

// Question types
export const QUESTION_TYPES = {
  FOUR_IMAGE: '4_image',
  FORM: 'form',
} as const

export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES]

// Form element types
export const FORM_ELEMENT_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  EMAIL: 'email',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
} as const

export type FormElementType = (typeof FORM_ELEMENT_TYPES)[keyof typeof FORM_ELEMENT_TYPES]

// Survey status types
export const SURVEY_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export type SurveyStatus = (typeof SURVEY_STATUS)[keyof typeof SURVEY_STATUS]

// Participant status types
export const PARTICIPANT_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const

export type ParticipantStatus = (typeof PARTICIPANT_STATUS)[keyof typeof PARTICIPANT_STATUS]

// Form element validation types
export interface FormElementValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
}

// Form element option types
export interface FormElementOption {
  label: string
  value: string
}

// Form element types
export interface FormElement {
  type: FormElementType
  name: string
  label: string
  placeholder?: string
  defaultValue?: string
  required: boolean
  options?: FormElementOption[]
  validation?: FormElementValidation
}

// Image option types
export interface ImageOption {
  id: string
  image: string // Media ID
  label?: string
}

// Rich text type for Payload CMS
export interface RichTextContent {
  [key: string]: unknown
}

// Question types
export interface Question {
  title: string
  type: QuestionType
  order: number
  overrideInstructions?: RichTextContent // Rich text
  countdownSeconds?: number
  images?: ImageOption[] // For 4_image type
  formElements?: FormElement[] // For form type
}

// Survey types
export interface Survey {
  title: string
  description?: RichTextContent // Rich text
  slug: string
  instructions: RichTextContent // Rich text
  thankYouMessage: RichTextContent // Rich text
  defaultCountdownSeconds: number
  questions: string[] // Question IDs
  status: SurveyStatus
}

// Participant types
export interface Participant {
  participantId: string
  uniqueLinkToken: string
  currentSurvey?: string // Survey ID
  lastCompletedQuestion?: string // Question ID
  status: ParticipantStatus
  metadata?: Record<string, unknown>
  startedAt?: Date
  completedAt?: Date
  totalTimeMs?: number
}

// Response types
export interface Response {
  participant: string // Participant ID
  survey: string // Survey ID
  question: string // Question ID
  questionDisplayedAt: Date
  initialSelectionTimeMs?: number
  finalSelectionTimeMs: number
  selectedOptionId?: string
  reselectionEvents?: Array<{
    timestampMs: number
    selectedOptionId: string
  }>
  formData?: Record<string, unknown>
  clientTimestamp?: Date
  serverTimestamp: Date
  responseQuality?: {
    isValid: boolean
    qualityScore?: number
    qualityNotes?: string
  }
}
