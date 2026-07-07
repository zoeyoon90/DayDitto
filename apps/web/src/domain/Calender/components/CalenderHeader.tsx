import { Button } from '@/components/Button/Button'

interface CalenderHeaderProps {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
}

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
]

export default function CalenderHeader({ year, month, onPrev, onNext }: CalenderHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <Button variant="neutral" size="icon" onClick={onPrev}>
        ‹
      </Button>
      <h2 className="text-lg font-bold text-foreground">
        {year}년 {MONTH_NAMES[month - 1]}
      </h2>
      <Button variant="neutral" size="icon" onClick={onNext}>
        ›
      </Button>
    </div>
  )
}
