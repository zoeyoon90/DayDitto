import { DailyLogDetail } from '@/types/calendar'
import DetailNavBar from './components/DetailNavBar'
import DetailNoteBook from './components/DetailNoteBook'

interface Props {
  log: DailyLogDetail | null
}

export default function DetailLogContainer({ log }: Props) {
  if (!log) return <p className="text-foreground/40">일기를 찾을 수 없습니다.</p>

  return (
    <div className="max-w-2xl w-full py-6 flex flex-col gap-6">
      <DetailNavBar
        logDate={log.logDate}
        weather={log.weather}
        mood={log.mood}
        imageUrl={log.imageUrl}
      />
      <DetailNoteBook
        koreanContent={log.koreanContent}
        englishContent={log.englishContent}
      />
    </div>
  )
}
