
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"
import { supabase } from "../lib/supabase"
import { AlertTriangle, Mail, Send, Users, TrendingUp } from "lucide-react"

interface NoResponseProject {
  projet_id: number
  contact_id: number
  statut: string
  created_at: string
  contact: {
    identifiant: number
    prenom: string
    nom: string
    email: string
    civilite: string
  }
}

export function NoResponseCampaign() {
  const [projects, setProjects] = useState<NoResponseProject[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [campaignStatus, setCampaignStatus] = useState<string | null>(null)

  useEffect(() => {
    loadNoResponseProjects()
    loadTemplates()
  }, [])

  const loadNoResponseProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projets")
        .select(`
          projet_id,
          contact_id,
          statut,
          created_at,
          contact:contact_id (
            identifiant,
            prenom,
            nom,
            email,
            civilite
          )
        `)
        .ilike("statut", "%ne repond pas%")
        .not("contact.email", "is", null)

      if (error) throw error

      // Corriger le type de données
      const formattedProjects: NoResponseProject[] = (data || [])
        .filter(p => p.contact && !Array.isArray(p.contact))
        .map(p => ({
          ...p,
          contact: Array.isArray(p.contact) ? p.contact[0] : p.contact
        }))
        .filter(p => p.contact?.email)

      setProjects(formattedProjects)
    } catch (error) {
      console.error("Error loading no response projects:", error)
    }
  }

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("templates_email")
        .select("*")
        .eq("statut", "actif")

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error("Error loading templates:", error)
    }
  }

  const launchCampaign = async () => {
    if (!selectedTemplate || projects.length === 0) return

    setLoading(true)
    setCampaignStatus(null)

    try {
      // Créer une campagne pour les non-répondeurs
      const { data: campaign, error: campaignError } = await supabase
        .from("campagnes_email")
        .insert({
          nom: `Relance Non-Répondeurs - ${new Date().toLocaleDateString()}`,
          description: `Campagne de relance pour ${projects.length} projets sans réponse`,
          template_id: selectedTemplate,
          statut: "brouillon",
          contact_count: projects.length,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (campaignError) throw campaignError

      // Ajouter les contacts à la file d'attente
      const queueEntries = projects.map(project => ({
        campagne_id: campaign.id,
        project_id: project.projet_id,
        contact_id: project.contact_id,
        email_destinataire: project.contact.email,
        sujet: "Relance - Votre projet d'assurance",
        contenu_html: `<p>Bonjour ${project.contact.prenom || project.contact.civilite},</p><p>Nous n'avons pas eu de retour concernant votre projet d'assurance...</p>`,
        statut: "pending",
        scheduled_for: new Date().toISOString()
      }))

      const { error: queueError } = await supabase
        .from("email_queue")
        .insert(queueEntries)

      if (queueError) throw queueError

      setCampaignStatus("success")
    } catch (error: any) {
      console.error("Error launching campaign:", error)
      setCampaignStatus("error")
    } finally {
      setLoading(false)
    }
  }

  if (projects.length === 0) return null

  return (
    <Card className="rounded-2xl border-0 shadow-md bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <AlertTriangle className="w-5 h-5" />
          <span>Campagne Non-Répondeurs</span>
          <Badge variant="outline" className="bg-orange-100 text-orange-700">
            {projects.length} projets
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-orange-600" />
            <div>
              <div className="text-sm text-muted-foreground">Projets ciblés</div>
              <div className="font-bold text-orange-600">{projects.length}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-green-600" />
            <div>
              <div className="text-sm text-muted-foreground">Avec email</div>
              <div className="font-bold text-green-600">{projects.filter(p => p.contact.email).length}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-sm text-muted-foreground">Potentiel</div>
              <div className="font-bold text-blue-600">Élevé</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Template d'email</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="rounded-xl">
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

          <Button
            onClick={launchCampaign}
            disabled={loading || !selectedTemplate}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Lancement..." : "Lancer la campagne de relance"}
          </Button>
        </div>

        {campaignStatus === "success" && (
          <Alert className="border-green-200 bg-green-50 rounded-xl">
            <AlertDescription className="text-green-800">
              Campagne lancée avec succès ! Les emails sont en cours d'envoi.
            </AlertDescription>
          </Alert>
        )}

        {campaignStatus === "error" && (
          <Alert className="border-red-200 bg-red-50 rounded-xl">
            <AlertDescription className="text-red-800">
              Erreur lors du lancement de la campagne. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
