"use client"

import type React from "react"
import { useState, useMemo } from "react"
import type { DateRange } from "react-day-picker"
import type { Interaction, Contact, Projet, Contrat } from "../lib/types"
import { DateRangePicker } from "./ui/DateRangePicker"
import { CommercialAnalytics } from "./CommercialAnalytics"
import { AIAnalytics } from "./ai/AIAnalytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"

interface DashboardTabProps {
  stats: any
  clients: any[]
  projets: Projet[]
  contrats: Contrat[]
  segments: any[]
  workflows: any[]
  campaigns: any[]
  aiPredictions: any[]
  interactions: Interaction[]
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  stats,
  clients,
  projets: allProjets,
  contrats: allContrats,
  segments,
  workflows,
  campaigns,
  aiPredictions,
  interactions,
}) => {
  const [activeView, setActiveView] = useState("commercial")
  const [date, setDate] = useState<DateRange | undefined>()

  // Transformer les données pour le nouveau dashboard
  const allContacts = useMemo(() => clients as Contact[], [clients])

  const { contacts, projets, contrats } = useMemo(() => {
    if (!date?.from) {
      return { contacts: allContacts, projets: allProjets, contrats: allContrats }
    }
    const from = date.from
    const to = date.to || from

    const filteredContacts = allContacts.filter((c) => {
      if (!c.created_at) return false
      const contactDate = new Date(c.created_at)
      return contactDate >= from && contactDate <= to
    })
    const filteredProjets = allProjets.filter((p) => {
      if (!p.date_creation) return false
      const projetDate = new Date(p.date_creation)
      return projetDate >= from && projetDate <= to
    })
    const filteredContrats = allContrats.filter((c) => {
      if (!c.contrat_date_creation) return false
      const contratDate = new Date(c.contrat_date_creation)
      return contratDate >= from && contratDate <= to
    })

    return { contacts: filteredContacts, projets: filteredProjets, contrats: filteredContrats }
  }, [allContacts, allProjets, allContrats, date])

  // Calcul du nombre de mois dans la période sélectionnée
  const nbMois = useMemo(() => {
    if (date?.from && date?.to) {
      return (date.to.getFullYear() - date.from.getFullYear()) * 12 + date.to.getMonth() - date.from.getMonth() + 1
    }

    const allValidDates = [
      ...allProjets.map((p) => (p.date_creation ? new Date(p.date_creation) : null)),
      ...allContrats.map((c) => (c.contrat_date_creation ? new Date(c.contrat_date_creation) : null)),
    ].filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()))

    if (allValidDates.length < 2) return 1

    const minDate = new Date(Math.min(...allValidDates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...allValidDates.map((d) => d.getTime())))

    return (maxDate.getFullYear() - minDate.getFullYear()) * 12 + maxDate.getMonth() - minDate.getMonth() + 1
  }, [date, allProjets, allContrats])

  // Objectif individuel par mois
  const OBJECTIF_MENSUEL = 25000
  const objectifCommercial = OBJECTIF_MENSUEL * nbMois

  // Calculs KPI principaux
  const kpis = useMemo(() => {
    const totalContacts = contacts.length
    const totalProjets = projets.length
    const totalContrats = contrats.length

    // Taux de conversion global
    const tauxConversion = totalProjets > 0 ? (totalContrats / totalProjets) * 100 : 0

    // CA total et commissions basés sur prime_brute_annuelle
    const caTotal = contrats.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0)
    const commissions = contrats.reduce((sum, c) => sum + (c.commissionnement_annee1 || 0), 0)

    // Taux de joinabilité (excluant ne répond pas, perdu, inexploitable)
    const projetsJoinables = projets.filter(
      (p) =>
        p.statut !== "Ne répond pas" &&
        !p.statut?.toLowerCase().includes("perdu") &&
        !p.statut?.toLowerCase().includes("inexploitable"),
    )
    const tauxJoinabilite = totalProjets > 0 ? (projetsJoinables.length / totalProjets) * 100 : 0

    // Pipeline actuel
    const devisEnvoyes = projets.filter((p) => p.statut?.includes("Devis")).length
    const enCours = projets.filter((p) => p.statut?.includes("cours") || p.statut?.includes("traiter")).length

    // Performance par commercial
    const projetIdToCommercial = new Map(allProjets.map((p) => [p.projet_id, p.commercial || "Non assigné"]))

    // 1. Calculate all-time project counts
    const allTimeProjectCounts = new Map()
    allProjets.forEach((p) => {
      const commercial = p.commercial || "Non assigné"
      if (commercial !== "Non assigné") {
        allTimeProjectCounts.set(commercial, (allTimeProjectCounts.get(commercial) || 0) + 1)
      }
    })

    // 2. Calculate period-specific stats from filtered `contrats`
    const periodStats = new Map()
    contrats.forEach((contrat) => {
      if (contrat.projet_id) {
        const commercial = projetIdToCommercial.get(contrat.projet_id)
        if (commercial && commercial !== "Non assigné") {
          if (!periodStats.has(commercial)) {
            periodStats.set(commercial, { contrats: 0, ca: 0 })
          }
          const stats = periodStats.get(commercial)
          stats.contrats++
          stats.ca += contrat.prime_brute_annuelle || 0
        }
      }
    })

    // 3. Determine active commercials in the period from filtered `projets` and `contrats`
    const commercialsActiveInPeriod = new Set()
    projets.forEach((p) => {
      if (p.commercial) commercialsActiveInPeriod.add(p.commercial)
    })
    for (const commercial of periodStats.keys()) {
      commercialsActiveInPeriod.add(commercial)
    }

    // 4. Build the final stats list for active commercials
    const commerciauxStats = new Map()
    commercialsActiveInPeriod.forEach((commercial) => {
      const totalProjets = allTimeProjectCounts.get(commercial) || 0
      const { contrats: periodContrats, ca: periodCa } = periodStats.get(commercial) || { contrats: 0, ca: 0 }

      commerciauxStats.set(commercial, {
        projets: totalProjets,
        contrats: periodContrats,
        ca: periodCa,
      })
    })

    const topCommerciaux = Array.from(commerciauxStats.entries())
      .sort(([, a], [, b]) => b.ca - a.ca)
      .slice(0, 5)
      .map(([commercial, stats]) => ({
        commercial,
        stats,
        progressObjectif: Math.min((stats.ca / objectifCommercial) * 100, 100),
        ecartObjectif: stats.ca - objectifCommercial,
      }))

    // Analyse par produit/compagnie
    const produitsStats = new Map()
    contrats.forEach((contrat) => {
      const produit = contrat.contrat_produit || "Non spécifié"
      const compagnie = contrat.contrat_compagnie || "Non spécifiée"
      const key = `${produit} - ${compagnie}`

      if (!produitsStats.has(key)) {
        produitsStats.set(key, { count: 0, ca: 0, produit, compagnie })
      }
      produitsStats.get(key).count++
      produitsStats.get(key).ca += contrat.prime_brute_annuelle || 0
    })

    const topProduits = Array.from(produitsStats.entries())
      .sort(([, a], [, b]) => b.ca - a.ca)
      .slice(0, 5)

    return {
      totalContacts,
      totalProjets,
      totalContrats,
      tauxConversion,
      tauxJoinabilite,
      caTotal,
      commissions,
      devisEnvoyes,
      enCours,
      topCommerciaux,
      topProduits,
    }
  }, [contacts, projets, contrats, objectifCommercial, allProjets])

  return (
    <div className="space-y-6">
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Dashboard Commercial</h2>
              <p className="text-muted-foreground">KPIs, performances et analyses temps réel</p>
            </div>
            <DateRangePicker date={date} onSelect={setDate} />
          </div>
          <TabsList className="grid w-auto grid-cols-3">
            <TabsTrigger value="commercial">Performances Commerciales</TabsTrigger>
            <TabsTrigger value="analytics">Analyses Détaillées</TabsTrigger>
            <TabsTrigger value="ai">Assistant IA</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="commercial" className="space-y-6">
          {/* KPIs Principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              {
                title: "Contacts Total",
                value: kpis.totalContacts,
                icon: "fas fa-users",
                color: "from-blue-500 to-blue-600",
                change: "+12%",
              },
              {
                title: "Projets",
                value: kpis.totalProjets,
                icon: "fas fa-project-diagram",
                color: "from-green-500 to-green-600",
                change: "+8%",
              },
              {
                title: "Contrats Signés",
                value: kpis.totalContrats,
                icon: "fas fa-file-signature",
                color: "from-purple-500 to-purple-600",
                change: "+15%",
              },
              {
                title: "Taux Conversion",
                value: `${kpis.tauxConversion.toFixed(1)}%`,
                icon: "fas fa-percentage",
                color: "from-orange-500 to-orange-600",
                change: kpis.tauxConversion > 20 ? "+5%" : "-2%",
              },
              {
                title: "Taux Joinabilité",
                value: `${kpis.tauxJoinabilite.toFixed(1)}%`,
                icon: "fas fa-phone",
                color: "from-pink-500 to-pink-600",
                change: kpis.tauxJoinabilite > 70 ? "+3%" : "-1%",
              },
              {
                title: "CA Total",
                value: `€${(kpis.caTotal / 1000).toFixed(0)}k`,
                icon: "fas fa-euro-sign",
                color: "from-emerald-500 to-emerald-600",
                change: "+22%",
              },
            ].map((metric, index) => (
              <Card key={index} className="card-glow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}
                    >
                      <i className={`${metric.icon} text-white text-sm`}></i>
                    </div>
                    <Badge className={metric.change.startsWith("+") ? "metric-positive" : "metric-negative"}>
                      {metric.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-lg font-bold text-foreground">{metric.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top Commerciaux */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-trophy mr-2 text-yellow-600"></i>
                Top Commerciaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpis.topCommerciaux.map((item, index) => (
                  <div
                    key={item.commercial}
                    className="p-4 border border-border rounded-lg bg-gradient-to-r from-background to-muted/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                              : index === 1
                                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                : index === 2
                                  ? "bg-gradient-to-r from-orange-500 to-orange-600"
                                  : "bg-gradient-to-r from-blue-500 to-blue-600"
                          }`}
                        >
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-lg">{item.commercial}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.stats.projets} projets • {item.stats.contrats} contrats
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">€{(item.stats.ca / 1000).toFixed(0)}k</div>
                        <div className="text-sm text-muted-foreground">
                          {item.stats.projets > 0 ? ((item.stats.contrats / item.stats.projets) * 100).toFixed(1) : 0}%
                          conversion
                        </div>
                      </div>
                    </div>

                    {/* Progression vers objectif */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Objectif: €{(objectifCommercial / 1000).toFixed(0)}k
                        </span>
                        <span
                          className={`font-medium ${item.ecartObjectif >= 0 ? "text-green-600" : "text-orange-600"}`}
                        >
                          {item.ecartObjectif >= 0 ? "+" : ""}€{(item.ecartObjectif / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            item.progressObjectif >= 100
                              ? "bg-gradient-to-r from-green-500 to-green-600"
                              : item.progressObjectif >= 75
                                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                : "bg-gradient-to-r from-orange-500 to-orange-600"
                          }`}
                          style={{ width: `${Math.min(item.progressObjectif, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {item.progressObjectif.toFixed(1)}% de l'objectif atteint
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Produits & Compagnies */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-chart-pie mr-2 text-primary"></i>
                Top Produits & Compagnies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpis.topProduits.map(([key, stats], index) => (
                  <div key={key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <h4 className="font-semibold text-foreground">{stats.produit}</h4>
                      <p className="text-sm text-muted-foreground">{stats.compagnie}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">€{(stats.ca / 1000).toFixed(0)}k</div>
                      <div className="text-sm text-muted-foreground">{stats.count} contrats</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <CommercialAnalytics contacts={contacts} projets={projets} contrats={contrats} />
        </TabsContent>

        <TabsContent value="ai">
          <AIAnalytics contacts={contacts} projets={projets} contrats={contrats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { DashboardTab }

export default DashboardTab
