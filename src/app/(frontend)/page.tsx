import type { Metadata } from 'next'
import { SurveyToolLanding } from './components/SurveyToolLanding'

export const metadata: Metadata = {
  title: 'Wayfinding Reaction Time Survey Tool',
  description:
    'A comprehensive web-based survey tool designed to measure reaction times in wayfinding tasks and assess the effectiveness of different signage on cognitive load and mental processing.',
  keywords: ['wayfinding', 'survey', 'reaction time', 'cognitive load', 'signage', 'research'],
  openGraph: {
    title: 'Wayfinding Reaction Time Survey Tool',
    description: 'Measure reaction times in wayfinding tasks with precision and ease.',
    type: 'website',
  },
}

export default function HomePage() {
  return <SurveyToolLanding />
}
