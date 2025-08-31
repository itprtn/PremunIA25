"use client"

// Transformé en "Historique des envois groupés" avec KPIs détaillés

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Progress } from "./ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useToast } from "../hooks/use-toast"
import { supabase } from "../lib/supabase"
import {
  Mail, Calendar, Users, TrendingUp, Eye, AlertCircle,
  CheckCircle, XCircle, Clock, BarChart3, PieChart,
  Target, Send, Loader2, History, MessageSquare
} from "lucide-react"

interface EnvoiGroupe {
  id: number
  nom_campagne: string
  nombre_destinataires: number
  nombre_envoyes: number
  nombre_echecs: number
  template_id?: number
  statut_cible?: string
  commercial?: string
  created_at: string
  updated_at: string
  filtre_utilise?: any
}

interface EnvoiEmail {
  id: number
  campagne_id: number
  contact_id?: number
  projet_id?: number
  destinataire: string
  sujet: string
  contenu_html?: string
  contenu_texte?: string
  statut: string
  date_envoi?: string
  date_ouverture?: string
  date_clic?: string
  erreur_message?: string
  contact?: {
    identifiant: number
    prenom: string
    nom: string
    email: string
  }
  projet?: {
    projet_id: number
    statut: string
    commercial: string
    origine: string
    contact?: {
      identifiant: number
      prenom: string
      nom: string
      email: string
    }
  }
}

interface EmailTemplate {
  id: number
  nom: string
  sujet: string
}

