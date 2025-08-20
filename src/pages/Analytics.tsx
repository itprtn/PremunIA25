
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { AnalyticsTab } from '../../components/AnalyticsTab'
import { PipelineAnalyticsAdvanced } from '../../components/analytics/PipelineAnalyticsAdvanced'
import { supabase } from '../../lib/supabase'
import type { Contact, Projet, Contrat, Campaign } from '../../lib/types'

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [contrats, setContrats] = useState<Contrat[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
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
        { data: contratsData }
      ] = await Promise.all([
        supabase.from('contact').select('*, projets(*)').order('created_at', { ascending: false }),
        supabase.from('projets').select('*').order('created_at', { ascending: false }),
        supabase.from('contrats').select('*').order('contrat_date_creation', { ascending: false })
      ])
      
      setContacts(contactsData || [])
      setProjets(projetsData || [])
      setContrats(contratsData || [])
      setCampaigns([]) // Will be loaded from Supabase once campaigns table is ready

      // Calculate origin analytics
      const originAnalytics = calculateOriginAnalytics(projetsData || [], contratsData || [])
      const commercialAnalytics = calculateCommercialAnalytics(projetsData || [], contratsData || [])

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
        originAnalytics,
        commercialAnalytics
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
    }
  }

  const calculateOriginAnalytics = (projets: Projet[], contrats: Contrat[]) => {
    const originStats = projets.reduce((acc, projet) => {
      let origine = projet.origine || 'Non spécifié'
      
      // Regrouper les origines contenant "Fb" sous "Facebook"
      if (origine.toLowerCase().includes('fb')) {
        origine = 'Facebook'
      }
      
      if (!acc[origine]) {
        acc[origine] = {
          total: 0,
          converted: 0,
          revenue: 0
        }
      }
      acc[origine].total += 1
      
      // Trouver les contrats liés à ce projet via contact_id
      const relatedContracts = contrats.filter(c => c.contact_id === projet.contact_id)
      if (relatedContracts.length > 0) {
        acc[origine].converted += 1
        acc[origine].revenue += relatedContracts.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0)
      }
      
      return acc
    }, {} as any)

    return Object.entries(originStats).map(([origine, stats]: [string, any]) => ({
      origine,
      total: stats.total,
      converted: stats.converted,
      conversionRate: stats.total > 0 ? (stats.converted / stats.total) * 100 : 0,
      revenue: stats.revenue
    }))
  }

  const calculateCommercialAnalytics = (projets: Projet[], contrats: Contrat[]) => {
    const commercialStats = projets.reduce((acc, projet) => {
      const commercial = projet.commercial || 'Non assigné'
      if (!acc[commercial]) {
        acc[commercial] = {
          projets: 0,
          contrats: 0,
          revenue: 0
        }
      }
      acc[commercial].projets += 1

      // Find related contracts
      const relatedContracts = contrats.filter(c => c.contact_id === projet.contact_id)
      acc[commercial].contrats += relatedContracts.length
      acc[commercial].revenue += relatedContracts.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0)

      return acc
    }, {} as any)

    return Object.entries(commercialStats).map(([commercial, stats]: [string, any]) => ({
      commercial,
      projets: stats.projets,
      contrats: stats.contrats,
      conversionRate: stats.projets > 0 ? (stats.contrats / stats.projets) * 100 : 0,
      revenue: stats.revenue
    }))
  }

  // Prepare analytics data with proper structure
  const analyticsData = {
    overview: {
      totalRevenue: stats.totalRevenue || 0,
      revenueGrowth: 15.2,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.statut === "active").length,
      emailsSent: campaigns.reduce((sum, c) => sum + (c.tracking_stats?.envois || 0), 0),
      openRate: "24.5%",
      clickRate: "3.2%",
      conversionRate: `${stats.conversionRate || 0}%`,
      roi: 285,
    },
    trends: [],
    topCampaigns: campaigns.slice(0, 5),
    segmentPerformance: [], // Ensure this is always an array
    aiInsights: [],
    originAnalytics: stats.originAnalytics || [],
    commercialAnalytics: stats.commercialAnalytics || []
  }

  return (
    <Layout title="Analytics & Insights">
      <div className="space-y-8">
        <AnalyticsTab
          stats={stats}
          campaigns={campaigns}
          clients={contacts}
          analyticsData={analyticsData}
          contacts={contacts}
          projets={projets}
          contrats={contrats}
        />
        
        <PipelineAnalyticsAdvanced 
          projets={projets}
          contrats={contrats}
          contacts={contacts}
        />
      </div>
    </Layout>
  )
}
