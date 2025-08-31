
import React, { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { OptimizedLoader } from '../../components/ui/optimized-loader'
import { supabase } from '../../lib/supabase'
import type { Contact, Projet } from '../../lib/types'
import { FolderOpen } from 'lucide-react'

// Import statique temporaire pour éviter les erreurs de lazy loading
import { ProjectsTab } from '../../components/ProjectsTab'

export default function ProjectsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
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
      const [{ data: contactsData }, { data: projetsData }] = await Promise.all([
        supabase.from('contact').select('*, projets(*)').order('created_at', { ascending: false }),
        supabase.from('projets').select('*').order('created_at', { ascending: false })
      ])
      
      setContacts(contactsData || [])
      setProjets(projetsData || [])
    } catch (error) {
      console.error('Error loading projects data:', error)
    }
  }

  return (
    <Layout title="Gestion des Projets">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header minimaliste */}
        <div className="mb-12">
          <h1 className="text-3xl font-light text-slate-900 mb-2">
            Projets
          </h1>
          <p className="text-slate-600 text-base">
            Gestion de vos projets commerciaux
          </p>
        </div>

        <ProjectsTab />
      </div>
    </Layout>
  )
}
