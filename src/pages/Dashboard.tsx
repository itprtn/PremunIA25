"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../components/auth-provider"
import { useNavigate } from "react-router-dom"
import { Layout } from "../../components/Layout"
import { DashboardTab } from "../../components/DashboardTab"
import { Cpu } from 'lucide-react'
import { supabase } from "../../lib/supabase"
import type { Contact, Projet, Contrat, Campaign, Interaction } from "../../lib/types"

interface DashboardStats {
  totalContacts: number;
  activeClients: number;
  prospects: number;
  totalRevenue: number;
  conversionRate: string;
  avgRevenuePerClient: string;
  growthRate: string;
  activeCampaigns: number;
  crossSellOpportunities: number;
  aiScore: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [state, setState] = useState<{
    contacts: Contact[];
    projets: Projet[];
    contrats: Contrat[];
    interactions: Interaction[];
    campaigns: Campaign[];
    stats: DashboardStats;
  }>({
    contacts: [] as Contact[],
    projets: [] as Projet[],
    contrats: [] as Contrat[],
    interactions: [],
    campaigns: [],
    stats: {
      totalContacts: 0,
      activeClients: 0,
      prospects: 0,
      totalRevenue: 0,
      conversionRate: "0",
      avgRevenuePerClient: "0",
      growthRate: "0",
      activeCampaigns: 0,
      crossSellOpportunities: 0,
      aiScore: 0,
    },
  });

  const { contacts, projets, contrats, interactions, campaigns, stats } = state;
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  // Redirection automatique vers login si pas authentifié
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  // Redirection immédiate si pas d'utilisateur
  if (!loading && !user) {
    return null // La redirection se fera via useEffect
  }

  const loadData = async () => {
    if (dataLoading) return // Prevent multiple simultaneous loads

    setDataLoading(true)
    try {
      console.log('Loading dashboard data...')

      const [
        { data: contactsData, error: contactsError },
        { data: projetsData, error: projetsError },
        { data: contratsData, error: contratsError },
        { data: interactionsData, error: interactionsError },
      ] = await Promise.all([
        supabase.from("contact").select("*, projets(projet_id)").order("created_at", { ascending: false }), // Fetch only projet_id
        supabase.from("projets").select("*").order("created_at", { ascending: false }),
        supabase.from("contrats").select("*").order("contrat_date_creation", { ascending: false }),
        supabase.from("interactions").select("*").order("created_at", { ascending: false }),
      ])

      // Handle individual errors but continue with available data
      if (contactsError) console.error("Error loading contacts:", contactsError)
      if (projetsError) console.error("Error loading projets:", projetsError)
      if (contratsError) console.error("Error loading contrats:", contratsError)
      if (interactionsError) console.error("Error loading interactions:", interactionsError)

      // Calculate stats with fallback values
      const totalContacts = contactsData?.length || 0;
      const activeClients = contactsData?.filter(c => c.statut === 'active').length || 0;
      const prospects = contactsData?.filter(c => c.statut === 'prospect').length || 0;
      const totalProjets = projetsData?.length || 0;
      const totalContrats = contratsData?.length || 0;
      const totalRevenue = contratsData?.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0) || 0;
      const conversionRate = totalProjets > 0 ? ((totalContrats / totalProjets) * 100).toFixed(2) : "0";
      const avgRevenuePerClient = totalContacts > 0 ? (totalRevenue / totalContacts).toFixed(2) : "0";
      const growthRate = "+5%"; // Placeholder
      const activeCampaigns = 10; // Placeholder
      const crossSellOpportunities = 5; // Placeholder
      const aiScore = 75; // Placeholder

      const dashboardStats = {
        totalContacts,
        activeClients,
        prospects,
        totalRevenue,
        conversionRate: conversionRate,
        avgRevenuePerClient: avgRevenuePerClient,
        growthRate: growthRate,
        activeCampaigns: activeCampaigns,
        crossSellOpportunities: crossSellOpportunities,
        aiScore: aiScore,
      }

      // Update state in a single call
      setState({
        contacts: contactsData || [],
        projets: projetsData || [],
        contrats: contratsData || [],
        interactions: interactionsData || [],
        campaigns: [], // Will be loaded from Supabase once campaigns table is ready
        stats: dashboardStats,
      });

      console.log('Dashboard data loaded successfully:', dashboardStats)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      // Set empty state on critical error
      setState({
        contacts: [],
        projets: [],
        contrats: [],
        interactions: [],
        campaigns: [],
        stats: {
          totalContacts: 0,
          activeClients: 0,
          prospects: 0,
          totalRevenue: 0,
          conversionRate: "0",
          avgRevenuePerClient: "0",
          growthRate: "0",
          activeCampaigns: 0,
          crossSellOpportunities: 0,
          aiScore: 0,
        },
      });
    } finally {
      setDataLoading(false)
    }
  }

  return (
    <Layout title="Dashboard">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header minimaliste */}
        <div className="mb-12">
          <h1 className="text-3xl font-light text-slate-900 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 text-base">
            Vue d'ensemble de votre activité
          </p>
        </div>

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
          isLoading={dataLoading}
        />
      </div>
    </Layout>
  )
}
