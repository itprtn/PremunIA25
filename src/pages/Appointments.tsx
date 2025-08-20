import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { AppointmentsTab } from '../../components/AppointmentsTab'
import { supabase } from '../../lib/supabase'
import type { Contact } from '../../lib/types'

export default function AppointmentsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

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
      const { data: contactsData } = await supabase
        .from('contact')
        .select('*')
        .order('created_at', { ascending: false })
      
      setContacts(contactsData || [])
      setAppointments([]) // Will be loaded from Supabase once appointments table is ready
    } catch (error) {
      console.error('Error loading appointments data:', error)
    }
  }

  return (
    <Layout title="Prendre un RDV">
      <AppointmentsTab 
        appointments={appointments} 
        contacts={contacts}
        onAppointmentUpdate={loadData} 
      />
    </Layout>
  )
}