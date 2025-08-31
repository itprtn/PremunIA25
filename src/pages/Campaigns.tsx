import React, { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { SimplePageHeader } from '../../components/ui/page-header'
import { OptimizedLoader } from '../../components/ui/optimized-loader'
import { supabase } from '../../lib/supabase'
import type { Campaign, Contact } from '../../lib/types'
import { Mail, Plus, Download } from 'lucide-react'
import { Button } from '../../components/ui/button'

// Import statique temporaire pour éviter les erreurs de lazy loading
import { CampaignsTab } from '../../components/CampaignsTab'

export default function CampaignsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  // Suppression du loader pour plus de fluidité

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
    if (user) {
      loadData()
    }
  }, [user, loading, navigate])

  const loadData = async () => {
    try {
      const { data: contactsData } = await supabase
        .from('contact')
        .select('*')
        .order('created_at', { ascending: false })
      
      setContacts(contactsData || [])
      setCampaigns([]) // Will be loaded from Supabase once campaigns table is ready
    } catch (error) {
      console.error('Error loading campaigns data:', error)
    }
  }

  return (
    <Layout title="Gestion des Campagnes">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header minimaliste avec actions */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-light text-slate-900 mb-2">
              Campagnes
            </h1>
            <p className="text-slate-600 text-base">
              Gestion de vos campagnes email
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors">
              Exporter
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Nouvelle campagne
            </button>
          </div>
        </div>

        <CampaignsTab />
      </div>
    </Layout>
  )
}