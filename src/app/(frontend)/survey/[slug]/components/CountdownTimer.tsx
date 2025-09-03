'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  seconds: number
  onComplete: () => void
}

export function CountdownTimer({ seconds, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, onComplete])

  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-4">
        <span className="text-3xl font-bold text-blue-600">{timeLeft}</span>
      </div>
      <p className="text-lg text-gray-600">Get ready for the next question...</p>
    </div>
  )
}
