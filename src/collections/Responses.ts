import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { QUESTION_TYPES } from '../types'

export const Responses: CollectionConfig = {
  slug: 'responses',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['participant', 'survey', 'question', 'finalSelectionTimeMs', 'createdAt'],
    description: 'Survey response data with precise timing measurements',
    group: 'Survey Management',
  },
  fields: [
    {
      name: 'participant',
      type: 'relationship',
      relationTo: 'participants',
      required: true,
      admin: {
        description: 'Participant who provided this response',
      },
    },
    {
      name: 'survey',
      type: 'relationship',
      relationTo: 'surveys',
      required: true,
      admin: {
        description: 'Survey this response belongs to',
      },
    },
    {
      name: 'question',
      type: 'relationship',
      relationTo: 'questions',
      required: true,
      admin: {
        description: 'Question this response answers',
      },
    },
    {
      name: 'questionDisplayedAt',
      type: 'date',
      required: true,
      admin: {
        description:
          'Timestamp when question elements fully appeared to user (client-side captured)',
      },
    },
    {
      name: 'initialSelectionTimeMs',
      type: 'number',
      admin: {
        description: `Duration from questionDisplayedAt to first image click (for ${QUESTION_TYPES.FOUR_IMAGE} type)`,
      },
    },
    {
      name: 'finalSelectionTimeMs',
      type: 'number',
      required: true,
      admin: {
        description: 'Duration from questionDisplayedAt to "Next" button click',
      },
    },
    {
      name: 'selectedOptionId',
      type: 'text',
      admin: {
        description: `For ${QUESTION_TYPES.FOUR_IMAGE} type, the ID of the selected image (e.g., "image_a")`,
      },
    },
    {
      name: 'reselectionEvents',
      type: 'array',
      admin: {
        description: `For ${QUESTION_TYPES.FOUR_IMAGE} type, tracking re-selections before final submission`,
      },
      fields: [
        {
          name: 'timestampMs',
          type: 'number',
          required: true,
          admin: {
            description: 'Duration from questionDisplayedAt to this re-selection',
          },
        },
        {
          name: 'selectedOptionId',
          type: 'text',
          required: true,
          admin: {
            description: 'The image ID selected at this event',
          },
        },
      ],
    },
    {
      name: 'formData',
      type: 'json',
      admin: {
        description: `For ${QUESTION_TYPES.FORM} type, key-value pairs of form input data`,
      },
    },
    {
      name: 'clientTimestamp',
      type: 'date',
      admin: {
        description: 'Client-side timestamp when response was submitted',
      },
    },
    {
      name: 'serverTimestamp',
      type: 'date',
      admin: {
        description: 'Server-side timestamp when response was received',
      },
    },
    {
      name: 'responseQuality',
      type: 'group',
      admin: {
        description: 'Quality metrics for the response',
      },
      fields: [
        {
          name: 'isValid',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether this response meets quality criteria',
          },
        },
        {
          name: 'qualityScore',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Quality score (0-100) based on response patterns',
          },
        },
        {
          name: 'qualityNotes',
          type: 'textarea',
          admin: {
            description: 'Notes about response quality or anomalies',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-set server timestamp if not provided
        if (!data.serverTimestamp) {
          data.serverTimestamp = new Date()
        }
        return data
      },
    ],
  },
}
