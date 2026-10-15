import { lazy } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { EmptyState } from './components/ui'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const InventoryPage = lazy(() => import('./pages/InventoryPage'))
const SimulatorPage = lazy(() => import('./pages/SimulatorPage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const ReportPage = lazy(() => import('./pages/ReportPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

export default function App() {
  return (
    <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route
            path="*"
            element={
              <EmptyState title="Page not found">
                <Link to="/" className="text-teal-300 underline">Back to the dashboard</Link>
              </EmptyState>
            }
          />
        </Route>
    </Routes>
  )
}
