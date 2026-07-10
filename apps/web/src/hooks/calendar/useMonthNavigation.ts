import { useState } from 'react'

export function useMonthNavigation(initialYear: number, initialMonth: number) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)

  const handlePrev = () => {
    const d = new Date(year, month - 2, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

  const handleNext = () => {
    const d = new Date(year, month, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

  return { year, month, handlePrev, handleNext }
}
