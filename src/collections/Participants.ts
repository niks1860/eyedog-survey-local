import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'
import { PARTICIPANT_STATUS } from '../types'

export const Participants: CollectionConfig = {
  slug: 'participants',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'participantId',
    defaultColumns: [
      'participantId',
      'currentSurvey',
      'lastCompletedQuestion',
      'status',
      'createdAt',
    ],
    description: 'Manage survey participants and their progress',
    group: 'Survey Management',
  },
  fields: [
    {
      name: 'participantId',
      type: 'text',
      required: true,
      unique: true,

      admin: {
        description: 'Unique identifier for the participant (leave empty to auto-generate)',
        placeholder: 'Leave empty to auto-generate',
      },
    },
    {
      name: 'uniqueLinkToken',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Secure, unique token for generating access links',
        readOnly: true,
      },
    },
    {
      name: 'currentSurvey',
      type: 'relationship',
      relationTo: 'surveys',
      admin: {
        description: 'Survey this participant is currently assigned to',
      },
    },
    {
      name: 'lastCompletedQuestion',
      type: 'relationship',
      relationTo: 'questions',
      admin: {
        description: 'Last question completed by this participant (for pause/resume functionality)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        {
          label: 'New',
          value: PARTICIPANT_STATUS.NEW,
        },
        {
          label: 'In Progress',
          value: PARTICIPANT_STATUS.IN_PROGRESS,
        },
        {
          label: 'Completed',
          value: PARTICIPANT_STATUS.COMPLETED,
        },
        {
          label: 'Abandoned',
          value: PARTICIPANT_STATUS.ABANDONED,
        },
      ],
      admin: {
        description: 'Current status of the participant',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Arbitrary participant-specific data (e.g., age, gender, group ID)',
      },
    },
    {
      name: 'startedAt',
      type: 'date',
      admin: {
        description: 'When the participant first started the survey',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        description: 'When the participant completed the survey',
      },
    },
    {
      name: 'totalTimeMs',
      type: 'number',
      admin: {
        description: 'Total time spent on the survey in milliseconds',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req: _req }) => {
        // Auto-generate participantId if not provided
        if (!data.participantId) {
          data.participantId = generateParticipantId()
        }

        // Auto-generate uniqueLinkToken if not provided
        if (!data.uniqueLinkToken) {
          data.uniqueLinkToken = generateUniqueToken()
        }
        return data
      },
    ],
  },
}

// Helper function to generate a unique participant ID
function generateParticipantId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  const participantId = `P${timestamp}${random}`.toUpperCase()

  // Ensure it's a valid format (starts with P, followed by alphanumeric)
  if (!/^P[A-Z0-9]+$/.test(participantId)) {
    // Fallback if the generated ID doesn't match the pattern
    return `P${Date.now()}${Math.random().toString(36).substring(2, 6)}`.toUpperCase()
  }

  return participantId
}

// Helper function to generate a unique token
function generateUniqueToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
