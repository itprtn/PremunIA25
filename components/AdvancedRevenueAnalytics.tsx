import React, { useState, useMemo } from 'react'
import { ModernCard, StatCard } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Legend, FunnelChart, Funnel, LabelList
} from 'recharts'
import { 
  Euro, TrendingUp, Target, Activity, Calendar, FileText, Download, 
  DollarSign, Percent, Users, BarChart3, Building2, Zap, Timer, TrendingDown
} from 'lucide-react'
import { Contact, Projet, Contrat } from '../../lib/types'

interface AdvancedRevenueAnalyticsProps {
  projets: Projet[]
  contrats: Contrat[]
  contacts: Contact[]
}

export function AdvancedRevenueAnalytics({ projets = [], contrats = [], contacts = [] }: AdvancedRevenueAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('3m')
  const [selectedSegment, setSelectedSegment] = useState<string>('all')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  // Analytics des revenus avancés
  const revenueAnalytics = useMemo(() => {
    let startDate = new Date()
    
    switch(selectedPeriod) {
      case '1m': startDate.setMonth(startDate.getMonth() - 1); break
      case '3m': startDate.setMonth(startDate.getMonth() - 3); break
      case '6m': startDate.setMonth(startDate.getMonth() - 6); break
      case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break
      case 'ytd': startDate = new Date(startDate.getFullYear(), 0, 1); break
    }

    const filteredContrats = contrats.filter(c => {
      const dateContrat = new Date(c.contrat_date_creation || c.created_at || Date.now())
      return dateContrat >= startDate
    })

    const filteredProjets = projets.filter(p => {
      const dateProjet = new Date(p.date_creation || p.created_at || Date.now())
      return dateProjet >= startDate
    })

    // Calculs de base
    const totalRevenuePrimes = filteredContrats.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0)
    const totalCommissions = filteredContrats.reduce((sum, c) => sum + (c.commissionnement_annee1 || 0), 0)
    const totalCommissionsRecurrentes = filteredContrats.reduce((sum, c) => sum + (c.commissionnement_autres_annees || 0), 0)
    const nombreContrats = filteredContrats.length
    const nombreProjets = filteredProjets.length

    // Métriques avancées
    const revenueMoyenParContrat = nombreContrats > 0 ? totalRevenuePrimes / nombreContrats : 0
    const commissionMoyenneParContrat = nombreContrats > 0 ? totalCommissions / nombreContrats : 0
    const tauxConversion = nombreProjets > 0 ? (nombreContrats / nombreProjets) * 100 : 0
    const panicMoyen = filteredContrats.length > 0 
      ? filteredContrats.reduce((sum, c) => sum + (c.prime_brute_mensuelle || 0), 0) / filteredContrats.length
      : 0

    // Analyse par compagnie
    const revenueParCompagnie = new Map()
    filteredContrats.forEach(contrat => {
      const compagnie = contrat.contrat_compagnie || 'Non spécifiée'
      if (!revenueParCompagnie.has(compagnie)) {
        revenueParCompagnie.set(compagnie, {
          revenus: 0,
          commissions: 0,
          contrats: 0,
          primeMoyenne: 0,
          produits: new Set()
        })
      }
      const stats = revenueParCompagnie.get(compagnie)
      stats.revenus += contrat.prime_brute_annuelle || 0
      stats.commissions += contrat.commissionnement_annee1 || 0
      stats.contrats++
      if (contrat.contrat_produit) stats.produits.add(contrat.contrat_produit)
    })

    // Calculer prime moyenne pour chaque compagnie
    revenueParCompagnie.forEach((stats) => {
      stats.primeMoyenne = stats.contrats > 0 ? stats.revenus / stats.contrats : 0
      stats.produitsCount = stats.produits.size
    })

    const topCompagnies = Array.from(revenueParCompagnie.entries())
      .map(([compagnie, stats]) => ({
        compagnie,
        ...stats
      }))
      .sort((a, b) => b.revenus - a.revenus)

    // Analyse par produit
    const revenueParProduit = new Map()
    filteredContrats.forEach(contrat => {
      const produit = contrat.contrat_produit || 'Non spécifié'
      if (!revenueParProduit.has(produit)) {
        revenueParProduit.set(produit, {
          revenus: 0,
          commissions: 0,
          contrats: 0,
          compagnies: new Set()
        })
      }
      const stats = revenueParProduit.get(produit)
      stats.revenus += contrat.prime_brute_annuelle || 0
      stats.commissions += contrat.commissionnement_annee1 || 0
      stats.contrats++
      if (contrat.contrat_compagnie) stats.compagnies.add(contrat.contrat_compagnie)
    })

    const topProduits = Array.from(revenueParProduit.entries())
      .map(([produit, stats]) => ({
        produit,
        ...stats,
        compagniesCount: stats.compagnies.size
      }))
      .sort((a, b) => b.revenus - a.revenus)

    // Évolution mensuelle des revenus
    const evolutionMensuelle = new Map()
    filteredContrats.forEach(contrat => {
      const date = new Date(contrat.contrat_date_creation || contrat.created_at || Date.now())
      const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!evolutionMensuelle.has(moisKey)) {
        evolutionMensuelle.set(moisKey, {
          mois: moisKey,
          revenus: 0,
          commissions: 0,
          contrats: 0,
          primeMoyenne: 0
        })
      }
      
      const stats = evolutionMensuelle.get(moisKey)
      stats.revenus += contrat.prime_brute_annuelle || 0
      stats.commissions += contrat.commissionnement_annee1 || 0
      stats.contrats++
    })

    // Calculer prime moyenne mensuelle
    evolutionMensuelle.forEach((stats) => {
      stats.primeMoyenne = stats.contrats > 0 ? stats.revenus / stats.contrats : 0
    })

    const evolutionData = Array.from(evolutionMensuelle.values())
      .sort((a, b) => a.mois.localeCompare(b.mois))

    // Projections et tendances
    const derniersMois = evolutionData.slice(-3)
    const moyenneRevenus = derniersMois.length > 0 
      ? derniersMois.reduce((sum, m) => sum + m.revenus, 0) / derniersMois.length
      : 0
    const projectionAnnuelle = moyenneRevenus * 12
    const croissanceRevenue = derniersMois.length >= 2 ? 
      ((derniersMois[derniersMois.length - 1].revenus - derniersMois[0].revenus) / Math.max(derniersMois[0].revenus, 1)) * 100 : 0

    // Funnel de conversion
    const totalProspects = contacts.filter(c => c.statut === 'Prospect').length
    const totalClients = contacts.filter(c => c.statut === 'Client').length
    const funnelData = [
      { name: 'Prospects', value: totalProspects, fill: '#3b82f6' },
      { name: 'Projets', value: nombreProjets, fill: '#10b981' },
      { name: 'Contrats', value: nombreContrats, fill: '#f59e0b' },
      { name: 'Clients', value: totalClients, fill: '#ef4444' }
    ]

    // Analyse saisonnière (par trimestre)
    const revenueParTrimestre = new Map()
    filteredContrats.forEach(contrat => {
      const date = new Date(contrat.contrat_date_creation || contrat.created_at || Date.now())
      const trimestre = `T${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`
      
      if (!revenueParTrimestre.has(trimestre)) {
        revenueParTrimestre.set(trimestre, { revenus: 0, contrats: 0 })
      }
      const stats = revenueParTrimestre.get(trimestre)
      stats.revenus += contrat.prime_brute_annuelle || 0
      stats.contrats++
    })

    const saisonData = Array.from(revenueParTrimestre.entries())
      .map(([trimestre, stats]) => ({
        trimestre,
        revenus: stats.revenus,
        contrats: stats.contrats
      }))
      .sort((a, b) => a.trimestre.localeCompare(b.trimestre))

    // Analyse de la rentabilité
    const margeGlobale = totalRevenuePrimes > 0 ? (totalCommissions / totalRevenuePrimes) * 100 : 0
    const potentielRecurrent = totalCommissionsRecurrentes * 10 // projection 10 ans
    const valorisationPortefeuille = totalRevenuePrimes + potentielRecurrent

    // Benchmarks et objectifs
    const objectifMensuel = 50000 // objectif de revenus mensuel
    const performanceVsObjectif = moyenneRevenus > 0 ? (moyenneRevenus / objectifMensuel) * 100 : 0

    return {
      // Métriques principales
      totalRevenuePrimes,
      totalCommissions,
      totalCommissionsRecurrentes,
      nombreContrats,
      nombreProjets,
      
      // Métriques avancées
      revenueMoyenParContrat,
      commissionMoyenneParContrat,
      tauxConversion,
      panicMoyen,
      margeGlobale,
      potentielRecurrent,
      valorisationPortefeuille,
      
      // Analyses détaillées
      topCompagnies,
      topProduits,
      evolutionData,
      funnelData,
      saisonData,
      
      // Projections
      projectionAnnuelle,
      croissanceRevenue,
      performanceVsObjectif,
      
      // Insights
      meilleurMois: evolutionData.length > 0 
        ? evolutionData.reduce((max, curr) => curr.revenus > max.revenus ? curr : max)
        : null,
      tendanceGenerale: croissanceRevenue >= 5 ? 'positive' : croissanceRevenue >= -5 ? 'stable' : 'negative'
    }
  }, [contrats, projets, contacts, selectedPeriod])

  // Fonction d'export PDF
  const exportToPDF = () => {
    console.log('Export PDF des analytics revenus')
    alert('Fonctionnalité d\'export PDF à implémenter')
  }

  // Fonction d'export Excel  
  const exportToExcel = () => {
    console.log('Export Excel des analytics revenus')
    alert('Fonctionnalité d\'export Excel à implémenter')
  }

  const getTendanceColor = (tendance: string) => {
    switch(tendance) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'stable': return 'text-blue-600 bg-blue-100'
      case 'negative': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTendanceIcon = (tendance: string) => {
    switch(tendance) {
      case 'positive': return <TrendingUp className="w-5 h-5" />
      case 'stable': return <Activity className="w-5 h-5" />
      case 'negative': return <TrendingDown className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Analytics des Revenus</h2>
          <p className="text-slate-600">Analyse complète des revenus et de la rentabilité</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Dernier mois</SelectItem>
              <SelectItem value="3m">3 derniers mois</SelectItem>
              <SelectItem value="6m">6 derniers mois</SelectItem>
              <SelectItem value="1y">12 derniers mois</SelectItem>
              <SelectItem value="ytd">Année en cours</SelectItem>
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

      {/* Indicateur de tendance globale */}
      <ModernCard variant="gradient" hover>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-xl mr-4 ${getTendanceColor(revenueAnalytics.tendanceGenerale)}`}>
              {getTendanceIcon(revenueAnalytics.tendanceGenerale)}
            </div>
            <div>
              <h3 className="text-2xl font-bold">Tendance des Revenus</h3>
              <p className="text-slate-600">
                Croissance de {revenueAnalytics.croissanceRevenue >= 0 ? '+' : ''}{revenueAnalytics.croissanceRevenue.toFixed(1)}% 
                sur les derniers mois
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {(revenueAnalytics.projectionAnnuelle / 1000).toFixed(0)}k€
            </div>
            <p className="text-sm text-slate-600">Projection annuelle</p>
          </div>
        </div>
      </ModernCard>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          title="Revenus Totaux"
          value={`${(revenueAnalytics.totalRevenuePrimes / 1000).toFixed(0)}k€`}
          change={{
            value: Math.abs(revenueAnalytics.croissanceRevenue),
            type: revenueAnalytics.croissanceRevenue >= 0 ? 'increase' : 'decrease'
          }}
          icon={<Euro className="w-5 h-5" />}
          variant="success"
          description="Primes annuelles"
        />
        
        <StatCard
          title="Commissions"
          value={`${(revenueAnalytics.totalCommissions / 1000).toFixed(0)}k€`}
          change={{ value: 0, type: 'neutral' }}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
          description="Première année"
        />
        
        <StatCard
          title="Marge Moyenne"
          value={`${revenueAnalytics.margeGlobale.toFixed(1)}%`}
          change={{ value: 0, type: 'neutral' }}
          icon={<Percent className="w-5 h-5" />}
          variant="warning"
          description="Commission/Prime"
        />
        
        <StatCard
          title="Revenu par Contrat"
          value={`${revenueAnalytics.revenueMoyenParContrat.toFixed(0)}€`}
          change={{ value: 0, type: 'neutral' }}
          icon={<Target className="w-5 h-5" />}
          variant="default"
          description="Prime moyenne"
        />
        
        <StatCard
          title="Taux de Conversion"
          value={`${revenueAnalytics.tauxConversion.toFixed(1)}%`}
          change={{ value: 0, type: 'neutral' }}
          icon={<Users className="w-5 h-5" />}
          variant="default"
          description="Projets → Contrats"
        />
        
        <StatCard
          title="Potentiel Récurrent"
          value={`${(revenueAnalytics.potentielRecurrent / 1000).toFixed(0)}k€`}
          change={{ value: 0, type: 'neutral' }}
          icon={<Zap className="w-5 h-5" />}
          variant="success"
          description="Projection 10 ans"
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des revenus */}
        <ModernCard variant="glass" hover>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold gradient-text">Évolution des Revenus</h3>
              <p className="text-sm text-slate-600">Tendance mensuelle des primes et commissions</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {revenueAnalytics.croissanceRevenue >= 0 ? '+' : ''}{revenueAnalytics.croissanceRevenue.toFixed(1)}%
            </Badge>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={revenueAnalytics.evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()}€`,
                  name === 'revenus' ? 'Revenus' : name === 'commissions' ? 'Commissions' : name
                ]}
              />
              <Legend />
              <Area yAxisId="left" dataKey="revenus" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Revenus" />
              <Line yAxisId="left" type="monotone" dataKey="commissions" stroke="#10b981" strokeWidth={3} name="Commissions" />
              <Bar yAxisId="right" dataKey="contrats" fill="#f59e0b" name="Contrats" />
            </ComposedChart>
          </ResponsiveContainer>
        </ModernCard>

        {/* Funnel de conversion */}
        <ModernCard variant="elevated" hover>
          <div className="flex items-center mb-6">
            <div className="p-3 gradient-accent rounded-xl mr-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold gradient-text">Funnel de Conversion</h3>
              <p className="text-sm text-slate-600">Parcours prospects → clients</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {revenueAnalytics.funnelData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="font-semibold">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.value}</div>
                  {index > 0 && revenueAnalytics.funnelData[index - 1].value > 0 && (
                    <div className="text-xs text-slate-600">
                      {((item.value / revenueAnalytics.funnelData[index - 1].value) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      </div>

      {/* Analyse par compagnie */}
      <ModernCard variant="glass">
        <div className="flex items-center mb-6">
          <div className="p-3 gradient-primary rounded-xl mr-3">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold gradient-text">Performance par Compagnie</h3>
            <p className="text-sm text-slate-600">Revenus et rentabilité par assureur</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold">Compagnie</th>
                <th className="text-right py-3 px-4 font-semibold">Revenus</th>
                <th className="text-right py-3 px-4 font-semibold">Commissions</th>
                <th className="text-right py-3 px-4 font-semibold">Contrats</th>
                <th className="text-right py-3 px-4 font-semibold">Prime Moyenne</th>
                <th className="text-right py-3 px-4 font-semibold">Marge %</th>
                <th className="text-right py-3 px-4 font-semibold">Produits</th>
              </tr>
            </thead>
            <tbody>
              {revenueAnalytics.topCompagnies.slice(0, 8).map((compagnie, index) => (
                <tr key={compagnie.compagnie} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold">{compagnie.compagnie}</td>
                  <td className="text-right py-3 px-4 font-bold text-green-600">
                    {(compagnie.revenus / 1000).toFixed(0)}k€
                  </td>
                  <td className="text-right py-3 px-4">
                    {(compagnie.commissions / 1000).toFixed(0)}k€
                  </td>
                  <td className="text-right py-3 px-4">{compagnie.contrats}</td>
                  <td className="text-right py-3 px-4">{compagnie.primeMoyenne.toFixed(0)}€</td>
                  <td className="text-right py-3 px-4">
                    {compagnie.revenus > 0 ? ((compagnie.commissions / compagnie.revenus) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="text-right py-3 px-4">
                    <Badge variant="outline">{compagnie.produitsCount}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ModernCard>

      {/* Analyse saisonnière et projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard variant="elevated">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Analyse Saisonnière</h3>
              <p className="text-sm text-slate-600">Performance par trimestre</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueAnalytics.saisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="trimestre" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()}€`} />
              <Bar dataKey="revenus" fill="#3b82f6" name="Revenus" />
            </BarChart>
          </ResponsiveContainer>
        </ModernCard>

        <ModernCard variant="gradient">
          <div className="flex items-center mb-6">
            <Target className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Projections & Objectifs</h3>
              <p className="text-sm text-slate-600">Performance vs objectifs</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/70 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-700">Performance vs Objectif</span>
                <span className={`font-bold ${revenueAnalytics.performanceVsObjectif >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  {revenueAnalytics.performanceVsObjectif.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${revenueAnalytics.performanceVsObjectif >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                  style={{ width: `${Math.min(revenueAnalytics.performanceVsObjectif, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {(revenueAnalytics.projectionAnnuelle / 1000).toFixed(0)}k€
                </p>
                <p className="text-sm text-slate-600">Projection annuelle</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {(revenueAnalytics.valorisationPortefeuille / 1000).toFixed(0)}k€
                </p>
                <p className="text-sm text-slate-600">Valorisation portefeuille</p>
              </div>
            </div>
            
            {revenueAnalytics.meilleurMois && (
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm font-semibold text-green-800">Meilleur mois</p>
                <p className="text-xs text-green-700">
                  {revenueAnalytics.meilleurMois.mois}: {(revenueAnalytics.meilleurMois.revenus / 1000).toFixed(0)}k€
                </p>
              </div>
            )}
          </div>
        </ModernCard>
      </div>
    </div>
  )
}
