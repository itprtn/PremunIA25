import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { EmailTemplatesTab } from '../../components/EmailTemplatesTab'
import { supabase } from '../../lib/supabase'
import type { EmailTemplate } from '../../lib/types'

export default function EmailTemplatesPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])

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
      const { data: templatesData } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false })

      setTemplates(templatesData || [])
    } catch (error) {
      console.error('Error loading email templates data:', error)
    }
  }

  return (
    <Layout title="Templates Email">
      <EmailTemplatesTab
        templates={templates}
        onTemplateUpdate={loadData}
      />
    </Layout>
  )
}