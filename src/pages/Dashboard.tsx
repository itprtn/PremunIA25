
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../components/auth-provider"
import { useNavigate } from "react-router-dom"
import { Layout } from "../../components/Layout"
import { DashboardTab } from "../../components/DashboardTab"
import { supabase } from "../../lib/supabase"
import type { Contact, Projet, Contrat, Campaign, Interaction } from "../../lib/types"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [contrats, setContrats] = useState<Contrat[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [stats, setStats] = useState<any>({})

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
      const [
        { data: contactsData },
        { data: projetsData },
        { data: contratsData },
        { data: interactionsData },
      ] = await Promise.all([
        supabase.from("contact").select("*, projets(*)").order("created_at", { ascending: false }),
        supabase.from("projets").select("*").order("created_at", { ascending: false }),
        supabase.from("contrats").select("*").order("contrat_date_creation", { ascending: false }),
        supabase.from("interactions").select("*").order("created_at", { ascending: false }),
      ])

      setContacts(contactsData || [])
      setProjets(projetsData || [])
      setContrats(contratsData || [])
      setInteractions(interactionsData || [])
      setCampaigns([]) // Will be loaded from Supabase once campaigns table is ready

      // Calculate stats
      const totalContacts = contactsData?.length || 0
      const totalProjets = projetsData?.length || 0
      const totalContrats = contratsData?.length || 0
      const totalRevenue = contratsData?.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0) || 0

      setStats({
        totalContacts,
        totalProjets,
        totalContrats,
        totalRevenue,
        conversionRate: totalProjets > 0 ? (totalContrats / totalProjets) * 100 : 0,
      })
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  return (
    <Layout title="Dashboard">
      <DashboardTab
        stats={stats}
        clients={contacts}
        projets={projets}
        contrats={contrats}
        segments={[]}
        workflows={[]}
        campaigns={campaigns}
        aiPredictions={[]}
        interactions={interactions}
      />
    </Layout>
  )
}
