import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { EmailTemplatesTab } from '../../components/EmailTemplatesTab'
import { supabase } from '../../lib/supabase'
import type { EmailTemplate, Segment } from '../../lib/types'

export default function EmailTemplatesPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [segments, setSegments] = useState<Segment[]>([])

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
      const [{ data: templatesData }, { data: segmentsData }] = await Promise.all([
        supabase.from('email_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('segments').select('*').order('created_at', { ascending: false })
      ])
      
      setTemplates(templatesData || [])
      setSegments(segmentsData || [])
    } catch (error) {
      console.error('Error loading email templates data:', error)
    }
  }

  return (
    <Layout title="Templates Email">
      <EmailTemplatesTab 
        templates={templates} 
        segments={segments}
        onTemplateUpdate={loadData} 
      />
    </Layout>
  )
}