import React from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { SettingsTab } from '../../components/SettingsTab'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return null

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <Layout title="Paramètres">
      <SettingsTab 
        user={user} 
        onSettingsUpdate={() => {}} 
      />
    </Layout>
  )
}