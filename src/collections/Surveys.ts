import type { CollectionConfig } from 'payload'
import {
  lexicalEditor,
  FixedToolbarFeature,
  InlineToolbarFeature,
} from '@payloadcms/richtext-lexical'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'
import { slugField } from '@/fields/slug'
import { SURVEY_STATUS } from '../types'

export const Surveys: CollectionConfig = {
  slug: 'surveys',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'createdAt'],
    group: 'Survey Management',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal name for the survey (e.g., "Wayfinding Study Q3 2025")',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      admin: {
        description: 'Detailed description of the survey purpose and content',
      },
    },
    ...slugField(),
    {
      name: 'instructions',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      admin: {
        description: 'General instructions displayed to participants before starting the survey',
      },
    },
    {
      name: 'thankYouMessage',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      admin: {
        description: 'Message displayed to participants upon completing the survey',
      },
    },
    {
      name: 'defaultCountdownSeconds',
      type: 'number',
      required: true,
      defaultValue: 3,
      min: 1,
      max: 10,
      admin: {
        description: 'Default countdown duration in seconds before each question (1-10 seconds)',
      },
    },
    {
      name: 'questions',
      type: 'relationship',
      relationTo: 'questions',
      hasMany: true,
      admin: {
        description: 'Ordered list of questions for this survey',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: SURVEY_STATUS.DRAFT,
        },
        {
          label: 'Published',
          value: SURVEY_STATUS.PUBLISHED,
        },
        {
          label: 'Archived',
          value: SURVEY_STATUS.ARCHIVED,
        },
      ],
      admin: {
        description: 'Current status of the survey',
      },
    },
  ],
}
