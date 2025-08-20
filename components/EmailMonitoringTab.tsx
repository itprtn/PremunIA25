"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { supabase, supabaseUrl, supabaseAnonKey } from "../lib/supabase"

interface EmailMonitoringTabProps {
  campaigns: any[]
}

interface QueueStats {
  pending: number
  processing: number
  sent: number
  failed: number
  total: number
}

interface RealtimeEmail {
  id: number
  email_destinataire: string
  sujet: string
  statut: string
  created_at: string
  sent_at?: string
  error_message?: string
  campagne_id?: number
}

export function EmailMonitoringTab({ campaigns }: EmailMonitoringTabProps) {
  const [queueStats, setQueueStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    sent: 0,
    failed: 0,
    total: 0,
  })
  const [realtimeEmails, setRealtimeEmails] = useState<RealtimeEmail[]>([])
  const [campaignStats, setCampaignStats] = useState<any>({})
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h")
  const [isProcessing, setIsProcessing] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadMonitoringData()

    // Auto-refresh every 10 seconds
    const interval = setInterval(loadMonitoringData, 10000)
    setRefreshInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [selectedTimeframe])

  const loadMonitoringData = async () => {
    try {
      await Promise.all([loadQueueStats(), loadRealtimeEmails(), loadCampaignStats()])
    } catch (error) {
      console.error("Error loading monitoring data:", error)
    }
  }

  const loadQueueStats = async () => {
    try {
      const { data: queueData, error } = await supabase.from("email_queue").select("statut")

      if (error) throw error

      const stats = {
        pending: 0,
        processing: 0,
        sent: 0,
        failed: 0,
        total: queueData?.length || 0,
      }

      queueData?.forEach((item) => {
        if (item.statut in stats) {
          stats[item.statut as keyof QueueStats]++
        }
      })

      setQueueStats(stats)
    } catch (error) {
      console.error("Error loading queue stats:", error)
    }
  }

  const loadRealtimeEmails = async () => {
    try {
      const timeFilter = getTimeFilter(selectedTimeframe)

      const { data: emailData, error } = await supabase
        .from("email_queue")
        .select("id, email_destinataire, sujet, statut, created_at, sent_at, error_message, campagne_id")
        .gte("created_at", timeFilter)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      setRealtimeEmails(emailData || [])
    } catch (error) {
      console.error("Error loading realtime emails:", error)
    }
  }

  const loadCampaignStats = async () => {
    try {
      const stats: any = {}

      for (const campaign of campaigns) {
        const { data, error } = await supabase.rpc("get_email_stats", {
          p_campagne_id: campaign.id,
        })

        if (!error && data && data.length > 0) {
          stats[campaign.id] = data[0]
        }
      }

      setCampaignStats(stats)
    } catch (error) {
      console.error("Error loading campaign stats:", error)
    }
  }

  const getTimeFilter = (timeframe: string) => {
    const now = new Date()
    switch (timeframe) {
      case "1h":
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    }
  }

  const processEmailQueue = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/process-email-queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({}),
      })

      const result = await response.json()

      if (result.success) {
        console.log("Queue processed successfully:", result)
        loadMonitoringData() // Refresh data
      } else {
        console.error("Queue processing failed:", result.error)
      }
    } catch (error) {
      console.error("Error processing queue:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "sent":
        return "fas fa-check-circle text-green-600"
      case "pending":
        return "fas fa-clock text-yellow-600"
      case "processing":
        return "fas fa-spinner fa-spin text-blue-600"
      case "failed":
        return "fas fa-exclamation-triangle text-red-600"
      default:
        return "fas fa-question-circle text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Monitoring Email</h2>
          <p className="text-muted-foreground">Surveillance en temps réel des envois d'emails</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 heure</SelectItem>
              <SelectItem value="24h">24 heures</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={processEmailQueue} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Traitement...
              </>
            ) : (
              <>
                <i className="fas fa-play mr-2"></i>
                Traiter la file
              </>
            )}
          </Button>
          <Button variant="outline" onClick={loadMonitoringData}>
            <i className="fas fa-sync-alt mr-2"></i>
            Actualiser
          </Button>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          {
            title: "Total",
            value: queueStats.total,
            icon: "fas fa-envelope",
            color: "from-gray-500 to-gray-600",
          },
          {
            title: "En attente",
            value: queueStats.pending,
            icon: "fas fa-clock",
            color: "from-yellow-500 to-yellow-600",
          },
          {
            title: "En cours",
            value: queueStats.processing,
            icon: "fas fa-spinner",
            color: "from-blue-500 to-blue-600",
          },
          {
            title: "Envoyés",
            value: queueStats.sent,
            icon: "fas fa-check-circle",
            color: "from-green-500 to-green-600",
          },
          {
            title: "Échecs",
            value: queueStats.failed,
            icon: "fas fa-exclamation-triangle",
            color: "from-red-500 to-red-600",
          },
        ].map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <i className={`${stat.icon} text-white text-lg`}></i>
                </div>
                {queueStats.total > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {((stat.value / queueStats.total) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="realtime">Temps Réel</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="errors">Erreurs</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-stream mr-2 text-blue-600"></i>
                Flux d'emails en temps réel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realtimeEmails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <i className={getStatusIcon(email.statut)}></i>
                      <div>
                        <div className="font-medium text-sm">{email.email_destinataire}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-xs">{email.sujet}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(email.statut)}>{email.statut}</Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(email.created_at).toLocaleTimeString("fr-FR")}
                      </div>
                    </div>
                  </div>
                ))}
                {realtimeEmails.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-inbox text-4xl mb-4"></i>
                    <p>Aucun email dans la période sélectionnée</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const stats = campaignStats[campaign.id] || {}
              const successRate =
                stats.total_sent > 0 ? ((stats.total_sent - (stats.total_bounced || 0)) / stats.total_sent) * 100 : 0

              return (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{campaign.nom}</CardTitle>
                      <Badge
                        className={
                          campaign.statut === "en_cours" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {campaign.statut}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-semibold text-blue-600">{stats.total_sent || 0}</div>
                          <div className="text-xs text-muted-foreground">Envoyés</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold text-green-600">{stats.open_rate || 0}%</div>
                          <div className="text-xs text-muted-foreground">Ouverture</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Taux de succès</span>
                          <span className="font-medium">{successRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={successRate} className="h-2" />
                      </div>

                      {campaign.statut === "en_cours" && (
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Campagne active</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-exclamation-triangle mr-2 text-red-600"></i>
                Erreurs récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realtimeEmails
                  .filter((email) => email.statut === "failed")
                  .map((email) => (
                    <div
                      key={email.id}
                      className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-exclamation-triangle text-red-600 mt-1"></i>
                        <div>
                          <div className="font-medium text-sm">{email.email_destinataire}</div>
                          <div className="text-xs text-muted-foreground mb-1">{email.sujet}</div>
                          <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                            {email.error_message || "Erreur inconnue"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(email.created_at).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  ))}
                {realtimeEmails.filter((email) => email.statut === "failed").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-check-circle text-4xl mb-4 text-green-500"></i>
                    <p>Aucune erreur récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
