"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Checkbox } from "./ui/checkbox"
import { useToast } from "../hooks/use-toast"
import { supabase } from "../lib/supabase"
import { brevoSync, brevoUtils } from "../lib/brevo-sync-service"
import {
  Eye, Mail, Filter, Search, ChevronLeft, ChevronRight,
  User, Building2, FileText, Calendar, Users, Target,
  Send, CalendarPlus, CheckSquare, Square, Loader2,
  MessageSquare, History, AlertTriangle, TrendingUp, RefreshCw
} from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Project {
  projet_id: number
  contact_id: number
  date_creation: string
  origine: string
  statut: string
  commercial: string
  contact?: {
    identifiant: number
    prenom: string
    nom: string
    email: string
    civilite: string
  }
}

interface EmailTemplate {
  id: number
  nom: string
  sujet: string
  contenu_html: string
  contenu_texte: string
}

export function ProjectsTab() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [commercialFilter, setCommercialFilter] = useState("all")
  const [distinctStatuses, setDistinctStatuses] = useState<string[]>([])
  const [distinctCommercials, setDistinctCommercials] = useState<string[]>([])
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [contactFilter, setContactFilter] = useState("all")
  const [contactFrequencyFilter, setContactFrequencyFilter] = useState("all")
  const [scoreSort, setScoreSort] = useState("default")

  // Dialogs
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isRdvDialogOpen, setIsRdvDialogOpen] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isCreatingRdv, setIsCreatingRdv] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [projectHistory, setProjectHistory] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [emailStats, setEmailStats] = useState({
    totalSent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)
  const [contactEmailCounts, setContactEmailCounts] = useState<Map<number, number>>(new Map())
  const [isSyncingBrevo, setIsSyncingBrevo] = useState(false)

  // Email form
  const [emailData, setEmailData] = useState({
    templateId: '',
    subject: '',
    content: '',
    useCustomContent: false
  })

  // RDV form
  const [rdvData, setRdvData] = useState({
    dateProposee: '',
    message: ''
  })

  const loadContactEmailCounts = async () => {
    try {
      const { data: emailCounts, error } = await supabase
        .from('envois_email')
        .select('contact_id')
        .not('contact_id', 'is', null)

      if (error) throw error

      const counts = new Map<number, number>()
      emailCounts?.forEach(email => {
        if (email.contact_id) {
          counts.set(email.contact_id, (counts.get(email.contact_id) || 0) + 1)
        }
      })

      setContactEmailCounts(counts)
    } catch (error) {
      console.error("Error loading contact email counts:", error)
      setContactEmailCounts(new Map())
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await loadProjects()
      await loadFilters()
      await loadTemplates()
      await loadEmailStats()
      await loadContactEmailCounts()
    }
    loadData()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const { data: rawProjects, error } = await supabase
        .from("projets")
        .select(`
          *,
          contact:contact_id (
            identifiant,
            prenom,
            nom,
            email,
            civilite
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      let validProjects = rawProjects || []
      validProjects = validProjects.filter(project => project.projet_id && project.contact)
      setProjects(validProjects)
    } catch (error) {
      console.error("Error loading projects:", error)
      toast({ title: "Erreur", description: "Impossible de charger les projets", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const loadFilters = async () => {
    try {
      const { data, error } = await supabase
        .from("projets")
        .select("statut, commercial")
        .not("statut", "is", null)
        .not("commercial", "is", null)

      if (error) throw error
      const statuses = [...new Set(data?.map(p => p.statut).filter(Boolean))] as string[]
      const commercials = [...new Set(data?.map(p => p.commercial).filter(Boolean))] as string[]
      setDistinctStatuses(statuses.sort())
      setDistinctCommercials(commercials.sort())
    } catch (error) {
      console.error("Error loading filters:", error)
    }
  }

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, nom, sujet, contenu_html, contenu_texte')
        .eq('statut', 'active')
        .order('nom')

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error("Error loading templates:", error)
    }
  }

  const loadEmailStats = async () => {
    try {
      setLoadingStats(true)
      const { data: emails, error } = await supabase
        .from('envois_email')
        .select('statut, date_envoi, date_ouverture, date_clic, projet_id')
        .order('created_at', { ascending: false })

      if (error) throw error
      const emailsWithProjects = emails?.filter(e => e.projet_id) || []
      const totalSent = emailsWithProjects.length
      const delivered = emailsWithProjects.filter(e => e.statut === 'delivre' || e.statut === 'envoye').length
      const opened = emailsWithProjects.filter(e => e.date_ouverture).length
      const clicked = emailsWithProjects.filter(e => e.date_clic).length
      const bounced = emailsWithProjects.filter(e => e.statut === 'echec' || e.statut === 'bounce').length

      const openRate = totalSent > 0 ? Math.round((opened / totalSent) * 100 * 100) / 100 : 0
      const clickRate = totalSent > 0 ? Math.round((clicked / totalSent) * 100 * 100) / 100 : 0
      const bounceRate = totalSent > 0 ? Math.round((bounced / totalSent) * 100 * 100) / 100 : 0

      setEmailStats({ totalSent, delivered, opened, clicked, bounced, openRate, clickRate, bounceRate })
    } catch (error) {
      console.error("Error loading email stats:", error)
      setEmailStats({ totalSent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, openRate: 0, clickRate: 0, bounceRate: 0 })
    } finally {
      setLoadingStats(false)
    }
  }

  // Personnalisation
  const personalizeContent = (content: string, recipient: any) => {
    return content
      .replace(/{{nom_client}}/g, `${recipient.prenom} ${recipient.nom}`)
      .replace(/{{prenom}}/g, recipient.prenom)
      .replace(/{{nom}}/g, recipient.nom)
      .replace(/{{nom_commercial}}/g, recipient.commercial)
      .replace(/{{lien_rdv}}/g, recipient.lien_rdv || '#')
      .replace(/{{infos_premunia}}/g, `📞 Contactez-nous : Téléphone : 01 23 45 67 89 Email : info@premunia.com`)
  }

  const validateEmailData = (recipient: any) => {
    const errors = []
    if (!recipient.projectId) errors.push(`Projet ID manquant pour ${recipient.email}`)
    if (!recipient.contactId) errors.push(`Contact ID manquant pour ${recipient.email}`)
    if (!recipient.email || !recipient.email.includes('@')) errors.push(`Email invalide: ${recipient.email}`)
    return errors
  }

  // 🚀 VERSION CORRIGÉE
  const handleSendGroupEmail = async () => {
    const allSelected = getSelectedProjectsWithEmail()
    let recipients = allSelected.filter(p => p.hasEmail)
    const withoutEmail = allSelected.filter(p => !p.hasEmail)

    if (recipients.length === 0) {
      toast({ title: "Aucun destinataire avec email", description: `Vous avez sélectionné ${allSelected.length} projet(s), mais aucun n'a d'adresse email valide.`, variant: "destructive" })
      return
    }

    setIsSendingEmail(true)
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('campagnes_email')
        .insert({
          nom: `Envoi depuis Projets - ${new Date().toLocaleDateString()}`,
          statut: "en_cours",
          statut_cible: "projet",
          contact_count: recipients.length,
          date_lancement: new Date().toISOString()
        })
        .select()
        .single()

      if (campaignError) throw campaignError

      let successCount = 0
      let errorCount = 0
      for (const recipient of recipients) {
        try {
          const selectedTemplate = templates.find(t => t.id === parseInt(emailData.templateId))
          const subject = emailData.useCustomContent ? emailData.subject : selectedTemplate?.sujet || 'Email Premunia'
          const htmlContent = emailData.useCustomContent ? emailData.content : selectedTemplate?.contenu_html || ''
          const textContent = selectedTemplate?.contenu_texte || ''

          const personalizedHtml = personalizeContent(htmlContent, recipient)
          const personalizedText = personalizeContent(textContent, recipient)
          const personalizedSubject = personalizeContent(subject, recipient)

          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email', {
            body: { to: recipient.email, subject: personalizedSubject, html: personalizedHtml, text: personalizedText }
          })
          if (emailError || !emailResult?.success) throw new Error(emailError?.message || emailResult?.error || 'Échec envoi')

          successCount++

          await supabase.from('envois_email').insert({
            campagne_id: campaign.id,
            contact_id: recipient.contactId,
            projet_id: recipient.projectId,
            destinataire: recipient.email,
            sujet: personalizedSubject,
            contenu_html: personalizedHtml,
            contenu_texte: personalizedText,
            statut: 'envoye',
            date_envoi: new Date().toISOString(),
            date_ouverture: null,
            date_clic: null,
            erreur_message: null
          })

        } catch (err: any) {
          errorCount++
          await supabase.from('envois_email').insert({
            campagne_id: campaign.id,
            contact_id: recipient.contactId,
            projet_id: recipient.projectId,
            destinataire: recipient.email,
            sujet: emailData.subject || 'Échec envoi',
            contenu_html: '',
            contenu_texte: '',
            statut: 'echec',
            date_envoi: new Date().toISOString(),
            erreur_message: err.message || 'Erreur inconnue',
            date_ouverture: null,
            date_clic: null
          })
        }
      }

      await supabase.from('campagnes_email').update({
        statut: "terminee",
        nombre_envoyes: successCount,
        nombre_echecs: errorCount
      }).eq('id', campaign.id)

      toast({ title: "Envoi terminé", description: `${successCount} emails envoyés • ${errorCount} erreurs` })
      await loadEmailStats()
      await loadContactEmailCounts()
      setIsEmailDialogOpen(false)
      setSelectedProjects(new Set())
      setEmailData({ templateId: '', subject: '', content: '', useCustomContent: false })
    } catch (error: any) {
      console.error('Erreur envoi groupé:', error)
      toast({ title: "Erreur d'envoi", description: error.message || "Impossible d'envoyer les emails", variant: "destructive" })
    } finally {
      setIsSendingEmail(false)
    }
  }

  // 🔄 Historique corrigé
  const loadProjectEmailHistory = async (project: Project) => {
    try {
      setLoadingHistory(true)
      setSelectedProject(project)

      const { data: emails, error } = await supabase
        .from('envois_email')
        .select('id, campagne_id, contact_id, projet_id, destinataire, sujet, contenu_html, contenu_texte, statut, date_envoi, date_ouverture, date_clic, created_at')
        .eq('projet_id', project.projet_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (emails && emails.length > 0) {
        const campaignIds = [...new Set(emails.map(e => e.campagne_id).filter(Boolean))]
        const { data: campaigns } = await supabase
          .from('campagnes_email')
          .select('id, nom, created_at, statut, type')
          .in('id', campaignIds)

        const historyData = campaigns?.map(campaign => ({
          campaign,
          emails: emails.filter(e => e.campagne_id === campaign.id),
          emailCount: emails.filter(e => e.campagne_id === campaign.id).length,
          sentCount: emails.filter(e => e.campagne_id === campaign.id && e.statut === 'envoye').length,
          openedCount: emails.filter(e => e.campagne_id === campaign.id && e.date_ouverture).length,
          clickedCount: emails.filter(e => e.campagne_id === campaign.id && e.date_clic).length,
          errorCount: emails.filter(e => e.campagne_id === campaign.id && e.statut === 'echec').length
        })) || []

        setProjectHistory(historyData)
        setIsHistoryOpen(true)
      } else {
        toast({ title: "Aucun email trouvé", description: "Ce projet n'a pas d'historique d'emails.", variant: "destructive" })
      }
    } catch (error) {
      console.error('Erreur loadProjectEmailHistory:', error)
      toast({ title: "Erreur", description: "Impossible de charger l'historique des emails", variant: "destructive" })
    } finally {
      setLoadingHistory(false)
    }
  }

  // Filtrage et tri des projets
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      const matchesSearch = !searchTerm ||
        project.contact?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.contact?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.commercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.origine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projet_id.toString().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" ||
        project.statut?.toLowerCase().includes(statusFilter.toLowerCase())

      const matchesCommercial = commercialFilter === "all" ||
        project.commercial === commercialFilter

      // New contact filters - simplified for now
      const matchesContact = contactFilter === "all" ||
        (contactFilter === "contacted" && project.contact?.email) ||
        (contactFilter === "not_contacted" && !project.contact?.email)

      const matchesContactFrequency = (() => {
        if (contactFrequencyFilter === "all") return true
        if (!project.contact?.identifiant) return contactFrequencyFilter === "never"

        const emailCount = contactEmailCounts.get(project.contact.identifiant) || 0

        switch (contactFrequencyFilter) {
          case "never":
            return emailCount === 0
          case "1-2":
            return emailCount >= 1 && emailCount <= 2
          case "3-5":
            return emailCount >= 3 && emailCount <= 5
          case "5+":
            return emailCount >= 5
          default:
            return true
        }
      })()

      return matchesSearch && matchesStatus && matchesCommercial && matchesContact && matchesContactFrequency
    })

    // Apply sorting
    if (scoreSort !== "default") {
      filtered = [...filtered].sort((a, b) => {
        switch (scoreSort) {
          case "date_desc":
            return new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
          case "date_asc":
            return new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime()
          default:
            return 0
        }
      })
    }

    return filtered
  }, [projects, searchTerm, statusFilter, commercialFilter, contactFilter, contactFrequencyFilter, contactEmailCounts, scoreSort])

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage)

  // Sélection
  const toggleProjectSelection = (projectId: number) => {
    const newSelection = new Set(selectedProjects)
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId)
    } else {
      newSelection.add(projectId)
    }
    setSelectedProjects(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedProjects.size === paginatedProjects.length) {
      setSelectedProjects(new Set())
    } else {
      setSelectedProjects(new Set(paginatedProjects.map(p => p.projet_id)))
    }
  }

  const getSelectedProjectsWithEmail = () => {
    return paginatedProjects
      .filter(p => selectedProjects.has(p.projet_id))
      .map(p => ({
        projectId: p.projet_id,
        contactId: p.contact?.identifiant,
        email: p.contact?.email || '',
        prenom: p.contact?.prenom || '',
        nom: p.contact?.nom || '',
        civilite: p.contact?.civilite || '',
        commercial: p.commercial || '',
        hasEmail: !!(p.contact?.email)
      }))
  }

  // Créer des RDV pour les projets sélectionnés
  const handleCreateRdv = async () => {
    const selectedProjectsList = paginatedProjects.filter(p => selectedProjects.has(p.projet_id))

    if (selectedProjectsList.length === 0) {
      toast({
        title: "Aucun projet sélectionné",
        description: "Sélectionnez au moins un projet",
        variant: "destructive"
      })
      return
    }

    setIsCreatingRdv(true)

    try {
      const rdvPromises = selectedProjectsList.map(async (project) => {
        // Créer le RDV dans la base
        const { data: rdv, error } = await supabase
          .from('rdv')
          .insert({
            projet_id: project.projet_id,
            commercial_id: project.commercial,
            date_proposee: rdvData.dateProposee,
            message: rdvData.message,
            statut: 'propose'
          })
          .select()
          .single()

        if (error) throw error

        // Générer le lien unique
        const lienRdv = `${window.location.origin}/rdv/${rdv.id}`

        // Mettre à jour avec le lien
        await supabase
          .from('rdv')
          .update({ lien: lienRdv })
          .eq('id', rdv.id)

        return { ...rdv, lien: lienRdv }
      })

      const rdvResults = await Promise.all(rdvPromises)

      toast({
        title: "RDV créés",
        description: `${rdvResults.length} rendez-vous proposés avec succès`,
      })

      setIsRdvDialogOpen(false)
      setSelectedProjects(new Set())
      setRdvData({ dateProposee: '', message: '' })

    } catch (error: any) {
      console.error('Erreur création RDV:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer les rendez-vous",
        variant: "destructive"
      })
    } finally {
      setIsCreatingRdv(false)
    }
  }

  // Synchroniser manuellement avec Brevo
  const handleBrevoSync = async () => {
    setIsSyncingBrevo(true)

    try {
      // Utiliser le service de synchronisation Brevo pour mettre à jour les stats
      const brevoStats = await brevoSync.getAggregatedEmailStats()

      // Transformer les statistiques de Brevo en format attendu par notre composant
      const aggregateStats = brevoUtils.formatEmailStats(brevoStats)

      // Mettre à jour les statistiques avec les données Brevo
      setEmailStats({
        totalSent: aggregateStats.totalSent,
        delivered: aggregateStats.delivered,
        opened: aggregateStats.opened,
        clicked: aggregateStats.clicked,
        bounced: aggregateStats.bounced,
        openRate: aggregateStats.openRate,
        clickRate: aggregateStats.clickRate,
        bounceRate: aggregateStats.bounceRate
      })

      // Synchroniser les campaigns avec le CRM
      await brevoSync.syncEmailDataWithCRM()

      toast({
        title: "Synchronisation Brevo complétée",
        description: "Les statistiques et données emails ont été mises à jour depuis l'API Brevo.",
      })

      // Recharger les données locales
      await loadEmailStats()
      await loadContactEmailCounts()

    } catch (error: any) {
      console.error('Erreur lors de la synchronisation Brevo:', error)
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "Impossible de synchroniser avec Brevo",
        variant: "destructive"
      })
    } finally {
      setIsSyncingBrevo(false)
    }
  }

  // Email history function for getting email tracking data
  const history = async (email: string, startDate?: string, endDate?: string) => {
    try {
      console.log('🔍 DEBUG: Loading email history for:', email)

      // Get email tracking data from database
      const { data: emailHistory, error } = await supabase
        .from('envois_email')
        .select('date_envoi, date_ouverture, date_clic, sujet, statut')
        .eq('destinataire', email)
        .order('date_envoi', { ascending: false })

      if (error) throw error

      // Transform data to match expected format
      const formattedHistory = emailHistory?.map(email => ({
        date: email.date_envoi,
        event: email.statut === 'envoye' ? 'delivered' :
               email.date_ouverture ? 'opened' :
               email.date_clic ? 'clicked' : 'sent',
        subject: email.sujet,
        campaign: 'Email Tracking'
      })) || []

      console.log('🔍 DEBUG: Email history retrieved:', formattedHistory.length, 'events')
      return formattedHistory
    } catch (error) {
      console.error('🔍 DEBUG: Error loading email history:', error)
      throw error
    }
  }

  // Sélection du template
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === parseInt(templateId))
    if (template) {
      setEmailData({
        templateId,
        subject: template.sujet,
        content: template.contenu_html,
        useCustomContent: false
      })
    }
  }

  const getStatusColor = (statut: string) => {
    const statusLower = statut?.toLowerCase()
    switch (true) {
      case statusLower?.includes("ne repond pas") || statusLower?.includes("ne répond pas"):
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case statusLower?.includes("en cours"):
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case statusLower?.includes("devis envoyé"):
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case statusLower?.includes("contrat"):
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
          <h1 className="text-3xl font-bold text-foreground">Gestion des Projets</h1>
          <p className="text-muted-foreground mt-2">
            {filteredProjects.length} projets • {selectedProjects.size} sélectionnés
          </p>
        </div>
      </div>

      {/* Filtres avancés */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ne repond pas">Ne répond pas</SelectItem>
                <SelectItem value="en cours">En cours</SelectItem>
                <SelectItem value="devis envoyé">Devis envoyé</SelectItem>
                <SelectItem value="contrat">Contrat signé</SelectItem>
                {distinctStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={commercialFilter} onValueChange={setCommercialFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Commercial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les commerciaux</SelectItem>
                {distinctCommercials.map(commercial => (
                  <SelectItem key={commercial} value={commercial}>{commercial}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={contactFilter} onValueChange={setContactFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les contacts</SelectItem>
                <SelectItem value="contacted">Contactés</SelectItem>
                <SelectItem value="not_contacted">Non contactés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contactFrequencyFilter} onValueChange={setContactFrequencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Fréquence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes fréquences</SelectItem>
                <SelectItem value="never">Jamais contacté</SelectItem>
                <SelectItem value="1-2">1-2 fois</SelectItem>
                <SelectItem value="3-5">3-5 fois</SelectItem>
                <SelectItem value="5+">Plus de 5 fois</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreSort} onValueChange={setScoreSort}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Par défaut</SelectItem>
                <SelectItem value="date_desc">📅 Date ↓ (Récent → Ancien)</SelectItem>
                <SelectItem value="date_asc">📅 Date ↑ (Ancien → Récent)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setCommercialFilter("all")
                  setContactFilter("all")
                  setContactFrequencyFilter("all")
                  setScoreSort("default")
                  setCurrentPage(1) // Reset to first page
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Éléments par page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(parseInt(value))
                setCurrentPage(1) // Reset to first page when changing page size
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques Email */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Statistiques Email
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBrevoSync}
                disabled={isSyncingBrevo}
                className="gap-2"
                title="Synchroniser les données avec l'API Brevo"
              >
                {isSyncingBrevo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isSyncingBrevo ? 'Synchronisation...' : 'Sync Brevo'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadEmailStats}
                disabled={loadingStats}
                title="Actualiser les statistiques locales"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  emailStats.totalSent.toLocaleString()
                )}
              </div>
              <div className="text-sm text-blue-700 mt-1">Total envoyés</div>
              <div className="text-xs text-blue-600">
                {loadingStats ? 'Chargement...' : 'Tous les emails'}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  emailStats.delivered.toLocaleString()
                )}
              </div>
              <div className="text-sm text-green-700 mt-1">Délivrés</div>
              <div className="text-xs text-green-600">
                {loadingStats ? 'Chargement...' : `${emailStats.totalSent > 0 ? Math.round((emailStats.delivered / emailStats.totalSent) * 100) : 0}% du total`}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  emailStats.opened.toLocaleString()
                )}
              </div>
              <div className="text-sm text-blue-700 mt-1">Ouverts</div>
              <div className="text-xs text-blue-600">
                {loadingStats ? 'Chargement...' : `${emailStats.openRate}% d'ouverture`}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  emailStats.clicked.toLocaleString()
                )}
              </div>
              <div className="text-sm text-purple-700 mt-1">Clics</div>
              <div className="text-xs text-purple-600">
                {loadingStats ? 'Chargement...' : `${emailStats.clickRate}% de clics`}
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  emailStats.bounced.toLocaleString()
                )}
              </div>
              <div className="text-sm text-red-700 mt-1">Rebonds</div>
              <div className="text-xs text-red-600">
                {loadingStats ? 'Chargement...' : `${emailStats.bounceRate}% de rebonds`}
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taux d'ouverture:</span>
              <span className="font-medium">
                {loadingStats ? '--' : `${emailStats.openRate}%`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Taux de clic:</span>
              <span className="font-medium">
                {loadingStats ? '--' : `${emailStats.clickRate}%`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Taux de rebond:</span>
              <span className="font-medium">
                {loadingStats ? '--' : `${emailStats.bounceRate}%`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions groupées */}
      {selectedProjects.size > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">
                {selectedProjects.size} projet{selectedProjects.size > 1 ? 's' : ''} sélectionné{selectedProjects.size > 1 ? 's' : ''}
              </div>
              <div className="flex gap-2">
                {(() => {
                  const selectedWithEmail = getSelectedProjectsWithEmail().filter(p => p.hasEmail)
                  const totalSelected = getSelectedProjectsWithEmail().length

                  return (
                    <Button
                      onClick={() => setIsEmailDialogOpen(true)}
                      className="gap-2"
                      disabled={selectedWithEmail.length === 0}
                      title={selectedWithEmail.length === totalSelected ?
                             `${selectedWithEmail.length} projets avec email` :
                             `${selectedWithEmail.length}/${totalSelected} projets peuvent recevoir un email`}
                    >
                      <Send className="h-4 w-4" />
                      Envoyer Email Groupé ({selectedWithEmail.length})
                      {totalSelected !== selectedWithEmail.length && (
                        <span className="text-xs opacity-70">/{totalSelected}</span>
                      )}
                    </Button>
                  )
                })()}
                <Button
                  variant="outline"
                  onClick={() => setIsRdvDialogOpen(true)}
                  className="gap-2"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Proposer RDV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des projets */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Projets CRM
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedProjects.size === paginatedProjects.length && paginatedProjects.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Tout sélectionner ({paginatedProjects.length})</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           {/* Table Headers - Simplified without AI Score */}
           <div className="design-card design-border rounded-lg p-4 mb-6">
             <div className="grid grid-cols-6 gap-4 font-medium text-sm text-muted-foreground">
               <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors duration-200" onClick={() => {
                 if (scoreSort === "date_desc") setScoreSort("date_asc")
                 else if (scoreSort === "date_asc") setScoreSort("default")
                 else setScoreSort("date_desc")
               }}>
                 <Calendar className="h-4 w-4" />
                 <span>Date & ID</span>
                 {scoreSort === "date_desc" && <ChevronLeft className="h-3 w-3" />}
                 {scoreSort === "date_asc" && <ChevronRight className="h-3 w-3" />}
               </div>

               <div className="flex items-center gap-2">
                 <User className="h-4 w-4" />
                 <span>Contact</span>
               </div>

               <div className="flex items-center gap-2">
                 <Target className="h-4 w-4" />
                 <span>Statut</span>
               </div>

               <div className="flex items-center gap-2">
                 <Building2 className="h-4 w-4" />
                 <span>Commercial</span>
               </div>

               <div className="flex items-center gap-2">
                 <Mail className="h-4 w-4" />
                 <span>Email & Contact</span>
               </div>

               <div className="flex items-center gap-2">
                 <Eye className="h-4 w-4" />
                 <span>Actions</span>
               </div>
             </div>
           </div>

           {/* Project rows - Simplified layout without AI scoring */}
           <div className="space-y-4">
             {paginatedProjects.map((project) => {
               const emailCount = project.contact?.identifiant ? contactEmailCounts.get(project.contact.identifiant) || 0 : 0

               return (
                <div
                  key={project.projet_id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedProjects.has(project.projet_id)}
                      onCheckedChange={() => toggleProjectSelection(project.projet_id)}
                      className="mt-1"
                    />

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-6 items-start">
                      {/* Date & ID */}
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-foreground">
                          {new Date(project.date_creation).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          #{project.projet_id}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-2">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          {project.contact?.prenom} {project.contact?.nom}
                          {!project.contact?.email && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" aria-label="Pas d'adresse email" />
                          )}
                        </div>
                        <div className="text-sm">
                          {project.contact?.email ? (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-green-600" />
                              <span className="text-green-600 truncate">{project.contact.email}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-orange-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="text-xs">Email manquant</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Project Status */}
                      <div className="space-y-2">
                        <Badge className={`${getStatusColor(project.statut)} px-3 py-1 text-xs font-medium`}>
                          {project.statut}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {project.origine && `Origine: ${project.origine}`}
                        </div>
                      </div>

                      {/* Commercial */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {project.commercial}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Responsable
                        </div>
                      </div>

                      {/* Email & Contact Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            {emailCount}
                          </span>
                          <span className="text-xs text-muted-foreground">emails envoyés</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {emailCount === 0 ? "Pas encore contacté" :
                           emailCount === 1 ? "1 fois contacté" :
                           `${emailCount} fois contacté`}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => loadProjectEmailHistory(project)}
                          title="Historique emails"
                          className="h-8 w-8 p-0"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/projects/${project.projet_id}`)}
                          title="Voir détails"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
               )
             })}
           </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProjects.length)} sur {filteredProjects.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Envoi Email Groupé */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Envoi Email Groupé - {getSelectedProjectsWithEmail().length} destinataires</DialogTitle>
            <div className="text-sm text-muted-foreground">
              Envoyer des emails personnalisés à plusieurs projets sélectionnés
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template existant</Label>
                <Select
                  value={emailData.templateId}
                  onValueChange={handleTemplateSelect}
                  disabled={emailData.useCustomContent}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mt-8">
                <Checkbox
                  checked={emailData.useCustomContent}
                  onCheckedChange={(checked) => setEmailData({
                    ...emailData,
                    useCustomContent: !!checked,
                    templateId: checked ? '' : emailData.templateId
                  })}
                />
                <Label>Rédiger un email personnalisé</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sujet</Label>
              <Input
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                placeholder="Sujet de l'email"
              />
            </div>

            <div className="space-y-2">
              <Label>Contenu HTML</Label>
              <Textarea
                value={emailData.content}
                onChange={(e) => setEmailData({...emailData, content: e.target.value})}
                placeholder="Contenu de l'email en HTML"
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Variables disponibles :</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><code>{'{{nom_client}}'}</code> - Nom complet</div>
                <div><code>{'{{prenom}}'}</code> - Prénom</div>
                <div><code>{'{{nom}}'}</code> - Nom de famille</div>
                <div><code>{'{{nom_commercial}}'}</code> - Commercial assigné</div>
                <div><code>{'{{lien_rdv}}'}</code> - Lien RDV (si créé)</div>
                <div><code>{'{{infos_premunia}}'}</code> - Infos de contact Premunia</div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSendGroupEmail} disabled={isSendingEmail}>
                {isSendingEmail && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Envoyer les Emails
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Proposition RDV */}
      <Dialog open={isRdvDialogOpen} onOpenChange={setIsRdvDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proposer un RDV - {selectedProjects.size} projets</DialogTitle>
            <div className="text-sm text-muted-foreground">
              Créer des propositions de rendez-vous pour les projets sélectionnés
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date proposée</Label>
              <Input
                type="datetime-local"
                value={rdvData.dateProposee}
                onChange={(e) => setRdvData({...rdvData, dateProposee: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Message personnalisé</Label>
              <Textarea
                value={rdvData.message}
                onChange={(e) => setRdvData({...rdvData, message: e.target.value})}
                placeholder="Message à joindre à la proposition de RDV"
                rows={4}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Liens générés automatiquement :</h4>
              <p className="text-sm text-blue-700">
                Un lien unique sera créé pour chaque RDV : <br />
                <code className="bg-white px-2 py-1 rounded">
                  https://moncrm.netlify.app/rdv/[id]
                </code>
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsRdvDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateRdv} disabled={isCreatingRdv}>
                {isCreatingRdv && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer les RDV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

       {/* Dialog Historique par projet */}
       <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
         <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Mail className="h-5 w-5" />
               Historique Email - {selectedProject?.contact?.prenom} {selectedProject?.contact?.nom}
             </DialogTitle>
             <div className="text-sm text-muted-foreground">
               Consulter l'historique des emails et campagnes pour ce projet
             </div>
           </DialogHeader>

           {projectHistory.length > 0 ? (
             <div className="space-y-6 mt-6">
               {projectHistory.map((item: any, index: number) => (
                 <Card key={index} className="border-l-4 border-l-blue-500">
                   <CardHeader>
                     <div className="flex justify-between items-start">
                       <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                           <div className="font-medium text-lg">
                             {item.campaign.nom_campagne}
                           </div>
                           <Badge variant="outline">
                             Campagne #{item.campaign.id}
                           </Badge>
                           <Badge className={getStatusColor(item.campaign.commercial)}>
                             {item.campaign.commercial}
                           </Badge>
                         </div>
                         <div className="text-sm text-muted-foreground">
                           Créée le {new Date(item.campaign.created_at).toLocaleDateString('fr-FR')}
                         </div>
                       </div>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           if (selectedProject?.contact?.email) {
                             history(selectedProject.contact.email)
                               .then(historyData => {
                                 console.log('📧 Email history for project:', historyData)
                                 toast({
                                   title: "Historique Email chargé",
                                   description: `${historyData.length} événements trouvés`,
                                 })
                               })
                               .catch(error => {
                                 console.error('Error loading Brevo history:', error)
                                 toast({
                                   title: "Erreur",
                                   description: "Impossible de charger l'historique Email",
                                   variant: "destructive"
                                 })
                               })
                           }
                         }}
                         disabled={!selectedProject?.contact?.email}
                       >
                         <Mail className="h-4 w-4 mr-2" />
                         Historique Email
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

                     {/* Détails des emails pour cette campagne */}
                     <div className="space-y-3">
                       <h4 className="font-medium">Détails des emails :</h4>
                       <div className="max-h-96 overflow-y-auto space-y-3">
                         {item.emails.map((email: any, emailIndex: number) => (
                           <div key={emailIndex} className="p-4 bg-gray-50 rounded-lg border">
                             <div className="flex justify-between items-start mb-3">
                               <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-2">
                                   <Badge className={getStatusColor(email.statut)}>
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
                   Ce projet n'a pas d'historique d'emails.
                 </p>
               </CardContent>
             </Card>
           )}
         </DialogContent>
       </Dialog>
    </div>
  )
  return (
    <div>
      <h1>Nouveau contenu pour ProjectsTab</h1>
      {/* Contenu simplifié temporaire */}
    </div>
  )
}
