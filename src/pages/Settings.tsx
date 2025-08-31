import React, { useEffect, Suspense } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { SimplePageHeader } from '../../components/ui/page-header'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/button'

// Import statique temporaire pour éviter les erreurs de lazy loading
import { SettingsTab } from '../../components/SettingsTab'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (!loading && !user) {
    return null
  }

  return (
    <Layout title="Paramètres">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header minimaliste */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-light text-slate-900 mb-2">
              Paramètres
            </h1>
            <p className="text-slate-600 text-base">
              Configuration de votre compte
            </p>
          </div>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sauvegarder
          </button>
        </div>

        <SettingsTab 
          user={user} 
          onSettingsUpdate={() => {}} 
        />
      </div>
    </Layout>
  )
}