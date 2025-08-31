import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { AutomationsTab } from '../../components/AutomationsTab'
import { supabase } from '../../lib/supabase'
import type { Workflow } from '../../lib/types'

export default function AutomationsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [workflows, setWorkflows] = useState<Workflow[]>([])

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
      const { data: workflowsData } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false })

      setWorkflows(workflowsData || [])
    } catch (error) {
      console.error('Error loading automations data:', error)
    }
  }

  return (
    <Layout title="Automations & Workflows">
      <AutomationsTab
        workflows={workflows}
        onWorkflowUpdate={loadData}
      />
    </Layout>
  )
}