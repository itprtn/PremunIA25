import React, { useState, useMemo } from 'react'
import { ModernCard, StatCard } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { DateRangePicker } from '../ui/DateRangePicker'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Legend
} from 'recharts'
import { 
  Euro, TrendingUp, Target, Award, Calendar, FileText, Download, 
  Calculator, PiggyBank, BarChart3, Activity, Users, Building
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Contact, Projet, Contrat } from '../../lib/types'
import { CommissionService } from '../../lib/commission-service'

interface AdvancedCommissionAnalyticsProps {
  projets: Projet[]
  contrats: Contrat[]
  contacts: Contact[]
}

export function AdvancedCommissionAnalytics({ projets = [], contrats = [], contacts = [] }: AdvancedCommissionAnalyticsProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedPeriod, setSelectedPeriod] = useState('3m')
  const [selectedCommercial, setSelectedCommercial] = useState<string>('all')

  // Filtrage des données selon la période
  const filteredData = useMemo(() => {
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

    return { filteredContrats, filteredProjets }
  }, [contrats, projets, selectedPeriod])

  // Analyse des commissions avancée
  const commissionAnalytics = useMemo(() => {
    const { filteredContrats, filteredProjets } = filteredData

    // Utiliser votre service de commission fiable pour les calculs
    const contratsAvecCommissions = filteredContrats.map(contrat => {
      try {
        const commission = CommissionService.calculateCommissionForContract(
          contrat.contrat_compagnie || 'DEFAULT',
          contrat.prime_brute_mensuelle || 0
        )
        return {
          ...contrat,
          calculatedCommission: commission
        }
      } catch (error) {
        console.warn(`Erreur calcul commission pour contrat ${contrat.id}:`, error)
        return {
          ...contrat,
          calculatedCommission: null
        }
      }
    })

    // Calculs basés sur votre service de commission
    const totalCommissionsAnnee1 = contratsAvecCommissions.reduce((sum, c) => 
      sum + (c.calculatedCommission?.commission_annuelle_avec_retenue || c.commissionnement_annee1 || 0), 0)
    const totalCommissionsRecurrentes = contratsAvecCommissions.reduce((sum, c) => 
      sum + (c.calculatedCommission?.commission_recurrente_avec_retenue || c.commissionnement_autres_annees || 0), 0)
    const totalPrimesAnnuelles = contratsAvecCommissions.reduce((sum, c) => 
      sum + (c.calculatedCommission?.cotisation_annuelle || c.prime_brute_annuelle || 0), 0)
    const totalPrimesMensuelles = contratsAvecCommissions.reduce((sum, c) => 
      sum + (c.calculatedCommission?.cotisation_mensuelle || c.prime_brute_mensuelle || 0), 0)

    // Métriques avancées
    const nombreContrats = filteredContrats.length
    const revenuMoyenParContrat = nombreContrats > 0 ? totalCommissionsAnnee1 / nombreContrats : 0
    const tauxCommissionMoyen = totalPrimesAnnuelles > 0 ? (totalCommissionsAnnee1 / totalPrimesAnnuelles) * 100 : 0
    const potentielRecurrentTotal = totalCommissionsRecurrentes * 10 // 10 ans projection

    // Analyse par commercial avec les vraies commissions calculées
    const statsParCommercial = new Map()
    
    contratsAvecCommissions.forEach(contrat => {
      const projet = filteredProjets.find(p => p.projet_id === contrat.projet_id)
      const commercial = projet?.commercial || contrat.commercial || 'Non assigné'
      
      if (!statsParCommercial.has(commercial)) {
        statsParCommercial.set(commercial, {
          contrats: 0,
          commissionsAnnee1: 0,
          commissionsRecurrentes: 0,
          primes: 0,
          produits: new Set(),
          commissionsCalculees: 0,
          commissionsRecurrentesCalculees: 0
        })
      }

      const stats = statsParCommercial.get(commercial)
      stats.contrats++
      
      // Utiliser les commissions calculées par votre service ou fallback sur les données existantes
      const commissionAnnee1 = contrat.calculatedCommission?.commission_annuelle_avec_retenue || contrat.commissionnement_annee1 || 0
      const commissionRecurrente = contrat.calculatedCommission?.commission_recurrente_avec_retenue || contrat.commissionnement_autres_annees || 0
      const prime = contrat.calculatedCommission?.cotisation_annuelle || contrat.prime_brute_annuelle || 0
      
      stats.commissionsAnnee1 += commissionAnnee1
      stats.commissionsRecurrentes += commissionRecurrente
      stats.primes += prime
      stats.commissionsCalculees += (contrat.calculatedCommission ? 1 : 0)
      
      if (contrat.contrat_produit) stats.produits.add(contrat.contrat_produit)
    })

    // Top performers
    const topCommerciaux = Array.from(statsParCommercial.entries())
      .map(([commercial, stats]) => ({
        commercial,
        ...stats,
        produitsCount: stats.produits.size,
        tauxCommission: stats.primes > 0 ? (stats.commissionsAnnee1 / stats.primes) * 100 : 0,
        revenuMoyen: stats.contrats > 0 ? stats.commissionsAnnee1 / stats.contrats : 0,
        potentielRecurrent: stats.commissionsRecurrentes * 10
      }))
      .sort((a, b) => b.commissionsAnnee1 - a.commissionsAnnee1)

    // Analyse par compagnie avec les vraies commissions
    const statsParCompagnie = new Map()
    contratsAvecCommissions.forEach(contrat => {
      const compagnie = contrat.contrat_compagnie || 'Non spécifiée'
      if (!statsParCompagnie.has(compagnie)) {
        statsParCompagnie.set(compagnie, {
          contrats: 0,
          commissions: 0,
          primes: 0,
          produits: new Set(),
          commissionsCalculees: 0,
          tauxCalculReussi: 0
        })
      }
      const stats = statsParCompagnie.get(compagnie)
      stats.contrats++
      
      const commission = contrat.calculatedCommission?.commission_annuelle_avec_retenue || contrat.commissionnement_annee1 || 0
      const prime = contrat.calculatedCommission?.cotisation_annuelle || contrat.prime_brute_annuelle || 0
      
      stats.commissions += commission
      stats.primes += prime
      stats.commissionsCalculees += (contrat.calculatedCommission ? 1 : 0)
      
      if (contrat.contrat_produit) stats.produits.add(contrat.contrat_produit)
    })
    
    // Calculer le taux de succès des calculs par compagnie
    statsParCompagnie.forEach((stats) => {
      stats.tauxCalculReussi = stats.contrats > 0 ? (stats.commissionsCalculees / stats.contrats) * 100 : 0
    })

    const topCompagnies = Array.from(statsParCompagnie.entries())
      .map(([compagnie, stats]) => ({
        compagnie,
        ...stats,
        produitsCount: stats.produits.size,
        tauxCommission: stats.primes > 0 ? (stats.commissions / stats.primes) * 100 : 0
      }))
      .sort((a, b) => b.commissions - a.commissions)

    // Évolution mensuelle
    const evolutionMensuelle = new Map()
    filteredContrats.forEach(contrat => {
      const date = new Date(contrat.contrat_date_creation || contrat.created_at || Date.now())
      const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!evolutionMensuelle.has(moisKey)) {
        evolutionMensuelle.set(moisKey, {
          mois: moisKey,
          contrats: 0,
          commissions: 0,
          primes: 0
        })
      }
      
      const stats = evolutionMensuelle.get(moisKey)
      stats.contrats++
      stats.commissions += contrat.commissionnement_annee1 || 0
      stats.primes += contrat.prime_brute_annuelle || 0
    })

    const evolutionData = Array.from(evolutionMensuelle.values())
      .sort((a, b) => a.mois.localeCompare(b.mois))

    // Projections et tendances
    const derniersMois = evolutionData.slice(-3)
    const moyenneCommissions = derniersMois.reduce((sum, m) => sum + m.commissions, 0) / derniersMois.length
    const projectionAnnuelle = moyenneCommissions * 12
    const croissanceMensuelle = derniersMois.length >= 2 ? 
      ((derniersMois[derniersMois.length - 1].commissions - derniersMois[0].commissions) / derniersMois[0].commissions) * 100 : 0

    // Calculer le taux global de réussite des calculs
    const totalCommissionsCalculees = contratsAvecCommissions.filter(c => c.calculatedCommission !== null).length
    const tauxCalculReussi = nombreContrats > 0 ? (totalCommissionsCalculees / nombreContrats) * 100 : 0

    return {
      // Métriques principales
      totalCommissionsAnnee1,
      totalCommissionsRecurrentes,
      totalPrimesAnnuelles,
      nombreContrats,
      revenuMoyenParContrat,
      tauxCommissionMoyen,
      potentielRecurrentTotal,
      
      // Analyses détaillées
      topCommerciaux,
      topCompagnies,
      evolutionData,
      
      // Projections
      projectionAnnuelle,
      croissanceMensuelle,
      
      // Ratios avancés
      ratioCommissionPrime: totalPrimesAnnuelles > 0 ? (totalCommissionsAnnee1 / totalPrimesAnnuelles) : 0,
      valeurVieClient: revenuMoyenParContrat + (totalCommissionsRecurrentes / nombreContrats || 0) * 10,
      
      // Métriques de fiabilité
      tauxCalculReussi,
      totalCommissionsCalculees
    }
  }, [filteredData])

  // Fonction d'export PDF (placeholder)
  const exportToPDF = () => {
    // Ici on intégrerait une bibliothèque comme jsPDF ou react-pdf
    console.log('Export PDF des analytics commissions')
    alert('Fonctionnalité d\'export PDF à implémenter avec jsPDF')
  }

  // Fonction d'export Excel (placeholder)  
  const exportToExcel = () => {
    // Ici on intégrerait une bibliothèque comme xlsx
    console.log('Export Excel des analytics commissions')
    alert('Fonctionnalité d\'export Excel à implémenter avec XLSX')
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Analytics des Commissions</h2>
          <p className="text-slate-600">Tableau de bord complet des commissions d'assurance</p>
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

      {/* Alertes sur la fiabilité des données */}
      {commissionAnalytics.tauxCalculReussi < 90 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Attention :</strong> Seulement {commissionAnalytics.tauxCalculReussi?.toFixed(1)}% des commissions ont pu être calculées avec le CommissionService. 
                Les autres utilisent les données existantes en base.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard
          title="Commissions Année 1"
          value={`${(commissionAnalytics.totalCommissionsAnnee1 / 1000).toFixed(0)}k€`}
          change={{
            value: Math.abs(commissionAnalytics.croissanceMensuelle),
            type: commissionAnalytics.croissanceMensuelle >= 0 ? 'increase' : 'decrease'
          }}
          icon={<Euro className="w-5 h-5" />}
          variant="success"
          description="Revenus directs"
        />
        
        <StatCard
          title="Commissions Récurrentes"
          value={`${(commissionAnalytics.totalCommissionsRecurrentes / 1000).toFixed(0)}k€`}
          change={{ value: 0, type: 'neutral' }}
          icon={<PiggyBank className="w-5 h-5" />}
          variant="default"
          description="Revenus récurrents"
        />
        
        <StatCard
          title="Potentiel 10 ans"
          value={`${(commissionAnalytics.potentielRecurrentTotal / 1000).toFixed(0)}k€`}
          change={{ value: 0, type: 'neutral' }}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="warning"
          description="Projection long terme"
        />
        
        <StatCard
          title="Taux Commission Moyen"
          value={`${commissionAnalytics.tauxCommissionMoyen.toFixed(1)}%`}
          change={{ value: 0, type: 'neutral' }}
          icon={<Calculator className="w-5 h-5" />}
          variant="default"
          description="Commission / Primes"
        />
        
        <StatCard
          title="Revenu par Contrat"
          value={`${commissionAnalytics.revenuMoyenParContrat.toFixed(0)}€`}
          change={{ value: 0, type: 'neutral' }}
          icon={<Target className="w-5 h-5" />}
          variant="success"
          description="Moyenne par contrat"
        />
        
        <StatCard
          title="Nombre Contrats"
          value={commissionAnalytics.nombreContrats.toLocaleString()}
          change={{ value: 0, type: 'neutral' }}
          icon={<FileText className="w-5 h-5" />}
          variant="default"
          description="Contrats signés"
        />
        
        <StatCard
          title="Calculs Réussis"
          value={`${commissionAnalytics.tauxCalculReussi?.toFixed(1) || 0}%`}
          change={{ value: 0, type: 'neutral' }}
          icon={<Calculator className="w-5 h-5" />}
          variant={commissionAnalytics.tauxCalculReussi > 90 ? "success" : commissionAnalytics.tauxCalculReussi > 70 ? "warning" : "danger"}
          description="Via CommissionService"
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <ModernCard variant="glass" hover>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold gradient-text">Évolution des Commissions</h3>
              <p className="text-sm text-slate-600">Tendance mensuelle</p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {commissionAnalytics.croissanceMensuelle >= 0 ? '+' : ''}{commissionAnalytics.croissanceMensuelle.toFixed(1)}%
            </Badge>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={commissionAnalytics.evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'commissions' ? `${value.toLocaleString()}€` : value,
                  name === 'commissions' ? 'Commissions' : name === 'contrats' ? 'Contrats' : name
                ]}
              />
              <Legend />
              <Bar yAxisId="right" dataKey="contrats" fill="#10b981" name="Contrats" />
              <Line yAxisId="left" type="monotone" dataKey="commissions" stroke="#3b82f6" strokeWidth={3} name="Commissions" />
            </ComposedChart>
          </ResponsiveContainer>
        </ModernCard>

        {/* Top Compagnies */}
        <ModernCard variant="gradient" hover>
          <div className="flex items-center mb-6">
            <div className="p-3 gradient-primary rounded-xl mr-3">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold gradient-text">Performance par Compagnie</h3>
              <p className="text-sm text-slate-600">Ranking des assureurs</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {commissionAnalytics.topCompagnies.slice(0, 5).map((compagnie, index) => (
              <div key={compagnie.compagnie} className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{compagnie.compagnie}</p>
                    <p className="text-xs text-slate-600">{compagnie.contrats} contrats • {compagnie.produitsCount} produits</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{(compagnie.commissions / 1000).toFixed(0)}k€</p>
                  <p className="text-xs text-slate-600">{compagnie.tauxCommission.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      </div>

      {/* Top Commerciaux détaillé */}
      <ModernCard variant="elevated" hover>
        <div className="flex items-center mb-6">
          <div className="p-3 gradient-accent rounded-xl mr-3">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold gradient-text">Performance des Commerciaux</h3>
            <p className="text-sm text-slate-600">Analyse détaillée par commercial</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold">#</th>
                <th className="text-left py-3 px-4 font-semibold">Commercial</th>
                <th className="text-right py-3 px-4 font-semibold">Contrats</th>
                <th className="text-right py-3 px-4 font-semibold">Commissions</th>
                <th className="text-right py-3 px-4 font-semibold">Revenu Moyen</th>
                <th className="text-right py-3 px-4 font-semibold">Taux Commission</th>
                <th className="text-right py-3 px-4 font-semibold">Potentiel 10 ans</th>
                <th className="text-right py-3 px-4 font-semibold">Produits</th>
              </tr>
            </thead>
            <tbody>
              {commissionAnalytics.topCommerciaux.map((commercial, index) => (
                <tr key={commercial.commercial} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      #{index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold">{commercial.commercial}</td>
                  <td className="text-right py-3 px-4">{commercial.contrats}</td>
                  <td className="text-right py-3 px-4 font-bold text-green-600">
                    {(commercial.commissionsAnnee1 / 1000).toFixed(0)}k€
                  </td>
                  <td className="text-right py-3 px-4">{commercial.revenuMoyen.toFixed(0)}€</td>
                  <td className="text-right py-3 px-4">{commercial.tauxCommission.toFixed(1)}%</td>
                  <td className="text-right py-3 px-4 text-purple-600 font-semibold">
                    {(commercial.potentielRecurrent / 1000).toFixed(0)}k€
                  </td>
                  <td className="text-right py-3 px-4">
                    <Badge variant="outline">{commercial.produitsCount}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ModernCard>

      {/* Projections et Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModernCard variant="glass">
          <div className="flex items-center mb-4">
            <Activity className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold">Projections Annuelles</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-slate-700">Projection CA Annuel</span>
              <span className="font-bold text-blue-600">
                {(commissionAnalytics.projectionAnnuelle / 1000).toFixed(0)}k€
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-slate-700">Croissance Mensuelle</span>
              <span className="font-bold text-green-600">
                {commissionAnalytics.croissanceMensuelle >= 0 ? '+' : ''}{commissionAnalytics.croissanceMensuelle.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-slate-700">Valeur Vie Client</span>
              <span className="font-bold text-purple-600">
                {commissionAnalytics.valeurVieClient.toFixed(0)}€
              </span>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="gradient">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold">Ratios Clés</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Ratio Commission/Prime</span>
                <span>{(commissionAnalytics.ratioCommissionPrime * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(commissionAnalytics.ratioCommissionPrime * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-slate-600 mb-2">Performance Globale</p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Excellente performance</span>
              </div>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  )
}
