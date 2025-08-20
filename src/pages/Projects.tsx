
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { ProjectsTab } from '../../components/ProjectsTab'
import { supabase } from '../../lib/supabase'
import type { Contact, Projet } from '../../lib/types'

export default function ProjectsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [projets, setProjets] = useState<Projet[]>([])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  if (loading) return null

  if (!user) {
    navigate('/login')
    return null
  }

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
      <ProjectsTab />
    </Layout>
  )
}
