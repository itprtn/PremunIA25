import React, { useState, useMemo } from 'react'
import { ModernCard, StatCard } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Legend
} from 'recharts'
import { 
  Mail, TrendingUp, Target, Activity, Calendar, FileText, Download, 
  Eye, MousePointer, UserCheck, AlertTriangle, Send, Users
} from 'lucide-react'
import { Contact, Projet } from '../../lib/types'

interface BrevoEmailAnalyticsProps {
  contacts: Contact[]
  projets: Projet[]
}

// Interface pour les données d'email simulées (à remplacer par les vraies données Brevo API)
interface EmailCampaign {
  id: string
  name: string
  subject: string
  sent: number
  delivered: number
  opens: number
  clicks: number
  unsubscribes: number
  bounces: number
  complaints: number
  sentDate: string
  type: 'newsletter' | 'promotional' | 'transactional' | 'follow-up'
}

export function BrevoEmailAnalytics({ contacts = [], projets = [] }: BrevoEmailAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('3m')
  const [selectedCampaignType, setSelectedCampaignType] = useState<string>('all')

  // Données d'exemple pour les campagnes email (à remplacer par l'API Brevo)
  const emailCampaigns: EmailCampaign[] = useMemo(() => [
    {
      id: '1',
      name: 'Newsletter Mensuelle Octobre',
      subject: 'Vos nouvelles offres d\'assurance ce mois-ci',
      sent: 1500,
      delivered: 1485,
      opens: 445,
      clicks: 89,
      unsubscribes: 12,
      bounces: 15,
      complaints: 2,
      sentDate: '2024-10-15',
      type: 'newsletter'
    },
    {
      id: '2',
      name: 'Offre Spéciale Assurance Auto',
      subject: 'Économisez 20% sur votre assurance auto',
      sent: 800,
      delivered: 792,
      opens: 316,
      clicks: 95,
      unsubscribes: 8,
      bounces: 8,
      complaints: 1,
      sentDate: '2024-10-20',
      type: 'promotional'
    },
    {
      id: '3',
      name: 'Suivi Prospects Chauds',
      subject: 'Votre devis personnalisé vous attend',
      sent: 250,
      delivered: 248,
      opens: 124,
      clicks: 62,
      unsubscribes: 3,
      bounces: 2,
      complaints: 0,
      sentDate: '2024-10-22',
      type: 'follow-up'
    },
    {
      id: '4',
      name: 'Confirmation Contrat',
      subject: 'Votre contrat d\'assurance est confirmé',
      sent: 45,
      delivered: 45,
      opens: 42,
      clicks: 15,
      unsubscribes: 0,
      bounces: 0,
      complaints: 0,
      sentDate: '2024-10-25',
      type: 'transactional'
    }
  ], [])

  // Analytics des performances email
  const emailAnalytics = useMemo(() => {
    let filteredCampaigns = emailCampaigns

    if (selectedCampaignType !== 'all') {
      filteredCampaigns = emailCampaigns.filter(c => c.type === selectedCampaignType)
    }

    // Métriques agrégées
    const totalSent = filteredCampaigns.reduce((sum, c) => sum + c.sent, 0)
    const totalDelivered = filteredCampaigns.reduce((sum, c) => sum + c.delivered, 0)
    const totalOpens = filteredCampaigns.reduce((sum, c) => sum + c.opens, 0)
    const totalClicks = filteredCampaigns.reduce((sum, c) => sum + c.clicks, 0)
    const totalUnsubscribes = filteredCampaigns.reduce((sum, c) => sum + c.unsubscribes, 0)
    const totalBounces = filteredCampaigns.reduce((sum, c) => sum + c.bounces, 0)
    const totalComplaints = filteredCampaigns.reduce((sum, c) => sum + c.complaints, 0)

    // Taux de performance
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
    const openRate = totalDelivered > 0 ? (totalOpens / totalDelivered) * 100 : 0
    const clickRate = totalDelivered > 0 ? (totalClicks / totalDelivered) * 100 : 0
    const clickToOpenRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0
    const unsubscribeRate = totalDelivered > 0 ? (totalUnsubscribes / totalDelivered) * 100 : 0
    const bounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0
    const complaintRate = totalDelivered > 0 ? (totalComplaints / totalDelivered) * 100 : 0

    // Performance par type de campagne
    const performanceByType = ['newsletter', 'promotional', 'transactional', 'follow-up'].map(type => {
      const typeCampaigns = emailCampaigns.filter(c => c.type === type)
      const typeSent = typeCampaigns.reduce((sum, c) => sum + c.sent, 0)
      const typeDelivered = typeCampaigns.reduce((sum, c) => sum + c.delivered, 0)
      const typeOpens = typeCampaigns.reduce((sum, c) => sum + c.opens, 0)
      const typeClicks = typeCampaigns.reduce((sum, c) => sum + c.clicks, 0)
      
      return {
        type,
        sent: typeSent,
        delivered: typeDelivered,
        opens: typeOpens,
        clicks: typeClicks,
        deliveryRate: typeSent > 0 ? (typeDelivered / typeSent) * 100 : 0,
        openRate: typeDelivered > 0 ? (typeOpens / typeDelivered) * 100 : 0,
        clickRate: typeDelivered > 0 ? (typeClicks / typeDelivered) * 100 : 0,
        clickToOpenRate: typeOpens > 0 ? (typeClicks / typeOpens) * 100 : 0
      }
    }).filter(t => t.sent > 0)

    // Évolution temporelle
    const timelineData = filteredCampaigns
      .sort((a, b) => new Date(a.sentDate).getTime() - new Date(b.sentDate).getTime())
      .map(campaign => ({
        date: campaign.sentDate,
        name: campaign.name.substring(0, 20) + '...',
        sent: campaign.sent,
        delivered: campaign.delivered,
        opens: campaign.opens,
        clicks: campaign.clicks,
        openRate: campaign.delivered > 0 ? (campaign.opens / campaign.delivered) * 100 : 0,
        clickRate: campaign.delivered > 0 ? (campaign.clicks / campaign.delivered) * 100 : 0
      }))

    // Analyse de la liste des contacts
    const activeContacts = contacts.filter(c => c.statut === 'Prospect' || c.statut === 'Client')
    const contactSegmentation = {
      prospects: contacts.filter(c => c.statut === 'Prospect').length,
      clients: contacts.filter(c => c.statut === 'Client').length,
      inactifs: contacts.filter(c => c.statut === 'Inactif').length,
      total: contacts.length
    }

    // Score de santé globale de l'email marketing
    let healthScore = 0
    if (deliveryRate >= 95) healthScore += 25
    else if (deliveryRate >= 90) healthScore += 20
    else if (deliveryRate >= 85) healthScore += 15
    
    if (openRate >= 25) healthScore += 25
    else if (openRate >= 20) healthScore += 20
    else if (openRate >= 15) healthScore += 15
    
    if (clickRate >= 3) healthScore += 25
    else if (clickRate >= 2) healthScore += 20
    else if (clickRate >= 1) healthScore += 15
    
    if (bounceRate <= 2) healthScore += 25
    else if (bounceRate <= 5) healthScore += 20
    else if (bounceRate <= 10) healthScore += 15

    return {
      // Métriques principales
      totalSent,
      totalDelivered,
      totalOpens,
      totalClicks,
      totalUnsubscribes,
      totalBounces,
      totalComplaints,
      
      // Taux de performance
      deliveryRate,
      openRate,
      clickRate,
      clickToOpenRate,
      unsubscribeRate,
      bounceRate,
      complaintRate,
      
      // Analyses détaillées
      performanceByType,
      timelineData,
      contactSegmentation,
      
      // Score de santé
      healthScore,
      
      // Benchmarks industrie (assurance)
      benchmarks: {
        openRate: 22.5,
        clickRate: 2.8,
        deliveryRate: 96.2,
        bounceRate: 3.1,
        unsubscribeRate: 0.8
      }
    }
  }, [emailCampaigns, contacts, selectedCampaignType])

  // Fonction d'export PDF
  const exportToPDF = () => {
    console.log('Export PDF des analytics Brevo')
    alert('Fonctionnalité d\'export PDF à implémenter')
  }

  // Fonction d'export Excel  
  const exportToExcel = () => {
    console.log('Export Excel des analytics Brevo')
    alert('Fonctionnalité d\'export Excel à implémenter')
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getPerformanceStatus = (actual: number, benchmark: number) => {
    if (actual >= benchmark * 1.1) return { status: 'excellent', color: 'text-green-600', icon: '↗️' }
    if (actual >= benchmark * 0.9) return { status: 'good', color: 'text-blue-600', icon: '→' }
    return { status: 'needs-improvement', color: 'text-red-600', icon: '↘️' }
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Analytics Email Brevo</h2>
          <p className="text-slate-600">Performance des campagnes d'email marketing</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedCampaignType} onValueChange={setSelectedCampaignType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="promotional">Promotionnel</SelectItem>
              <SelectItem value="transactional">Transactionnel</SelectItem>
              <SelectItem value="follow-up">Suivi</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportToPDF} variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
          
          <Button onClick={exportToExcel} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Score de santé global */}
      <ModernCard variant="gradient" hover>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 gradient-primary rounded-xl mr-4">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Score de Santé Email Marketing</h3>
              <p className="text-slate-600">Évaluation globale de vos performances</p>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold rounded-full w-24 h-24 flex items-center justify-center ${getHealthScoreColor(emailAnalytics.healthScore)}`}>
              {emailAnalytics.healthScore}
            </div>
            <p className="text-sm mt-2">/ 100</p>
          </div>
        </div>
      </ModernCard>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard
          title="Emails Envoyés"
          value={emailAnalytics.totalSent.toLocaleString()}
          change={{ value: 0, type: 'neutral' }}
          icon={<Send className="w-5 h-5" />}
          variant="default"
          description="Total des envois"
        />
        
        <StatCard
          title="Taux de Livraison"
          value={`${emailAnalytics.deliveryRate.toFixed(1)}%`}
          change={{
            value: Math.abs(emailAnalytics.deliveryRate - emailAnalytics.benchmarks.deliveryRate),
            type: emailAnalytics.deliveryRate >= emailAnalytics.benchmarks.deliveryRate ? 'increase' : 'decrease'
          }}
          icon={<Mail className="w-5 h-5" />}
          variant="success"
          description={`Benchmark: ${emailAnalytics.benchmarks.deliveryRate}%`}
        />
        
        <StatCard
          title="Taux d'Ouverture"
          value={`${emailAnalytics.openRate.toFixed(1)}%`}
          change={{
            value: Math.abs(emailAnalytics.openRate - emailAnalytics.benchmarks.openRate),
            type: emailAnalytics.openRate >= emailAnalytics.benchmarks.openRate ? 'increase' : 'decrease'
          }}
          icon={<Eye className="w-5 h-5" />}
          variant="warning"
          description={`Benchmark: ${emailAnalytics.benchmarks.openRate}%`}
        />
        
        <StatCard
          title="Taux de Clic"
          value={`${emailAnalytics.clickRate.toFixed(2)}%`}
          change={{
            value: Math.abs(emailAnalytics.clickRate - emailAnalytics.benchmarks.clickRate),
            type: emailAnalytics.clickRate >= emailAnalytics.benchmarks.clickRate ? 'increase' : 'decrease'
          }}
          icon={<MousePointer className="w-5 h-5" />}
          variant="success"
          description={`Benchmark: ${emailAnalytics.benchmarks.clickRate}%`}
        />
        
        <StatCard
          title="Clic vers Ouverture"
          value={`${emailAnalytics.clickToOpenRate.toFixed(1)}%`}
          change={{ value: 0, type: 'neutral' }}
          icon={<Target className="w-5 h-5" />}
          variant="default"
          description="Engagement qualité"
        />
        
        <StatCard
          title="Taux de Rebond"
          value={`${emailAnalytics.bounceRate.toFixed(2)}%`}
          change={{
            value: Math.abs(emailAnalytics.bounceRate - emailAnalytics.benchmarks.bounceRate),
            type: emailAnalytics.bounceRate <= emailAnalytics.benchmarks.bounceRate ? 'increase' : 'decrease'
          }}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="danger"
          description={`Benchmark: ${emailAnalytics.benchmarks.bounceRate}%`}
        />
        
        <StatCard
          title="Désabonnements"
          value={`${emailAnalytics.unsubscribeRate.toFixed(2)}%`}
          change={{
            value: Math.abs(emailAnalytics.unsubscribeRate - emailAnalytics.benchmarks.unsubscribeRate),
            type: emailAnalytics.unsubscribeRate <= emailAnalytics.benchmarks.unsubscribeRate ? 'increase' : 'decrease'
          }}
          icon={<UserCheck className="w-5 h-5" />}
          variant="default"
          description={`Benchmark: ${emailAnalytics.benchmarks.unsubscribeRate}%`}
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance dans le temps */}
        <ModernCard variant="glass" hover>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold gradient-text">Performance Campagnes</h3>
              <p className="text-sm text-slate-600">Évolution des taux d'ouverture et de clic</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={emailAnalytics.timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name.includes('Rate') ? `${value.toFixed(1)}%` : value,
                  name === 'openRate' ? 'Taux d\'ouverture' : name === 'clickRate' ? 'Taux de clic' : name
                ]}
              />
              <Legend />
              <Bar yAxisId="right" dataKey="sent" fill="#e5e7eb" name="Envoyés" />
              <Line yAxisId="left" type="monotone" dataKey="openRate" stroke="#3b82f6" strokeWidth={3} name="Taux d'ouverture" />
              <Line yAxisId="left" type="monotone" dataKey="clickRate" stroke="#10b981" strokeWidth={3} name="Taux de clic" />
            </ComposedChart>
          </ResponsiveContainer>
        </ModernCard>

        {/* Performance par type */}
        <ModernCard variant="elevated" hover>
          <div className="flex items-center mb-6">
            <div className="p-3 gradient-accent rounded-xl mr-3">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold gradient-text">Performance par Type</h3>
              <p className="text-sm text-slate-600">Comparaison des types de campagnes</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emailAnalytics.performanceByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="openRate" fill="#3b82f6" name="Taux d'ouverture" />
              <Bar dataKey="clickRate" fill="#10b981" name="Taux de clic" />
            </BarChart>
          </ResponsiveContainer>
        </ModernCard>
      </div>

      {/* Analyse détaillée des benchmarks */}
      <ModernCard variant="glass">
        <div className="flex items-center mb-6">
          <div className="p-3 gradient-primary rounded-xl mr-3">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold gradient-text">Comparaison Benchmarks Industrie</h3>
            <p className="text-sm text-slate-600">Performance vs. moyennes du secteur assurance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { metric: 'Taux d\'ouverture', actual: emailAnalytics.openRate, benchmark: emailAnalytics.benchmarks.openRate, unit: '%' },
            { metric: 'Taux de clic', actual: emailAnalytics.clickRate, benchmark: emailAnalytics.benchmarks.clickRate, unit: '%' },
            { metric: 'Taux de livraison', actual: emailAnalytics.deliveryRate, benchmark: emailAnalytics.benchmarks.deliveryRate, unit: '%' },
            { metric: 'Taux de rebond', actual: emailAnalytics.bounceRate, benchmark: emailAnalytics.benchmarks.bounceRate, unit: '%', reverse: true }
          ].map(({ metric, actual, benchmark, unit, reverse }) => {
            const status = reverse 
              ? getPerformanceStatus(benchmark, actual)
              : getPerformanceStatus(actual, benchmark)
            
            return (
              <div key={metric} className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-slate-600">{metric}</p>
                  <span className={`text-lg ${status.color}`}>{status.icon}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Actuel</span>
                    <span className="font-bold">{actual.toFixed(reverse && metric.includes('rebond') ? 2 : 1)}{unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Benchmark</span>
                    <span className="text-slate-600">{benchmark.toFixed(reverse && metric.includes('rebond') ? 2 : 1)}{unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${status.status === 'excellent' ? 'bg-green-500' : status.status === 'good' ? 'bg-blue-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min((actual / benchmark) * (reverse ? (200 - 100) : 100), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ModernCard>

      {/* Segmentation de la base de contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard variant="elevated">
          <div className="flex items-center mb-6">
            <Users className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Segmentation Contacts</h3>
              <p className="text-sm text-slate-600">Répartition de votre base de données</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{emailAnalytics.contactSegmentation.prospects}</p>
              <p className="text-sm text-slate-600">Prospects</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{emailAnalytics.contactSegmentation.clients}</p>
              <p className="text-sm text-slate-600">Clients</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{emailAnalytics.contactSegmentation.inactifs}</p>
              <p className="text-sm text-slate-600">Inactifs</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{emailAnalytics.contactSegmentation.total}</p>
              <p className="text-sm text-slate-600">Total</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="gradient">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Recommandations</h3>
              <p className="text-sm text-slate-600">Actions pour améliorer vos performances</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {emailAnalytics.openRate < emailAnalytics.benchmarks.openRate && (
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <p className="text-sm font-semibold text-yellow-800">Améliorer le taux d'ouverture</p>
                <p className="text-xs text-yellow-700">Optimisez vos objets d'emails et l'horaire d'envoi</p>
              </div>
            )}
            
            {emailAnalytics.clickRate < emailAnalytics.benchmarks.clickRate && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm font-semibold text-blue-800">Augmenter l'engagement</p>
                <p className="text-xs text-blue-700">Personnalisez davantage vos contenus et CTA</p>
              </div>
            )}
            
            {emailAnalytics.bounceRate > emailAnalytics.benchmarks.bounceRate && (
              <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                <p className="text-sm font-semibold text-red-800">Nettoyer la base de données</p>
                <p className="text-xs text-red-700">Supprimez les emails invalides pour améliorer la délivrabilité</p>
              </div>
            )}
            
            {emailAnalytics.healthScore >= 80 && (
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm font-semibold text-green-800">Excellente performance !</p>
                <p className="text-xs text-green-700">Continuez sur cette voie et testez de nouveaux formats</p>
              </div>
            )}
          </div>
        </ModernCard>
      </div>
    </div>
  )
}
