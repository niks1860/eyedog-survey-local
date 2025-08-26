# Survey Collections Documentation

This document describes the new collections implemented for the Wayfinding Reaction Time Survey Tool.

## Collections Overview

The survey system consists of four main collections:

1. **Surveys** - Main survey configuration
2. **Questions** - Individual questions within surveys
3. **Participants** - Survey participants and their progress
4. **Responses** - Detailed response data with timing measurements

## 1. Surveys Collection

**Purpose**: Defines the overall survey structure and configuration.

**Key Fields**:
- `title` - Internal name for the survey
- `description` - Rich text description of the survey
- `slug` - URL-friendly identifier
- `instructions` - General instructions shown to participants
- `thankYouMessage` - Message displayed upon completion
- `defaultCountdownSeconds` - Default countdown duration (1-10 seconds)
- `questions` - Ordered list of questions
- `status` - Draft, Published, or Archived

**Usage**:
- Create surveys with descriptive titles and clear instructions
- Set appropriate countdown duration for your study
- Add questions in the desired order
- Publish when ready for participants

## 2. Questions Collection

**Purpose**: Defines individual questions with their specific configuration.

**Question Types**:

### 4 Image Selection (`4_image`)
- **Purpose**: Present four images for selection
- **Fields**: 
  - `images` - Array of exactly 4 images with IDs (image_a, image_b, image_c, image_d)
  - `overrideInstructions` - Question-specific instructions
  - `countdownSeconds` - Question-specific countdown (overrides survey default)

### Form Input (`form`)
- **Purpose**: Collect structured data from participants
- **Fields**:
  - `formElements` - Array of form inputs (text, textarea, boolean, number, email, select, checkbox, radio)
  - Each element can have validation rules, placeholders, and required settings

**Key Fields**:
- `title` - Internal question name
- `type` - Question type (4_image or form)
- `order` - Sequence within survey
- `overrideInstructions` - Question-specific instructions
- `countdownSeconds` - Question-specific countdown

## 3. Participants Collection

**Purpose**: Manages survey participants and tracks their progress.

**Key Fields**:
- `participantId` - Unique identifier (user-defined or auto-generated)
- `uniqueLinkToken` - Auto-generated secure token for access links
- `currentSurvey` - Survey assigned to participant
- `lastCompletedQuestion` - Progress tracking for pause/resume
- `status` - New, In Progress, Completed, or Abandoned
- `metadata` - JSON field for participant-specific data (age, gender, group, etc.)
- `startedAt` - When participant first started
- `completedAt` - When participant finished
- `totalTimeMs` - Total time spent on survey

**Features**:
- Auto-generates secure access tokens
- Tracks progress for pause/resume functionality
- Stores arbitrary metadata for research purposes

## 4. Responses Collection

**Purpose**: Captures detailed response data with precise timing measurements.

**Key Fields**:
- `participant` - Who provided the response
- `survey` - Which survey the response belongs to
- `question` - Which question was answered
- `questionDisplayedAt` - When question elements appeared (client-side timestamp)
- `initialSelectionTimeMs` - Time to first image click (4_image type)
- `finalSelectionTimeMs` - Time to "Next" button click
- `selectedOptionId` - Which image was selected (4_image type)
- `reselectionEvents` - Array of re-selection events before final submission
- `formData` - JSON data from form inputs (form type)
- `clientTimestamp` - Client-side submission time
- `serverTimestamp` - Server-side reception time
- `responseQuality` - Quality metrics and validation

**Timing Precision**:
- All timestamps use `performance.now()` for maximum accuracy
- Tracks both initial selection and final confirmation
- Records re-selection events for detailed analysis
- Separate client and server timestamps for validation

## Access Control

- **Create/Update/Delete**: Authenticated users only
- **Read**: 
  - Surveys, Questions: Anyone (for public survey access)
  - Participants, Responses: Authenticated users only (for data privacy)

## Admin Interface Features

### Survey Management
- Create, edit, and archive surveys
- Drag-and-drop question ordering
- Rich text editors for instructions and messages
- Status management (draft/published/archived)

### Question Configuration
- Conditional field display based on question type
- Image upload integration with Media collection
- Comprehensive form element configuration
- Validation rule setup

### Participant Management
- Overview dashboard with key metrics
- CSV import/export capabilities
- Progress tracking visualization
- Link generation for survey access

### Response Analysis
- Detailed response viewing
- Timing data analysis
- Quality metrics
- CSV export for statistical analysis

## Usage Workflow

1. **Setup Phase**:
   - Create a new Survey
   - Add Questions (4_image or form type)
   - Configure instructions and countdown settings
   - Publish the survey

2. **Participant Management**:
   - Create Participants (manually or via CSV import)
   - **Auto-generation**: Participant IDs and access tokens are automatically generated if not provided
   - Assign participants to surveys
   - Generate unique access links

3. **Data Collection**:
   - Participants access surveys via unique links
   - System tracks progress and timing
   - Responses are stored with precise measurements

4. **Analysis**:
   - View individual responses in admin
   - Export data for statistical analysis
   - Monitor participant progress and completion rates

## Technical Notes

- All collections use Payload CMS's built-in features
- Rich text editing powered by Lexical editor
- Image handling integrated with existing Media collection
- JSON fields for flexible metadata storage
- Automatic timestamp generation and validation
- Secure token generation for participant access
- **Auto-generation**: Participant IDs and access tokens are automatically generated with proper formatting
- **Typed Constants**: All question types, form element types, and status values use typed constants for better type safety and maintainability

## Typed Constants

The survey system uses typed constants for better type safety and maintainability:

### Question Types
```typescript
import { QUESTION_TYPES } from '../types'

// Use typed constants instead of hardcoded strings
if (question.type === QUESTION_TYPES.FOUR_IMAGE) {
  // Handle image question
}
```

### Form Element Types
```typescript
import { FORM_ELEMENT_TYPES } from '../types'

// Validate form element types
if (element.type === FORM_ELEMENT_TYPES.SELECT) {
  // Handle select element
}
```

### Status Constants
```typescript
import { SURVEY_STATUS, PARTICIPANT_STATUS } from '../types'

// Check survey status
if (survey.status === SURVEY_STATUS.PUBLISHED) {
  // Survey is active
}

// Check participant status
if (participant.status === PARTICIPANT_STATUS.COMPLETED) {
  // Participant finished
}
```

### Utility Functions
```typescript
import { isImageQuestion, isSurveyActive } from '../utilities/surveyHelpers'

// Use helper functions for common checks
if (isImageQuestion(question.type)) {
  // Handle image question
}

if (isSurveyActive(survey.status)) {
  // Survey is available
}
```

## Future Enhancements

- Advanced analytics dashboard
- Real-time progress monitoring
- A/B testing capabilities
- External data visualization integration
- Advanced question types (video, drag-and-drop)
- User authentication system
