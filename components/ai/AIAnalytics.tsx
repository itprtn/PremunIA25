"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import type { Contact, Projet, Contrat } from "../../lib/types"

interface AIAnalyticsProps {
  contacts: Contact[]
  projets: Projet[]
  contrats: Contrat[]
}

export function AIAnalytics({ contacts, projets, contrats }: AIAnalyticsProps) {
  // Analyses IA simulées
  const aiInsights = useMemo(() => {
    // Analyse prédictive des contacts
    const contactsAnalysis = contacts
      .map((contact) => {
        const contactProjets = projets.filter((p) => p.contact_id === contact.id)
        const contactContrats = contrats.filter((c) => contactProjets.some((p) => p.id === c.projet_id))

        // Score de probabilité de conversion (simulé)
        let conversionScore = 50
        if (contactProjets.length > 0) conversionScore += 20
        if (contactContrats.length > 0) conversionScore += 30
        if (contact.type === "Professionnel") conversionScore += 10
        if (contact.statut === "Actif") conversionScore += 15

        return {
          ...contact,
          conversionScore: Math.min(conversionScore, 95),
          projetsCount: contactProjets.length,
          contratsCount: contactContrats.length,
        }
      })
      .sort((a, b) => b.conversionScore - a.conversionScore)

    // Recommandations IA
    const recommendations = [
      {
        id: 1,
        type: "opportunity",
        title: "Opportunité de cross-selling",
        description: "Clients avec assurance auto uniquement - potentiel habitation",
        priority: "high",
        impact: "Revenus potentiels: €45k",
        action: "Contacter 12 clients identifiés",
        confidence: 87,
      },
      {
        id: 2,
        type: "retention",
        title: "Risque de churn détecté",
        description: "3 clients à forte valeur montrent des signaux de départ",
        priority: "urgent",
        impact: "Risque de perte: €23k",
        action: "Appel de rétention immédiat",
        confidence: 92,
      },
      {
        id: 3,
        type: "optimization",
        title: "Optimisation du pipeline",
        description: "Projets en stagnation depuis plus de 30 jours",
        priority: "medium",
        impact: "Accélération possible: 15%",
        action: "Relance ciblée de 8 prospects",
        confidence: 78,
      },
      {
        id: 4,
        type: "market",
        title: "Tendance marché favorable",
        description: "Augmentation de la demande en assurance santé",
        priority: "medium",
        impact: "Croissance potentielle: 25%",
        action: "Campagne marketing ciblée",
        confidence: 83,
      },
    ]

    // Prédictions de performance
    const predictions = {
      nextMonthCA: contrats.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0) * 1.12,
      nextMonthContrats: Math.ceil(contrats.length * 1.08),
      quarterlyGrowth: 18.5,
      yearlyProjection: contrats.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0) * 1.35,
    }

    return {
      topProspects: contactsAnalysis.slice(0, 10),
      recommendations,
      predictions,
    }
  }, [contacts, projets, contrats])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return "fas fa-bullseye"
      case "retention":
        return "fas fa-shield-alt"
      case "optimization":
        return "fas fa-cogs"
      case "market":
        return "fas fa-chart-line"
      default:
        return "fas fa-lightbulb"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">Assistant IA & Analyses Prédictives</h3>
        <p className="text-muted-foreground">Insights intelligents et recommandations automatisées</p>
      </div>

      {/* Prédictions clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-crystal-ball text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prédiction CA Mois Prochain</p>
                <p className="text-lg font-bold text-foreground">
                  €{(aiInsights.predictions.nextMonthCA / 1000).toFixed(0)}k
                </p>
                <Badge className="bg-purple-100 text-purple-800">+12% prévu</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-robot text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contrats Prévus</p>
                <p className="text-lg font-bold text-foreground">{aiInsights.predictions.nextMonthContrats}</p>
                <Badge className="bg-blue-100 text-blue-800">+8% prévu</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-trending-up text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Croissance Trimestrielle</p>
                <p className="text-lg font-bold text-foreground">{aiInsights.predictions.quarterlyGrowth}%</p>
                <Badge className="bg-green-100 text-green-800">Excellente</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-calendar-check text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projection Annuelle</p>
                <p className="text-lg font-bold text-foreground">
                  €{(aiInsights.predictions.yearlyProjection / 1000).toFixed(0)}k
                </p>
                <Badge className="bg-orange-100 text-orange-800">+35% vs N-1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-brain mr-2 text-purple-600"></i>
            Recommandations IA Prioritaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <i className={`${getTypeIcon(rec.type)} text-white text-sm`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {rec.confidence}% confiance
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Impact Estimé</p>
                    <p className="text-xs text-green-600">{rec.impact}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Action Recommandée</p>
                    <p className="text-xs text-blue-600">{rec.action}</p>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <Button size="sm" variant="outline">
                    <i className="fas fa-play mr-2"></i>
                    Appliquer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Prospects IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-target mr-2 text-green-600"></i>
            Top Prospects (Score IA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiInsights.topProspects.slice(0, 8).map((prospect, index) => (
              <div key={prospect.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      prospect.conversionScore >= 80
                        ? "bg-green-500"
                        : prospect.conversionScore >= 60
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {prospect.prenom} {prospect.nom}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {prospect.type} • {prospect.statut}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-600">{prospect.projetsCount}</div>
                    <div className="text-xs text-muted-foreground">Projets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-green-600">{prospect.contratsCount}</div>
                    <div className="text-xs text-muted-foreground">Contrats</div>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Score IA</span>
                      <span className="font-bold">{prospect.conversionScore}%</span>
                    </div>
                    <Progress value={prospect.conversionScore} className="h-2" />
                  </div>
                  <Button size="sm" variant="outline">
                    <i className="fas fa-phone mr-1"></i>
                    Contacter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
