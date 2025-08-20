import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { SegmentsTab } from '../../components/SegmentsTab'
import { supabase } from '../../lib/supabase'
import type { Segment, Contact, Projet } from '../../lib/types'

export default function SegmentsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [segments, setSegments] = useState<Segment[]>([])
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
      const [{ data: segmentsData }, { data: contactsData }, { data: projetsData }] = await Promise.all([
        supabase.from('segments').select('*').order('created_at', { ascending: false }),
        supabase.from('contact').select('*').order('created_at', { ascending: false }),
        supabase.from('projets').select('*').order('created_at', { ascending: false })
      ])
      
      setSegments(segmentsData || [])
      setContacts(contactsData || [])
      setProjets(projetsData || [])
    } catch (error) {
      console.error('Error loading segments data:', error)
    }
  }

  return (
    <Layout title="Segments Intelligents">
      <SegmentsTab 
        segments={segments} 
        contacts={contacts}
        onSegmentUpdate={loadData} 
      />
    </Layout>
  )
}