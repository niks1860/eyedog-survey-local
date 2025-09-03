'use client'

interface SurveyProgressProps {
  current: number
  total: number
}

export function SurveyProgress({ current, total }: SurveyProgressProps) {
  const percentage = (current / total) * 100

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>
          Question {current} of {total}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
