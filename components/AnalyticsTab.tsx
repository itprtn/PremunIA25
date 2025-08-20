import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts"
import { 
  TrendingUp, Users, Mail, MousePointer, DollarSign, 
  Calendar, Target, Award, Activity, BarChart3
} from "lucide-react"
import { CommercialAnalytics } from './CommercialAnalytics'
import { OriginAnalytics } from './analytics/OriginAnalytics'

interface AnalyticsTabProps {
  stats: any
  campaigns: any[]
  clients: any[]
  analyticsData: any
  contacts: any[]
  projets: any[]
  contrats: any[]
}

const overviewData = [
  {
    label: "Chiffre d'affaires Total",
    value: "12,450€",
    change: "+19%",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: DollarSign,
  },
  {
    label: "Taux de Conversion",
    value: "3.2%",
    change: "+2.1%",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
    icon: TrendingUp,
  },
  {
    label: "Campagnes Actives",
    value: "14",
    change: "-5%",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    icon: Mail,
  },
  {
    label: "ROI Moyen",
    value: "285%",
    change: "+7%",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    icon: MousePointer,
  },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function AnalyticsTab({ 
  stats, 
  campaigns, 
  clients, 
  analyticsData, 
  contacts, 
  projets, 
  contrats 
}: AnalyticsTabProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics & Insights</h2>
          <p className="text-muted-foreground mt-2">
            Analyse approfondie des performances marketing et commerciales
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            En temps réel
          </Badge>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="origins" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Analyse Origines</span>
          </TabsTrigger>
          <TabsTrigger value="commercial" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Performance Commerciale</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Campagnes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overviewData.map((metric, index) => (
              <Card key={index} className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                      <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">{metric.change}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Trend Chart */}
          <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Évolution du Chiffre d'Affaires</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Campaigns */}
          <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Top Campagnes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topCampaigns.length > 0 ? (
                  analyticsData.topCampaigns.map((campaign: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                      <div>
                        <h3 className="font-medium">{campaign.nom}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{campaign.tracking_stats?.ouvertures || 0} ouvertures</p>
                        <p className="text-sm text-muted-foreground">{campaign.tracking_stats?.clics || 0} clics</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune campagne disponible</p>
                    <p className="text-sm">Créez votre première campagne pour voir les statistiques</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="origins">
          <OriginAnalytics 
            originData={analyticsData.originAnalytics || []}
            commercialData={analyticsData.commercialAnalytics || []}
          />
        </TabsContent>

        <TabsContent value="commercial">
          <CommercialAnalytics 
            contacts={contacts} 
            projets={projets} 
            contrats={contrats} 
          />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Campaign Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Performance des Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Ensure segmentPerformance is an array before mapping */}
                  {Array.isArray(analyticsData.segmentPerformance) && analyticsData.segmentPerformance.length > 0 ? (
                    analyticsData.segmentPerformance.map((segment: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <span className="font-medium">{segment.name}</span>
                        <Badge>{segment.performance}%</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Aucune donnée de segment disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Insights IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(analyticsData.aiInsights) && analyticsData.aiInsights.length > 0 ? (
                    analyticsData.aiInsights.map((insight: any, index: number) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Activity className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-900">{insight.title}</h4>
                            <p className="text-sm text-purple-700 mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Analyse IA en cours...</p>
                      <p className="text-sm">Les insights seront disponibles bientôt</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
