import { HashRouter, Routes, Route } from 'react-router-dom'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { CalendarPage } from '@/pages/CalendarPage'
import { DetailPage } from '@/pages/DetailPage'
import { WritePage } from '@/pages/WritePage'

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/detail" element={<DetailPage />} />
            <Route path="/write" element={<WritePage />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryProvider>
  )
}
