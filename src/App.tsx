
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../components/auth-provider'
import { Toaster } from '../components/ui/toaster'
import { useAppPersistence } from '../hooks/use-app-persistence'

// Optimized loading - Import critical pages immediately, lazy load less critical ones only when needed
import DashboardPage from './pages/Dashboard'
import ProjectsPage from './pages/Projects'
import LoginPage from './pages/Login'

const CampaignsPage = lazy(() => import('./pages/Campaigns'))
const AnalyticsPage = lazy(() => import('./pages/Analytics'))
const EmailTemplatesPage = lazy(() => import('./pages/EmailTemplates'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const SignupPage = lazy(() => import('./pages/Signup'))
const ProjectDetailsPage = lazy(() => import('./pages/ProjectDetails'))
const LeadGenerationPage = lazy(() => import('./pages/LeadGeneration'))
const CommissionsPage = lazy(() => import('./pages/Commissions'))

function AppContent() {
  // Initialize app persistence for better navigation stability
  useAppPersistence()

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/email-templates" element={<EmailTemplatesPage />} />
        <Route path="/lead-generation" element={<LeadGenerationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/commissions" element={<CommissionsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
