import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { AutomationsTab } from '../../components/AutomationsTab'
import { supabase } from '../../lib/supabase'
import type { Workflow, Segment, Projet } from '../../lib/types'

export default function AutomationsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
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
      const [{ data: workflowsData }, { data: segmentsData }, { data: projetsData }] = await Promise.all([
        supabase.from('workflows').select('*').order('created_at', { ascending: false }),
        supabase.from('segments').select('*').order('created_at', { ascending: false }),
        supabase.from('projets').select('*').order('created_at', { ascending: false })
      ])
      
      setWorkflows(workflowsData || [])
      setSegments(segmentsData || [])
      setProjets(projetsData || [])
    } catch (error) {
      console.error('Error loading automations data:', error)
    }
  }

  return (
    <Layout title="Automatisations">
      <AutomationsTab 
        workflows={workflows} 
        segments={segments} 
        projets={projets}
        onWorkflowUpdate={loadData} 
      />
    </Layout>
  )
}