// Utility functions for working with survey data
// Demonstrates how to use the typed constants

import {
  QUESTION_TYPES,
  FORM_ELEMENT_TYPES,
  SURVEY_STATUS,
  PARTICIPANT_STATUS,
  type QuestionType,
  type FormElementType,
  type SurveyStatus,
  type ParticipantStatus,
} from '../types'

/**
 * Check if a question is an image selection question
 */
export function isImageQuestion(questionType: QuestionType): boolean {
  return questionType === QUESTION_TYPES.FOUR_IMAGE
}

/**
 * Check if a question is a form question
 */
export function isFormQuestion(questionType: QuestionType): boolean {
  return questionType === QUESTION_TYPES.FORM
}

/**
 * Check if a form element requires options
 */
export function requiresOptions(elementType: FormElementType): boolean {
  return (
    elementType === FORM_ELEMENT_TYPES.SELECT ||
    elementType === FORM_ELEMENT_TYPES.RADIO ||
    elementType === FORM_ELEMENT_TYPES.CHECKBOX
  )
}

/**
 * Check if a survey is active (published and not archived)
 */
export function isSurveyActive(status: SurveyStatus): boolean {
  return status === SURVEY_STATUS.PUBLISHED
}

/**
 * Check if a participant has completed the survey
 */
export function hasParticipantCompleted(status: ParticipantStatus): boolean {
  return status === PARTICIPANT_STATUS.COMPLETED
}

/**
 * Get the display label for a question type
 */
export function getQuestionTypeLabel(questionType: QuestionType): string {
  const labels = {
    [QUESTION_TYPES.FOUR_IMAGE]: '4 Image Selection',
    [QUESTION_TYPES.FORM]: 'Form Input',
  }
  return labels[questionType] || 'Unknown'
}

/**
 * Get the display label for a form element type
 */
export function getFormElementTypeLabel(elementType: FormElementType): string {
  const labels = {
    [FORM_ELEMENT_TYPES.TEXT]: 'Text Input',
    [FORM_ELEMENT_TYPES.TEXTAREA]: 'Text Area',
    [FORM_ELEMENT_TYPES.BOOLEAN]: 'Boolean',
    [FORM_ELEMENT_TYPES.NUMBER]: 'Number Input',
    [FORM_ELEMENT_TYPES.EMAIL]: 'Email Input',
    [FORM_ELEMENT_TYPES.SELECT]: 'Select Dropdown',
    [FORM_ELEMENT_TYPES.CHECKBOX]: 'Checkbox',
    [FORM_ELEMENT_TYPES.RADIO]: 'Radio Button',
  }
  return labels[elementType] || 'Unknown'
}

/**
 * Validate that a question type is valid
 */
export function validateQuestionType(type: string): type is QuestionType {
  return Object.values(QUESTION_TYPES).includes(type as QuestionType)
}

/**
 * Validate that a form element type is valid
 */
export function validateFormElementType(type: string): type is FormElementType {
  return Object.values(FORM_ELEMENT_TYPES).includes(type as FormElementType)
}