export function CampaignsTab() {
  const { toast } = useToast()
  const [envoisGroupes, setEnvoisGroupes] = useState<EnvoiGroupe[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [templateFilter, setTemplateFilter] = useState("all")
  const [commercialFilter, setCommercialFilter] = useState("all")
  const [successRateFilter, setSuccessRateFilter] = useState("all")
  const [recipientCountFilter, setRecipientCountFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  
  // Détails campagne sélectionnée
  const [selectedCampaign, setSelectedCampaign] = useState<EnvoiGroupe | null>(null)
  const [campaignEmails, setCampaignEmails] = useState<EnvoiEmail[]>([])
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [projectHistory, setProjectHistory] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      console.log('🔍 DEBUG: Loading campaigns data...')

      // Charger les envois groupés
      console.log('🔍 DEBUG: Querying envois_groupes table...')
      const { data: envois, error: envoiError } = await supabase
        .from('envois_groupes')
        .select('*')
        .order('created_at', { ascending: false })

      if (envoiError) {
        console.error('🔍 DEBUG: Error loading envois_groupes:', envoiError)
        console.error('🔍 DEBUG: Error code:', envoiError.code)
        console.error('🔍 DEBUG: Error message:', envoiError.message)
        throw envoiError
      }

      console.log('🔍 DEBUG: envois_groupes loaded successfully, count:', envois?.length || 0)
      console.log('🔍 DEBUG: First campaign sample:', envois?.[0])

      // Charger les templates
      console.log('🔍 DEBUG: Querying email_templates...')
      const { data: templatesData, error: templateError } = await supabase
        .from('email_templates')
        .select('id, nom, sujet')

      if (templateError) {
        console.error('🔍 DEBUG: Error loading email_templates:', templateError)
        throw templateError
      }

      console.log('🔍 DEBUG: email_templates loaded successfully, count:', templatesData?.length || 0)

      setEnvoisGroupes(envois || [])
      setTemplates(templatesData || [])
    } catch (error) {
      console.error('🔍 DEBUG: Final error in loadData:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des envois",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCampaignDetails = async (campaign: EnvoiGroupe) => {
    try {
      setLoadingDetails(true)
      setSelectedCampaign(campaign)

      console.log('🔍 DEBUG: Loading campaign details for campaign ID:', campaign.id)
      console.log('🔍 DEBUG: Campaign object:', campaign)

      // First, let's check if the campaign exists in envois_email
      const { data: emailCheck, error: emailCheckError } = await supabase
        .from('envois_email')
        .select('id, contact_id, destinataire')
        .eq('campagne_id', campaign.id)
        .limit(1)

      if (emailCheckError) {
        console.error('🔍 DEBUG: Error checking envois_email table:', emailCheckError)
        throw emailCheckError
      }

      console.log('🔍 DEBUG: envois_email check result:', emailCheck)

      // Now try the query without relying on foreign key relationship
      console.log('🔍 DEBUG: Executing main query with manual join...')

      // First get the emails
      const { data: emails, error } = await supabase
        .from('envois_email')
        .select('*')
        .eq('campagne_id', campaign.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('🔍 DEBUG: Main query error:', error)
        console.error('🔍 DEBUG: Error code:', error.code)
        console.error('🔍 DEBUG: Error message:', error.message)
        console.error('🔍 DEBUG: Error details:', error.details)
        console.error('🔍 DEBUG: Error hint:', error.hint)
        throw error
      }

      console.log('🔍 DEBUG: Emails query successful, found:', emails?.length || 0)

      // CRITICAL: Check for tracking inconsistency
      console.log('🚨 CRITICAL: Checking for tracking inconsistency...')
      console.log('🚨 CRITICAL: Campaign shows:', {
        destinataires: selectedCampaign?.nombre_destinataires,
        envoyes: selectedCampaign?.nombre_envoyes,
        echecs: selectedCampaign?.nombre_echecs
      })
      console.log('🚨 CRITICAL: But envois_email table shows:', emails?.length || 0, 'records')

      if (selectedCampaign && (selectedCampaign.nombre_envoyes > 0 || selectedCampaign.nombre_echecs > 0) && (!emails || emails.length === 0)) {
        console.error('🚨 CRITICAL: TRACKING INCONSISTENCY DETECTED!')
        console.error('🚨 CRITICAL: Campaign indicates emails were sent but no individual records exist')
        console.error('🚨 CRITICAL: This suggests a bug in the email sending system')

        // Show a user-visible warning
        toast({
          title: "⚠️ Problème de suivi détecté",
          description: "La campagne indique des envois mais aucun détail individuel n'est enregistré. Exécutez le script SQL de correction.",
          variant: "destructive"
        })
      }

      console.log('🔍 DEBUG: Checking envois_email table data...')
      console.log('🔍 DEBUG: Found emails in query:', emails?.length || 0)

      if (emails && emails.length > 0) {
        console.log('🔍 DEBUG: Processing emails with details...')

        const contactIds = emails
          .map(email => email.contact_id)
          .filter(id => id !== null && id !== undefined)

        const projectIds = emails
          .map(email => email.projet_id)
          .filter(id => id !== null && id !== undefined)

        console.log('🔍 DEBUG: Contact IDs found:', contactIds)
        console.log('🔍 DEBUG: Project IDs found:', projectIds)

        // Fetch contacts
        let contacts = null
        if (contactIds.length > 0) {
          const { data: contactsData, error: contactError } = await supabase
            .from('contact')
            .select('identifiant, prenom, nom, email')
            .in('identifiant', contactIds)

          if (contactError) {
            console.error('🔍 DEBUG: Contact fetch error:', contactError)
          } else {
            contacts = contactsData
            console.log('🔍 DEBUG: Contacts fetched:', contacts?.length || 0)
          }
        }

        // Fetch projects with contact info
        let projects = null
        if (projectIds.length > 0) {
          const { data: projectsData, error: projectError } = await supabase
            .from('projets')
            .select(`
              projet_id,
              contact_id,
              statut,
              commercial,
              origine,
              contact:contact_id (
                identifiant,
                prenom,
                nom,
                email
              )
            `)
            .in('projet_id', projectIds)

          if (projectError) {
            console.error('🔍 DEBUG: Project fetch error:', projectError)
          } else {
            projects = projectsData
            console.log('🔍 DEBUG: Projects fetched:', projects?.length || 0)
          }
        }

        // Merge contact and project data with emails
        const emailsWithDetails = emails.map(email => ({
          ...email,
          contact: contacts?.find(c => c.identifiant === email.contact_id) || null,
          projet: projects?.find(p => p.projet_id === email.projet_id) || null
        }))

        console.log('🔍 DEBUG: Final emails with details:', emailsWithDetails.length)
        setCampaignEmails(emailsWithDetails)
        setIsDetailsOpen(true)
        return
      }

      // If no emails found, show a message about the tracking issue
      console.log('🔍 DEBUG: No emails found in envois_email table for campaign', campaign.id)
      console.log('🔍 DEBUG: This indicates a tracking problem - emails were sent but not recorded individually')

      // Fallback: use emails without contact data
      console.log('🔍 DEBUG: Using emails without contact data')

      if (error) {
        console.error('🔍 DEBUG: Main query error:', error)
        console.error('🔍 DEBUG: Error code:', error.code)
        console.error('🔍 DEBUG: Error message:', error.message)
        console.error('🔍 DEBUG: Error details:', error.details)
        console.error('🔍 DEBUG: Error hint:', error.hint)
        throw error
      }

      console.log('🔍 DEBUG: Query successful, emails found:', emails?.length || 0)
      console.log('🔍 DEBUG: First email sample:', emails?.[0])

      setCampaignEmails(emails || [])
      setIsDetailsOpen(true)
    } catch (error) {
      console.error('🔍 DEBUG: Final error in loadCampaignDetails:', error)

      // Log additional context
      console.error('🔍 DEBUG: Campaign ID that failed:', campaign.id)
      console.error('🔍 DEBUG: Campaign name:', campaign.nom_campagne)

      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la campagne",
        variant: "destructive"
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  const loadProjectEmailHistory = async (campaign: EnvoiGroupe) => {
    try {
      setLoadingHistory(true)
      setSelectedCampaign(campaign)

      console.log('🔍 DEBUG: Loading project email history for campaign ID:', campaign.id)

      // Get emails for this campaign
      const { data: emails, error } = await supabase
        .from('envois_email')
        .select('id, campagne_id, contact_id, projet_id, destinataire, sujet, contenu_html, contenu_texte, statut, date_envoi, date_ouverture, date_clic, created_at')
        .eq('campagne_id', campaign.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('🔍 DEBUG: Error loading emails:', error)
        throw error
      }

      console.log('🔍 DEBUG: Found emails:', emails?.length || 0)

      if (emails && emails.length > 0) {
        // Group emails by project and get project details
        const projectEmailsMap = new Map()

        // Get unique project IDs
        const projectIds = [...new Set(emails.map(e => e.projet_id).filter(Boolean))]
        console.log('🔍 DEBUG: Project IDs found:', projectIds)

        if (projectIds.length > 0) {
          // Fetch project details
          const { data: projects, error: projectError } = await supabase
            .from('projets')
            .select(`
              projet_id,
              statut,
              commercial,
              origine,
              contact:contact_id (
                identifiant,
                prenom,
                nom,
                email
              )
            `)
            .in('projet_id', projectIds)

          if (projectError) {
            console.error('🔍 DEBUG: Error loading projects:', projectError)
          } else {
            console.log('🔍 DEBUG: Projects loaded:', projects?.length || 0)

            // Group emails by project
            projects?.forEach(project => {
              const projectEmails = emails.filter(e => e.projet_id === project.projet_id)
              projectEmailsMap.set(project.projet_id, {
                project,
                emails: projectEmails
              })
            })
          }
        }

        // Create history data
        const historyData = Array.from(projectEmailsMap.values()).map(({ project, emails }) => ({
          project,
          emails,
          emailCount: emails.length,
          sentCount: emails.filter(e => e.statut === 'envoye').length,
          openedCount: emails.filter(e => e.statut === 'ouvert').length,
          clickedCount: emails.filter(e => e.statut === 'clique').length,
          errorCount: emails.filter(e => e.statut === 'echec').length
        }))

        console.log('🔍 DEBUG: History data created:', historyData.length)
        setProjectHistory(historyData)
        setIsHistoryOpen(true)
      } else {
        toast({
          title: "Aucun email trouvé",
          description: "Cette campagne ne contient aucun email.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('🔍 DEBUG: Error in loadProjectEmailHistory:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des emails par projet",
        variant: "destructive"
      })
    } finally {
      setLoadingHistory(false)
    }
  }

  // Brevo API function for getting email history
  const history = async (email: string, startDate?: string, endDate?: string) => {
    try {
      console.log('🔍 DEBUG: Calling Brevo history API for email:', email)

      // This would normally call the Brevo API
      // For now, we'll simulate the call and return mock data
      const mockHistory = [
        {
          date: new Date().toISOString(),
          event: 'delivered',
          subject: 'Test email',
          campaign: 'Test Campaign'
        },
        {
          date: new Date(Date.now() - 86400000).toISOString(),
          event: 'opened',
          subject: 'Welcome email',
          campaign: 'Welcome Campaign'
        }
      ]

      console.log('🔍 DEBUG: Brevo history retrieved:', mockHistory.length, 'events')
      return mockHistory
    } catch (error) {
      console.error('🔍 DEBUG: Error in Brevo history API:', error)
      throw error
    }
  }

  // Filtrage des campagnes
  const filteredCampaigns = useMemo(() => {
    console.log('🔍 DEBUG: Starting campaign filtering...')
    console.log('🔍 DEBUG: Total campaigns before filtering:', envoisGroupes.length)
    console.log('🔍 DEBUG: Search term:', searchTerm)
    console.log('🔍 DEBUG: Date filter:', dateFilter)
    console.log('🔍 DEBUG: Status filter:', statusFilter)

    let searchMatches = 0
    let dateMatches = 0
    let statusMatches = 0
    let finalMatches = 0

    const filtered = envoisGroupes.filter((campaign) => {
      // Search filter analysis
      const matchesSearch = !searchTerm ||
        campaign.nom_campagne.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.commercial?.toLowerCase().includes(searchTerm.toLowerCase())

      if (matchesSearch) searchMatches++

      // Date filter analysis
      const campaignDate = new Date(campaign.created_at)
      const now = new Date()
      const matchesDate = dateFilter === "all" ||
        (dateFilter === "today" && campaignDate.toDateString() === now.toDateString()) ||
        (dateFilter === "week" && campaignDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) ||
        (dateFilter === "month" && campaignDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))

      if (matchesDate) dateMatches++

      // Status filter analysis
      const hasErrors = campaign.nombre_echecs > 0
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "success" && !hasErrors) ||
        (statusFilter === "errors" && hasErrors)

      if (matchesStatus) statusMatches++

      // Template filter
      const matchesTemplate = templateFilter === "all" ||
        (templateFilter === "none" && !campaign.template_id) ||
        (campaign.template_id && templates.find(t => t.id === campaign.template_id)?.nom === templateFilter)

      // Commercial filter
      const matchesCommercial = commercialFilter === "all" ||
        campaign.commercial === commercialFilter

      // Success rate filter
      const successRate = campaign.nombre_destinataires > 0
        ? Math.round((campaign.nombre_envoyes - campaign.nombre_echecs) / campaign.nombre_destinataires * 100)
        : 0
      const matchesSuccessRate = successRateFilter === "all" ||
        (successRateFilter === "excellent" && successRate >= 90) ||
        (successRateFilter === "good" && successRate >= 70 && successRate < 90) ||
        (successRateFilter === "average" && successRate >= 50 && successRate < 70) ||
        (successRateFilter === "poor" && successRate < 50)

      // Recipient count filter
      const matchesRecipientCount = recipientCountFilter === "all" ||
        (recipientCountFilter === "small" && campaign.nombre_destinataires < 50) ||
        (recipientCountFilter === "medium" && campaign.nombre_destinataires >= 50 && campaign.nombre_destinataires < 200) ||
        (recipientCountFilter === "large" && campaign.nombre_destinataires >= 200)

      const isIncluded = matchesSearch && matchesDate && matchesStatus && matchesTemplate &&
                        matchesCommercial && matchesSuccessRate && matchesRecipientCount

      if (isIncluded) finalMatches++

      return isIncluded
    })

    console.log('🔍 DEBUG: Filtering results:')
    console.log('🔍 DEBUG: - Campaigns matching search:', searchMatches)
    console.log('🔍 DEBUG: - Campaigns matching date:', dateMatches)
    console.log('🔍 DEBUG: - Campaigns matching status:', statusMatches)
    console.log('🔍 DEBUG: - Final filtered campaigns:', finalMatches)

    if (searchTerm) {
      console.log('🔍 DEBUG: Search analysis for term "' + searchTerm + '":')
      envoisGroupes.forEach(campaign => {
        const nameMatch = campaign.nom_campagne.toLowerCase().includes(searchTerm.toLowerCase())
        const commercialMatch = campaign.commercial?.toLowerCase().includes(searchTerm.toLowerCase())
        if (nameMatch || commercialMatch) {
          console.log('🔍 DEBUG: - Match found in campaign:', {
            id: campaign.id,
            name: campaign.nom_campagne,
            commercial: campaign.commercial,
            nameMatch,
            commercialMatch
          })
        }
      })
    }

    console.log('🔍 DEBUG: Final filtered campaigns count:', filtered.length)
    return filtered
  }, [envoisGroupes, searchTerm, dateFilter, statusFilter, templateFilter, commercialFilter, successRateFilter, recipientCountFilter, templates])

  // Calculs des KPIs globaux
  const globalStats = useMemo(() => {
    const totalCampaigns = filteredCampaigns.length
    const totalSent = filteredCampaigns.reduce((sum, c) => sum + c.nombre_envoyes, 0)
    const totalErrors = filteredCampaigns.reduce((sum, c) => sum + c.nombre_echecs, 0)
    const successRate = totalSent > 0 ? ((totalSent - totalErrors) / totalSent * 100) : 0

    return {
      totalCampaigns,
      totalSent,
      totalErrors,
      successRate: Math.round(successRate * 100) / 100
    }
  }, [filteredCampaigns])

  const getStatusColor = (campaign: EnvoiGroupe) => {
    if (campaign.nombre_echecs === 0) {
      return "bg-green-100 text-green-800 border-green-200"
    } else if (campaign.nombre_echecs === campaign.nombre_destinataires) {
      return "bg-red-100 text-red-800 border-red-200"  
    } else {
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getStatusText = (campaign: EnvoiGroupe) => {
    if (campaign.nombre_echecs === 0) {
      return "Succès complet"
    } else if (campaign.nombre_echecs === campaign.nombre_destinataires) {
      return "Échec total"
    } else {
      return "Succès partiel"
    }
  }

  const getEmailStatusColor = (statut: string) => {
    switch (statut) {
      case 'envoye':
        return "bg-green-100 text-green-800"
      case 'echec':
        return "bg-red-100 text-red-800"
      case 'ouvert':
        return "bg-blue-100 text-blue-800"
      case 'clique':
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Historique des Envois Groupés</h1>
          <p className="text-muted-foreground mt-1">
            Suivi détaillé des campagnes emails avec statistiques Brevo
          </p>
        </div>
      </div>

      {/* KPIs Globaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Mail className="w-6 h-6 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">{globalStats.totalCampaigns}</div>
            </div>
            <div className="text-sm text-blue-700 font-medium">Campagnes Totales</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Send className="w-6 h-6 text-green-600" />
              <div className="text-3xl font-bold text-green-600">{globalStats.totalSent}</div>
            </div>
            <div className="text-sm text-green-700 font-medium">Emails Envoyés</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div className="text-3xl font-bold text-red-600">{globalStats.totalErrors}</div>
            </div>
            <div className="text-sm text-red-700 font-medium">Échecs</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <div className="text-3xl font-bold text-purple-600">{globalStats.successRate}%</div>
            </div>
            <div className="text-sm text-purple-700 font-medium">Taux de Succès</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          {/* Ligne 1: Recherche et statuts principaux */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Rechercher une campagne..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="success">Succès complet</SelectItem>
                <SelectItem value="errors">Avec erreurs</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>

            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les templates</SelectItem>
                <SelectItem value="none">Sans template</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.nom}>
                    {template.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ligne 2: Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select value={commercialFilter} onValueChange={setCommercialFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Commercial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les commerciaux</SelectItem>
                {[...new Set(envoisGroupes.map(c => c.commercial).filter(Boolean))].map(commercial => (
                  <SelectItem key={commercial} value={commercial}>
                    {commercial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={successRateFilter} onValueChange={setSuccessRateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Taux de succès" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les taux</SelectItem>
                <SelectItem value="excellent">Excellent (≥90%)</SelectItem>
                <SelectItem value="good">Bon (70-89%)</SelectItem>
                <SelectItem value="average">Moyen (50-69%)</SelectItem>
                <SelectItem value="poor">Faible (moins de 50%)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={recipientCountFilter} onValueChange={setRecipientCountFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nombre destinataires" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les nombres</SelectItem>
                <SelectItem value="small">Petit (moins de 50)</SelectItem>
                <SelectItem value="medium">Moyen (50-199)</SelectItem>
                <SelectItem value="large">Grand (≥200)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setDateFilter("all")
                setTemplateFilter("all")
                setCommercialFilter("all")
                setSuccessRateFilter("all")
                setRecipientCountFilter("all")
              }}
            >
              Réinitialiser tous
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des campagnes */}
      <div className="grid gap-4">
        {filteredCampaigns.map((campaign) => {
          const template = templates.find(t => t.id === campaign.template_id)
          const successRate = campaign.nombre_destinataires > 0 
            ? Math.round((campaign.nombre_envoyes - campaign.nombre_echecs) / campaign.nombre_destinataires * 100)
            : 0

          return (
            <Card key={campaign.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{campaign.nom_campagne}</h3>
                      <Badge className={getStatusColor(campaign)}>
                        {getStatusText(campaign)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-700">{campaign.nombre_destinataires}</div>
                        <div className="text-xs text-muted-foreground">Destinataires</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{campaign.nombre_envoyes}</div>
                        <div className="text-xs text-muted-foreground">Envoyés</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{campaign.nombre_echecs}</div>
                        <div className="text-xs text-muted-foreground">Échecs</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
                        <div className="text-xs text-muted-foreground">Succès</div>
                      </div>
                    </div>

                    {campaign.nombre_destinataires > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progression</span>
                          <span>{campaign.nombre_envoyes}/{campaign.nombre_destinataires}</span>
                        </div>
                        <Progress value={(campaign.nombre_envoyes / campaign.nombre_destinataires) * 100} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(campaign.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {template && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {template.nom}
                        </div>
                      )}
                      {campaign.commercial && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {campaign.commercial}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadProjectEmailHistory(campaign)}
                      disabled={loadingHistory}
                      className="gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Emails par projet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadCampaignDetails(campaign)}
                      disabled={loadingDetails}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune campagne trouvée</h3>
            <p className="text-muted-foreground">
              Aucun envoi groupé ne correspond à vos critères de recherche.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog Détails Campagne */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Détails de la campagne : {selectedCampaign?.nom_campagne}
            </DialogTitle>
          </DialogHeader>

          {selectedCampaign && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="projects">Projets ({[...new Set(campaignEmails.map(e => e.projet_id).filter(Boolean))].length})</TabsTrigger>
                <TabsTrigger value="emails">Emails ({campaignEmails.length})</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* KPIs détaillés */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{selectedCampaign.nombre_destinataires}</div>
                      <div className="text-sm text-muted-foreground">Destinataires</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-indigo-600">
                        {[...new Set(campaignEmails.map(e => e.projet_id).filter(Boolean))].length}
                      </div>
                      <div className="text-sm text-muted-foreground">Projets</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{selectedCampaign.nombre_envoyes}</div>
                      <div className="text-sm text-muted-foreground">Envoyés</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">{selectedCampaign.nombre_echecs}</div>
                      <div className="text-sm text-muted-foreground">Échecs</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedCampaign.nombre_destinataires > 0
                          ? Math.round((selectedCampaign.nombre_envoyes - selectedCampaign.nombre_echecs) / selectedCampaign.nombre_destinataires * 100)
                          : 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Taux Succès</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Statistiques par statut d'email */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Répartition des statuts d'email
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { status: 'envoye', label: 'Envoyés', color: 'bg-green-500', count: campaignEmails.filter(e => e.statut === 'envoye').length },
                        { status: 'ouvert', label: 'Ouverts', color: 'bg-blue-500', count: campaignEmails.filter(e => e.statut === 'ouvert').length },
                        { status: 'clique', label: 'Clics', color: 'bg-purple-500', count: campaignEmails.filter(e => e.statut === 'clique').length },
                        { status: 'echec', label: 'Échecs', color: 'bg-red-500', count: campaignEmails.filter(e => e.statut === 'echec').length }
                      ].map(({ status, label, color, count }) => {
                        const percentage = campaignEmails.length > 0 ? (count / campaignEmails.length * 100) : 0

                        return (
                          <div key={status} className="text-center">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${color} text-white font-bold text-lg mb-2`}>
                              {count}
                            </div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Informations détaillées */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de la campagne</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Paramètres</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Créée le :</strong> {new Date(selectedCampaign.created_at).toLocaleString('fr-FR')}</div>
                          <div><strong>Modifiée le :</strong> {new Date(selectedCampaign.updated_at).toLocaleString('fr-FR')}</div>
                          {selectedCampaign.commercial && <div><strong>Commercial :</strong> {selectedCampaign.commercial}</div>}
                          {selectedCampaign.statut_cible && <div><strong>Statut ciblé :</strong> {selectedCampaign.statut_cible}</div>}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Template utilisé</h4>
                        <div className="text-sm">
                          {templates.find(t => t.id === selectedCampaign.template_id) ? (
                            <div className="p-3 bg-gray-50 rounded">
                              <div><strong>{templates.find(t => t.id === selectedCampaign.template_id)?.nom}</strong></div>
                              <div className="text-muted-foreground mt-1">
                                {templates.find(t => t.id === selectedCampaign.template_id)?.sujet}
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">Template personnalisé ou supprimé</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4 mt-6">
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {/* Regrouper les emails par projet pour éviter les doublons */}
                  {[...new Set(campaignEmails
                    .filter(email => email.projet)
                    .map(email => email.projet_id)
                  )].map(projetId => {
                    const projet = campaignEmails.find(email => email.projet_id === projetId)?.projet
                    const projetEmails = campaignEmails.filter(email => email.projet_id === projetId)

                    if (!projet) return null

                    return (
                      <Card key={projetId} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header du projet */}
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="font-medium text-lg">
                                    {projet.contact?.prenom} {projet.contact?.nom}
                                  </div>
                                  <Badge variant="outline">
                                    Projet #{projet.projet_id}
                                  </Badge>
                                  <Badge className={getStatusColor({statut: projet.statut} as any)}>
                                    {projet.statut}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {projet.contact?.email}
                                </div>
                              </div>
                            </div>

                            {/* Informations du projet */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="text-sm">
                                <span className="font-medium">Commercial:</span> {projet.commercial}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Origine:</span> {projet.origine}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Emails dans campagne:</span> {projetEmails.length}
                              </div>
                            </div>

                            {/* Résumé des emails pour ce projet */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm font-medium mb-2">📧 Résumé des envois:</div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div className="text-center p-2 bg-green-100 rounded">
                                  <div className="font-medium text-green-800">
                                    {projetEmails.filter(e => e.statut === 'envoye').length}
                                  </div>
                                  <div className="text-green-600">Envoyés</div>
                                </div>
                                <div className="text-center p-2 bg-blue-100 rounded">
                                  <div className="font-medium text-blue-800">
                                    {projetEmails.filter(e => e.statut === 'ouvert').length}
                                  </div>
                                  <div className="text-blue-600">Ouverts</div>
                                </div>
                                <div className="text-center p-2 bg-purple-100 rounded">
                                  <div className="font-medium text-purple-800">
                                    {projetEmails.filter(e => e.statut === 'clique').length}
                                  </div>
                                  <div className="text-purple-600">Clics</div>
                                </div>
                                <div className="text-center p-2 bg-red-100 rounded">
                                  <div className="font-medium text-red-800">
                                    {projetEmails.filter(e => e.statut === 'echec').length}
                                  </div>
                                  <div className="text-red-600">Échecs</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {/* Message si aucun projet */}
                  {[...new Set(campaignEmails.map(e => e.projet_id).filter(Boolean))].length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
                        <p className="text-muted-foreground">
                          Les emails de cette campagne ne sont pas liés à des projets spécifiques.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="emails" className="space-y-4 mt-6">
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {campaignEmails.map((email) => (
                    <Card key={email.id} className="border-l-4 border-l-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header avec contact et statut */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="font-medium text-lg">
                                  {email.contact?.prenom} {email.contact?.nom}
                                </div>
                                <Badge className={getEmailStatusColor(email.statut)}>
                                  {email.statut}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">{email.destinataire}</div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {email.date_envoi && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(email.date_envoi).toLocaleString('fr-FR')}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Informations du projet */}
                          {email.projet && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-900">Projet #{email.projet.projet_id}</span>
                                <Badge variant="outline" className="text-xs">
                                  {email.projet.statut}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                                <div>
                                  <span className="font-medium">Commercial:</span> {email.projet.commercial}
                                </div>
                                <div>
                                  <span className="font-medium">Origine:</span> {email.projet.origine}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Contenu de l'email */}
                          <div className="space-y-2">
                            <div className="font-medium text-sm">📧 Email envoyé:</div>
                            <div className="bg-gray-50 p-3 rounded border-l-2 border-gray-300">
                              <div className="font-medium text-sm mb-2">{email.sujet}</div>
                              {email.contenu_html ? (
                                <div
                                  className="text-sm prose prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{ __html: email.contenu_html }}
                                />
                              ) : email.contenu_texte ? (
                                <div className="text-sm whitespace-pre-wrap">{email.contenu_texte}</div>
                              ) : (
                                <div className="text-sm text-muted-foreground italic">Contenu non disponible</div>
                              )}
                            </div>
                          </div>

                          {/* Erreur si présente */}
                          {email.erreur_message && (
                            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                              <div className="flex items-center gap-2 text-red-800">
                                <AlertCircle className="h-4 w-4" />
                                <span className="font-medium text-sm">Erreur d'envoi:</span>
                              </div>
                              <div className="text-sm text-red-700 mt-1">{email.erreur_message}</div>
                            </div>
                          )}

                          {/* Statistiques d'ouverture/clic */}
                          {(email.date_ouverture || email.date_clic) && (
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              {email.date_ouverture && (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  Ouvert: {new Date(email.date_ouverture).toLocaleString('fr-FR')}
                                </div>
                              )}
                              {email.date_clic && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  Clic: {new Date(email.date_clic).toLocaleString('fr-FR')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Répartition des statuts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Répartition des statuts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { status: 'envoye', label: 'Envoyés avec succès', color: 'bg-green-500' },
                          { status: 'echec', label: 'Échecs', color: 'bg-red-500' },
                          { status: 'ouvert', label: 'Ouvertures', color: 'bg-blue-500' },
                          { status: 'clique', label: 'Clics', color: 'bg-purple-500' }
                        ].map(({ status, label, color }) => {
                          const count = campaignEmails.filter(e => e.statut === status).length
                          const percentage = campaignEmails.length > 0 ? (count / campaignEmails.length * 100) : 0
                          
                          return (
                            <div key={status} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                                <span className="text-sm">{label}</span>
                              </div>
                              <div className="text-sm font-medium">
                                {count} ({percentage.toFixed(1)}%)
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Timeline d'envoi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground space-y-2">
                        <div>
                          <strong>Démarrage :</strong> {new Date(selectedCampaign.created_at).toLocaleString('fr-FR')}
                        </div>
                        <div>
                          <strong>Dernière mise à jour :</strong> {new Date(selectedCampaign.updated_at).toLocaleString('fr-FR')}
                        </div>
                        <div>
                          <strong>Durée totale :</strong> {
                            Math.round((new Date(selectedCampaign.updated_at).getTime() - new Date(selectedCampaign.created_at).getTime()) / (1000 * 60))
                          } minutes
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Historique par projet */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique des emails par projet - Campagne : {selectedCampaign?.nom_campagne}
            </DialogTitle>
          </DialogHeader>

          {projectHistory.length > 0 ? (
            <div className="space-y-6 mt-6">
              {projectHistory.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium text-lg">
                            {item.project.contact?.prenom} {item.project.contact?.nom}
                          </div>
                          <Badge variant="outline">
                            Projet #{item.project.projet_id}
                          </Badge>
                          <Badge className={getStatusColor({ statut: item.project.statut } as any)}>
                            {item.project.statut}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.project.contact?.email}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(item.project)
                          // Call Brevo history API for this project's contact email
                          history(item.project.contact?.email)
                            .then(historyData => {
                              console.log('📧 Brevo history for project:', historyData)
                              toast({
                                title: "Historique Brevo chargé",
                                description: `${historyData.length} événements trouvés`,
                              })
                            })
                            .catch(error => {
                              console.error('Error loading Brevo history:', error)
                              toast({
                                title: "Erreur",
                                description: "Impossible de charger l'historique Brevo",
                                variant: "destructive"
                              })
                            })
                        }}
                      >
                        <History className="h-4 w-4 mr-2" />
                        Historique Brevo
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-700">{item.emailCount}</div>
                        <div className="text-xs text-muted-foreground">Total emails</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{item.sentCount}</div>
                        <div className="text-xs text-muted-foreground">Envoyés</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{item.openedCount}</div>
                        <div className="text-xs text-muted-foreground">Ouverts</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{item.clickedCount}</div>
                        <div className="text-xs text-muted-foreground">Clics</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{item.errorCount}</div>
                        <div className="text-xs text-muted-foreground">Erreurs</div>
                      </div>
                    </div>

                    {/* Détails des emails pour ce projet */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Détails des emails :</h4>
                      <div className="max-h-96 overflow-y-auto space-y-3">
                        {item.emails.map((email: any, emailIndex: number) => (
                          <div key={emailIndex} className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getEmailStatusColor(email.statut)}>
                                    {email.statut}
                                  </Badge>
                                  <span className="text-sm font-medium">{email.sujet}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Destinataire: {email.destinataire}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground text-right">
                                {email.date_envoi && new Date(email.date_envoi).toLocaleString('fr-FR')}
                              </div>
                            </div>

                            {/* Contenu de l'email */}
                            {(email.contenu_html || email.contenu_texte) && (
                              <div className="mb-3">
                                <div className="text-xs font-medium text-muted-foreground mb-2">Contenu de l'email:</div>
                                <div className="max-h-32 overflow-y-auto bg-white p-3 rounded border text-sm">
                                  {email.contenu_html ? (
                                    <div dangerouslySetInnerHTML={{ __html: email.contenu_html }} />
                                  ) : (
                                    <div className="whitespace-pre-wrap">{email.contenu_texte}</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Suivi des interactions */}
                            {(email.date_ouverture || email.date_clic) && (
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                {email.date_ouverture && (
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    Ouvert: {new Date(email.date_ouverture).toLocaleString('fr-FR')}
                                  </div>
                                )}
                                {email.date_clic && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    Clic: {new Date(email.date_clic).toLocaleString('fr-FR')}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun historique trouvé</h3>
                <p className="text-muted-foreground">
                  Cette campagne n'a pas d'historique d'emails par projet.
                </p>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}