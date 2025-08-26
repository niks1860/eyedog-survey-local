import type { CollectionConfig } from 'payload'
import {
  lexicalEditor,
  FixedToolbarFeature,
  InlineToolbarFeature,
} from '@payloadcms/richtext-lexical'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'
import { QUESTION_TYPES, FORM_ELEMENT_TYPES } from '../types'

export const Questions: CollectionConfig = {
  slug: 'questions',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'order', 'createdAt'],
    group: 'Survey Management',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal name for the question (e.g., "Q1 - Museum Entrance")',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: '4 Image Selection',
          value: QUESTION_TYPES.FOUR_IMAGE,
        },
        {
          label: 'Form Input',
          value: QUESTION_TYPES.FORM,
        },
      ],
      admin: {
        description: 'Type of question - either image selection or form input',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Order of this question within a survey',
      },
    },
    {
      name: 'overrideInstructions',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      admin: {
        description: 'Optional instructions that override survey-level instructions',
      },
    },
    {
      name: 'countdownSeconds',
      type: 'number',
      min: 1,
      max: 10,
      admin: {
        description: 'Optional countdown duration that overrides survey default (1-10 seconds)',
      },
    },
    // Conditional fields for 4_image type
    {
      name: 'images',
      type: 'array',
      admin: {
        condition: (data) => data.type === QUESTION_TYPES.FOUR_IMAGE,
        description: 'Four images for the question (only shown for 4_image type)',
      },
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
          admin: {
            description: 'Unique identifier for the image within the question (e.g., "image_a")',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Image file for this option',
          },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Optional label for internal identification',
          },
        },
      ],
      validate: (val) => {
        if (val && Array.isArray(val) && val.length !== 4) {
          return 'Exactly 4 images are required for 4_image type questions'
        }
        return true
      },
    },
    // Conditional fields for form type
    {
      name: 'formElements',
      type: 'array',
      admin: {
        condition: (data) => data.type === QUESTION_TYPES.FORM,
        description: 'Form input elements for the question (only shown for form type)',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Text', value: FORM_ELEMENT_TYPES.TEXT },
            { label: 'Textarea', value: FORM_ELEMENT_TYPES.TEXTAREA },
            { label: 'Boolean', value: FORM_ELEMENT_TYPES.BOOLEAN },
            { label: 'Number', value: FORM_ELEMENT_TYPES.NUMBER },
            { label: 'Email', value: FORM_ELEMENT_TYPES.EMAIL },
            { label: 'Select', value: FORM_ELEMENT_TYPES.SELECT },
            { label: 'Checkbox', value: FORM_ELEMENT_TYPES.CHECKBOX },
            { label: 'Radio', value: FORM_ELEMENT_TYPES.RADIO },
          ],
          admin: {
            description: 'Type of form input element',
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Unique identifier for the input (e.g., "age", "comments")',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Display label for the user (e.g., "Your Age:")',
          },
        },
        {
          name: 'placeholder',
          type: 'text',
          admin: {
            description: 'Optional placeholder text',
          },
        },
        {
          name: 'defaultValue',
          type: 'text',
          admin: {
            description: 'Optional default value for the input',
          },
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether this field is required',
          },
        },
        {
          name: 'options',
          type: 'array',
          admin: {
            condition: (data, siblingData) =>
              siblingData.type === FORM_ELEMENT_TYPES.SELECT ||
              siblingData.type === FORM_ELEMENT_TYPES.RADIO ||
              siblingData.type === FORM_ELEMENT_TYPES.CHECKBOX,
            description: 'Options for select, radio, or checkbox inputs',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'validation',
          type: 'group',
          admin: {
            description: 'Validation rules for this input',
          },
          fields: [
            {
              name: 'minLength',
              type: 'number',
              admin: {
                description: 'Minimum character length',
              },
            },
            {
              name: 'maxLength',
              type: 'number',
              admin: {
                description: 'Maximum character length',
              },
            },
            {
              name: 'min',
              type: 'number',
              admin: {
                description: 'Minimum value (for number inputs)',
              },
            },
            {
              name: 'max',
              type: 'number',
              admin: {
                description: 'Maximum value (for number inputs)',
              },
            },
            {
              name: 'pattern',
              type: 'text',
              admin: {
                description: 'Regex pattern for validation',
              },
            },
          ],
        },
      ],
    },
  ],
}
